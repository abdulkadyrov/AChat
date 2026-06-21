import { useUiStore, type UiState } from "@/shared/model/ui-store";

export function useTheme() {
  const theme = useUiStore((state: UiState) => state.theme);
  const setTheme = useUiStore((state: UiState) => state.setTheme);

  return {
    theme,
    toggleTheme: () => setTheme(theme === "light" ? "dark" : "light")
  };
}
