import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Leaf, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import ScheduleItem from '@/components/ScheduleItem';
import ScheduleDialog from '@/components/ScheduleDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import useCareData from '@/hooks/useCareData';

export default function CareSchedules() {
  const { plants, schedules, loading, error, reload } = useCareData();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === '1' && plants.length > 0) setDialogOpen(true);
  }, [plants.length]);

  const plantFor = (plantId) => plants.find((plant) => plant.id === plantId);

  async function toggleActive(schedule) {
    setBusy(true);
    try {
      await base44.entities.CareSchedule.update(schedule.id, { active: schedule.active === false });
      await reload();
    } catch (err) {
      toast({ title: 'Could not update schedule', description: err?.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!removing) return;
    setBusy(true);
    try {
      await base44.entities.CareSchedule.delete(removing.id);
      setRemoving(null);
      toast({ title: 'Schedule removed' });
      await reload();
    } catch (err) {
      toast({ title: 'Could not remove schedule', description: err?.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <PageHeader
        eyebrow="Rhythm"
        title="Care schedules"
        description="Every recurring care task across your collection."
        actions={
          <Button
            className="gradient-primary rounded-full text-primary-foreground"
            onClick={() => { setEditing(null); setDialogOpen(true); }}
            disabled={plants.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New schedule
          </Button>
        }
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>
      ) : plants.length === 0 ? (
        <EmptyState
          icon={Leaf}
          title="Add a plant first"
          description="Schedules belong to a plant, so start by adding one to your collection."
          action={
            <Button asChild className="rounded-full">
              <Link to="/plants/new">Add plant</Link>
            </Button>
          }
        />
      ) : schedules.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No schedules yet"
          description="Set a rhythm for watering, feeding, pruning or repotting and we will handle the due dates."
          action={
            <Button className="rounded-full" onClick={() => { setEditing(null); setDialogOpen(true); }}>
              Create your first schedule
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {schedules.map((schedule) => (
            <ScheduleItem
              key={schedule.id}
              schedule={schedule}
              plant={plantFor(schedule.plantId)}
              busy={busy}
              onEdit={() => { setEditing(schedule); setDialogOpen(true); }}
              onToggleActive={() => toggleActive(schedule)}
              onDelete={() => setRemoving(schedule)}
            />
          ))}
        </div>
      )}

      <ScheduleDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        plants={plants}
        schedule={editing}
        onSaved={reload}
      />

      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="Delete this schedule?"
        description="It will stop creating reminders. Completed care history is kept."
        confirmLabel="Delete schedule"
        onConfirm={handleDelete}
        busy={busy}
      />
    </div>
  );
}