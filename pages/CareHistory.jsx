import { useCallback, useEffect, useState } from 'react';
import { History, Leaf } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import CareTypeBadge from '@/components/CareTypeBadge';
import PlantPhoto from '@/components/PlantPhoto';
import { asItems } from '@/lib/records';
import { CARE_TYPES, formatDate } from '@/lib/plantCare';

export default function CareHistory() {
  const [plants, setPlants] = useState([]);
  const [logs, setLogs] = useState([]);
  const [plantId, setPlantId] = useState('all');
  const [careType, setCareType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.entities.Plant.list({ sort: 'plantName', limit: 200 })
      .then((result) => setPlants(asItems(result)))
      .catch(() => setPlants([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = {};
      if (plantId !== 'all') query.plantId = plantId;
      if (careType !== 'all') query.careType = careType;
      const result = await base44.entities.CareLog.filter(query, { sort: '-completedAt', limit: 200 });
      setLogs(asItems(result));
    } catch (err) {
      setError(err?.message || 'We could not load your care history.');
    } finally {
      setLoading(false);
    }
  }, [plantId, careType]);

  useEffect(() => {
    load();
  }, [load]);

  const plantFor = (id) => plants.find((plant) => plant.id === id);
  const hasFilters = plantId !== 'all' || careType !== 'all';

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <PageHeader
        eyebrow="Journal"
        title="Care History"
        description="Every care task you have completed, newest first."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:w-60">
          <label htmlFor="filter-plant" className="sr-only">
            Filter by plant
          </label>
          <select id="filter-plant" className="field-shell h-10" value={plantId} onChange={(event) => setPlantId(event.target.value)}>
            <option value="all">All plants</option>
            {plants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.plantName}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:w-56">
          <label htmlFor="filter-type" className="sr-only">
            Filter by activity
          </label>
          <select id="filter-type" className="field-shell h-10" value={careType} onChange={(event) => setCareType(event.target.value)}>
            <option value="all">All activities</option>
            {CARE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setPlantId('all');
              setCareType('all');
            }}
            className="self-start rounded-full px-3 py-2 text-xs font-semibold text-primary underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {loading ? (
        <LoadingState label="Loading care history" />
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={hasFilters ? Leaf : History}
          title={hasFilters ? 'No matching care yet' : 'No completed care yet'}
          description={
            hasFilters ? 'Try a different plant or activity.' : 'Mark a reminder as completed and it will be recorded here.'
          }
        />
      ) : (
        <div className="relative pl-5">
          <span className="absolute bottom-2 left-[7px] top-2 w-px bg-border" aria-hidden="true" />
          <ul className="space-y-2.5">
            {logs.map((log) => {
              const plant = plantFor(log.plantId);
              return (
                <li key={log.id} className="relative">
                  <span
                    className="absolute -left-5 top-5 h-[9px] w-[9px] rounded-full border-2 border-background bg-primary"
                    aria-hidden="true"
                  />
                  <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card p-3 transition hover:border-primary/30">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-border/80">
                      <PlantPhoto
                        uri={plant?.imageUrl}
                        plantType={plant?.plantType}
                        alt={plant?.plantName || 'Plant'}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{plant?.plantName || 'Removed plant'}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {formatDate(log.completedAt, 'MMM d, yyyy · HH:mm')}
                        {log.scheduleId ? ' · Scheduled care' : ' · Logged care'}
                      </p>
                      {log.notes ? <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{log.notes}</p> : null}
                    </div>
                    <div className="shrink-0">
                      <CareTypeBadge careType={log.careType} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}