import { BellRing, Mail, MonitorSmartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime12, nextReminderAt, relativeDayLabel } from '@/lib/reminderTiming';

const CHANNELS = [
  { key: 'inApp', label: 'In-app', Icon: BellRing },
  { key: 'browser', label: 'Browser', Icon: MonitorSmartphone },
  { key: 'email', label: 'Email', Icon: Mail },
];

export default function ReminderSummary({ prefs, email }) {
  const anyOn = prefs.inApp || prefs.browser || prefs.email;
  const next = nextReminderAt(prefs.reminderTime);

  return (
    <section className="relative w-full min-w-0 overflow-hidden rounded-2xl border border-primary/25 bg-secondary p-4 sm:p-5">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-2xl" aria-hidden="true" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80">Your reminders</p>

      {anyOn ? (
        <>
          <p className="mt-2 font-display text-2xl font-extrabold leading-tight">
            {formatTime12(prefs.reminderTime)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Next reminder {relativeDayLabel(next)}
            {prefs.email && email ? ` · email to ${email}` : ''}
          </p>
        </>
      ) : (
        <p className="mt-2 font-display text-lg font-bold leading-tight">All reminders are off</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {CHANNELS.map(({ key, label, Icon }) => {
          const on = prefs[key];
          return (
            <span
              key={key}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1',
                on
                  ? 'bg-primary/15 text-primary ring-primary/30'
                  : 'bg-white/[0.03] text-muted-foreground ring-border/70',
              )}
            >
              <Icon className="h-3 w-3" aria-hidden="true" />
              {label}
              <span className="font-normal opacity-80">{on ? 'on' : 'off'}</span>
            </span>
          );
        })}
      </div>
    </section>
  );
}