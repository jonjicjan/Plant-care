export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/80">{eyebrow}</p>
        ) : null}
        <h1 className="mt-2 font-display text-[27px] font-extrabold leading-tight tracking-tight sm:text-[34px]">{title}</h1>
        {description ? <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}