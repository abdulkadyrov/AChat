import type { ThemeMode } from "@/shared/types/domain";

export function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.style.colorScheme = theme;

  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}
