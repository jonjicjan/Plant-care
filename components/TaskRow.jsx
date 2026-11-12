import { Bell, BellOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PlantPhoto from '@/components/PlantPhoto';
import { CareTypeIcon } from '@/components/CareTypeBadge';
import { careTypeLabel, dueLabel, formatDate, statusLabel, taskStatus } from '@/lib/plantCare';
import { cn } from '@/lib/utils';

const STATUS_TONES = {
  today: 'bg-primary/15 text-primary ring-1 ring-primary/25',
  overdue: 'bg-destructive/15 text-destructive ring-1 ring-destructive/25',
  upcoming: 'bg-white/5 text-muted-foreground ring-1 ring-border',
};

export default function TaskRow({ task, onComplete, busy = false }) {
  const status = taskStatus(task.nextDueAt);

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-border/80 sm:h-12 sm:w-12">
        <PlantPhoto
          uri={task.plantImage}
          plantType={task.plantType}
          alt={task.plantName}
          className="h-full w-full object-cover"
        />
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-background/80 py-0.5 text-primary backdrop-blur-sm">
          <CareTypeIcon careType={task.careType} className="h-3 w-3" />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{task.plantName}</p>
          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', STATUS_TONES[status])}>
            {statusLabel(status)}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">{careTypeLabel(task.careType)}</span> · Due{' '}
          {formatDate(task.nextDueAt, 'MMM d, yyyy')}
          {task.reminderTime ? ` · ${task.reminderTime}` : ''}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
          {task.reminderEnabled ? (
            <Bell className="h-3 w-3 text-primary/70" aria-hidden="true" />
          ) : (
            <BellOff className="h-3 w-3" aria-hidden="true" />
          )}
          {task.reminderEnabled ? 'Reminder on' : 'Muted'}
          {status === 'overdue' ? <span className="text-destructive"> · {dueLabel(task.nextDueAt)}</span> : null}
        </p>
      </div>

      {onComplete ? (
        <Button
          size="sm"
          variant={status === 'overdue' ? 'default' : 'outline'}
          className="shrink-0 rounded-full border-primary/30 px-3 text-xs hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
          onClick={() => onComplete(task)}
          disabled={busy}
        >
          <Check className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          {busy ? 'Saving' : 'Complete'}
        </Button>
      ) : null}
    </div>
  );
}