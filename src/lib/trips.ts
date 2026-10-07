import alps from "@/assets/alps.jpg";
import cinque from "@/assets/cinque.jpg";
import lisboa from "@/assets/lisboa.jpg";
import kioto from "@/assets/kioto.jpg";
import marrakech from "@/assets/marrakech.jpg";
import maldivas from "@/assets/maldivas.jpg";

export type Answers = {
  style: string;
  company: string;
  pace: string;
  interests: string[];
  origin: string;
  budget: number;
};

export const STYLES = ["Aventura", "Cultural", "Relax", "Gastronómico"];
export const COMPANY = ["Solo", "Pareja", "Amigos", "Familia"];
export const PACES = ["Tranquilo", "Equilibrado", "Intenso"];
export const INTERESTS = ["Playa", "Montaña", "Arte", "Gastronomía", "Historia", "Naturaleza", "Vida nocturna", "Fotografía"];
export const ORIGINS = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao", "Málaga", "Lisboa", "Ciudad de México", "Buenos Aires"];

type Dest = {
  id: string;
  name: string;
  region: string;
  img: string;
  tagline: string;
  base: number; // coste base orientativo para una persona, 1 semana
  far: boolean;
  tags: string[];
  styles: string[];
  plan: string[];
};

const DESTS: Dest[] = [
  { id: "lisboa", name: "Lisboa y Sintra", region: "Portugal", img: lisboa, tagline: "Tranvías, azulejos y food tour", base: 700, far: false, tags: ["Gastronomía", "Historia", "Arte", "Fotografía", "Vida nocturna"], styles: ["Cultural", "Gastronómico"], plan: ["Alfama y miradores al atardecer", "Palacio da Pena en Sintra", "Ruta de pastéis y tascas"] },
  { id: "marrakech", name: "Marrakech", region: "Marruecos", img: marrakech, tagline: "Zocos, riads y noche en el desierto", base: 850, far: false, tags: ["Historia", "Gastronomía", "Fotografía", "Naturaleza"], styles: ["Aventura", "Cultural"], plan: ["Medina y plaza Jemaa el-Fna", "Excursión al Atlas", "Noche en campamento de Agafay"] },
  { id: "cinque", name: "Cinque Terre", region: "Liguria, Italia", img: cinque, tagline: "Senderos sobre el mar y pesto fresco", base: 1500, far: false, tags: ["Playa", "Naturaleza", "Gastronomía", "Fotografía"], styles: ["Relax", "Aventura", "Gastronómico"], plan: ["Sentiero Azzurro entre pueblos", "Paseo en barco al atardecer", "Cata de vinos Sciacchetrà"] },
  { id: "alps", name: "Suiza alpina", region: "Zermatt, Suiza", img: alps, tagline: "Tren panorámico y cumbres eternas", base: 2600, far: false, tags: ["Montaña", "Naturaleza", "Fotografía"], styles: ["Aventura", "Relax"], plan: ["Glacier Express panorámico", "Gornergrat frente al Matterhorn", "Spa alpino y fondue"] },
  { id: "kioto", name: "Kioto", region: "Japón", img: kioto, tagline: "Templos, linternas y kaiseki", base: 3800, far: true, tags: ["Historia", "Arte", "Gastronomía", "Fotografía"], styles: ["Cultural", "Gastronómico"], plan: ["Fushimi Inari al amanecer", "Ceremonia del té en Gion", "Cena kaiseki tradicional"] },
  { id: "maldivas", name: "Maldivas", region: "Atolón de Baa", img: maldivas, tagline: "Villa sobre el agua y arrecifes", base: 6500, far: true, tags: ["Playa", "Naturaleza", "Fotografía"], styles: ["Relax"], plan: ["Snorkel con mantas", "Cena privada en la arena", "Spa sobre la laguna"] },
];

const FAR_ORIGINS = ["Ciudad de México", "Buenos Aires"];

export type Tier = { key: "low" | "mid" | "high" | "lux"; label: string; color: string };

export function tierFor(budget: number): Tier {
  if (budget < 1000) return { key: "low", label: "Económico", color: "var(--tier-low)" };
  if (budget < 3000) return { key: "mid", label: "Gama media", color: "var(--tier-mid)" };
  if (budget < 6000) return { key: "high", label: "Premium", color: "var(--tier-high)" };
  return { key: "lux", label: "Lujo", color: "var(--tier-lux)" };
}

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
};

const r10 = (n: number) => Math.round(n / 10) * 10;

export function recommend(a: Answers): Trip[] {
  const scored = DESTS.map((d) => {
    const interestHits = d.tags.filter((t) => a.interests.includes(t)).length;
    const styleHit = d.styles.includes(a.style) ? 1 : 0;
    const affordability = d.base <= a.budget ? 1 - (a.budget - d.base) / 10000 : -((d.base - a.budget) / a.budget) * 3;
    const score = interestHits * 1.2 + styleHit * 1.5 + affordability * 3;
    return { d, score };
  }).sort((x, y) => y.score - x.score);

  const farOrigin = FAR_ORIGINS.includes(a.origin);
  const people = a.company === "Solo" ? 1 : a.company === "Familia" ? 3 : 2;

  return scored.slice(0, 3).map(({ d, score }) => {
    const target = Math.min(a.budget, Math.max(d.base * 0.6, a.budget * 0.9));
    let tShare = d.far !== farOrigin ? 0.45 : 0.3;
    if (a.pace === "Intenso") tShare += 0.03;
    const aShare = a.pace === "Intenso" ? 0.25 : a.pace === "Tranquilo" ? 0.15 : 0.2;
    const transport = r10(target * tShare);
    const activities = r10(target * aShare);
    const stay = r10(target - transport - activities);
    const days = Math.max(3, Math.min(14, Math.round((target / (d.base / 7)) * (people > 1 ? 0.85 : 1))));
    return {
      id: d.id, name: d.name, region: d.region, img: d.img, tagline: d.tagline, plan: d.plan,
      days, transport, stay, activities,
      total: transport + stay + activities,
      tier: tierFor(transport + stay + activities),
      match: Math.max(62, Math.min(98, Math.round(70 + score * 4))),
    };
  });
}

export const eur = (n: number) => n.toLocaleString("es-ES") + "€";

export function itineraryText(t: Trip, a: Answers) {
  return [
    `NextTrip · Itinerario`,
    `${t.name} (${t.region}) — ${t.days} días desde ${a.origin}`,
    `Estilo: ${a.style} · Con: ${a.company} · Ritmo: ${a.pace}`,
    `Intereses: ${a.interests.join(", ") || "—"}`,
    ``,
    `Transporte: ${eur(t.transport)}`,
    `Estancia: ${eur(t.stay)}`,
    `Actividades: ${eur(t.activities)}`,
    `TOTAL: ${eur(t.total)}`,
    ``,
    `Plan destacado:`,
    ...t.plan.map((p, i) => `  ${i + 1}. ${p}`),
  ].join("\n");
}
