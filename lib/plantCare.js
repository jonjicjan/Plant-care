import { addDays, differenceInCalendarDays, format, isValid, parseISO, startOfDay } from 'date-fns';

export const CARE_TYPES = [
  {
    value: 'watering',
    label: 'Watering',
    hint: 'Keep the soil evenly moist',
    intervalHint: 'Choose the gap this plant actually needs — check the soil first.',
  },
  {
    value: 'fertilizing',
    label: 'Fertilizing',
    hint: 'Feed for steady growth',
    intervalHint: 'Slower in winter, more often while a plant is actively growing.',
  },
  {
    value: 'pruning',
    label: 'Pruning',
    hint: 'Trim spent leaves and stems',
    intervalHint: 'Most plants need this a few times a year, not every week.',
  },
  {
    value: 'repotting',
    label: 'Repotting',
    hint: 'Refresh soil and roots',
    intervalHint: 'Typically once a year or two, when roots start to fill the pot.',
  },
  {
    value: 'maintenance',
    label: 'General maintenance',
    hint: 'Inspect, clean and support',
    intervalHint: 'A gentle inspection rhythm works well for most plants.',
  },
];

export const PLANT_TYPES = [
  'Indoor foliage',
  'Tropical',
  'Succulent',
  'Cactus',
  'Fern',
  'Flowering',
  'Herb',
  'Trailing',
  'Other',
];

export function careTypeLabel(value) {
  return CARE_TYPES.find((item) => item.value === value)?.label ?? 'Care';
}

export function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : parseISO(String(value));
  return isValid(date) ? date : null;
}

export function formatDate(value, pattern = 'MMM d, yyyy') {
  const date = toDate(value);
  return date ? format(date, pattern) : '—';
}

export function taskStatus(nextDueAt) {
  const due = toDate(nextDueAt);
  if (!due) return 'upcoming';
  const days = differenceInCalendarDays(startOfDay(due), startOfDay(new Date()));
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  return 'upcoming';
}

const STATUS_LABELS = {
  overdue: 'Overdue',
  today: 'Due today',
  upcoming: 'Upcoming',
};

export function statusLabel(status) {
  return STATUS_LABELS[status] ?? STATUS_LABELS.upcoming;
}

export function dueLabel(nextDueAt) {
  const due = toDate(nextDueAt);
  if (!due) return 'No date';
  const days = differenceInCalendarDays(startOfDay(due), startOfDay(new Date()));
  if (days === 0) return 'Due today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return '1 day overdue';
  if (days < -1) return `${Math.abs(days)} days overdue`;
  if (days <= 7) return `In ${days} days`;
  return format(due, 'MMM d');
}

/** Next due date: at least `intervalDays` after today, anchored on the current due date. */
export function advanceDue(nextDueAt, intervalDays, from = new Date()) {
  const interval = Math.max(1, Number(intervalDays) || 1);
  const due = toDate(nextDueAt);
  const base = due && due > from ? due : from;
  return addDays(startOfDay(base), interval).toISOString();
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function sortByDue(items) {
  return [...items].sort((a, b) => {
    const aTime = toDate(a.nextDueAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bTime = toDate(b.nextDueAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  });
}