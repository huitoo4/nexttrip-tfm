import type { AiSuggestion, Answers, Scene } from "./trips";
import { resolveOrigin, km } from "./geo";

// [nombre, región, país, lat, lon, escena, etiquetas, coste/noche/persona base, eslogan, plan]
type D = [string, string, string, number, number, Scene, string[], number, string, string[]];
const CATALOG: D[] = [
  ["Granada", "Andalucía", "España", 37.18, -3.6, "ciudad", ["Historia", "Arte", "Gastronomía", "Cultural"], 45, "La Alhambra y tapas gratis", ["Visita a la Alhambra", "Paseo por el Albaicín", "Ruta de tapas"]],
  ["Asturias", "Principado de Asturias", "España", 43.36, -5.85, "montaña", ["Montaña", "Naturaleza", "Gastronomía", "Aventura"], 50, "Verde, sidra y Picos de Europa", ["Lagos de Covadonga", "Ruta del Cares", "Sidrería en Gijón"]],
  ["Valencia", "Comunidad Valenciana", "España", 39.47, -0.38, "costa", ["Playa", "Gastronomía", "Arte", "Relax"], 55, "Paella, playa y vanguardia", ["Ciudad de las Artes", "Paella en La Albufera", "Playa de la Malvarrosa"]],
  ["Sevilla", "Andalucía", "España", 37.39, -5.98, "ciudad", ["Historia", "Arte", "Vida nocturna", "Cultural"], 55, "Flamenco y patios en flor", ["Real Alcázar", "Barrio de Santa Cruz", "Espectáculo flamenco"]],
  ["Tenerife", "Canarias", "España", 28.29, -16.63, "playa", ["Playa", "Naturaleza", "Montaña", "Relax"], 60, "Volcán y playas todo el año", ["Subida al Teide", "Avistamiento de cetáceos", "Playa de Benijo"]],
  ["Oporto", "Norte", "Portugal", 41.15, -8.61, "ciudad", ["Gastronomía", "Historia", "Fotografía", "Cultural"], 50, "Vino de Oporto junto al Duero", ["Bodegas de Gaia", "Librería Lello", "Crucero de los seis puentes"]],
  ["Lisboa", "Lisboa", "Portugal", 38.72, -9.14, "ciudad", ["Historia", "Gastronomía", "Vida nocturna", "Fotografía"], 60, "Tranvías, fado y miradores", ["Tranvía 28", "Torre de Belém", "Noche en el Bairro Alto"]],
  ["Algarve", "Algarve", "Portugal", 37.09, -8.25, "playa", ["Playa", "Naturaleza", "Relax"], 60, "Acantilados dorados y calas", ["Cueva de Benagil", "Ruta de los Siete Valles", "Playa de Marinha"]],
  ["Cinque Terre", "Liguria", "Italia", 44.13, 9.71, "costa", ["Naturaleza", "Fotografía", "Playa", "Gastronomía"], 80, "Cinco pueblos de colores", ["Sendero Azul", "Barco entre pueblos", "Cata en Vernazza"]],
  ["Roma", "Lacio", "Italia", 41.9, 12.5, "ciudad", ["Historia", "Arte", "Gastronomía", "Cultural"], 75, "Dos mil años en cada esquina", ["Coliseo y Foro", "Museos Vaticanos", "Trastevere de noche"]],
  ["Sicilia", "Sicilia", "Italia", 37.6, 14.0, "costa", ["Historia", "Playa", "Gastronomía"], 60, "Templos griegos y cannoli", ["Valle de los Templos", "Subida al Etna", "Mercado de Palermo"]],
  ["Dolomitas", "Trentino", "Italia", 46.41, 11.84, "montaña", ["Montaña", "Naturaleza", "Aventura", "Fotografía"], 90, "Picos de roca rosada", ["Tre Cime di Lavaredo", "Lago di Braies", "Vía ferrata"]],
  ["París", "Île-de-France", "Francia", 48.86, 2.35, "ciudad", ["Arte", "Gastronomía", "Historia", "Cultural"], 95, "La ciudad de la luz", ["Museo del Louvre", "Montmartre", "Crucero por el Sena"]],
  ["Chamonix", "Alpes", "Francia", 45.92, 6.87, "montaña", ["Montaña", "Aventura", "Naturaleza"], 100, "A los pies del Mont Blanc", ["Aiguille du Midi", "Mer de Glace", "Senderismo alpino"]],
  ["Cracovia", "Pequeña Polonia", "Polonia", 50.06, 19.94, "ciudad", ["Historia", "Vida nocturna", "Cultural"], 35, "Joya medieval asequible", ["Plaza del Mercado", "Minas de sal de Wieliczka", "Barrio de Kazimierz"]],
  ["Budapest", "Budapest", "Hungría", 47.5, 19.04, "ciudad", ["Historia", "Vida nocturna", "Relax", "Arte"], 45, "Balnearios y bares en ruinas", ["Baños Széchenyi", "Parlamento", "Ruin bars"]],
  ["Praga", "Bohemia", "República Checa", 50.08, 14.44, "ciudad", ["Historia", "Arte", "Vida nocturna"], 50, "La ciudad de las cien torres", ["Puente de Carlos", "Castillo de Praga", "Cervecería tradicional"]],
  ["Ámsterdam", "Holanda Septentrional", "Países Bajos", 52.37, 4.9, "ciudad", ["Arte", "Vida nocturna", "Fotografía"], 100, "Canales, bicis y museos", ["Museo Van Gogh", "Paseo en barco", "Ruta en bici"]],
  ["Edimburgo", "Escocia", "Reino Unido", 55.95, -3.19, "ciudad", ["Historia", "Naturaleza", "Cultural"], 85, "Castillos y Highlands", ["Castillo de Edimburgo", "Arthur's Seat", "Excursión a las Highlands"]],
  ["Islandia", "Suðurland", "Islandia", 64.14, -21.94, "montaña", ["Naturaleza", "Aventura", "Fotografía"], 140, "Fuego, hielo y auroras", ["Círculo Dorado", "Laguna glaciar", "Cascada Seljalandsfoss"]],
  ["Santorini", "Cícladas", "Grecia", 36.39, 25.46, "costa", ["Playa", "Relax", "Fotografía"], 110, "Atardeceres sobre la caldera", ["Atardecer en Oia", "Barco por la caldera", "Playa Roja"]],
  ["Dubrovnik", "Dalmacia", "Croacia", 42.65, 18.09, "costa", ["Historia", "Playa", "Fotografía"], 80, "La perla del Adriático", ["Murallas", "Kayak a Lokrum", "Teleférico al Srđ"]],
  ["Estambul", "Mármara", "Turquía", 41.01, 28.98, "oriental", ["Historia", "Gastronomía", "Cultural", "Arte"], 50, "Entre Europa y Asia", ["Santa Sofía", "Gran Bazar", "Crucero por el Bósforo"]],
  ["Marrakech", "Marrakech-Safi", "Marruecos", 31.63, -8.0, "desierto", ["Historia", "Gastronomía", "Fotografía", "Cultural"], 35, "Zocos, especias y riads", ["Plaza Jemaa el-Fna", "Jardín Majorelle", "Excursión al Atlas"]],
  ["Fez", "Fez-Mequinez", "Marruecos", 34.03, -5.0, "desierto", ["Historia", "Cultural", "Fotografía"], 30, "La medina más viva del mundo", ["Medina de Fez el-Bali", "Curtidurías Chouara", "Madrasa Bou Inania"]],
  ["Chefchaouen", "Tánger-Tetuán", "Marruecos", 35.17, -5.27, "montaña", ["Fotografía", "Naturaleza", "Relax"], 25, "El pueblo azul del Rif", ["Paseo por la medina azul", "Cascadas de Akchour", "Mirador de la mezquita española"]],
  ["Merzouga", "Drâa-Tafilalet", "Marruecos", 31.1, -4.01, "desierto", ["Aventura", "Naturaleza", "Fotografía"], 40, "Noche bajo las dunas", ["Paseo en dromedario", "Campamento en el Erg Chebbi", "Amanecer en las dunas"]],
  ["El Cairo", "El Cairo", "Egipto", 30.04, 31.24, "desierto", ["Historia", "Cultural"], 45, "Pirámides y faraones", ["Pirámides de Giza", "Museo Egipcio", "Bazar Khan el-Khalili"]],
  ["Zanzíbar", "Zanzíbar", "Tanzania", -6.16, 39.2, "playa", ["Playa", "Relax", "Historia"], 70, "Especias y aguas turquesa", ["Stone Town", "Snorkel en Mnemba", "Tour de especias"]],
  ["Kioto", "Kansai", "Japón", 35.01, 135.77, "oriental", ["Historia", "Arte", "Fotografía", "Cultural"], 110, "Templos, geishas y jardines", ["Fushimi Inari", "Bosque de bambú de Arashiyama", "Barrio de Gion"]],
  ["Bangkok", "Bangkok", "Tailandia", 13.76, 100.5, "oriental", ["Gastronomía", "Vida nocturna", "Historia"], 40, "Templos dorados y street food", ["Gran Palacio", "Mercado flotante", "Street food en Yaowarat"]],
  ["Bali", "Bali", "Indonesia", -8.41, 115.19, "playa", ["Playa", "Relax", "Naturaleza"], 45, "Arrozales, templos y surf", ["Arrozales de Tegallalang", "Templo Uluwatu", "Clase de surf en Canggu"]],
  ["Maldivas", "Atolón de Malé", "Maldivas", 4.18, 73.51, "playa", ["Playa", "Relax"], 250, "Villas sobre el agua", ["Snorkel con mantas", "Cena en la playa", "Excursión a banco de arena"]],
  ["Nueva York", "Nueva York", "Estados Unidos", 40.71, -74.0, "ciudad", ["Arte", "Vida nocturna", "Fotografía", "Cultural"], 170, "La ciudad que nunca duerme", ["Central Park", "MoMA", "Atardecer en el Top of the Rock"]],
  ["Ciudad de México", "CDMX", "México", 19.43, -99.13, "ciudad", ["Gastronomía", "Historia", "Arte"], 50, "Tacos, murales y pirámides", ["Teotihuacán", "Casa Azul de Frida Kahlo", "Trajineras de Xochimilco"]],
  ["Cusco", "Cusco", "Perú", -13.53, -71.97, "montaña", ["Historia", "Montaña", "Aventura"], 45, "Puerta a Machu Picchu", ["Machu Picchu", "Valle Sagrado", "Montaña de Colores"]],
  ["Patagonia", "Santa Cruz", "Argentina", -50.34, -72.26, "montaña", ["Naturaleza", "Aventura", "Montaña", "Fotografía"], 90, "Glaciares en el fin del mundo", ["Glaciar Perito Moreno", "Trekking al Fitz Roy", "Navegación por el lago Argentino"]],
  ["Río de Janeiro", "Río de Janeiro", "Brasil", -22.91, -43.17, "playa", ["Playa", "Vida nocturna", "Naturaleza"], 70, "Samba entre playa y morros", ["Cristo Redentor", "Pan de Azúcar", "Playa de Ipanema"]],
];

const STYLE_TAG: Record<string, string[]> = {
  Aventura: ["Aventura", "Montaña", "Naturaleza"],
  Cultural: ["Cultural", "Historia", "Arte"],
  Relax: ["Relax", "Playa"],
  "Gastronómico": ["Gastronomía"],
};

/** Modo rescate: genera sugerencias realistas sin IA, a partir de un catálogo local */
export function fallbackSuggestions(a: Answers): AiSuggestion[] {
  const o = resolveOrigin(a.origin);
  const oLat = o.city?.lat ?? o.hub.lat, oLon = o.city?.lon ?? o.hub.lon;
  const people = a.company === "Solo" ? 1 : a.company === "Familia" ? 3 : 2;
  const wanted = new Set([...(STYLE_TAG[a.style] ?? []), ...a.interests]);
  const lux = a.budget / people > 2500 ? 1.8 : a.budget / people > 1200 ? 1.3 : 1;
  const out: (AiSuggestion & { score: number })[] = [];
  for (const [name, region, country, lat, lon, scene, tags, night, tagline, plan] of CATALOG) {
    const d = km(oLat, oLon, lat, lon);
    if (d < 60) continue;
    const flight = d > 900;
    const perPerson = flight ? 80 + d * 0.09 : d > 300 ? d * 0.22 : d * 0.18 + 10;
    const transport = Math.round(perPerson * people + 15 * people);
    const options = a.days ? [a.days] : [10, 7, 5, 4, 3, 2];
    for (const days of options) {
      const nights = Math.max(1, days - 1);
      const stay = Math.round(night * lux * nights * people * (people > 1 ? 0.75 : 1) + 25 * days * people);
      const activities = Math.round((20 + night * 0.3) * Math.min(days, 5) * people * lux);
      const total = transport + stay + activities;
      if (total <= a.budget) {
        const hits = tags.filter((t) => wanted.has(t)).length;
        const usage = total / a.budget;
        out.push({
          name, region, country, lat, lon, scene, tagline, days, transport, stay, activities, plan,
          needsFlight: flight, match: Math.min(97, Math.round(60 + hits * 9 + usage * 10)),
          score: hits * 10 + usage * 8 + Math.random() * 4,
        });
        break;
      }
    }
  }
  return out.sort((x, y) => y.score - x.score).slice(0, 5).map(({ score: _s, ...t }) => t);
}
