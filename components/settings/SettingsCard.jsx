import { cn } from '@/lib/utils';

export default function SettingsCard({ icon: Icon, title, description, action, className, children }) {
  return (
    <section className={cn('card-surface w-full min-w-0 overflow-hidden', className)}>
      <header className="flex items-start justify-between gap-3 px-4 pb-3 pt-4 sm:px-5">
        <div className="flex min-w-0 items-start gap-2.5">
          {Icon ? (
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
          ) : null}
          <div className="min-w-0">
            <h2 className="font-display text-sm font-bold leading-tight">{title}</h2>
            {description ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p> : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className="min-w-0 px-4 pb-4 sm:px-5">{children}</div>
    </section>
  );
}