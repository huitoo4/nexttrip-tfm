import alps from "@/assets/alps.jpg";
import cinque from "@/assets/cinque.jpg";
import lisboa from "@/assets/lisboa.jpg";
import kioto from "@/assets/kioto.jpg";
import marrakech from "@/assets/marrakech.jpg";
import maldivas from "@/assets/maldivas.jpg";
import { resolveOrigin, km, norm } from "./geo";
export { resolveOrigin } from "./geo";

export type Answers = {
  style: string;
  company: string;
  pace: string;
  interests: string[];
  origin: string;
  budget: number;
  /** Duración deseada en días (opcional; si falta, la IA la decide) */
  days?: number | undefined;
};

export const STYLES = ["Aventura", "Cultural", "Relax", "Gastronómico"];
export const COMPANY = ["Solo", "Pareja", "Amigos", "Familia"];
export const PACES = ["Tranquilo", "Equilibrado", "Intenso"];
export const INTERESTS = ["Playa", "Montaña", "Arte", "Gastronomía", "Historia", "Naturaleza", "Vida nocturna", "Fotografía"];

export const SCENES = ["ciudad", "costa", "playa", "montaña", "desierto", "oriental"] as const;
export type Scene = (typeof SCENES)[number];
const SCENE_IMG: Record<Scene, string> = { ciudad: lisboa, costa: cinque, playa: maldivas, montaña: alps, desierto: marrakech, oriental: kioto };

export type Tier = { key: "low" | "mid" | "high" | "lux"; label: string; color: string };

export function tierFor(budget: number): Tier {
  if (budget < 1000) return { key: "low", label: "Económico", color: "var(--tier-low)" };
  if (budget < 3000) return { key: "mid", label: "Gama media", color: "var(--tier-mid)" };
  if (budget < 6000) return { key: "high", label: "Premium", color: "var(--tier-high)" };
  return { key: "lux", label: "Lujo", color: "var(--tier-lux)" };
}

export type Mode = "avion" | "tren" | "bus";
export const MODE_LABEL: Record<Mode, string> = { avion: "✈ Avión", tren: "🚆 Tren", bus: "🚌 Autobús" };

export type Trip = {
  id: string;
  name: string;
  region: string;
  img: string;
  tagline: string;
  days: number;
  transport: number;
  stay: number;
  activities: number;
  total: number;
  tier: Tier;
  plan: string[];
  match: number;
  mode: Mode;
  distanceKm: number;
  departFrom: string; // texto para mostrar: "aeropuerto de Casablanca (CMN)" o "Marrakech"
  departCode: string;
};

/** Sugerencia en bruto devuelta por la IA */
export type AiSuggestion = {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  scene: Scene;
  tagline: string;
  days: number;
  transport: number;
  stay: number;
  activities: number;
  plan: string[];
  match: number;
  needsFlight: boolean;
};

const r10 = (n: number) => Math.round(n / 10) * 10;

/** Elige transporte según distancia, filtra el origen y valida presupuesto */
export function finalizeTrips(raw: AiSuggestion[], a: Answers): Trip[] {
  const o = resolveOrigin(a.origin);
  const oLat = o.city?.lat ?? o.hub.lat, oLon = o.city?.lon ?? o.hub.lon;
  const originName = norm(o.city?.name ?? a.origin.split(",")[0] ?? "");
  const seen = new Set<string>();
  const out: Trip[] = [];
  for (const s of raw) {
    const dist = Math.round(km(oLat, oLon, s.lat, s.lon));
    const nm = norm(s.name);
    if (dist < 60 || nm === originName || nm.includes(originName) && originName.length > 3) continue; // misma ciudad que el origen
    const id = nm.replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    if (seen.has(id)) continue;
    const mode: Mode = s.needsFlight || dist > 900 ? "avion" : dist > 300 ? "tren" : "bus";
    const transport = r10(Math.max(0, s.transport));
    // Si el viajero fija la duración, ajustamos el precio de la estancia a esas noches
    const aiDays = Math.max(1, Math.min(30, Math.round(s.days)));
    const days = a.days ? Math.max(1, Math.min(30, Math.round(a.days))) : aiDays;
    const nightRatio = days === aiDays ? 1 : Math.max(0.4, (days - 1) / Math.max(1, aiDays - 1));
    const stay = r10(Math.max(0, s.stay) * nightRatio);
    const activities = r10(Math.max(0, s.activities));
    const total = transport + stay + activities;
    if (total <= 0 || total > a.budget * 1.05) continue;
    seen.add(id);
    const originLabel = o.city?.name ?? a.origin;
    out.push({
      id, name: s.name, region: s.region || s.country, img: SCENE_IMG[s.scene] ?? lisboa, tagline: s.tagline,
      days, transport, stay, activities, total,
      tier: tierFor(total), plan: s.plan.slice(0, 4), match: Math.max(50, Math.min(99, Math.round(s.match))),
      mode, distanceKm: dist,
      departFrom: mode === "avion" ? `aeropuerto de ${o.hub.city} (${o.hub.code})` : originLabel,
      departCode: mode === "avion" ? o.hub.code : originLabel.slice(0, 3).toUpperCase(),
    });
    if (out.length === 3) break;
  }
  return out;
}

export const eur = (n: number) => n.toLocaleString("es-ES") + "€";

export function itineraryText(t: Trip, a: Answers) {
  return [
    `NextTrip · Itinerario`,
    `${t.name} (${t.region}) — ${t.days} días desde ${a.origin}`,
    `Transporte principal: ${MODE_LABEL[t.mode ?? "avion"]} desde ${t.departFrom ?? a.origin} · ${t.distanceKm ?? "?"} km`,
    `Estilo: ${a.style} · Con: ${a.company} · Ritmo: ${a.pace}`,
    `Intereses: ${a.interests.join(", ") || "—"}`,
    ``,
    ...(() => {
      const b = breakdown(t, a);
      const sec = (n: string, v: number, items: CostItem[]) => [`${n}: ${eur(v)}`, ...items.map((i) => `   · ${i.label}: ${eur(i.amount)}`)];
      return [...sec("Transporte", t.transport, b.transport), ...sec("Estancia", t.stay, b.stay), ...sec("Actividades", t.activities, b.activities)];
    })(),
    `TOTAL: ${eur(t.total)}`,
    ``,
    `Plan destacado:`,
    ...t.plan.map((p, i) => `  ${i + 1}. ${p}`),
  ].join("\n");
}

export type CostItem = { label: string; amount: number };
export type Breakdown = { transport: CostItem[]; stay: CostItem[]; activities: CostItem[] };

function split(total: number, parts: [string, number][]): CostItem[] {
  const w = parts.reduce((s, [, x]) => s + x, 0);
  const items = parts.map(([label, x]) => ({ label, amount: r10((total * x) / w) }));
  const diff = total - items.reduce((s, i) => s + i.amount, 0);
  if (items[0]) items[0].amount += diff;
  return items.filter((i) => i.amount > 0);
}

export function breakdown(t: Trip, a: Answers): Breakdown {
  const nights = Math.max(1, t.days - 1);
  const week = t.days >= 6 ? "una semana" : `${t.days} días`;
  const intense = a.pace === "Intenso", calm = a.pace === "Tranquilo";
  const lux = t.tier.key === "lux" || t.tier.key === "high";
  const cheap = t.tier.key === "low";
  const mode = t.mode ?? "avion";
  const main: [string, number][] =
    mode === "avion" ? [["Avión ida y vuelta", 60], ["Traslados aeropuerto", 8]]
    : mode === "tren" ? [["Tren ida y vuelta", 60]]
    : [["Autobús ida y vuelta", 50]];
  const transport = split(t.transport, [
    ...main,
    [cheap ? "Bus y metro local" : "Transporte local", 16],
    [intense ? `Alquiler de coche ${week}` : "Taxis y excursiones en grupo", intense ? 24 : 12],
  ]);
  const stayLabel = cheap ? "Hostel / guesthouse" : lux ? "Hotel boutique 4-5★" : "Hotel 3★ céntrico";
  const stay = split(t.stay, [
    [`${stayLabel} · ${nights} noches`, 62],
    [cheap ? "Comidas en mercados y street food" : "Comidas y cenas", 30],
    ["Tasas turísticas y seguro de viaje", 8],
  ]);
  const p = t.plan;
  const activities = split(t.activities, [
    [p[0] ?? "Actividad principal", 34],
    [p[1] ?? "Excursión", 28],
    [p[2] ?? "Experiencia", calm ? 18 : 24],
    ["Entradas a museos y extras", calm ? 10 : 14],
  ]);
  return { transport, stay, activities };
}
