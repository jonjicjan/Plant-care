import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export default function ChannelRow({ icon: Icon, title, description, status, checked, disabled, onChange }) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 rounded-2xl border px-3.5 py-3 transition',
        checked ? 'border-primary/30 bg-primary/[0.06]' : 'border-border/70 bg-white/[0.03]',
      )}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon ? (
          <Icon
            className={cn('mt-0.5 h-4 w-4 shrink-0', checked ? 'text-primary' : 'text-muted-foreground')}
            aria-hidden="true"
          />
        ) : null}
        <div className="min-w-0">
          <p className="text-sm font-medium leading-tight">{title}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{description}</p>
          {status ? <p className="mt-1 text-[11px] font-semibold text-primary/90">{status}</p> : null}
        </div>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
        aria-label={title}
        className="mt-0.5 shrink-0"
      />
    </div>
  );
}