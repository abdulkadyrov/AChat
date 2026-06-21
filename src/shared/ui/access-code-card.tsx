interface AccessCodeCardProps {
  value: string;
  title?: string;
}

export function AccessCodeCard({ value, title }: AccessCodeCardProps) {
  return (
    <div className="text-center">
      {title && <p className="mb-3 text-sm font-semibold">{title}</p>}
      <div className="mx-auto rounded-[24px] border border-slate-200 bg-white px-6 py-8 dark:border-white/10 dark:bg-white/5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-soft dark:text-slate-400">
          Код доступа
        </p>
        <p className="mt-3 text-4xl font-black tracking-[0.35em] text-accent">{value}</p>
      </div>
    </div>
  );
}
