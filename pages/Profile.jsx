import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import ProfileCard from '@/components/profile/ProfileCard';
import PlantCard from '@/components/PlantCard';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import { Button } from '@/components/ui/button';
import useCareData from '@/hooks/useCareData';
import { nextCareForPlant } from '@/lib/tasks';

export default function Profile() {
  const { plants, schedules, loading } = useCareData();
  const [user, setUser] = useState(null);
  const [careLogCount, setCareLogCount] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then((account) => {
        setUser(account);
        return base44.entities.CareLog.count({ created_by_id: account.id });
      })
      .then((count) => setCareLogCount(count))
      .catch(() => setUser(null));
  }, []);

  const activeSchedules = schedules.filter((schedule) => schedule.active !== false).length;

  return (
    <div className="space-y-5 animate-in fade-in-50 duration-500">
      <PageHeader
        eyebrow="Your account"
        title="Profile"
        description="Your details, your garden at a glance and every plant you are caring for."
        actions={
          <Button asChild className="gradient-primary h-10 rounded-full text-primary-foreground">
            <Link to="/plants/new">
              <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Add plant
            </Link>
          </Button>
        }
      />

      <ProfileCard
        user={user}
        plantCount={plants.length}
        scheduleCount={activeSchedules}
        careLogCount={careLogCount}
      />

      <section className="min-w-0 space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-extrabold tracking-tight">Plant collection</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {plants.length > 0 ? `${plants.length} ${plants.length === 1 ? 'plant' : 'plants'} in your care` : 'Nothing here yet'}
            </p>
          </div>
          {plants.length > 0 ? (
            <Link to="/plants" className="text-xs font-semibold text-primary underline-offset-4 hover:underline">
              Manage all
            </Link>
          ) : null}
        </div>

        {loading ? (
          <LoadingState />
        ) : plants.length === 0 ? (
          <EmptyState
            icon={Leaf}
            title="No plants yet"
            description="Add your first plant to start building your collection."
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
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {plants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} nextCare={nextCareForPlant(schedules, plant.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}