import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const DEFAULT_TIME_ZONE = 'UTC';

function safeTimeZone(value) {
  if (typeof value !== 'string' || !value) return DEFAULT_TIME_ZONE;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value });
    return value;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

function tzParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const out = {};
  for (const part of parts) {
    if (part.type !== 'literal') out[part.type] = Number(part.value);
  }
  return out;
}

function zoneOffsetMs(date, timeZone) {
  const p = tzParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - date.getTime();
}

/** The UTC instant of local midnight for a calendar date in the user's time zone. */
function localMidnight(dateParts, timeZone) {
  const naive = Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day, 0, 0, 0);
  let ts = naive - zoneOffsetMs(new Date(naive), timeZone);
  ts = naive - zoneOffsetMs(new Date(ts), timeZone);
  return ts;
}

/**
 * Next due date: `intervalDays` calendar days after the later of today (in the
 * user's time zone) and the current due date, landing on local midnight.
 */
function computeNextDue(currentDue, intervalDays, timeZone) {
  const now = new Date();
  const due = new Date(currentDue);
  const base = !Number.isNaN(due.getTime()) && due > now ? due : now;
  const interval = Math.min(365, Math.max(1, Math.floor(Number(intervalDays) || 1)));

  const todayLocal = tzParts(base, timeZone);
  const target = new Date(Date.UTC(todayLocal.year, todayLocal.month - 1, todayLocal.day + interval));

  return new Date(
    localMidnight(
      { year: target.getUTCFullYear(), month: target.getUTCMonth() + 1, day: target.getUTCDate() },
      timeZone,
    ),
  ).toISOString();
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Please sign in to complete this task.' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    const scheduleId = typeof payload.scheduleId === 'string' ? payload.scheduleId : '';
    const dueAt = typeof payload.dueAt === 'string' ? payload.dueAt : '';
    if (!scheduleId) return Response.json({ error: 'A care schedule is required.' }, { status: 400 });

    const timeZone = safeTimeZone(payload.timezone || user.timezone);

    const schedule = await base44.entities.CareSchedule.get(scheduleId).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!schedule) return Response.json({ error: 'This care schedule no longer exists.' }, { status: 404 });
    if (schedule.created_by_id && schedule.created_by_id !== user.id) {
      return Response.json({ error: 'You cannot complete care for this schedule.' }, { status: 403 });
    }

    const staleMessage = 'This task was already completed. Refresh to see the next date.';

    if (dueAt && new Date(dueAt).getTime() !== new Date(schedule.nextDueAt).getTime()) {
      return Response.json({ error: staleMessage, alreadyCompleted: true }, { status: 409 });
    }

    // Second guard: a log for this exact due occurrence means it was handled already.
    const existing = await base44.entities.CareLog.filter(
      { scheduleId: schedule.id, dueAt: schedule.nextDueAt },
      { limit: 1 },
    );
    if ((existing?.items ?? existing ?? []).length > 0) {
      return Response.json({ error: staleMessage, alreadyCompleted: true }, { status: 409 });
    }

    const nextDueAt = computeNextDue(schedule.nextDueAt, schedule.intervalDays, timeZone);
    const completedAt = new Date().toISOString();

    const log = await base44.entities.CareLog.create({
      userId: user.id,
      plantId: schedule.plantId,
      scheduleId: schedule.id,
      careType: schedule.careType,
      completedAt,
      dueAt: schedule.nextDueAt,
      notes: '',
    });

    const updated = await base44.entities.CareSchedule.update(schedule.id, { nextDueAt });

    return Response.json({ log, schedule: updated, nextDueAt, timeZone });
  } catch (error) {
    return Response.json({ error: error.message || 'Something went wrong.' }, { status: 500 });
  }
}