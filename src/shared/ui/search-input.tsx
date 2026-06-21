import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <label className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3">
      <Search className="h-4 w-4 text-ink-soft dark:text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Поиск"
        className="w-full bg-transparent outline-none placeholder:text-ink-soft/80 dark:placeholder:text-slate-500"
      />
    </label>
  );
}
