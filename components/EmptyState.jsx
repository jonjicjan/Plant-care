import { Leaf } from 'lucide-react';
import { GALLERY } from '@/lib/plantImages';
import { Image } from '@/components/ui/image';

export default function EmptyState({ icon: Icon = Leaf, title, description, action }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-primary/25 bg-card/60 px-6 py-12 text-center">
      <div className="pointer-events-none absolute inset-0 opacity-[0.14]" aria-hidden="true">
        <Image src={GALLERY.fern} alt="" fittingType="fill" className="h-full w-full object-cover" />
      </div>
      <div className="relative">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
          <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
        </span>
        <p className="mt-4 font-display text-lg font-bold">{title}</p>
        {description ? (
          <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
        {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}