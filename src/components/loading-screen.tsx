import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const MORPH = ["✈️", "🧳", "🦆", "🌲"];
const ITEMS = [
  { label: "🛂 Pasaporte", good: true },
  { label: "🪥 Cepillo de dientes", good: true },
  { label: "🕶️ Gafas de sol", good: true },
  { label: "🧴 Protector solar", good: true },
  { label: "📷 Cámara", good: true },
  { label: "🧦 Calcetines", good: true },
  { label: "🍍 Una piña", good: false },
  { label: "🍞 Una tostadora", good: false },
  { label: "⚓ Un ancla de barco", good: false },
  { label: "🌵 Un cactus gigante", good: false },
  { label: "🪑 Una silla de oficina", good: false },
];

export function LoadingScreen({ fading, score, onScore }: { fading: boolean; score: number; onScore: (fn: (n: number) => number) => void }) {
  const [m, setM] = useState(0);
  const [deck, setDeck] = useState<typeof ITEMS>([]);
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [fb, setFb] = useState<string | null>(null);
  const handled = useRef(-1);
  const item = deck[index];
  const complete = deck.length > 0 && index === deck.length;

  useEffect(() => {
    const shuffled = [...ITEMS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const first = shuffled[i];
      const second = shuffled[j];
      if (first && second) { shuffled[i] = second; shuffled[j] = first; }
    }
    setDeck(shuffled);
  }, []);
  useEffect(() => { const t = setInterval(() => setM((x) => (x + 1) % MORPH.length), 1400); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (!item || fading) return;
    const t = setTimeout(() => {
      if (handled.current === index) return;
      handled.current = index;
      setFb("¡Demasiado lento!");
      setMistakes((n) => n + 1);
      setIndex((n) => n + 1);
    }, 2600);
    return () => clearTimeout(t);
  }, [item, index, fading]);

  const answer = (pack: boolean) => {
    if (!item || fading || handled.current === index) return;
    handled.current = index;
    const ok = pack === item.good;
    if (ok && pack) onScore((n) => n + 1);
    if (!ok) setMistakes((n) => n + 1);
    setFb(ok ? (pack ? "¡Bien empaquetado! ✓" : "¡Fuera! ✓") : pack ? "¡Eso no cabe en la maleta! ✗" : "¡Lo necesitabas! ✗");
    setIndex((n) => n + 1);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Preparando tus viajes" className={`no-print fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm transition-opacity duration-400 motion-reduce:transition-none ${fading ? "opacity-0 pointer-events-none" : "opacity-100 animate-rise"}`}>
      <div className="w-full max-w-md rounded-[28px] bg-card p-7 text-center shadow-2xl">
        <div className="mx-auto grid size-24 place-items-center rounded-full bg-primary/10">
          <span key={m} className="nt-spin text-5xl motion-reduce:animate-none" aria-hidden="true">{MORPH[m]}</span>
        </div>
        <p className="mt-4 font-display text-xl font-semibold">Buscando tus viajes…</p>
        <div className="mt-5 border-t border-border pt-5">
          {complete ? (
            <div role="status" className="animate-rise py-5">
              <span className="text-5xl" aria-hidden="true">{mistakes === 0 ? "🏆" : "🧳"}</span>
              <h2 className="mt-4 font-display text-3xl font-semibold">{mistakes === 0 ? "¡Felicidades!" : "¡Maleta terminada!"}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{mistakes === 0 ? "Has acertado los 11 objetos. ¡Tu maleta está perfecta!" : "Has clasificado todos los objetos."}</p>
              <p className="mt-4 font-mono text-sm font-bold">Puntuación: {score} objetos empaquetados</p>
              <p className="mt-5 text-xs text-muted-foreground">Tus viajes estarán listos en un momento…</p>
            </div>
          ) : (
            <>
              <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-primary">¿Qué meterías en tu maleta?</p>
              <p className="mt-2 text-xs text-muted-foreground">Objeto {Math.min(index + 1, ITEMS.length)} de {ITEMS.length}</p>
              <div className="relative mx-auto mt-4 h-28 w-48">
                <div className="absolute inset-x-0 bottom-0 h-14 rounded-b-2xl rounded-t-md border-2 border-dashed border-foreground/30 bg-card/70" />
                <div className="absolute inset-x-4 bottom-14 h-3 rounded-t-lg border-2 border-b-0 border-foreground/30" />
                {item && <div key={index} data-testid="packing-object" className="nt-drop absolute inset-x-0 top-0 mx-auto w-fit rounded-full bg-card px-4 py-2 text-[14px] font-bold shadow-md">{item.label}</div>}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button type="button" disabled={!item || fading} onClick={() => answer(true)} className="h-auto whitespace-normal rounded-full px-3 py-2.5 text-[13px] font-bold">¡A la maleta!</Button>
                <Button type="button" variant="outline" disabled={!item || fading} onClick={() => answer(false)} className="h-auto whitespace-normal rounded-full px-3 py-2.5 text-[13px] font-bold text-destructive">¡Descártalo!</Button>
              </div>
              <p aria-live="polite" className="mt-3 min-h-4 text-[12px] font-semibold text-muted-foreground">{fb}</p>
              <p className="mt-1 font-mono text-[14px] font-bold">Puntuación: {score} objetos empaquetados</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}