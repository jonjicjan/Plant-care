import { cn } from '@/lib/utils';

const TONES = {
  default: 'border-border/80 bg-card',
  today: 'border-primary/25 bg-card',
  danger: 'border-destructive/25 bg-card',
};

export default function DashboardSection({ icon: Icon, title, count, tone = 'default', action, children }) {
  return (
    <section className={cn('w-full min-w-0 max-w-full overflow-hidden rounded-2xl border p-4 shadow-[0_24px_60px_-46px_rgba(0,0,0,0.95)] sm:p-6', TONES[tone] || TONES.default)}>
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <Icon className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <h2 className="truncate font-display text-base font-bold sm:text-lg">{title}</h2>
          {typeof count === 'number' ? (
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground ring-1 ring-border">
              {count}
            </span>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-3 min-w-0 max-w-full">{children}</div>
    </section>
  );
}