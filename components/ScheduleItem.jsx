import { Bell, BellOff, Clock, Pencil, Repeat, Trash2 } from 'lucide-react';
import PlantPhoto from '@/components/PlantPhoto';
import { Switch } from '@/components/ui/switch';
import { CareTypeIcon } from '@/components/CareTypeBadge';
import { careTypeLabel, dueLabel, formatDate, taskStatus } from '@/lib/plantCare';
import { cn } from '@/lib/utils';

export default function ScheduleItem({ schedule, plant, onEdit, onToggleActive, onDelete, busy = false }) {
  const inactive = schedule.active === false;
  const muted = schedule.reminderEnabled === false;
  const status = taskStatus(schedule.nextDueAt);
  const days = Number(schedule.intervalDays) || 1;

  return (
    <div
      className={cn(
        'group rounded-2xl border border-border/80 bg-card p-3.5 transition duration-300 hover:border-primary/35 sm:p-4',
        inactive && 'opacity-60',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl ring-1 ring-border/80">
          <PlantPhoto
            uri={plant?.imageUrl}
            plantType={plant?.plantType}
            alt={plant?.plantName || 'Plant'}
            className="h-full w-full object-cover"
          />
          <span className="absolute inset-x-0 bottom-0 flex justify-center bg-background/80 py-0.5 text-primary backdrop-blur-sm">
            <CareTypeIcon careType={schedule.careType} className="h-3 w-3" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-sm font-semibold text-foreground">{careTypeLabel(schedule.careType)}</p>
            {plant?.plantName ? <span className="truncate text-xs text-muted-foreground">· {plant.plantName}</span> : null}
            {inactive ? (
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground ring-1 ring-border">
                Paused
              </span>
            ) : null}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Repeat className="h-3 w-3 text-primary/70" aria-hidden="true" />
              Every {days} {days === 1 ? 'day' : 'days'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-primary/70" aria-hidden="true" />
              {schedule.reminderTime || '09:00'}
            </span>
            <span className="inline-flex items-center gap-1">
              {muted ? <BellOff className="h-3 w-3" aria-hidden="true" /> : <Bell className="h-3 w-3 text-primary/70" aria-hidden="true" />}
              {muted ? 'Reminder off' : 'Reminder on'}
            </span>
          </div>

          <p className="mt-1.5 text-[11px]">
            <span className="text-muted-foreground">Next due </span>
            <span className="font-semibold text-foreground">{formatDate(schedule.nextDueAt, 'MMM d, yyyy')}</span>
            {!inactive ? (
              <span className={cn('ml-1.5', status === 'overdue' ? 'font-semibold text-destructive' : status === 'today' ? 'font-semibold text-primary' : 'text-muted-foreground')}>
                · {dueLabel(schedule.nextDueAt)}
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Switch
            checked={!inactive}
            onCheckedChange={onToggleActive}
            disabled={busy}
            aria-label={`${inactive ? 'Activate' : 'Pause'} ${careTypeLabel(schedule.careType)} schedule`}
          />
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-white/5 hover:text-primary"
              aria-label="Edit schedule"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              aria-label="Delete schedule"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}