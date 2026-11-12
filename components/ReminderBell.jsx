import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BellRing } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import useCareData from '@/hooks/useCareData';
import useNotificationPrefs from '@/hooks/useNotificationPrefs';
import { buildTasks } from '@/lib/tasks';
import { careTypeLabel, dueLabel } from '@/lib/plantCare';
import { notifyDueTasks, reminderTasks } from '@/lib/notifications';

export default function ReminderBell() {
  const { plants, schedules, loading } = useCareData();
  const { prefs, ready } = useNotificationPrefs();

  const due = useMemo(() => reminderTasks(buildTasks(schedules, plants), prefs), [schedules, plants, prefs]);

  useEffect(() => {
    if (!ready || loading) return;
    notifyDueTasks(due, prefs);
  }, [ready, loading, due, prefs]);

  if (!ready || !prefs.inApp) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Reminders: ${due.length} waiting`}
          className="relative rounded-xl border border-border/70 bg-card p-2 text-muted-foreground transition hover:text-foreground"
        >
          <BellRing className="h-[18px] w-[18px]" strokeWidth={1.7} aria-hidden="true" />
          {due.length > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {due.length}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[280px] p-0">
        <div className="border-b border-border/60 px-4 py-3">
          <p className="font-display text-sm">Care reminders</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {due.length > 0
              ? `${due.length} ${due.length === 1 ? 'task needs' : 'tasks need'} attention`
              : 'Nothing due right now'}
          </p>
        </div>
        {due.length > 0 ? (
          <ul className="max-h-64 divide-y divide-border/60 overflow-y-auto">
            {due.slice(0, 5).map((task) => (
              <li key={task.id} className="px-4 py-2.5">
                <p className="truncate text-sm font-medium">{task.plantName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {careTypeLabel(task.careType)} · {dueLabel(task.nextDueAt)}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
        <Link
          to="/reminders"
          className="block border-t border-border/60 px-4 py-2.5 text-sm font-medium text-primary hover:bg-muted"
        >
          Open reminders
        </Link>
      </PopoverContent>
    </Popover>
  );
}