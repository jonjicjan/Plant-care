import { cn } from '@/lib/utils';

const TONES = {
  default: {
    card: 'border-border/80 bg-card',
    icon: 'bg-primary/12 text-primary',
    bar: 'from-primary/60 to-primary',
  },
  good: {
    card: 'border-primary/25 bg-secondary',
    icon: 'bg-primary/18 text-primary',
    bar: 'from-primary to-primary/40',
  },
  warning: {
    card: 'border-warning/25 bg-card',
    icon: 'bg-warning/15 text-warning',
    bar: 'from-warning/70 to-warning',
  },
  danger: {
    card: 'border-destructive/25 bg-card',
    icon: 'bg-destructive/15 text-destructive',
    bar: 'from-destructive/70 to-destructive',
  },
};

export default function StatCard({ label, value, hint, icon: Icon, tone = 'default' }) {
  const style = TONES[tone] || TONES.default;

  return (
    <div
      className={cn(
        'group card-hover relative h-full overflow-hidden rounded-2xl border p-3.5 shadow-[0_20px_50px_-40px_rgba(0,0,0,0.95)] sm:p-5',
        style.card,
      )}
    >
      <span className={cn('absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r opacity-70', style.bar)} aria-hidden="true" />
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase leading-tight tracking-[0.12em] text-muted-foreground sm:text-[11px] sm:tracking-[0.16em]">
          {label}
        </p>
        {Icon ? (
          <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition duration-300 group-hover:scale-105', style.icon)}>
            <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-[26px] font-extrabold leading-none tracking-tight text-foreground sm:text-3xl">{value}</p>
      {hint ? <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground sm:mt-2 sm:text-xs">{hint}</p> : null}
    </div>
  );
}