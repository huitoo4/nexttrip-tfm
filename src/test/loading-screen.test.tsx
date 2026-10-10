import { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoadingScreen } from "@/components/loading-screen";

function Game() {
  const [score, setScore] = useState(0);
  return <LoadingScreen fading={false} score={score} onScore={setScore} />;
}
const useful = /Pasaporte|Cepillo|Gafas|Protector|Cámara|Calcetines/;
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("Loading minigame", () => {
  it("shows all eleven objects once and congratulates a perfect game", () => {
    render(<Game />);
    const seen = new Set<string>();
    for (let i = 0; i < 11; i++) {
      const label = screen.getByTestId("packing-object").textContent ?? "";
      expect(seen.has(label)).toBe(false);
      seen.add(label);
      fireEvent.click(screen.getByRole("button", { name: useful.test(label) ? "¡A la maleta!" : "¡Descártalo!" }));
    }
    expect(seen.size).toBe(11);
    expect(screen.getByText("¡Felicidades!")).toBeInTheDocument();
    expect(screen.getByText("Puntuación: 6 objetos empaquetados")).toBeInTheDocument();
    expect(screen.queryByTestId("packing-object")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("finishes without congratulations after a wrong answer", () => {
    render(<Game />);
    for (let i = 0; i < 11; i++) {
      const label = screen.getByTestId("packing-object").textContent ?? "";
      const pack = i === 0 ? !useful.test(label) : useful.test(label);
      fireEvent.click(screen.getByRole("button", { name: pack ? "¡A la maleta!" : "¡Descártalo!" }));
    }
    expect(screen.getByText("¡Maleta terminada!")).toBeInTheDocument();
    expect(screen.queryByText("¡Felicidades!")).not.toBeInTheDocument();
  });

  it("does not repeat timed-out objects or award a perfect result", () => {
    vi.useFakeTimers();
    render(<Game />);
    const seen = new Set<string>();
    for (let i = 0; i < 11; i++) {
      const label = screen.getByTestId("packing-object").textContent ?? "";
      expect(seen.has(label)).toBe(false);
      seen.add(label);
      act(() => { vi.advanceTimersByTime(2600); });
    }
    expect(screen.getByText("¡Maleta terminada!")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(10000); });
    expect(screen.queryByTestId("packing-object")).not.toBeInTheDocument();
  });
});