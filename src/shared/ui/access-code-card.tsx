interface AccessCodeCardProps {
  value: string;
  title?: string;
}

export function AccessCodeCard({ value, title }: AccessCodeCardProps) {
  return (
    <div className="text-center">
      {title && <p className="mb-3 text-sm font-semibold">{title}</p>}
      <div className="mx-auto rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-6 py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-text-secondary)]">
          Код доступа
        </p>
        <p className="mt-3 text-4xl font-black tracking-[0.35em] text-[var(--color-accent)]">
          {value}
        </p>
      </div>
    </div>
  );
}
