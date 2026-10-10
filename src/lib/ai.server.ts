import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { SCENES, type AiSuggestion, type Answers } from "./trips";
import { resolveOrigin } from "./geo";

const schema = z.object({
  trips: z.array(z.object({
    name: z.string(),
    region: z.string(),
    country: z.string(),
    lat: z.number(),
    lon: z.number(),
    scene: z.enum(SCENES),
    tagline: z.string(),
    days: z.number(),
    transport: z.number(),
    stay: z.number(),
    activities: z.number(),
    plan: z.array(z.string()),
    match: z.number(),
    needsFlight: z.boolean(),
  })),
});

export async function generateSuggestions(a: Answers): Promise<AiSuggestion[]> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Falta la configuración de IA");
  const o = resolveOrigin(a.origin);
  const people = a.company === "Solo" ? 1 : a.company === "Familia" ? 3 : 2;
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  const originTxt = o.city ? `${o.city.name}, ${o.city.country} (lat ${o.city.lat}, lon ${o.city.lon}); aeropuerto internacional más cercano: ${o.hub.city} (${o.hub.code})` : `${a.origin} (aeropuerto de referencia ${o.hub.city} ${o.hub.code})`;
  const prompt = `Eres un agente de viajes experto y realista. Sugiere hasta 5 destinos (de cualquier parte del mundo: ciudades, regiones, islas, parques naturales, pueblos) para este viajero, ordenados de mejor a peor encaje.

Origen: ${originTxt}
Estilo: ${a.style}. Viajan: ${a.company} (${people} persona/s). Ritmo: ${a.pace}. Intereses: ${a.interests.join(", ") || "sin preferencia"}.
Duración: ${a.days ? `EXACTAMENTE ${a.days} días para todos los destinos (ajusta los precios de estancia y actividades a esa duración)` : "la que mejor encaje con el presupuesto (1-21 días)"}.
Presupuesto TOTAL para todo el grupo, todo incluido: ${a.budget} EUR.

Reglas:
- NUNCA sugieras la propia ciudad de origen ni lugares a menos de 60 km de ella.
- Ten en cuenta la distancia: con presupuestos bajos prioriza destinos cercanos accesibles en autobús o tren; para viajes largos indica needsFlight=true (también si hay mar de por medio).
- Precios realistas de 2026 en EUR para todo el grupo: transport (ida y vuelta + transporte local), stay (alojamiento + comidas), activities. La suma debe ser <= ${a.budget}. Aprovecha bien el presupuesto (idealmente 75-100%).
- Si el presupuesto no da para un viaje realista, devuelve menos destinos o una lista vacía. No inventes precios imposibles (ej. un vuelo internacional por 20€).
- days: duración razonable para el presupuesto (1-21). plan: 3 actividades concretas y reales. tagline: máx 8 palabras. match: 50-99. lat/lon reales del destino.
- scene: la imagen que mejor lo representa entre ${SCENES.join(", ")}.
- Varía: no repitas siempre los destinos típicos; incluye alguna joya menos conocida si encaja.
- Todo el texto en español.`;
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    prompt,
    output: Output.object({ schema }),
    providerOptions: {
      openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] },
    },
  });
  try {
    const out = await result.output;
    return out.trips as AiSuggestion[];
  } catch (e) {
    if (NoObjectGeneratedError.isInstance(e) && e.text) {
      try { return (schema.parse(JSON.parse(e.text)).trips) as AiSuggestion[]; } catch { return []; }
    }
    throw e;
  }
}
