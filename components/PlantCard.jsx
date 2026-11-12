import { Link } from 'react-router-dom';
import { ArrowRight, CalendarClock, Pencil, Trash2 } from 'lucide-react';
import PlantPhoto from '@/components/PlantPhoto';
import { Button } from '@/components/ui/button';
import { careTypeLabel, dueLabel, formatDate, taskStatus } from '@/lib/plantCare';

export default function PlantCard({ plant, nextCare, onDelete }) {
  const status = nextCare ? taskStatus(nextCare.nextDueAt) : null;

  return (
    <article className="group card-hover flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_24px_60px_-46px_rgba(0,0,0,0.95)]">
      <Link to={`/plants/${plant.id}`} className="relative block aspect-[4/3] w-full max-w-full overflow-hidden" aria-label={`View ${plant.plantName}`}>
        <PlantPhoto
          uri={plant.imageUrl}
          plantType={plant.plantType}
          alt={plant.plantName}
          className="h-full w-full max-w-full object-cover transition duration-500 group-hover:scale-[1.06]"
        />
        <span className="image-overlay absolute inset-0" aria-hidden="true" />
        <span className="absolute left-3 top-3 rounded-full bg-background/75 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary backdrop-blur">
          {plant.plantType || 'Plant'}
        </span>
        <div className="absolute inset-x-3 bottom-3">
          <h3 className="truncate font-display text-base font-bold leading-tight text-foreground drop-shadow">{plant.plantName}</h3>
          <p className="mt-0.5 text-[11px] text-foreground/70">Added {formatDate(plant.dateAdded)}</p>
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between gap-3 p-3.5">
        {nextCare ? (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.04] px-2.5 py-2 text-[11px] ring-1 ring-border/70">
            <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden="true" />
              <span className="truncate">{careTypeLabel(nextCare.careType)}</span>
            </span>
            <span
              className={
                status === 'overdue'
                  ? 'shrink-0 font-semibold text-destructive'
                  : status === 'today'
                    ? 'shrink-0 font-semibold text-primary'
                    : 'shrink-0 text-muted-foreground'
              }
            >
              {dueLabel(nextCare.nextDueAt)}
            </span>
          </div>
        ) : (
          <div className="rounded-xl bg-white/[0.04] px-2.5 py-2 text-[11px] text-muted-foreground ring-1 ring-border/70">
            No care scheduled yet
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="h-8 flex-1 rounded-full border-primary/30 text-xs hover:bg-primary/10 hover:text-primary">
            <Link to={`/plants/${plant.id}`}>
              View details
              <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="icon" variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary">
            <Link to={`/plants/${plant.id}/edit`} aria-label={`Edit ${plant.plantName}`}>
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(plant)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Delete ${plant.plantName}`}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}