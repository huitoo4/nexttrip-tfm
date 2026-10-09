import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const input = z.object({
  style: z.string().max(40),
  company: z.string().max(40),
  pace: z.string().max(40),
  interests: z.array(z.string().max(40)).max(12),
  origin: z.string().max(120),
  budget: z.number().min(100).max(10000),
});

export const suggestTrips = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const { generateSuggestions } = await import("./ai.server");
    try {
      return { ok: true as const, trips: await generateSuggestions(data) };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      const msg = status === 429 ? "Demasiadas solicitudes, inténtalo en un minuto."
        : status === 402 || status === 403 ? "Se agotaron los créditos de IA del proyecto."
        : "No se pudieron generar viajes ahora mismo. Inténtalo de nuevo.";
      console.error("suggestTrips error", e);
      return { ok: false as const, error: msg, trips: [] };
    }
  });
