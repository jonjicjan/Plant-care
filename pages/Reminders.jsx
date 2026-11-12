import { Link } from 'react-router-dom';
import { BellRing, CheckCircle2, Clock, TriangleAlert } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import TaskRow from '@/components/TaskRow';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import { Button } from '@/components/ui/button';
import useCareData from '@/hooks/useCareData';
import useCompleteTask from '@/hooks/useCompleteTask';
import { buildTasks } from '@/lib/tasks';
import { taskStatus } from '@/lib/plantCare';

const SHELLS = {
  danger: 'border-destructive/25 bg-destructive/[0.06]',
  today: 'border-warning/25 bg-warning/[0.05]',
  good: 'border-primary/25 bg-primary/[0.05]',
};

const ACCENTS = {
  danger: 'text-destructive',
  today: 'text-warning',
  good: 'text-primary',
};

function Section({ icon: Icon, title, description, tasks, tone = 'good', onComplete, busyId }) {
  if (tasks.length === 0) return null;

  return (
    <section className={`rounded-2xl border p-4 sm:p-6 ${SHELLS[tone]}`}>
      <div className="flex items-center gap-2.5">
        <Icon className={`h-4 w-4 ${ACCENTS[tone]}`} aria-hidden="true" />
        <h2 className="font-display text-lg font-bold">{title}</h2>
        <span className="rounded-full bg-background/60 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground ring-1 ring-border">
          {tasks.length}
        </span>
      </div>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      <div className="mt-3 divide-y divide-border/60">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} onComplete={onComplete} busy={busyId === task.id} />
        ))}
      </div>
    </section>
  );
}

export default function Reminders() {
  const { plants, schedules, loading, error, reload } = useCareData();
  const { complete, busyId } = useCompleteTask(reload);

  const tasks = buildTasks(schedules, plants);
  const overdue = tasks.filter((task) => taskStatus(task.nextDueAt) === 'overdue');
  const today = tasks.filter((task) => taskStatus(task.nextDueAt) === 'today');
  const upcoming = tasks.filter((task) => taskStatus(task.nextDueAt) === 'upcoming');

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <PageHeader
        eyebrow="Reminders"
        title="Care Reminders"
        description="Everything that needs you now, today, and in the days ahead."
        actions={
          <>
            <Button asChild variant="outline" className="rounded-full border-border bg-white/[0.03]">
              <Link to="/settings">
                <BellRing className="mr-2 h-4 w-4" aria-hidden="true" />
                Notification settings
              </Link>
            </Button>
            <Button asChild className="gradient-primary rounded-full text-primary-foreground">
              <Link to="/schedules?new=1">New schedule</Link>
            </Button>
          </>
        }
      />

      {loading ? (
        <LoadingState label="Checking your reminders" />
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No reminders yet"
          description="Create a care schedule for your plants and upcoming tasks will show up here."
          action={
            <Button asChild className="gradient-primary rounded-full text-primary-foreground">
              <Link to="/schedules?new=1">Create a schedule</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-5">
          <Section
            icon={TriangleAlert}
            title="Overdue"
            description="A little late is still care — start with these."
            tasks={overdue}
            tone="danger"
            onComplete={complete}
            busyId={busyId}
          />
          <Section
            icon={Clock}
            title="Due Today"
            description="The right day to tend to these plants."
            tasks={today}
            tone="today"
            onComplete={complete}
            busyId={busyId}
          />
          <Section
            icon={BellRing}
            title="Upcoming"
            description="Scheduled ahead so nothing sneaks up on you."
            tasks={upcoming}
            tone="good"
            onComplete={complete}
            busyId={busyId}
          />
          {overdue.length === 0 && today.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-primary/25 bg-card/60 px-6 py-10 text-center">
              <p className="font-display text-lg font-bold text-primary">Nothing due today</p>
              <p className="mt-1 text-sm text-muted-foreground">Your plants are happy — the next tasks are listed above.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}