import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingState({ label = 'Loading your garden' }) {
  return (
    <div className="space-y-3" role="status" aria-label={label}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div key={key} className="overflow-hidden rounded-2xl border border-border/70 bg-card">
            <Skeleton className="aspect-[4/3] w-full rounded-none bg-white/5" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-3 w-1/3 bg-white/5" />
              <Skeleton className="h-4 w-2/3 bg-white/5" />
              <Skeleton className="h-3 w-1/2 bg-white/5" />
            </div>
          </div>
        ))}
      </div>
      <p className="pt-1 text-center text-xs text-muted-foreground">{label}…</p>
    </div>
  );
}