import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowRight, BellRing, CalendarClock, CheckCircle2, Leaf, Plus, Sparkles, TriangleAlert } from 'lucide-react';
import StatCard from '@/components/StatCard';
import TaskRow from '@/components/TaskRow';
import UpcomingRow from '@/components/UpcomingRow';
import PlantCard from '@/components/PlantCard';
import DashboardSection from '@/components/DashboardSection';
import CareOverview from '@/components/CareOverview';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import useCareData from '@/hooks/useCareData';
import useCareOverview from '@/hooks/useCareOverview';
import useCompleteTask from '@/hooks/useCompleteTask';
import { buildTasks, nextCareForPlant } from '@/lib/tasks';
import { greeting, taskStatus } from '@/lib/plantCare';
import { HERO_IMAGE } from '@/lib/plantImages';
import { base44 } from '@/api/base44Client';

const LINK_CLASS = 'shrink-0 text-xs font-semibold text-primary underline-offset-4 hover:underline';

export default function Dashboard() {
  const { plants, schedules, loading, error, reload } = useCareData();
  const { completed } = useCareOverview();
  const { complete, busyId } = useCompleteTask(reload);
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    base44.auth.me()
      .then((user) => setFirstName(user?.full_name?.split(' ')[0] || ''))
      .catch(() => setFirstName(''));
  }, []);

  const tasks = useMemo(() => buildTasks(schedules, plants), [schedules, plants]);
  const dueToday = tasks.filter((task) => taskStatus(task.nextDueAt) === 'today');
  const overdue = tasks.filter((task) => taskStatus(task.nextDueAt) === 'overdue');
  const upcoming = tasks.filter((task) => taskStatus(task.nextDueAt) === 'upcoming');
  const needsAttention = overdue.length + dueToday.length;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <section className="relative w-full max-w-full overflow-hidden rounded-3xl border border-border/80 bg-card shadow-[0_40px_90px_-60px_rgba(0,0,0,1)]">
        <div className="absolute inset-y-0 right-0 hidden w-[46%] max-w-full sm:block" aria-hidden="true">
          <Image src={HERO_IMAGE} alt="" fittingType="fill" className="h-full w-full max-w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-card via-card/70 to-transparent" />
        </div>
        <div className="relative grid min-w-0 grid-cols-1 gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80">
              {format(new Date(), 'EEEE, d MMMM')}
            </p>
            <h1 className="mt-3 font-display text-[28px] font-extrabold leading-[1.1] tracking-tight sm:text-[40px]">
              Let’s make your plants <span className="gradient-text">thrive.</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Keep your plants healthy with simple care routines and timely reminders.
            </p>
            <p className="mt-2 text-xs text-muted-foreground/90">
              {greeting()}
              {firstName ? `, ${firstName}` : ''} ·{' '}
              {loading
                ? 'gathering your garden…'
                : needsAttention > 0
                  ? `${needsAttention} care ${needsAttention === 1 ? 'task needs' : 'tasks need'} your attention today.`
                  : 'everything is on schedule.'}
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button asChild className="gradient-primary h-11 rounded-full px-5 text-sm font-semibold text-primary-foreground shadow-[0_18px_40px_-22px_rgba(112,214,154,0.9)] hover:opacity-95">
                <Link to="/plants/new">
                  <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Add New Plant
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-full border-border bg-white/[0.03] px-5 hover:bg-white/[0.06]">
                <Link to="/schedules?new=1">
                  <CalendarClock className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Care schedule
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative h-40 w-full max-w-full overflow-hidden rounded-2xl ring-1 ring-border/70 sm:hidden">
            <Image src={HERO_IMAGE} alt="A calm arrangement of houseplants" fittingType="fill" className="h-full w-full max-w-full object-cover" />
            <span className="image-overlay absolute inset-0" aria-hidden="true" />
            <p className="absolute inset-x-4 bottom-3 font-display text-xs font-semibold text-foreground/90">
              {plants.length > 0 ? `${plants.length} plants in your care` : 'Your garden starts here'}
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}{' '}
          <button type="button" onClick={reload} className="font-semibold underline underline-offset-4">
            Try again
          </button>
        </div>
      ) : null}

      <section className="grid min-w-0 grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Overview">
        <StatCard label="Total Plants" value={plants.length} hint="In your collection" icon={Leaf} />
        <StatCard label="Due Today" value={dueToday.length} hint="Tend to these" icon={CheckCircle2} tone="good" />
        <StatCard label="Upcoming Tasks" value={upcoming.length} hint="Scheduled ahead" icon={CalendarClock} tone="warning" />
        <StatCard label="Overdue Tasks" value={overdue.length} hint="Catch up kindly" icon={TriangleAlert} tone="danger" />
      </section>

      {loading ? (
        <LoadingState />
      ) : plants.length === 0 ? (
        <EmptyState
          icon={Leaf}
          title="Your garden is empty"
          description="Add your first plant to start tracking watering, feeding and everything in between."
          action={
            <Button asChild className="gradient-primary rounded-full text-primary-foreground">
              <Link to="/plants/new">
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Add New Plant
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-5">
            {overdue.length > 0 ? (
              <DashboardSection
                icon={TriangleAlert}
                title="Overdue tasks"
                count={overdue.length}
                tone="danger"
                action={
                  <Link to="/reminders" className={LINK_CLASS}>
                    View all
                  </Link>
                }
              >
                <div className="divide-y divide-border/60">
                  {overdue.map((task) => (
                    <TaskRow key={task.id} task={task} onComplete={complete} busy={busyId === task.id} />
                  ))}
                </div>
              </DashboardSection>
            ) : null}

            <DashboardSection
              icon={CheckCircle2}
              title="Today’s Care Tasks"
              count={dueToday.length}
              tone="today"
              action={
                <Link to="/reminders" className={LINK_CLASS}>
                  Reminders
                </Link>
              }
            >
              {dueToday.length > 0 ? (
                <div className="divide-y divide-border/60">
                  {dueToday.map((task) => (
                    <TaskRow key={task.id} task={task} onComplete={complete} busy={busyId === task.id} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-primary/20 bg-white/[0.03] px-4 py-6 text-center">
                  <p className="font-display text-sm font-bold text-primary">All caught up</p>
                  <p className="mt-1 text-xs text-muted-foreground">No care tasks are due today.</p>
                </div>
              )}
            </DashboardSection>

            <DashboardSection
              icon={BellRing}
              title="Upcoming Reminders"
              count={upcoming.length}
              action={
                <Link to="/schedules" className={LINK_CLASS}>
                  Schedules
                </Link>
              }
            >
              {upcoming.length > 0 ? (
                <div className="divide-y divide-border/60">
                  {upcoming.slice(0, 5).map((task) => (
                    <UpcomingRow key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <p className="py-2 text-sm text-muted-foreground">
                  Nothing scheduled yet.{' '}
                  <Link to="/schedules?new=1" className="font-semibold text-primary underline-offset-4 hover:underline">
                    Create a care schedule
                  </Link>
                  .
                </p>
              )}
            </DashboardSection>

            <DashboardSection
              icon={Sparkles}
              title="Plant Care Overview"
              action={
                <Link to="/history" className={LINK_CLASS}>
                  History
                </Link>
              }
            >
              <CareOverview completed={completed} tasks={tasks} />
            </DashboardSection>
          </div>

          <div className="min-w-0 space-y-5">
            <DashboardSection
              icon={Leaf}
              title="My Recent Plants"
              action={
                <Link to="/plants" className={LINK_CLASS}>
                  View all
                </Link>
              }
            >
              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                {plants.slice(0, 4).map((plant) => (
                  <PlantCard key={plant.id} plant={plant} nextCare={nextCareForPlant(schedules, plant.id)} />
                ))}
              </div>
              <Link
                to="/plants"
                className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/25 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10"
              >
                See the whole collection
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </DashboardSection>

            <section className="relative overflow-hidden rounded-2xl border border-primary/25 bg-secondary p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80">Care note</p>
              <p className="mt-2 font-display text-base font-bold leading-snug text-foreground">
                Water in the morning, and always check the top inch of soil first.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Most houseplants recover from a missed watering far faster than from too much.
              </p>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}