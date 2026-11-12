import { Droplets, Flower2, Scissors, Sparkles, Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { careTypeLabel } from '@/lib/plantCare';

const ICONS = {
  watering: Droplets,
  fertilizing: Sprout,
  pruning: Scissors,
  repotting: Flower2,
  maintenance: Sparkles,
};

const TONES = {
  watering: 'bg-chart-5/15 text-chart-5 ring-chart-5/25',
  fertilizing: 'bg-chart-1/15 text-chart-1 ring-chart-1/25',
  pruning: 'bg-chart-3/15 text-chart-3 ring-chart-3/25',
  repotting: 'bg-chart-2/20 text-chart-2 ring-chart-2/30',
  maintenance: 'bg-white/5 text-muted-foreground ring-border',
};

export function CareTypeIcon({ careType, className }) {
  const Icon = ICONS[careType] || Sparkles;
  return <Icon className={cn('h-5 w-5', className)} strokeWidth={1.7} aria-hidden="true" />;
}

export default function CareTypeBadge({ careType, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1',
        TONES[careType] || TONES.maintenance,
        className,
      )}
    >
      <CareTypeIcon careType={careType} className="h-3.5 w-3.5" />
      {careTypeLabel(careType)}
    </span>
  );
}