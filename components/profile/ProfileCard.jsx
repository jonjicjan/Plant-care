import { Link } from 'react-router-dom';
import { CalendarClock, History, Leaf, Mail, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/plantCare';

const STATS = [
  { key: 'plantCount', label: 'Plants', icon: Leaf },
  { key: 'scheduleCount', label: 'Schedules', icon: CalendarClock },
  { key: 'careLogCount', label: 'Care logged', icon: History },
];

export default function ProfileCard({ user, plantCount, scheduleCount, careLogCount }) {
  const name = user?.full_name || user?.email?.split('@')[0] || 'Your account';
  const initials = (user?.full_name || user?.email || 'You').trim().slice(0, 2).toUpperCase();
  const values = { plantCount, scheduleCount, careLogCount };

  return (
    <section className="card-surface relative w-full max-w-full overflow-hidden rounded-3xl p-5 sm:p-7">
      <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-primary/10 blur-2xl" aria-hidden="true" />

      <div className="relative flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <span className="gradient-primary flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-display text-xl font-extrabold text-primary-foreground shadow-[0_18px_40px_-22px_rgba(112,214,154,0.9)]">
          {initials}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/80">
            {user?.created_date ? `Growing since ${formatDate(user.created_date, 'MMM yyyy')}` : 'Your account'}
          </p>
          <h2 className="mt-1.5 truncate font-display text-xl font-extrabold tracking-tight sm:text-2xl">{name}</h2>
          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{user?.email || '—'}</span>
          </p>
        </div>

        <Button asChild variant="outline" size="sm" className="h-9 shrink-0 rounded-full border-primary/30 text-xs hover:bg-primary/10 hover:text-primary">
          <Link to="/settings">
            <Settings className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Settings
          </Link>
        </Button>
      </div>

      <div className="relative mt-5 grid min-w-0 grid-cols-3 gap-2 sm:gap-3">
        {STATS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="min-w-0 rounded-2xl border border-border/70 bg-white/[0.03] px-3 py-3">
            <Icon className="h-3.5 w-3.5 text-primary/80" aria-hidden="true" />
            <p className="mt-1.5 font-display text-lg font-extrabold leading-none text-foreground">
              {values[key] ?? '—'}
            </p>
            <p className="mt-1 truncate text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}