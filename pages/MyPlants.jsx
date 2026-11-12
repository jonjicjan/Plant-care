import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Plus, Search, SlidersHorizontal } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import PlantCard from '@/components/PlantCard';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import useCareData from '@/hooks/useCareData';
import { nextCareForPlant } from '@/lib/tasks';
import { PLANT_TYPES } from '@/lib/plantCare';

export default function MyPlants() {
  const { plants, schedules, loading, error, reload } = useCareData();
  const { toast } = useToast();
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);

  const categories = useMemo(() => {
    const used = new Set(plants.map((plant) => plant.plantType).filter(Boolean));
    return ['all', ...PLANT_TYPES.filter((type) => used.has(type))];
  }, [plants]);

  const filtered = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return plants.filter((plant) => {
      const matchesTerm = !needle || (plant.plantName || '').toLowerCase().includes(needle);
      const matchesCategory = category === 'all' || plant.plantType === category;
      return matchesTerm && matchesCategory;
    });
  }, [plants, term, category]);

  async function handleDelete() {
    if (!removing) return;
    setBusy(true);
    try {
      await base44.entities.CareLog.deleteMany({ plantId: removing.id });
      await base44.entities.CareSchedule.deleteMany({ plantId: removing.id });
      await base44.entities.Plant.delete(removing.id);
      toast({ title: 'Plant removed', description: `${removing.plantName} and its care history were removed.` });
      setRemoving(null);
      await reload();
    } catch (err) {
      toast({ title: 'Could not remove plant', description: err?.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <PageHeader
        eyebrow="Collection"
        title="My Plants"
        description="Every plant you look after, with its next care date at a glance."
        actions={
          <Button asChild className="gradient-primary rounded-full text-primary-foreground">
            <Link to="/plants/new">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Add plant
            </Link>
          </Button>
        }
      />

      {plants.length > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search by plant name"
              aria-label="Search plants by name"
              className="field-shell pl-10"
            />
          </div>
          <div className="relative sm:w-56">
            <SlidersHorizontal
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter plants by category"
              className="field-shell appearance-none pl-10"
            >
              {categories.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All categories' : type}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {loading ? (
        <LoadingState label="Gathering your plants" />
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      ) : plants.length === 0 ? (
        <EmptyState
          icon={Leaf}
          title="No plants yet"
          description="Add your first plant and we will help you keep its care on track."
          action={
            <Button asChild className="gradient-primary rounded-full text-primary-foreground">
              <Link to="/plants/new">
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Add plant
              </Link>
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches"
          description="Try another name or category to find the plant you are looking for."
          action={
            <Button
              variant="outline"
              className="rounded-full border-border"
              onClick={() => {
                setTerm('');
                setCategory('all');
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {plants.length} {plants.length === 1 ? 'plant' : 'plants'}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                nextCare={nextCareForPlant(schedules, plant.id)}
                onDelete={setRemoving}
              />
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={`Delete ${removing?.plantName || 'this plant'}?`}
        description="This removes the plant, its schedules and its care history. This cannot be undone."
        confirmLabel="Delete plant"
        onConfirm={handleDelete}
        busy={busy}
      />
    </div>
  );
}