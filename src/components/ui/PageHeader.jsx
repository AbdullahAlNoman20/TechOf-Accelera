export default function PageHeader({ title, subtitle, actions, back }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        {back}
        <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-0.5 max-w-3xl text-sm text-ink-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
