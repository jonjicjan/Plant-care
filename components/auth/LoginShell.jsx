import React from 'react';
import { BellRing, CalendarClock, History } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { HERO_IMAGE } from '@/lib/plantImages';

const LOGO = 'https://media.base44.com/images/public/6ae6528026f350ab832f641a/376ed2f18_logo.png';

const FEATURES = [
  {
    icon: CalendarClock,
    title: 'Smart schedules',
    text: 'Care rhythms that repeat for you.',
  },
  {
    icon: BellRing,
    title: 'Timely reminders',
    text: 'Know what needs care, when.',
  },
  {
    icon: History,
    title: 'Care history',
    text: 'See every watering and feed.',
  },
];

export default function LoginShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-8 sm:px-6 sm:py-10 lg:min-h-screen lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:items-center lg:gap-14 lg:py-12">
        <section className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/25 bg-secondary">
              <Image src={LOGO} alt="Plant care reminder logo" fittingType="fit" className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-[13px] font-extrabold uppercase tracking-[0.18em] text-primary">
                Plant care
              </p>
              <p className="text-[11px] text-muted-foreground">Reminder application</p>
            </div>
          </div>

          <div className="relative mt-5 w-full max-w-full overflow-hidden rounded-3xl border border-border/80 bg-card shadow-[0_40px_90px_-60px_rgba(0,0,0,1)]">
            <Image
              src={HERO_IMAGE}
              alt="A calm collection of houseplants by a window"
              fittingType="fill"
              className="h-40 w-full max-w-full object-cover sm:h-56 lg:h-[19rem]"
            />
            <span className="image-overlay absolute inset-0" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="font-display text-xl font-extrabold leading-[1.15] tracking-tight sm:text-2xl">
                Every plant, <span className="gradient-text">perfectly cared for.</span>
              </p>
              <p className="mt-1 max-w-sm text-[11px] leading-relaxed text-foreground/80 sm:text-sm">
                Watering, feeding and repotting on a gentle rhythm that fits your home.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-3">
            {FEATURES.map(({ icon: Icon, title: label, text }) => (
              <div key={label} className="min-w-0 rounded-2xl border border-border/70 bg-white/[0.03] p-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="mt-2 font-display text-[11px] font-bold leading-tight text-foreground sm:text-xs">{label}</p>
                <p className="mt-1 hidden text-[11px] leading-snug text-muted-foreground sm:block">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 min-w-0 lg:mt-0">
          <div className="card-surface rounded-3xl p-5 sm:p-8">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
          {footer && <p className="mt-5 text-center text-sm text-muted-foreground">{footer}</p>}
        </section>
      </div>
    </div>
  );
}