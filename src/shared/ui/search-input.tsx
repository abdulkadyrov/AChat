import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <label className="flex h-11 items-center gap-3 rounded-[14px] bg-[var(--color-surface-secondary)] px-3">
      <Search aria-hidden="true" size={19} className="text-[var(--color-text-secondary)]" />
      <span className="visually-hidden">Поиск по чатам</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Поиск"
        aria-label="Поиск по чатам"
        className="w-full bg-transparent outline-none placeholder:text-[var(--color-text-muted)]"
      />
    </label>
  );
}
