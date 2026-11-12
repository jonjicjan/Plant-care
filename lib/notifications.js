import { taskStatus } from '@/lib/plantCare';

export const DEFAULT_PREFS = {
  inApp: true,
  browser: false,
  email: false,
  reminderTime: '09:00',
};

const NOTIFIED_PREFIX = 'plantcare.notified';

export function prefsFromUser(user) {
  if (!user) return { ...DEFAULT_PREFS };
  return {
    inApp: user.inAppRemindersEnabled !== false,
    browser: user.browserRemindersEnabled === true,
    email: user.emailRemindersEnabled === true,
    reminderTime: user.reminderTime || DEFAULT_PREFS.reminderTime,
  };
}

export function prefsToUserPatch(prefs) {
  return {
    inAppRemindersEnabled: prefs.inApp,
    browserRemindersEnabled: prefs.browser,
    emailRemindersEnabled: prefs.email,
    reminderTime: prefs.reminderTime,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  };
}

export function notificationSupport() {
  if (typeof window === 'undefined' || typeof window.Notification === 'undefined') return 'unsupported';
  return window.Notification.permission;
}

export async function requestNotificationPermission() {
  if (notificationSupport() === 'unsupported') return 'unsupported';
  return window.Notification.requestPermission();
}

export function showBrowserNotification(title, options = {}) {
  if (notificationSupport() !== 'granted') return false;
  new window.Notification(title, options);
  return true;
}

function reminderMinutes(prefs) {
  const [hours, minutes] = String(prefs?.reminderTime || DEFAULT_PREFS.reminderTime).split(':').map(Number);
  const h = Number.isFinite(hours) ? hours : 9;
  const m = Number.isFinite(minutes) ? minutes : 0;
  return h * 60 + m;
}

/**
 * Tasks that should be surfaced as a reminder right now.
 * Overdue care always qualifies; today's care only once the preferred reminder time has passed.
 */
export function reminderTasks(tasks = [], prefs = DEFAULT_PREFS) {
  const now = new Date();
  const readyForToday = now.getHours() * 60 + now.getMinutes() >= reminderMinutes(prefs);
  return tasks.filter((task) => {
    const status = taskStatus(task.nextDueAt);
    if (status === 'overdue') return true;
    if (status === 'today') return readyForToday;
    return false;
  });
}

function alreadyNotified(key) {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function markNotified(key) {
  try {
    localStorage.setItem(key, '1');
  } catch {
    // storage unavailable, the notification still shows once per page load
  }
}

/** One browser notification per task per day, and only while a tab is open. */
export function notifyDueTasks(tasks = [], prefs = DEFAULT_PREFS) {
  if (!prefs.browser || tasks.length === 0) return false;
  if (notificationSupport() !== 'granted') return false;

  const today = new Date().toISOString().slice(0, 10);
  const fresh = tasks.filter((task) => {
    const key = `${NOTIFIED_PREFIX}:${task.id}:${today}`;
    if (alreadyNotified(key)) return false;
    markNotified(key);
    return true;
  });
  if (fresh.length === 0) return false;

  const names = fresh
    .slice(0, 3)
    .map((task) => task.plantName)
    .join(', ');
  return showBrowserNotification(
    `${fresh.length} plant care ${fresh.length === 1 ? 'task' : 'tasks'} waiting`,
    { body: names, tag: 'plant-care-due' },
  );
}