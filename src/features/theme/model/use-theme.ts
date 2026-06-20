import { useUiStore } from "@/shared/model/ui-store";

export function useTheme() {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);

  return {
    theme,
    toggleTheme: () => setTheme(theme === "light" ? "dark" : "light")
  };
}
