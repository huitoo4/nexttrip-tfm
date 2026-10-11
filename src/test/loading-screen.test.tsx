import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingScreen } from "@/components/loading-screen";

describe("LoadingScreen", () => {
  it("shows only a waiting message, without the packing minigame", () => {
    render(<LoadingScreen fading={false} />);
    expect(screen.getByText("Buscando tus viajes…")).toBeInTheDocument();
    expect(screen.queryByText("¿Qué meterías en tu maleta?")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "¡A la maleta!" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "¡Descártalo!" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Puntuación/)).not.toBeInTheDocument();
  });
});
