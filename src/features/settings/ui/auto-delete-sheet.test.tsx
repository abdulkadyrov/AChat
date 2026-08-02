import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AutoDeleteSheet } from "@/features/settings/ui/auto-delete-sheet";
import { useUiStore } from "@/shared/model/ui-store";

describe("AutoDeleteSheet", () => {
  it("uses one radio group for TTL periods", () => {
    useUiStore.setState({ modalState: "auto-delete", messageTtl: "7d" });
    render(<AutoDeleteSheet />);
    const options = screen.getAllByRole("radio");
    expect(options).toHaveLength(4);
    expect(screen.getByRole("radio", { name: /7 дней/i })).toBeChecked();
    expect(screen.getByRole("switch", { name: /включить автоудаление/i })).toBeChecked();
  });
});
