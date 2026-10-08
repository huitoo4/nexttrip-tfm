export type Zone = "eu" | "af" | "me" | "as" | "na" | "la" | "oc";

export type Hub = { code: string; name: string; city: string; lat: number; lon: number; zone: Zone };
export type City = { name: string; country: string; lat: number; lon: number };

// Aeropuertos internacionales principales usados como nodo de salida
const H = (code: string, name: string, city: string, lat: number, lon: number, zone: Zone): Hub => ({ code, name, city, lat, lon, zone });
export const HUBS: Hub[] = [
  H("MAD", "Adolfo Suárez Madrid-Barajas", "Madrid", 40.49, -3.57, "eu"),
  H("BCN", "Barcelona-El Prat", "Barcelona", 41.30, 2.08, "eu"),
  H("BIO", "Bilbao", "Bilbao", 43.30, -2.91, "eu"),
  H("VLC", "Valencia", "Valencia", 39.49, -0.48, "eu"),
  H("ALC", "Alicante-Elche", "Alicante", 38.28, -0.56, "eu"),
  H("AGP", "Málaga-Costa del Sol", "Málaga", 36.67, -4.50, "eu"),
  H("SVQ", "Sevilla", "Sevilla", 37.42, -5.90, "eu"),
  H("SCQ", "Santiago-Rosalía de Castro", "Santiago de Compostela", 42.90, -8.42, "eu"),
  H("OVD", "Asturias", "Oviedo", 43.56, -6.03, "eu"),
  H("ZAZ", "Zaragoza", "Zaragoza", 41.67, -1.04, "eu"),
  H("PMI", "Palma de Mallorca", "Palma", 39.55, 2.74, "eu"),
  H("LPA", "Gran Canaria", "Las Palmas", 27.93, -15.39, "eu"),
  H("TFS", "Tenerife Sur", "Tenerife", 28.04, -16.57, "eu"),
  H("LIS", "Humberto Delgado", "Lisboa", 38.77, -9.13, "eu"),
  H("OPO", "Francisco Sá Carneiro", "Oporto", 41.24, -8.68, "eu"),
  H("CDG", "París-Charles de Gaulle", "París", 49.01, 2.55, "eu"),
  H("LYS", "Lyon-Saint Exupéry", "Lyon", 45.72, 5.08, "eu"),
  H("NCE", "Niza-Costa Azul", "Niza", 43.66, 7.21, "eu"),
  H("BOD", "Burdeos-Mérignac", "Burdeos", 44.83, -0.72, "eu"),
  H("LHR", "Londres-Heathrow", "Londres", 51.47, -0.45, "eu"),
  H("MAN", "Mánchester", "Mánchester", 53.35, -2.27, "eu"),
  H("DUB", "Dublín", "Dublín", 53.42, -6.27, "eu"),
  H("AMS", "Ámsterdam-Schiphol", "Ámsterdam", 52.31, 4.76, "eu"),
  H("BRU", "Bruselas", "Bruselas", 50.90, 4.48, "eu"),
  H("FRA", "Fráncfort", "Fráncfort", 50.04, 8.56, "eu"),
  H("MUC", "Múnich", "Múnich", 48.35, 11.79, "eu"),
  H("BER", "Berlín-Brandeburgo", "Berlín", 52.37, 13.50, "eu"),
  H("ZRH", "Zúrich", "Zúrich", 47.46, 8.55, "eu"),
  H("VIE", "Viena", "Viena", 48.11, 16.57, "eu"),
  H("FCO", "Roma-Fiumicino", "Roma", 41.80, 12.25, "eu"),
  H("MXP", "Milán-Malpensa", "Milán", 45.63, 8.72, "eu"),
  H("CPH", "Copenhague", "Copenhague", 55.62, 12.65, "eu"),
  H("ARN", "Estocolmo-Arlanda", "Estocolmo", 59.65, 17.92, "eu"),
  H("WAW", "Varsovia-Chopin", "Varsovia", 52.17, 20.97, "eu"),
  H("ATH", "Atenas", "Atenas", 37.94, 23.94, "eu"),
  H("IST", "Estambul", "Estambul", 41.26, 28.74, "me"),
  H("CMN", "Casablanca Mohammed V", "Casablanca", 33.37, -7.59, "af"),
  H("CAI", "El Cairo", "El Cairo", 30.12, 31.41, "af"),
  H("JNB", "Johannesburgo O. R. Tambo", "Johannesburgo", -26.14, 28.24, "af"),
  H("NBO", "Nairobi Jomo Kenyatta", "Nairobi", -1.32, 36.93, "af"),
  H("DXB", "Dubái", "Dubái", 25.25, 55.36, "me"),
  H("DOH", "Doha Hamad", "Doha", 25.27, 51.61, "me"),
  H("DEL", "Delhi Indira Gandhi", "Delhi", 28.56, 77.10, "as"),
  H("BOM", "Bombay", "Bombay", 19.09, 72.87, "as"),
  H("BKK", "Bangkok-Suvarnabhumi", "Bangkok", 13.69, 100.75, "as"),
  H("SIN", "Singapur-Changi", "Singapur", 1.36, 103.99, "as"),
  H("HKG", "Hong Kong", "Hong Kong", 22.31, 113.91, "as"),
  H("PEK", "Pekín-Capital", "Pekín", 40.08, 116.58, "as"),
  H("PVG", "Shanghái-Pudong", "Shanghái", 31.14, 121.81, "as"),
  H("ICN", "Seúl-Incheon", "Seúl", 37.46, 126.44, "as"),
  H("HND", "Tokio-Haneda", "Tokio", 35.55, 139.78, "as"),
  H("KIX", "Osaka-Kansai", "Osaka", 34.43, 135.24, "as"),
  H("JFK", "Nueva York JFK", "Nueva York", 40.64, -73.78, "na"),
  H("MIA", "Miami", "Miami", 25.80, -80.29, "na"),
  H("ORD", "Chicago O'Hare", "Chicago", 41.98, -87.90, "na"),
  H("LAX", "Los Ángeles", "Los Ángeles", 33.94, -118.41, "na"),
  H("SFO", "San Francisco", "San Francisco", 37.62, -122.38, "na"),
  H("YYZ", "Toronto Pearson", "Toronto", 43.68, -79.63, "na"),
  H("YUL", "Montreal-Trudeau", "Montreal", 45.47, -73.74, "na"),
  H("MEX", "Ciudad de México", "Ciudad de México", 19.44, -99.07, "la"),
  H("GDL", "Guadalajara", "Guadalajara", 20.52, -103.31, "la"),
  H("CUN", "Cancún", "Cancún", 21.04, -86.87, "la"),
  H("HAV", "La Habana José Martí", "La Habana", 22.99, -82.41, "la"),
  H("SDQ", "Santo Domingo Las Américas", "Santo Domingo", 18.43, -69.67, "la"),
  H("SJO", "San José Juan Santamaría", "San José", 9.99, -84.21, "la"),
  H("PTY", "Panamá Tocumen", "Panamá", 9.07, -79.38, "la"),
  H("BOG", "Bogotá El Dorado", "Bogotá", 4.70, -74.15, "la"),
  H("MDE", "Medellín José María Córdova", "Medellín", 6.16, -75.42, "la"),
  H("UIO", "Quito Mariscal Sucre", "Quito", -0.13, -78.36, "la"),
  H("LIM", "Lima Jorge Chávez", "Lima", -12.02, -77.11, "la"),
  H("SCL", "Santiago de Chile", "Santiago", -33.39, -70.79, "la"),
  H("EZE", "Buenos Aires-Ezeiza", "Buenos Aires", -34.82, -58.54, "la"),
  H("MVD", "Montevideo Carrasco", "Montevideo", -34.84, -56.03, "la"),
  H("GRU", "São Paulo-Guarulhos", "São Paulo", -23.43, -46.47, "la"),
  H("GIG", "Río de Janeiro-Galeão", "Río de Janeiro", -22.81, -43.25, "la"),
  H("SYD", "Sídney", "Sídney", -33.94, 151.18, "oc"),
  H("MEL", "Melbourne", "Melbourne", -37.67, 144.84, "oc"),
  H("AKL", "Auckland", "Auckland", -37.01, 174.79, "oc"),
];

// Catálogo de ciudades para el autocompletado (incluye muchas sin aeropuerto principal)
const RAW = `Madrid|España|40.42|-3.70;Barcelona|España|41.39|2.17;Valencia|España|39.47|-0.38;Sevilla|España|37.39|-5.98;Bilbao|España|43.26|-2.93;Málaga|España|36.72|-4.42;Zaragoza|España|41.65|-0.88;Alicante|España|38.35|-0.48;Palma de Mallorca|España|39.57|2.65;Las Palmas de Gran Canaria|España|28.12|-15.43;Santa Cruz de Tenerife|España|28.46|-16.25;Santiago de Compostela|España|42.88|-8.54;Oviedo|España|43.36|-5.85;Gijón|España|43.53|-5.66;San Sebastián|España|43.32|-1.98;Vitoria-Gasteiz|España|42.85|-2.67;Pamplona|España|42.81|-1.65;Logroño|España|42.47|-2.45;Santander|España|43.46|-3.81;Burgos|España|42.34|-3.70;Valladolid|España|41.65|-4.72;Salamanca|España|40.97|-5.66;León|España|42.60|-5.57;Segovia|España|40.95|-4.12;Ávila|España|40.66|-4.70;Toledo|España|39.86|-4.03;Guadalajara|España|40.63|-3.16;Cuenca|España|40.07|-2.13;Ciudad Real|España|38.99|-3.93;Cáceres|España|39.47|-6.37;Badajoz|España|38.88|-6.97;Mérida|España|38.92|-6.34;Córdoba|España|37.89|-4.78;Granada|España|37.18|-3.60;Jaén|España|37.78|-3.79;Almería|España|36.83|-2.46;Cádiz|España|36.53|-6.29;Jerez de la Frontera|España|36.69|-6.13;Huelva|España|37.26|-6.95;Marbella|España|36.51|-4.88;Murcia|España|37.99|-1.13;Cartagena|España|37.61|-0.99;Elche|España|38.27|-0.70;Benidorm|España|38.54|-0.13;Castellón de la Plana|España|39.99|-0.05;Tarragona|España|41.12|1.25;Reus|España|41.16|1.11;Lleida|España|41.62|0.62;Girona|España|41.98|2.82;Huesca|España|42.14|-0.41;Teruel|España|40.34|-1.11;Soria|España|41.76|-2.46;A Coruña|España|43.36|-8.41;Vigo|España|42.24|-8.72;Pontevedra|España|42.43|-8.64;Lugo|España|43.01|-7.56;Ourense|España|42.34|-7.86;Ibiza|España|38.91|1.43;Menorca|España|39.89|4.26;Lisboa|Portugal|38.72|-9.14;Oporto|Portugal|41.15|-8.61;Coímbra|Portugal|40.21|-8.43;Faro|Portugal|37.02|-7.93;Braga|Portugal|41.55|-8.42;París|Francia|48.86|2.35;Lyon|Francia|45.76|4.84;Marsella|Francia|43.30|5.37;Niza|Francia|43.70|7.27;Burdeos|Francia|44.84|-0.58;Toulouse|Francia|43.60|1.44;Biarritz|Francia|43.48|-1.56;Montpellier|Francia|43.61|3.88;Estrasburgo|Francia|48.57|7.75;Londres|Reino Unido|51.51|-0.13;Mánchester|Reino Unido|53.48|-2.24;Liverpool|Reino Unido|53.41|-2.98;Edimburgo|Reino Unido|55.95|-3.19;Oxford|Reino Unido|51.75|-1.26;Dublín|Irlanda|53.35|-6.26;Ámsterdam|Países Bajos|52.37|4.90;Róterdam|Países Bajos|51.92|4.48;Bruselas|Bélgica|50.85|4.35;Brujas|Bélgica|51.21|3.22;Berlín|Alemania|52.52|13.40;Múnich|Alemania|48.14|11.58;Fráncfort|Alemania|50.11|8.68;Hamburgo|Alemania|53.55|9.99;Colonia|Alemania|50.94|6.96;Zúrich|Suiza|47.38|8.54;Ginebra|Suiza|46.20|6.14;Viena|Austria|48.21|16.37;Salzburgo|Austria|47.81|13.06;Roma|Italia|41.90|12.50;Milán|Italia|45.46|9.19;Florencia|Italia|43.77|11.26;Venecia|Italia|45.44|12.32;Nápoles|Italia|40.85|14.27;Bolonia|Italia|44.49|11.34;Turín|Italia|45.07|7.69;Copenhague|Dinamarca|55.68|12.57;Estocolmo|Suecia|59.33|18.07;Oslo|Noruega|59.91|10.75;Varsovia|Polonia|52.23|21.01;Cracovia|Polonia|50.06|19.94;Praga|República Checa|50.08|14.44;Budapest|Hungría|47.50|19.04;Atenas|Grecia|37.98|23.73;Estambul|Turquía|41.01|28.98;Marrakech|Marruecos|31.63|-8.01;Casablanca|Marruecos|33.57|-7.59;Tánger|Marruecos|35.76|-5.83;El Cairo|Egipto|30.04|31.24;Ciudad del Cabo|Sudáfrica|-33.92|18.42;Johannesburgo|Sudáfrica|-26.20|28.05;Nairobi|Kenia|-1.29|36.82;Dubái|Emiratos Árabes|25.20|55.27;Abu Dabi|Emiratos Árabes|24.45|54.38;Doha|Catar|25.29|51.53;Delhi|India|28.61|77.21;Bombay|India|19.08|72.88;Jaipur|India|26.91|75.79;Bangkok|Tailandia|13.76|100.50;Chiang Mai|Tailandia|18.79|98.98;Singapur|Singapur|1.35|103.82;Kuala Lumpur|Malasia|3.14|101.69;Hong Kong|China|22.32|114.17;Pekín|China|39.90|116.41;Shanghái|China|31.23|121.47;Seúl|Corea del Sur|37.57|126.98;Tokio|Japón|35.68|139.69;Kioto|Japón|35.01|135.77;Osaka|Japón|34.69|135.50;Nueva York|Estados Unidos|40.71|-74.01;Boston|Estados Unidos|42.36|-71.06;Filadelfia|Estados Unidos|39.95|-75.17;Washington D. C.|Estados Unidos|38.91|-77.04;Miami|Estados Unidos|25.76|-80.19;Orlando|Estados Unidos|28.54|-81.38;Chicago|Estados Unidos|41.88|-87.63;Los Ángeles|Estados Unidos|34.05|-118.24;San Diego|Estados Unidos|32.72|-117.16;San Francisco|Estados Unidos|37.77|-122.42;Las Vegas|Estados Unidos|36.17|-115.14;Toronto|Canadá|43.65|-79.38;Montreal|Canadá|45.50|-73.57;Ciudad de México|México|19.43|-99.13;Puebla|México|19.04|-98.21;Guadalajara|México|20.66|-103.35;Monterrey|México|25.69|-100.32;Cancún|México|21.16|-86.85;Playa del Carmen|México|20.63|-87.08;Oaxaca|México|17.07|-96.73;La Habana|Cuba|23.11|-82.37;Santo Domingo|República Dominicana|18.49|-69.93;Punta Cana|República Dominicana|18.58|-68.40;San José|Costa Rica|9.93|-84.08;Ciudad de Panamá|Panamá|8.98|-79.52;Bogotá|Colombia|4.71|-74.07;Medellín|Colombia|6.24|-75.58;Cali|Colombia|3.45|-76.53;Cartagena de Indias|Colombia|10.39|-75.48;Quito|Ecuador|-0.18|-78.47;Guayaquil|Ecuador|-2.17|-79.92;Lima|Perú|-12.05|-77.04;Cusco|Perú|-13.53|-71.97;Santiago|Chile|-33.45|-70.67;Valparaíso|Chile|-33.05|-71.62;Buenos Aires|Argentina|-34.60|-58.38;Rosario|Argentina|-32.95|-60.65;Córdoba|Argentina|-31.42|-64.18;Mendoza|Argentina|-32.89|-68.85;La Plata|Argentina|-34.92|-57.95;Montevideo|Uruguay|-34.90|-56.16;São Paulo|Brasil|-23.55|-46.63;Río de Janeiro|Brasil|-22.91|-43.17;Sídney|Australia|-33.87|151.21;Melbourne|Australia|-37.81|144.96;Auckland|Nueva Zelanda|-36.85|174.76`;

export const CITIES: City[] = RAW.split(";").map((r) => {
  const [name, country, lat, lon] = r.split("|");
  return { name, country, lat: +lat, lon: +lon };
});

export const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export const cityLabel = (c: City) => `${c.name}, ${c.country}`;

export function searchCities(q: string, limit = 6): City[] {
  const n = norm(q.split(",")[0]);
  if (!n) return [];
  const starts = CITIES.filter((c) => norm(c.name).startsWith(n));
  const contains = CITIES.filter((c) => !starts.includes(c) && (norm(c.name).includes(n) || norm(c.country).startsWith(n)));
  return [...starts, ...contains].slice(0, limit);
}

function km(aLat: number, aLon: number, bLat: number, bLon: number) {
  const R = 6371, r = Math.PI / 180;
  const dLat = (bLat - aLat) * r, dLon = (bLon - aLon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export type ResolvedOrigin = { input: string; city: City | null; hub: Hub; km: number; rerouted: boolean };

export function resolveOrigin(input: string): ResolvedOrigin {
  const [namePart, countryPart] = input.split(",").map((s) => norm(s ?? ""));
  const city =
    CITIES.find((c) => norm(c.name) === namePart && (!countryPart || norm(c.country) === countryPart)) ??
    CITIES.find((c) => norm(c.name) === namePart) ?? null;
  if (!city) {
    const direct = HUBS.find((h) => norm(h.city) === namePart);
    return { input, city: null, hub: direct ?? HUBS[0], km: 0, rerouted: false };
  }
  let best = HUBS[0], bestKm = Infinity;
  for (const h of HUBS) {
    const d = km(city.lat, city.lon, h.lat, h.lon);
    if (d < bestKm) { best = h; bestKm = d; }
  }
  return { input, city, hub: best, km: Math.round(bestKm), rerouted: bestKm > 40 };
}
