import { BellRing, CalendarClock, History, Leaf, LayoutDashboard, Plus, Settings, UserRound } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', short: 'Home', icon: LayoutDashboard, end: true },
  { to: '/plants', label: 'My Plants', short: 'Plants', icon: Leaf },
  { to: '/plants/new', label: 'Add Plant', short: 'Add', icon: Plus, end: true },
  { to: '/schedules', label: 'Care Schedule', short: 'Schedule', icon: CalendarClock },
  { to: '/reminders', label: 'Reminders', short: 'Reminders', icon: BellRing },
  { to: '/history', label: 'Care History', short: 'History', icon: History },
  { to: '/profile', label: 'Profile', short: 'Profile', icon: UserRound },
  { to: '/settings', label: 'Settings', short: 'Settings', icon: Settings },
];

export const MOBILE_TABS = NAV_ITEMS.filter((item) =>
  ['/', '/plants', '/schedules', '/reminders', '/history'].includes(item.to),
);