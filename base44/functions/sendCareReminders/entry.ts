import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const DEFAULT_REMINDER_TIME = '09:00';
const WINDOW_MINUTES = 60;
const PRUNE_DAYS = 60;
const APP_URL = 'https://the-plant-care.base44.app';

function asItems(result) {
  if (Array.isArray(result)) return result;
  return result && Array.isArray(result.items) ? result.items : [];
}

function zonedMoment(date, timeZone) {
  const build = (zone) =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: zone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  let formatter;
  try {
    formatter = build(timeZone || 'UTC');
  } catch {
    formatter = build('UTC');
  }
  const parts = formatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});
  const hour = Number(parts.hour) % 24;
  return {
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: hour * 60 + Number(parts.minute),
  };
}

function localDateLabel(date, timeZone) {
  try {
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: timeZone || 'UTC' }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'UTC' }).format(date);
  }
}

function reminderMinutes(value) {
  const [hourPart, minutePart] = String(value || DEFAULT_REMINDER_TIME).split(':');
  const hours = Number(hourPart);
  const minutes = Number(minutePart);
  const h = Number.isFinite(hours) ? Math.min(23, Math.max(0, hours)) : 9;
  const m = Number.isFinite(minutes) ? Math.min(59, Math.max(0, minutes)) : 0;
  return h * 60 + m;
}

function withinWindow(currentMinutes, targetMinutes) {
  return ((currentMinutes - targetMinutes + 1440) % 1440) < WINDOW_MINUTES;
}

function firstName(user) {
  const full = String(user.full_name || '').trim();
  if (full) return full.split(' ')[0];
  return String(user.email || '').split('@')[0] || 'there';
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (caller.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const now = new Date();
    const users = asItems(await base44.asServiceRole.entities.User.list());

    const candidates = users
      .filter((user) => user.emailRemindersEnabled === true && user.email)
      .map((user) => {
        const moment = zonedMoment(now, user.timezone);
        return { user, dateKey: moment.dateKey, eligible: withinWindow(moment.minutes, reminderMinutes(user.reminderTime)) };
      })
      .filter((entry) => entry.eligible);

    const result = { checked: users.length, candidates: candidates.length, sent: 0, skipped: [], failed: [] };

    for (let index = 0; index < candidates.length; index += 6) {
      const batch = candidates.slice(index, index + 6);
      const outcomes = await Promise.allSettled(
        batch.map(async ({ user, dateKey }) => {
          const existing = asItems(
            await base44.asServiceRole.entities.ReminderDispatch.filter({
              userId: user.id,
              channel: 'email',
              dueDateKey: dateKey,
            }),
          );
          if (existing.length > 0) return { status: 'skipped', email: user.email };

          const [schedules, plants] = await Promise.all([
            asItems(
              await base44.asServiceRole.entities.CareSchedule.filter({
                created_by_id: user.id,
                active: { $ne: false },
              }),
            ),
            asItems(await base44.asServiceRole.entities.Plant.filter({ created_by_id: user.id })),
          ]);

          const due = schedules.filter((schedule) => {
            if (!schedule.nextDueAt || schedule.reminderEnabled === false) return false;
            const dueDate = new Date(schedule.nextDueAt);
            if (Number.isNaN(dueDate.getTime())) return false;
            return zonedMoment(dueDate, user.timezone).dateKey <= dateKey;
          });

          // Care that was marked completed today in the user's own time zone.
          const since = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
          const recentLogs = asItems(
            await base44.asServiceRole.entities.CareLog.filter({
              created_by_id: user.id,
              completedAt: { $gte: since },
            }),
          );
          const completedToday = recentLogs.filter((log) => {
            const stamp = new Date(log.completedAt);
            return !Number.isNaN(stamp.getTime()) && zonedMoment(stamp, user.timezone).dateKey === dateKey;
          });

          // Nothing due and nothing done: no email for the day.
          if (due.length === 0 && completedToday.length === 0) return { status: 'skipped', email: user.email };

          const plantNames = new Map(plants.map((plant) => [plant.id, plant.plantName]));
          const summarise = (items, emptyLabel) => {
            const names = [...new Set(items.map((item) => plantNames.get(item.plantId) || 'A plant'))];
            if (names.length === 0) return emptyLabel;
            const shown = names.slice(0, 5).join(', ');
            return names.length > 5 ? `${shown} and ${names.length - 5} more` : shown;
          };
          const overdueCount = due.filter(
            (schedule) => zonedMoment(new Date(schedule.nextDueAt), user.timezone).dateKey < dateKey,
          ).length;

          const taskWord = (count) => `${count} care ${count === 1 ? 'task' : 'tasks'}`;
          const statusLine =
            due.length === 0
              ? `Everything is done for today: ${taskWord(completedToday.length)} marked completed.`
              : completedToday.length === 0
                ? `${taskWord(due.length)} ${due.length === 1 ? 'is' : 'are'} still not completed today.`
                : `${taskWord(completedToday.length)} marked completed, and ${taskWord(due.length)} still not completed.`;

          const sendResult = await base44.asServiceRole.integrations.Core.SendEmail({
            to: user.email,
            template_name: 'CareReminderEmail',
            category: 'transactional',
            variables: {
              first_name: firstName(user),
              status_line: statusLine,
              task_count: due.length,
              plant_names: summarise(due, 'nothing left for today'),
              completed_count: completedToday.length,
              completed_names: summarise(completedToday, 'none yet'),
              overdue_count: overdueCount,
              issue_date: localDateLabel(now, user.timezone),
              cta_url: `${APP_URL}/reminders`,
            },
          });

          if (sendResult && sendResult.success === false) {
            return { status: 'failed', email: user.email, reason: sendResult.reason || sendResult.message || 'not sent' };
          }

          await base44.asServiceRole.entities.ReminderDispatch.create({
            userId: user.id,
            channel: 'email',
            dedupeKey: `${user.id}:${dateKey}:email`,
            dueDateKey: dateKey,
            taskCount: due.length,
            pendingCount: due.length,
            completedCount: completedToday.length,
            sentAt: new Date().toISOString(),
          });

          return { status: 'sent', email: user.email };
        }),
      );

      outcomes.forEach((outcome, position) => {
        if (outcome.status === 'rejected') {
          result.failed.push({ email: batch[position].user.email, reason: outcome.reason?.message || 'error' });
          return;
        }
        const value = outcome.value;
        if (value.status === 'sent') result.sent += 1;
        else if (value.status === 'failed') result.failed.push({ email: value.email, reason: value.reason });
        else result.skipped.push(value.email);
      });
    }

    const cutoff = new Date(now.getTime() - PRUNE_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    await base44.asServiceRole.entities.ReminderDispatch.deleteMany({
      channel: 'email',
      dueDateKey: { $lt: cutoff },
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}