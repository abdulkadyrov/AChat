import { describe, expect, it, vi } from "vitest";
import { applyTheme, resolveTheme } from "@/shared/lib/theme/apply-theme";

describe("theme selection", () => {
  it("resolves system preference", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    expect(resolveTheme("system")).toBe("dark");
  });

  it("applies theme before rendering surfaces", () => {
    applyTheme("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });
});
