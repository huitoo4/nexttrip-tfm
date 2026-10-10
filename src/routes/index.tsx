import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  STYLES, COMPANY, PACES, INTERESTS,
  finalizeTrips, tierFor, eur, itineraryText, breakdown, MODE_LABEL, type Answers, type Trip, type CostItem,
} from "@/lib/trips";
import { suggestTrips } from "@/lib/ai.functions";
import { LoadingScreen } from "@/components/loading-screen";
import { searchCities, resolveOrigin, cityLabel } from "@/lib/geo";

function OriginInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [q, setQ] = useState(value);
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  useEffect(() => setQ(value), [value]);
  const results = open ? searchCities(q, 40) : [];
  const r = resolveOrigin(value);
  const pick = (label: string) => { onChange(label); setQ(label); setOpen(false); };
  return (
    <div className="relative mt-4">
      <label className="block">
        <span className="sr-only">Escribe tu ciudad de origen</span>
        <input
          type="text"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-autocomplete="list"
          value={q}
          placeholder="Escribe cualquier ciudad del mundo…"
          onChange={(e) => { setQ(e.target.value); setOpen(true); setHi(0); onChange(e.target.value); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (!results.length) return;
            if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => (h + 1) % results.length); }
            if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => (h - 1 + results.length) % results.length); }
            if (e.key === "Enter") { e.preventDefault(); const c = results[hi]; if (c) pick(cityLabel(c)); }
          }}
          className="w-full rounded-2xl border border-input bg-card/70 px-4 py-3 text-[14px] font-semibold outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      {results.length > 0 && (
        <ul role="listbox" className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-border bg-card shadow-lg">
          {results.map((c, i) => {
            return (
              <li key={cityLabel(c)} role="option" aria-selected={i === hi}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); pick(cityLabel(c)); }}
                  onMouseEnter={() => setHi(i)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] ${i === hi ? "bg-primary/10" : ""}`}
                >
                  <span><span className="font-bold">{c.name}</span> <span className="text-muted-foreground">· {c.country}</span></span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {r.city && (
        <p className="mt-2 rounded-xl bg-accent/10 px-3 py-2 text-[12px] font-semibold text-foreground/75">
          Origen: {r.city.name}, {r.city.country} · el medio de transporte se elegirá según el destino
        </p>
      )}
      {!r.city && value.trim().length > 0 && !open && (
        <p role="alert" className="mt-2 rounded-xl bg-destructive/10 px-3 py-2 text-[12px] font-semibold text-destructive">
          ⚠ No reconocemos «{value}». Elige de la lista una ciudad más conocida o cercana (o escribe un país para ver sus ciudades).
        </p>
      )}
    </div>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NextTrip — Viajes personalizados según tu presupuesto" },
      { name: "description", content: "Responde 5 preguntas, elige tu presupuesto y tus días, y recibe hasta 3 itinerarios con desglose de transporte, estancia y actividades." },
      { property: "og:title", content: "NextTrip — Viajes personalizados según tu presupuesto" },
      { property: "og:description", content: "Tres itinerarios a tu medida con desglose real de costes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STEPS = ["Estilo", "Compañía", "Ritmo", "Intereses", "Presupuesto", "Días"] as const;
const DAY_OPTIONS = [3, 5, 7, 10, 14];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-5 py-2.5 text-[14px] font-semibold transition-all duration-200 ${
        active ? "bg-primary text-primary-foreground shadow-brand scale-[1.03]" : "glass-soft text-foreground/65 hover:text-foreground hover:-translate-y-0.5"
      }`}
    >
      {children}
    </button>
  );
}

function Index() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({
    style: "Cultural", company: "Pareja", pace: "Equilibrado", interests: ["Gastronomía"], origin: "", budget: 2400,
    days: undefined,
  });
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const saved = savedTrips.map((x) => x.id);
  const [showSaved, setShowSaved] = useState(false);
  const [exporting, setExporting] = useState<{ trip: Trip; answers: Answers } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const onboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("nexttrip-saved") || "[]");
      setSavedTrips(s);
    } catch { /* ignore */ }
  }, []);

  const tier = tierFor(a.budget);
  const pct = ((a.budget - 100) / (10000 - 100)) * 100;

  const flash = (m: string) => { setNotice(m); setTimeout(() => setNotice(null), 2400); };

  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [fading, setFading] = useState(false);
  const originOk = !!resolveOrigin(a.origin).city;
  const submit = async () => {
    if (loading) return;
    if (!originOk) { flash("⚠ Elige primero una ciudad de origen reconocida"); onboardRef.current?.scrollIntoView({ behavior: "smooth" }); return; }
    setLoading(true); setAiError(null); setScore(0); setFading(false);
    try {
      const res = await suggestTrips({ data: a });
      if (!res.ok) setAiError(res.error);
      setTrips(finalizeTrips(res.trips, a));
    } catch {
      setAiError("No se pudieron generar viajes ahora mismo. Inténtalo de nuevo.");
      setTrips([]);
    } finally {
      setFading(true);
      setTimeout(() => {
        setLoading(false); setFading(false);
        setScore((sc) => { flash(`🧳 Minijuego: ${sc} objetos empaquetados`); return sc; });
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }, 450);
    }
  };

  const persist = (list: SavedTrip[]) => {
    localStorage.setItem("nexttrip-saved", JSON.stringify(list));
    setSavedTrips(list);
  };

  const save = (t: Trip) => {
    if (saved.includes(t.id)) { setShowSaved(true); return; }
    persist([...savedTrips, { ...t, answers: a, savedAt: new Date().toISOString() }]);
    flash(`${t.name} guardado en «Mis viajes»`);
  };

  const removeSaved = (id: string) => persist(savedTrips.filter((x) => x.id !== id));

  const toggleInterest = (i: string) =>
    setA((p) => ({ ...p, interests: p.interests.includes(i) ? p.interests.filter((x) => x !== i) : [...p.interests, i] }));

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      <div className="pointer-events-none absolute -top-24 -left-16 -z-10 size-[420px] rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-10 -z-10 size-[360px] rounded-full bg-accent/15 blur-3xl" />

      <div className="mx-auto max-w-6xl px-6 pt-8 pb-20">
        <header className="no-print flex items-center justify-between">
          <p aria-label="NextTrip" className="font-ticket text-[32px] font-bold leading-none tracking-normal">Next<span className="text-primary">Trip</span></p>
          <button
            type="button"
            onClick={() => setShowSaved(true)}
            className="glass-soft rounded-full px-5 py-2 text-[13px] font-bold text-foreground/80 hover:text-foreground"
          >
            ♥ Mis viajes{saved.length > 0 ? ` (${saved.length})` : ""}
          </button>
        </header>

        {/* Hero + origen */}
        <section className="no-print mt-16 grid items-center gap-10 md:mt-20 md:grid-cols-[1.15fr_.85fr]">
          <div className="animate-rise">
            <h1 className="font-display text-5xl font-semibold leading-[1.08] tracking-normal md:text-[64px]">
              Diseña tu próximo <span className="italic text-primary">v<span className="not-italic font-ticket">IA</span>je</span>
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Cuéntanos cómo viajas y tu presupuesto. Nuestra IA busca entre cualquier destino del mundo y te devuelve hasta tres itinerarios con desglose real de costes, sin letra pequeña.
            </p>
            <button
              onClick={() => onboardRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="mt-8 rounded-full bg-primary px-7 py-3.5 text-[14px] font-bold text-primary-foreground shadow-brand transition-transform hover:-translate-y-0.5"
            >
              Empezar a diseñar
            </button>
          </div>

          <div className="glass animate-rise rounded-[28px] p-6" style={{ animationDelay: "120ms" }}>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              <span className="size-2 rounded-full bg-accent" />origen del viaje
            </div>
            <OriginInput value={a.origin} onChange={(origin) => setA({ ...a, origin })} />
            <div className="mt-4 rounded-2xl bg-card/60 p-4">
              <div className="flex items-baseline justify-between"><span className="text-[12px] font-semibold text-muted-foreground">Ritmo</span><span className="text-[13px] font-bold">{a.pace}</span></div>
              <div className="mt-2 flex gap-1.5">
                {PACES.map((p, i) => <span key={p} className={`h-1.5 flex-1 rounded-full ${i <= PACES.indexOf(a.pace) ? "bg-primary" : "bg-primary/15"}`} />)}
              </div>
            </div>
            <div className="mt-3 rounded-2xl bg-card/60 p-4">
              <div className="flex items-baseline justify-between"><span className="text-[12px] font-semibold text-muted-foreground">Compañía</span><span className="text-[13px] font-bold">{a.company}</span></div>
              <div className="mt-2 flex gap-1.5">
                {COMPANY.map((c, i) => <span key={c} className={`h-1.5 flex-1 rounded-full ${i <= COMPANY.indexOf(a.company) ? "bg-accent" : "bg-accent/15"}`} />)}
              </div>
            </div>
          </div>
        </section>

        {/* Onboarding */}
        <section ref={onboardRef} className="no-print glass mt-16 scroll-mt-8 rounded-[30px] p-7 md:p-9">
          <div className="flex flex-wrap items-center gap-2">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${
                  i === step ? "bg-foreground text-background" : i < step ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <span className="font-display">{String(i + 1).padStart(2, "0")}</span>{s}
              </button>
            ))}
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-primary/10">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>

          <div key={step} className="animate-rise mt-8 min-h-[180px]">
            {step === 0 && (
              <Question title="¿Qué estilo de viaje te define?">
                {STYLES.map((s) => <Chip key={s} active={a.style === s} onClick={() => setA({ ...a, style: s })}>{s}</Chip>)}
              </Question>
            )}
            {step === 1 && (
              <Question title="¿Con quién viajas?">
                {COMPANY.map((s) => <Chip key={s} active={a.company === s} onClick={() => setA({ ...a, company: s })}>{s}</Chip>)}
              </Question>
            )}
            {step === 2 && (
              <Question title="¿Qué ritmo prefieres?">
                {PACES.map((s) => <Chip key={s} active={a.pace === s} onClick={() => setA({ ...a, pace: s })}>{s}</Chip>)}
              </Question>
            )}
            {step === 3 && (
              <Question title="¿Qué te interesa? Elige varios.">
                {INTERESTS.map((s) => <Chip key={s} active={a.interests.includes(s)} onClick={() => toggleInterest(s)}>{s}</Chip>)}
              </Question>
            )}
            {step === 4 && (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-3xl font-semibold tracking-tight">¿Cuánto quieres invertir?</h2>
                    <p className="text-[13px] text-muted-foreground">Desliza y el color te indica el nivel de la experiencia.</p>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-4xl font-extrabold tracking-tight transition-colors" style={{ color: tier.color }}>
                      {a.budget.toLocaleString("es-ES")}<span className="text-xl opacity-60">€</span>
                    </span>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: tier.color }}>{tier.label}</p>
                  </div>
                </div>
                <div className="mt-8">
                <input
                  type="range" min={100} max={10000} step={50} value={a.budget}
                  onChange={(e) => setA({ ...a, budget: Number(e.target.value) })}
                  aria-label="Presupuesto"
                  className="range-budget block"
                  style={{
                    ["--tier" as string]: tier.color,
                    background: `linear-gradient(90deg, ${tier.color} ${pct}%, color-mix(in oklab, ${tier.color} 15%, transparent) ${pct}%)`,
                  }}
                />
                <div className="budget-scale relative mx-[0.8rem] mt-4 h-10 text-[11px] font-semibold text-muted-foreground">
                  {[100, 1000, 3000, 6000, 10000].map((value, i) => (
                    <span
                      key={value}
                      className={`budget-scale-label absolute whitespace-nowrap ${i === 0 ? "translate-x-0" : i === 4 ? "-translate-x-full" : "-translate-x-1/2"}`}
                      style={{ left: `${((value - 100) / 9900) * 100}%` }}
                    >
                      {value === 100 ? "100€" : `${(value / 1000).toFixed(0)}.000€`}
                    </span>
                  ))}
                </div>
                </div>
              </div>
            )}
            {step === 5 && (
              <Question title="¿Cuántos días quieres estar?">
                <div className="flex flex-wrap items-center gap-2">
                  {DAY_OPTIONS.map((d) => (
                    <Chip key={d} active={a.days === d} onClick={() => setA({ ...a, days: d })}>
                      {d} días
                    </Chip>
                  ))}
                  <Chip active={a.days === undefined} onClick={() => setA({ ...a, days: undefined })}>
                    Lo decide la IA
                  </Chip>
                </div>
                <p className="mt-4 text-[12.5px] text-muted-foreground">
                  Pregunta opcional: si la dejas sin responder, la IA elige la duración que mejor encaje con tu presupuesto.
                </p>
              </Question>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="glass-soft rounded-full px-6 py-3 text-[14px] font-bold text-foreground/70 disabled:opacity-40"
            >
              Atrás
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep((s) => s + 1)} className="rounded-full bg-primary px-7 py-3 text-[14px] font-bold text-primary-foreground shadow-brand">
                Siguiente
              </button>
            ) : (
              <button onClick={submit} disabled={loading} className="rounded-full bg-accent px-7 py-3 text-[14px] font-bold text-accent-foreground shadow-brand disabled:opacity-60">
                {loading ? "Buscando destinos…" : "Ver viajes recomendados"}
              </button>
            )}
          </div>
        </section>

        {/* Resultados */}
        {trips && (
          <section ref={resultsRef} className="scroll-mt-8">
            <div className="mt-14 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-[13px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {trips.length === 0 ? "Sin viajes realistas" : trips.length === 1 ? "1 itinerario para ti" : `${trips.length} itinerarios para ti`}
                </h2>
                <p className="mt-1 text-[13px] text-muted-foreground">Desde {a.origin} · {a.style} · {a.company} · {a.pace}</p>
              </div>
              {trips.length > 0 && (
                <button onClick={() => window.print()} className="no-print glass-soft rounded-full px-5 py-2 text-[13px] font-bold text-primary">
                  Imprimir / PDF
                </button>
              )}
            </div>
            {aiError && <div className="glass-soft mt-5 rounded-2xl p-5 text-[14px] font-semibold text-destructive">{aiError}</div>}
            {!aiError && trips.length < 3 && (
              <div className="glass-soft mt-5 rounded-2xl p-5 text-[14px]">
                {trips.length === 0
                  ? `No hay ningún viaje realista desde ${a.origin} con ${a.budget}€. Prueba a subir el presupuesto o a salir desde otra ciudad.`
                  : `Con ${a.budget}€ desde ${a.origin} solo encontramos ${trips.length === 1 ? "esta opción realista" : "estas opciones realistas"}. Sube el presupuesto para ver más.`}
              </div>
            )}
            <div className="mt-5 grid gap-6 md:grid-cols-3">
              {trips.map((t, i) => (
                <article key={t.id} className={`glass animate-rise overflow-hidden rounded-[26px] ${i === 0 ? "ring-1 ring-accent/40" : ""}`} style={{ animationDelay: `${i * 110}ms` }}>
                  <div className="relative">
                    <DestPhoto trip={t} className="h-48 w-full object-cover" />
                    <span className="glass-soft absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold">{t.match}% afinidad</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[17px] font-bold tracking-tight">{t.name}</h3>
                      <span className="rounded-full px-3 py-1 text-[11px] font-bold" style={{ color: t.tier.color, background: `color-mix(in oklab, ${t.tier.color} 12%, transparent)` }}>
                        {t.tier.label}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] text-muted-foreground">{t.days} días · {t.region} · {t.tagline}</p>
                    <p className="mt-2 rounded-xl bg-primary/8 px-3 py-1.5 text-[11.5px] font-semibold text-foreground/75">
                      {MODE_LABEL[t.mode]} · {t.mode === "avion" ? `Salida recomendada desde ${t.departFrom}` : `Desde ${t.departFrom}`} · {t.distanceKm.toLocaleString("es-ES")} km
                    </p>

                    <div className="mt-4 flex h-2 overflow-hidden rounded-full">
                      <span className="bg-primary" style={{ width: `${(t.transport / t.total) * 100}%` }} />
                      <span className="bg-accent" style={{ width: `${(t.stay / t.total) * 100}%` }} />
                      <span className="bg-tier-low" style={{ width: `${(t.activities / t.total) * 100}%` }} />
                    </div>
                    <div className="mt-3 space-y-2.5 text-[12px]">
                      <Row dot="bg-primary" label="Transporte" value={t.transport} />
                      <Row dot="bg-accent" label="Estancia" value={t.stay} />
                      <Row dot="bg-tier-low" label="Actividades" value={t.activities} />
                    </div>
                    <ul className="mt-4 space-y-1 text-[12px] text-foreground/70">
                      {t.plan.map((p) => <li key={p}>— {p}</li>)}
                    </ul>
                    <div className="mt-4 border-t border-border pt-3">
                      <p className="text-center font-display text-2xl font-extrabold">{eur(t.total)}</p>
                      <div className="no-print mt-3 grid grid-cols-2 gap-2">
                        <button onClick={() => save(t)} className="glass-soft rounded-full px-3 py-2 text-[12px] font-bold text-foreground/70">
                          {saved.includes(t.id) ? "Guardado ✓" : "Guardar"}
                        </button>
                        <button onClick={() => setExporting({ trip: t, answers: a })} className="rounded-full bg-primary px-3 py-2 text-[12px] font-bold text-primary-foreground">
                          Exportar
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {loading && <LoadingScreen fading={fading} score={score} onScore={setScore} />}

      {showSaved && (
        <SavedPanel
          trips={savedTrips}
          onClose={() => setShowSaved(false)}
          onRemove={removeSaved}
          onExport={(t) => setExporting({ trip: t, answers: t.answers })}
        />
      )}
      {exporting && <ExportDialog trip={exporting.trip} answers={exporting.answers} onClose={() => setExporting(null)} onDone={flash} />}

      {notice && (
        <div className="no-print glass animate-rise fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full px-6 py-3 text-[13px] font-bold">
          {notice}
        </div>
      )}
    </div>
  );
}

type SavedTrip = Trip & { answers: Answers; savedAt: string };

function downloadText(name: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="no-print fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-label={title} className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[24px] bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-semibold">{title}</h3>
          <button type="button" aria-label="Cerrar" onClick={onClose} className="rounded-full px-3 py-1 text-lg text-muted-foreground hover:bg-muted">×</button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function CostSection({ label, total, items, dot, defaultOpen }: { label: string; total: number; items: CostItem[]; dot: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-dashed border-border last:border-b-0">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 py-3 text-left">
        <span className={`size-2.5 rounded-sm ${dot}`} />
        <span className="flex-1 text-[12px] font-bold uppercase tracking-[0.14em]">{label}</span>
        <span className="font-mono text-[15px] font-bold">{eur(total)}</span>
        <span className={`font-mono text-[12px] text-muted-foreground transition-transform duration-200 ${open ? "rotate-90" : ""}`}>▸</span>
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <ul className="overflow-hidden">
          {items.map((i) => (
            <li key={i.label} className="flex items-baseline gap-2 pb-2 pl-5 text-[12.5px]">
              <span className="text-foreground/75">{i.label}</span>
              <span className="mx-1 flex-1 border-b border-dotted border-foreground/20" />
              <span className="font-mono font-semibold">{eur(i.amount)}</span>
            </li>
          ))}
          <li className="h-1" />
        </ul>
      </div>
    </div>
  );
}

function ExportDialog({ trip, answers, onClose, onDone }: { trip: Trip; answers: Answers; onClose: () => void; onDone: (m: string) => void }) {
  const text = itineraryText(trip, answers);
  const b = breakdown(trip, answers);
  const hub = resolveOrigin(answers.origin).hub;
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); onDone("Itinerario copiado al portapapeles"); }
    catch { onDone("No se pudo copiar el texto"); }
  };
  const print = () => {
    const w = window.open("", "_blank");
    if (!w) { onDone("Tu navegador bloqueó la ventana de impresión"); return; }
    w.document.write(`<title>NextTrip · ${trip.name}</title><pre style="font:14px/1.6 ui-monospace,monospace;white-space:pre-wrap;padding:32px">${text.replace(/</g, "&lt;")}</pre>`);
    w.document.close(); w.focus(); w.print();
  };
  return (
    <div className="no-print fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4 backdrop-blur-md" onClick={onClose}>
      <div role="dialog" aria-label={`Exportar ${trip.name}`} onClick={(e) => e.stopPropagation()}
        className="animate-rise max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[20px] bg-card font-ticket shadow-2xl">
        <div className="relative bg-primary px-6 pb-6 pt-5 text-primary-foreground">
          <div className="flex items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80">
            <span>NextTrip · Boarding pass</span>
            <button type="button" aria-label="Cerrar" onClick={onClose} className="rounded-full px-2 text-base opacity-90 hover:opacity-100">✕</button>
          </div>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-3xl font-bold">{trip.departCode ?? hub.code}</p>
              <p className="text-[11px] opacity-80">{answers.origin.split(",")[0]}</p>
            </div>
            <span className="pb-3 font-mono text-sm opacity-70">— ✈ —</span>
            <div className="text-right">
              <p className="text-xl font-bold leading-tight">{trip.name}</p>
              <p className="text-[11px] opacity-80">{trip.region}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-wider">
            <div><p className="opacity-60">Días</p><p className="text-[13px] font-bold">{trip.days}</p></div>
            <div><p className="opacity-60">Viajeros</p><p className="text-[13px] font-bold">{answers.company}</p></div>
            <div><p className="opacity-60">Ritmo</p><p className="text-[13px] font-bold">{answers.pace}</p></div>
          </div>
        </div>
        <div className="relative h-0 border-t-2 border-dashed border-border">
          <span className="absolute -left-3 -top-3 size-6 rounded-full bg-foreground/50" />
          <span className="absolute -right-3 -top-3 size-6 rounded-full bg-foreground/50" />
        </div>
        <div className="px-6 pt-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Desglose · toca para ver detalle</p>
          <CostSection label="Transporte" total={trip.transport} items={b.transport} dot="bg-primary" defaultOpen />
          <CostSection label="Estancia" total={trip.stay} items={b.stay} dot="bg-accent" />
          <CostSection label="Actividades" total={trip.activities} items={b.activities} dot="bg-tier-low" />
          <div className="mt-2 flex items-center justify-between rounded-xl bg-muted px-4 py-3">
            <span className="text-[12px] font-bold uppercase tracking-[0.14em]">Total</span>
            <span className="font-mono text-xl font-bold">{eur(trip.total)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 px-6 pb-6 pt-4">
          <button type="button" onClick={() => { downloadText(`nexttrip-${trip.id}.txt`, text); onDone("Descarga iniciada"); }} className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-bold text-primary-foreground">Descargar .txt</button>
          <button type="button" onClick={copy} className="rounded-xl border border-border px-4 py-2.5 text-[13px] font-bold hover:bg-muted">Copiar</button>
          <button type="button" onClick={print} className="rounded-xl border border-border px-4 py-2.5 text-[13px] font-bold hover:bg-muted">PDF</button>
        </div>
      </div>
    </div>
  );
}

function SavedPanel({ trips, onClose, onRemove, onExport }: { trips: SavedTrip[]; onClose: () => void; onRemove: (id: string) => void; onExport: (t: SavedTrip) => void }) {
  return (
    <Modal title="Mis viajes" onClose={onClose}>
      {trips.length === 0 ? (
        <p className="text-[14px] text-muted-foreground">Aún no has guardado ningún viaje. Pulsa «Guardar» en una de tus recomendaciones.</p>
      ) : (
        <ul className="space-y-3">
          {trips.map((t) => (
            <li key={t.id} className="flex gap-3 rounded-2xl border border-border p-3">
              <DestPhoto trip={t} className="size-16 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold">{t.name}</p>
                <p className="text-[12px] text-muted-foreground">{t.days} días · desde {t.answers.origin} · {eur(t.total)}</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => onExport(t)} className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">Exportar</button>
                  <button type="button" onClick={() => onRemove(t.id)} className="glass-soft rounded-full px-3 py-1 text-[11px] font-bold text-foreground/70">Eliminar</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-3xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-6 flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

function Row({ dot, label, value }: { dot: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`size-1.5 rounded-full ${dot}`} />
      <span className="flex-1 text-muted-foreground">{label}</span>
      <span className="font-bold">{eur(value)}</span>
    </div>
  );
}

const PHOTO_CACHE = new Map<string, string | null>();
async function wikiPhoto(title: string): Promise<string | null> {
  for (const lang of ["es", "en"]) {
    try {
      const r = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
      if (!r.ok) continue;
      const j = await r.json();
      const src = j.originalimage?.source ?? j.thumbnail?.source;
      if (src && !/\.svg/i.test(src)) return j.thumbnail?.source?.replace(/\/\d+px-/, "/960px-") ?? src;
    } catch { /* ignore */ }
  }
  return null;
}

function DestPhoto({ trip, className }: { trip: Trip; className?: string }) {
  const [src, setSrc] = useState<string>(trip.img);
  useEffect(() => {
    let alive = true;
    const key = trip.name;
    const run = async () => {
      if (!PHOTO_CACHE.has(key)) {
        const first = trip.name.split(/[,(]| y /)[0]!.trim();
        PHOTO_CACHE.set(key, (await wikiPhoto(trip.name)) ?? (first !== trip.name ? await wikiPhoto(first) : null) ?? (await wikiPhoto(trip.region)));
      }
      const u = PHOTO_CACHE.get(key);
      if (alive && u) setSrc(u);
    };
    run();
    return () => { alive = false; };
  }, [trip.name, trip.region]);
  return <img src={src} alt={trip.name} loading="lazy" width={944} height={704} className={className} onError={() => setSrc(trip.img)} />;
}

