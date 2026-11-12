import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarPlus, Clock, Leaf, Pencil, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PlantPhoto from '@/components/PlantPhoto';
import LoadingState from '@/components/LoadingState';
import ScheduleItem from '@/components/ScheduleItem';
import ScheduleDialog from '@/components/ScheduleDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import TaskRow from '@/components/TaskRow';
import EmptyState from '@/components/EmptyState';
import CareTypeBadge from '@/components/CareTypeBadge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import useCompleteTask from '@/hooks/useCompleteTask';
import { asItems } from '@/lib/records';
import { buildTasks } from '@/lib/tasks';
import { formatDate } from '@/lib/plantCare';

export default function PlantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [plant, setPlant] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [removingSchedule, setRemovingSchedule] = useState(null);
  const [deletePlantOpen, setDeletePlantOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [plantRecord, scheduleResult, logResult] = await Promise.all([
        base44.entities.Plant.get(id),
        base44.entities.CareSchedule.filter({ plantId: id }, { sort: 'nextDueAt', limit: 100 }),
        base44.entities.CareLog.filter({ plantId: id }, { sort: '-completedAt', limit: 8 }),
      ]);
      if (!plantRecord) {
        setNotFound(true);
      } else {
        setPlant(plantRecord);
      }
      setSchedules(asItems(scheduleResult));
      setLogs(asItems(logResult));
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!notFound) return undefined;
    const meta = document.createElement('meta');
    meta.name = 'prerender-status-code';
    meta.content = '404';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, [notFound]);

  const { complete, busyId } = useCompleteTask(load);
  const tasks = buildTasks(schedules, plant ? [plant] : []);

  async function toggleSchedule(schedule, nextActive) {
    setBusy(true);
    try {
      await base44.entities.CareSchedule.update(schedule.id, { active: nextActive });
      await load();
    } catch (err) {
      toast({ title: 'Could not update schedule', description: err?.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteSchedule() {
    if (!removingSchedule) return;
    setBusy(true);
    try {
      await base44.entities.CareSchedule.delete(removingSchedule.id);
      setRemovingSchedule(null);
      toast({ title: 'Schedule removed' });
      await load();
    } catch (err) {
      toast({ title: 'Could not remove schedule', description: err?.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  }

  async function handleDeletePlant() {
    setBusy(true);
    try {
      await base44.entities.CareLog.deleteMany({ plantId: id });
      await base44.entities.CareSchedule.deleteMany({ plantId: id });
      await base44.entities.Plant.delete(id);
      toast({ title: 'Plant removed', description: 'Its care history was removed too.' });
      navigate('/plants');
    } catch (err) {
      setBusy(false);
      toast({ title: 'Could not remove plant', description: err?.message, variant: 'destructive' });
    }
  }

  if (loading) return <LoadingState label="Opening plant" />;

  if (notFound || !plant) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-10 text-center">
        <h1 className="font-display text-2xl font-bold">Plant not found</h1>
        <p className="text-sm text-muted-foreground">It may have been removed, or it belongs to another account.</p>
        <Button asChild className="gradient-primary rounded-full text-primary-foreground">
          <Link to="/plants">Back to my plants</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/plants" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          My plants
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full border-border bg-white/[0.03]">
            <Link to={`/plants/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/15 hover:text-destructive"
            onClick={() => setDeletePlantOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Delete
          </Button>
        </div>
      </div>

      <section className="card-surface overflow-hidden">
        <div className="grid md:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
          <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:h-full md:min-h-[240px]">
            <PlantPhoto
              uri={plant.imageUrl}
              plantType={plant.plantType}
              alt={plant.plantName}
              className="h-full w-full object-cover"
            />
            <span className="image-overlay absolute inset-0 md:hidden" aria-hidden="true" />
          </div>
          <div className="p-5 sm:p-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary ring-1 ring-primary/25">
              <Leaf className="h-3 w-3" aria-hidden="true" />
              {plant.plantType || 'Plant'}
            </span>
            <h1 className="mt-3 font-display text-[28px] font-extrabold leading-tight sm:text-[34px]">{plant.plantName}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Added {formatDate(plant.dateAdded)}</p>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="rounded-xl bg-white/[0.04] px-3 py-2.5 ring-1 ring-border/70">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Schedules</p>
                <p className="mt-0.5 font-display text-lg font-bold">{schedules.length}</p>
              </div>
              <div className="rounded-xl bg-white/[0.04] px-3 py-2.5 ring-1 ring-border/70">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Care tasks ahead</p>
                <p className="mt-0.5 font-display text-lg font-bold">{tasks.length}</p>
              </div>
            </div>

            {plant.notes ? (
              <p className="mt-4 whitespace-pre-line rounded-xl bg-secondary/70 p-4 text-sm leading-relaxed text-foreground/85">
                {plant.notes}
              </p>
            ) : (
              <p className="mt-4 rounded-xl bg-white/[0.03] p-4 text-sm text-muted-foreground ring-1 ring-border/60">
                No notes yet. Add light, soil or watering preferences when you edit this plant.
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                className="gradient-primary rounded-full text-primary-foreground"
                onClick={() => {
                  setEditingSchedule(null);
                  setScheduleOpen(true);
                }}
              >
                <CalendarPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                Add care schedule
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="card-surface p-5 sm:p-6">
        <div>
          <h2 className="font-display text-lg font-bold">Care schedules</h2>
          <p className="mt-1 text-sm text-muted-foreground">Recurring care for this plant.</p>
        </div>
        {schedules.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={CalendarPlus}
              title="No schedules yet"
              description="Add watering, feeding or any other care rhythm for this plant."
              action={
                <Button
                  className="gradient-primary rounded-full text-primary-foreground"
                  onClick={() => {
                    setEditingSchedule(null);
                    setScheduleOpen(true);
                  }}
                >
                  Create schedule
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-4 space-y-2.5">
            {schedules.map((schedule) => (
              <ScheduleItem
                key={schedule.id}
                schedule={schedule}
                plant={plant}
                busy={busy}
                onEdit={() => {
                  setEditingSchedule(schedule);
                  setScheduleOpen(true);
                }}
                onToggleActive={() => toggleSchedule(schedule, schedule.active === false)}
                onDelete={() => setRemovingSchedule(schedule)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="card-surface p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold">Upcoming care</h2>
        {tasks.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nothing scheduled. Create a schedule to see tasks here.</p>
        ) : (
          <div className="mt-3 divide-y divide-border/60">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} onComplete={complete} busy={busyId === task.id} />
            ))}
          </div>
        )}
      </section>

      <section className="card-surface p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold">Recent care history</h2>
          <Link to="/history" className="text-xs font-semibold text-primary underline-offset-4 hover:underline">
            Full history
          </Link>
        </div>
        {logs.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Completed care will appear here.</p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {logs.map((log) => (
              <li key={log.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5 ring-1 ring-border/60">
                <CareTypeBadge careType={log.careType} />
                <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {formatDate(log.completedAt, 'MMM d, yyyy · HH:mm')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {loadError ? <p className="text-sm text-destructive">{loadError}</p> : null}

      <ScheduleDialog
        open={scheduleOpen}
        onOpenChange={(open) => {
          setScheduleOpen(open);
          if (!open) setEditingSchedule(null);
        }}
        plants={[plant]}
        schedule={editingSchedule}
        defaultPlantId={id}
        onSaved={load}
      />

      <ConfirmDialog
        open={Boolean(removingSchedule)}
        onOpenChange={(open) => !open && setRemovingSchedule(null)}
        title="Delete this schedule?"
        description="The schedule will stop creating reminders. Past care history is kept."
        confirmLabel="Delete schedule"
        onConfirm={handleDeleteSchedule}
        busy={busy}
      />

      <ConfirmDialog
        open={deletePlantOpen}
        onOpenChange={setDeletePlantOpen}
        title={`Delete ${plant.plantName}?`}
        description="This removes the plant, its schedules and its care history. This cannot be undone."
        confirmLabel="Delete plant"
        onConfirm={handleDeletePlant}
        busy={busy}
      />
    </div>
  );
}