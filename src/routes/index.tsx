import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  STYLES, COMPANY, PACES, INTERESTS, ORIGINS,
  recommend, tierFor, eur, itineraryText, type Answers, type Trip,
} from "@/lib/trips";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NextTrip — Viajes personalizados según tu presupuesto" },
      { name: "description", content: "Responde 4 preguntas, elige tu presupuesto y recibe 3 itinerarios con desglose de transporte, estancia y actividades." },
      { property: "og:title", content: "NextTrip — Viajes personalizados según tu presupuesto" },
      { property: "og:description", content: "Tres itinerarios a tu medida con desglose real de costes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STEPS = ["Estilo", "Compañía", "Ritmo", "Intereses", "Presupuesto"] as const;

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
    style: "Cultural", company: "Pareja", pace: "Equilibrado", interests: ["Gastronomía"], origin: "Madrid", budget: 2400,
  });
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const onboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("nexttrip-saved") || "[]");
      setSaved(s.map((x: { id: string }) => x.id));
    } catch { /* ignore */ }
  }, []);

  const tier = tierFor(a.budget);
  const pct = ((a.budget - 100) / (10000 - 100)) * 100;

  const flash = (m: string) => { setNotice(m); setTimeout(() => setNotice(null), 2400); };

  const submit = () => {
    setTrips(recommend(a));
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const save = (t: Trip) => {
    const list = JSON.parse(localStorage.getItem("nexttrip-saved") || "[]").filter((x: { id: string }) => x.id !== t.id);
    list.push({ ...t, answers: a, savedAt: new Date().toISOString() });
    localStorage.setItem("nexttrip-saved", JSON.stringify(list));
    setSaved(list.map((x: { id: string }) => x.id));
    flash(`${t.name} guardado en tus viajes`);
  };

  const exportTrip = (t: Trip) => {
    const blob = new Blob([itineraryText(t, a)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nexttrip-${t.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    flash("Itinerario descargado");
  };

  const toggleInterest = (i: string) =>
    setA((p) => ({ ...p, interests: p.interests.includes(i) ? p.interests.filter((x) => x !== i) : [...p.interests, i] }));

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      <div className="pointer-events-none absolute -top-24 -left-16 -z-10 size-[420px] rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-10 -z-10 size-[360px] rounded-full bg-accent/15 blur-3xl" />

      <div className="mx-auto max-w-6xl px-6 pt-8 pb-20">
        <header className="no-print flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-brand font-display">
              <span className="text-xl font-semibold">n</span>
            </div>
            <div>
              <p className="text-[17px] font-extrabold tracking-tight">NextTrip</p>
              <p className="text-[11px] font-medium text-muted-foreground">viajes a tu medida</p>
            </div>
          </div>
          {saved.length > 0 && (
            <span className="glass-soft rounded-full px-5 py-2 text-[13px] font-bold text-foreground/80">
              {saved.length} guardado{saved.length > 1 ? "s" : ""}
            </span>
          )}
        </header>

        {/* Hero + origen */}
        <section className="no-print mt-16 grid items-center gap-10 md:mt-20 md:grid-cols-[1.15fr_.85fr]">
          <div className="animate-rise">
            <div className="inline-flex items-center gap-2 rounded-full bg-card/70 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
              <span className="size-1.5 rounded-full bg-primary" />onboarding guiado
            </div>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-[64px]">
              Tu próximo viaje, <span className="italic text-primary">hecho a medida</span>.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Cuéntanos cómo viajas y tu presupuesto. Te devolvemos tres itinerarios con desglose real de costes, sin letra pequeña.
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
            <div className="mt-3 flex flex-wrap gap-2">
              {ORIGINS.slice(0, 4).map((o) => (
                <button
                  key={o}
                  onClick={() => setA({ ...a, origin: o })}
                  className={`rounded-full px-4 py-2 text-[13px] transition-colors ${
                    a.origin === o ? "border border-primary/20 bg-primary/10 font-bold text-primary" : "glass-soft font-semibold text-foreground/55 hover:text-foreground"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
            <label className="mt-4 block">
              <span className="sr-only">Otra ciudad de origen</span>
              <select
                value={a.origin}
                onChange={(e) => setA({ ...a, origin: e.target.value })}
                className="w-full rounded-2xl border border-input bg-card/70 px-4 py-3 text-[14px] font-semibold outline-none focus:ring-2 focus:ring-ring"
              >
                {ORIGINS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
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
                <input
                  type="range" min={100} max={10000} step={50} value={a.budget}
                  onChange={(e) => setA({ ...a, budget: Number(e.target.value) })}
                  aria-label="Presupuesto"
                  className="range-budget mt-8"
                  style={{
                    ["--tier" as string]: tier.color,
                    background: `linear-gradient(90deg, ${tier.color} ${pct}%, color-mix(in oklab, ${tier.color} 15%, transparent) ${pct}%)`,
                  }}
                />
                <div className="mt-4 flex justify-between text-[11px] font-semibold text-muted-foreground">
                  <span>100€</span><span>1.000€</span><span>3.000€</span><span>6.000€</span><span>10.000€</span>
                </div>
              </div>
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
              <button onClick={submit} className="rounded-full bg-accent px-7 py-3 text-[14px] font-bold text-accent-foreground shadow-brand">
                Ver mis 3 viajes
              </button>
            )}
          </div>
        </section>

        {/* Resultados */}
        {trips && (
          <section ref={resultsRef} className="scroll-mt-8">
            <div className="mt-14 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-[13px] font-bold uppercase tracking-[0.18em] text-muted-foreground">3 itinerarios para ti</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">Desde {a.origin} · {a.style} · {a.company} · {a.pace}</p>
              </div>
              <button onClick={() => window.print()} className="no-print glass-soft rounded-full px-5 py-2 text-[13px] font-bold text-primary">
                Imprimir / PDF
              </button>
            </div>
            <div className="mt-5 grid gap-6 md:grid-cols-3">
              {trips.map((t, i) => (
                <article key={t.id} className={`glass animate-rise overflow-hidden rounded-[26px] ${i === 0 ? "ring-1 ring-accent/40" : ""}`} style={{ animationDelay: `${i * 110}ms` }}>
                  <div className="relative">
                    <img src={t.img} alt={t.name} loading="lazy" width={944} height={704} className="h-48 w-full object-cover" />
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
                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
                      <span className="font-display text-xl font-extrabold">{eur(t.total)}</span>
                      <div className="no-print flex gap-2">
                        <button onClick={() => save(t)} className="glass-soft rounded-full px-4 py-1.5 text-[11px] font-bold text-foreground/70">
                          {saved.includes(t.id) ? "Guardado ✓" : "Guardar"}
                        </button>
                        <button onClick={() => exportTrip(t)} className="rounded-full bg-primary px-4 py-1.5 text-[11px] font-bold text-primary-foreground">
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

      {notice && (
        <div className="no-print glass animate-rise fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full px-6 py-3 text-[13px] font-bold">
          {notice}
        </div>
      )}
    </div>
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
