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
type Zone = "eu" | "af" | "me" | "as" | "na" | "la" | "oc";

const ORIGIN_ZONES: Record<string, Zone> = {
  Madrid: "eu", Barcelona: "eu", Valencia: "eu", Sevilla: "eu", Bilbao: "eu", Málaga: "eu", Zaragoza: "eu", "Palma de Mallorca": "eu", "Las Palmas": "eu", Lisboa: "eu", Oporto: "eu", París: "eu", Londres: "eu", Roma: "eu", Milán: "eu", Berlín: "eu", Ámsterdam: "eu", Bruselas: "eu", Zúrich: "eu", Viena: "eu", Dublín: "eu", Estocolmo: "eu",
  Marrakech: "af", Casablanca: "af", "El Cairo": "af", "Ciudad del Cabo": "af", Nairobi: "af",
  Dubái: "me", Estambul: "me", Doha: "me",
  Tokio: "as", Pekín: "as", Shanghái: "as", Seúl: "as", Bangkok: "as", Singapur: "as", "Hong Kong": "as", Delhi: "as", Bombay: "as",
  "Nueva York": "na", "Los Ángeles": "na", Miami: "na", Chicago: "na", Toronto: "na", Montreal: "na",
  "Ciudad de México": "la", Guadalajara: "la", Monterrey: "la", Bogotá: "la", Medellín: "la", Lima: "la", Santiago: "la", "Buenos Aires": "la", "São Paulo": "la", "Río de Janeiro": "la", Caracas: "la", Quito: "la", Montevideo: "la", "San José": "la", "La Habana": "la", "Santo Domingo": "la",
  Sídney: "oc", Melbourne: "oc", Auckland: "oc",
};

export const ORIGINS = Object.keys(ORIGIN_ZONES);

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

function zoneOf(origin: string): Zone {
  const n = norm(origin);
  const hit = Object.entries(ORIGIN_ZONES).find(([c]) => norm(c) === n || (n.length > 2 && norm(c).startsWith(n)));
  return hit ? hit[1] : "eu";
}

// Distancia relativa entre zonas (0 = misma zona, 1 = muy lejos)
const ZONE_POS: Record<Zone, [number, number]> = { eu: [0, 0], af: [0.3, -0.6], me: [0.6, -0.2], as: [1.3, -0.3], na: [-1.1, 0], la: [-1.2, -0.9], oc: [1.6, -1.4] };
function distance(a: Zone, b: Zone) {
  const [x1, y1] = ZONE_POS[a]; const [x2, y2] = ZONE_POS[b];
  return Math.min(1, Math.hypot(x1 - x2, y1 - y2) / 2);
}

type Dest = {
  id: string;
  name: string;
  region: string;
  zone: Zone;
  img: string;
  tagline: string;
  base: number; // coste base orientativo para una persona, 1 semana, sin vuelo largo
  tags: string[];
  styles: string[];
  plan: string[];
};

const D = (id: string, name: string, region: string, zone: Zone, img: string, base: number, tagline: string, tags: string[], styles: string[], plan: string[]): Dest =>
  ({ id, name, region, zone, img, base, tagline, tags, styles, plan });

const DESTS: Dest[] = [
  // España (nacional)
  D("granada", "Granada y Alpujarras", "Andalucía, España", "eu", marrakech, 450, "Alhambra, tapas gratis y pueblos blancos", ["Historia", "Arte", "Gastronomía", "Montaña", "Fotografía"], ["Cultural", "Gastronómico"], ["Alhambra y Generalife", "Albaicín al atardecer desde San Nicolás", "Ruta por Pampaneira y Capileira"]),
  D("asturias", "Asturias y Picos de Europa", "Asturias, España", "eu", alps, 550, "Lagos de Covadonga, sidra y costa verde", ["Montaña", "Naturaleza", "Gastronomía", "Playa"], ["Aventura", "Gastronómico", "Relax"], ["Lagos de Covadonga", "Ruta del Cares", "Espicha con sidra y cachopo"]),
  D("sansebastian", "San Sebastián", "País Vasco, España", "eu", lisboa, 900, "Pintxos, La Concha y alta cocina", ["Gastronomía", "Playa", "Vida nocturna", "Arte"], ["Gastronómico", "Relax"], ["Ruta de pintxos por la Parte Vieja", "Surf en Zurriola", "Menú degustación con estrella"]),
  D("canarias", "Tenerife", "Islas Canarias, España", "eu", maldivas, 750, "Volcán Teide, playas negras y ballenas", ["Playa", "Naturaleza", "Montaña", "Fotografía"], ["Relax", "Aventura"], ["Subida al Teide al amanecer", "Avistamiento de cetáceos", "Piscinas naturales de Garachico"]),
  D("ibiza", "Ibiza y Formentera", "Baleares, España", "eu", maldivas, 1400, "Calas turquesa y noches eternas", ["Playa", "Vida nocturna", "Fotografía"], ["Relax"], ["Atardecer en Cala Comte", "Ferry a Ses Illetes", "Noche en club de Sant Antoni"]),
  // Escapadas europeas
  D("lisboa", "Lisboa y Sintra", "Portugal", "eu", lisboa, 700, "Tranvías, azulejos y food tour", ["Gastronomía", "Historia", "Arte", "Fotografía", "Vida nocturna"], ["Cultural", "Gastronómico"], ["Alfama y miradores al atardecer", "Palacio da Pena en Sintra", "Ruta de pastéis y tascas"]),
  D("budapest", "Budapest", "Hungría", "eu", lisboa, 600, "Balnearios termales y ruin bars", ["Historia", "Vida nocturna", "Arte", "Fotografía"], ["Cultural", "Relax"], ["Baños Széchenyi", "Crucero nocturno por el Danubio", "Ruta de ruin bars en el barrio judío"]),
  D("praga", "Praga", "República Checa", "eu", lisboa, 650, "Puentes góticos y cerveza artesanal", ["Historia", "Arte", "Vida nocturna", "Fotografía"], ["Cultural"], ["Puente de Carlos al amanecer", "Castillo y Callejón del Oro", "Cata de cervezas checas"]),
  D("cracovia", "Cracovia", "Polonia", "eu", lisboa, 450, "Plaza medieval y precios de mochilero", ["Historia", "Arte", "Vida nocturna"], ["Cultural", "Aventura"], ["Rynek Główny y Sukiennice", "Minas de sal de Wieliczka", "Noche en Kazimierz"]),
  D("paris", "París", "Francia", "eu", lisboa, 1600, "Museos, bistrós y luces del Sena", ["Arte", "Historia", "Gastronomía", "Fotografía"], ["Cultural", "Gastronómico"], ["Louvre y Orsay", "Montmartre al atardecer", "Cena en bistró de Le Marais"]),
  D("roma", "Roma", "Italia", "eu", cinque, 1200, "Coliseo, trattorias y gelato", ["Historia", "Arte", "Gastronomía"], ["Cultural", "Gastronómico"], ["Coliseo y Foro Romano", "Vaticano y Capilla Sixtina", "Food tour por Trastevere"]),
  D("cinque", "Cinque Terre", "Liguria, Italia", "eu", cinque, 1500, "Senderos sobre el mar y pesto fresco", ["Playa", "Naturaleza", "Gastronomía", "Fotografía"], ["Relax", "Aventura", "Gastronómico"], ["Sentiero Azzurro entre pueblos", "Paseo en barco al atardecer", "Cata de vinos Sciacchetrà"]),
  D("santorini", "Santorini", "Grecia", "eu", cinque, 2200, "Casas blancas y atardeceres en Oia", ["Playa", "Fotografía", "Gastronomía"], ["Relax"], ["Atardecer en Oia", "Catamarán por la caldera", "Cata de vinos volcánicos"]),
  D("islandia", "Islandia", "Ring Road", "eu", alps, 2800, "Auroras, glaciares y cascadas", ["Naturaleza", "Montaña", "Fotografía"], ["Aventura"], ["Círculo Dorado", "Caminata sobre glaciar", "Caza de auroras boreales"]),
  D("alps", "Suiza alpina", "Zermatt, Suiza", "eu", alps, 2600, "Tren panorámico y cumbres eternas", ["Montaña", "Naturaleza", "Fotografía"], ["Aventura", "Relax"], ["Glacier Express panorámico", "Gornergrat frente al Matterhorn", "Spa alpino y fondue"]),
  // África y Oriente Medio
  D("marrakech", "Marrakech", "Marruecos", "af", marrakech, 650, "Zocos, riads y noche en el desierto", ["Historia", "Gastronomía", "Fotografía", "Naturaleza"], ["Aventura", "Cultural"], ["Medina y plaza Jemaa el-Fna", "Excursión al Atlas", "Noche en campamento de Agafay"]),
  D("egipto", "Egipto", "Cairo y Nilo", "af", marrakech, 1100, "Pirámides y crucero por el Nilo", ["Historia", "Arte", "Fotografía"], ["Cultural", "Aventura"], ["Pirámides de Guiza", "Crucero Luxor–Asuán", "Templos de Abu Simbel"]),
  D("kenia", "Safari en Kenia", "Masái Mara", "af", marrakech, 3200, "Los cinco grandes en libertad", ["Naturaleza", "Fotografía"], ["Aventura"], ["Safari 4x4 en Masái Mara", "Globo al amanecer", "Visita a aldea masái"]),
  D("dubai", "Dubái", "Emiratos Árabes", "me", maldivas, 2500, "Rascacielos, desierto y lujo", ["Vida nocturna", "Playa", "Fotografía"], ["Relax", "Aventura"], ["Burj Khalifa al atardecer", "Safari en dunas", "Beach club en Palm Jumeirah"]),
  // Asia
  D("tailandia", "Tailandia mochilera", "Bangkok y Krabi", "as", maldivas, 600, "Street food, templos e islas", ["Playa", "Gastronomía", "Vida nocturna", "Naturaleza"], ["Aventura", "Gastronómico"], ["Templos y mercados de Bangkok", "Island hopping en Krabi", "Clase de cocina tailandesa"]),
  D("vietnam", "Vietnam", "Hanói y Ha Long", "as", kioto, 700, "Bahías de karst y pho callejero", ["Naturaleza", "Gastronomía", "Historia", "Fotografía"], ["Aventura", "Gastronómico", "Cultural"], ["Crucero por la bahía de Ha Long", "Hoi An iluminado", "Street food en Hanói"]),
  D("bali", "Bali", "Indonesia", "as", maldivas, 900, "Arrozales, templos y surf", ["Playa", "Naturaleza", "Arte", "Fotografía"], ["Relax", "Aventura"], ["Arrozales de Tegallalang", "Templo de Uluwatu al atardecer", "Clase de surf en Canggu"]),
  D("kioto", "Kioto y Tokio", "Japón", "as", kioto, 2400, "Templos, neones y kaiseki", ["Historia", "Arte", "Gastronomía", "Fotografía", "Vida nocturna"], ["Cultural", "Gastronómico"], ["Fushimi Inari al amanecer", "Ceremonia del té en Gion", "Noche en Shibuya y Shinjuku"]),
  D("nepal", "Nepal", "Himalaya", "as", alps, 1000, "Trekking frente al Everest", ["Montaña", "Naturaleza", "Fotografía"], ["Aventura"], ["Trek al campo base del Annapurna", "Templos de Katmandú", "Vuelo panorámico al Everest"]),
  D("maldivas", "Maldivas", "Atolón de Baa", "as", maldivas, 5500, "Villa sobre el agua y arrecifes", ["Playa", "Naturaleza", "Fotografía"], ["Relax"], ["Snorkel con mantas", "Cena privada en la arena", "Spa sobre la laguna"]),
  // América
  D("nyc", "Nueva York", "Estados Unidos", "na", lisboa, 2200, "Skyline, museos y brunch", ["Arte", "Vida nocturna", "Gastronomía", "Fotografía"], ["Cultural", "Gastronómico"], ["High Line y Chelsea", "MoMA y Central Park", "Jazz en el Village"]),
  D("mexico", "Riviera Maya", "México", "la", maldivas, 1100, "Cenotes, ruinas mayas y Caribe", ["Playa", "Historia", "Naturaleza", "Gastronomía"], ["Relax", "Aventura"], ["Nado en cenotes", "Ruinas de Tulum", "Snorkel en Cozumel"]),
  D("peru", "Perú", "Cusco y Machu Picchu", "la", alps, 1300, "Camino Inca y cocina nikkei", ["Historia", "Montaña", "Gastronomía", "Fotografía"], ["Aventura", "Cultural", "Gastronómico"], ["Camino Inca a Machu Picchu", "Valle Sagrado", "Cevichería en Lima"]),
  D("colombia", "Colombia", "Cartagena y Medellín", "la", lisboa, 800, "Murallas coloridas y salsa", ["Playa", "Vida nocturna", "Historia", "Gastronomía"], ["Cultural", "Aventura"], ["Ciudad amurallada de Cartagena", "Islas del Rosario", "Comuna 13 en Medellín"]),
  D("costarica", "Costa Rica", "Arenal y Manuel Antonio", "la", cinque, 1500, "Volcanes, selva y perezosos", ["Naturaleza", "Playa", "Fotografía"], ["Aventura", "Relax"], ["Puentes colgantes del Arenal", "Rafting en Sarapiquí", "Playas de Manuel Antonio"]),
  D("patagonia", "Patagonia", "Argentina y Chile", "la", alps, 2600, "Glaciares y Torres del Paine", ["Montaña", "Naturaleza", "Fotografía"], ["Aventura"], ["Glaciar Perito Moreno", "Trek W en Torres del Paine", "Asado patagónico"]),
  D("bora", "Bora Bora", "Polinesia Francesa", "oc", maldivas, 7500, "Laguna turquesa y bungalows de lujo", ["Playa", "Naturaleza", "Fotografía"], ["Relax"], ["Bungalow sobre el agua", "Snorkel con rayas y tiburones", "Cena polinesia al atardecer"]),
];

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
  const oz = zoneOf(a.origin);
  const people = a.company === "Solo" ? 1 : a.company === "Familia" ? 3 : 2;
  const tier = tierFor(a.budget).key;

  const scored = DESTS.map((d) => {
    const dist = distance(oz, d.zone);
    // coste real estimado: base + vuelo según distancia
    const cost = d.base + dist * 1400;
    const interestHits = d.tags.filter((t) => a.interests.includes(t)).length;
    const styleHit = d.styles.includes(a.style) ? 1 : 0;
    const fit = cost <= a.budget
      ? 1 - Math.min(1, (a.budget - cost) / Math.max(a.budget, 1500)) // ideal: aprovecha el presupuesto
      : -((cost - a.budget) / a.budget) * 3; // fuera de presupuesto penaliza fuerte
    const luxBonus = tier === "lux" && d.base >= 2500 ? 1 : tier === "low" && d.base <= 700 ? 0.8 : 0;
    const score = interestHits * 1.2 + styleHit * 1.5 + fit * 3 + luxBonus;
    return { d, score, dist, cost };
  }).sort((x, y) => y.score - x.score);

  return scored.slice(0, 3).map(({ d, score, dist, cost }) => {
    const target = Math.min(a.budget, Math.max(Math.min(cost, a.budget) * 0.85, a.budget * 0.9));
    let tShare = 0.18 + dist * 0.32;
    if (a.pace === "Intenso") tShare += 0.03;
    const aShare = a.pace === "Intenso" ? 0.25 : a.pace === "Tranquilo" ? 0.15 : 0.2;
    const transport = r10(target * tShare);
    const activities = r10(target * aShare);
    const stay = r10(target - transport - activities);
    const days = Math.max(3, Math.min(14, Math.round(((target - transport) / ((d.base * 0.8) / 7)) * (people > 1 ? 0.85 : 1))));
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
