export function formatTime12(value) {
  const [h, m] = String(value || '09:00').split(':').map(Number);
  const hour = Number.isFinite(h) ? h : 9;
  const minute = Number.isFinite(m) ? m : 0;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

export function nextReminderAt(value) {
  const [h, m] = String(value || '09:00').split(':').map(Number);
  const now = new Date();
  const target = new Date(now);
  target.setHours(Number.isFinite(h) ? h : 9, Number.isFinite(m) ? m : 0, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target;
}

export function relativeDayLabel(date) {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (date.toDateString() === now.toDateString()) return 'today';
  if (date.toDateString() === tomorrow.toDateString()) return 'tomorrow';
  return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
}