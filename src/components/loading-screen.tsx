import { useEffect, useState } from "react";

const MORPH = ["✈️", "🧳", "🦆", "🌲"];

export function LoadingScreen({ fading }: { fading: boolean }) {
  const [m, setM] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setM((x) => (x + 1) % MORPH.length), 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`no-print fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm transition-opacity duration-400 motion-reduce:transition-none ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100 animate-rise"
      }`}
    >
      <div className="w-full max-w-sm rounded-[28px] bg-card p-8 text-center shadow-2xl">
        <div className="mx-auto grid size-24 place-items-center rounded-full bg-primary/10">
          <span key={m} className="nt-spin text-5xl motion-reduce:animate-none" aria-hidden="true">
            {MORPH[m]}
          </span>
        </div>
        <p className="mt-5 font-display text-xl font-semibold">Buscando tus viajes…</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Comparando destinos, precios y distancias para ti.
        </p>
      </div>
    </div>
  );
}
