import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const input = z.object({
  style: z.string().max(40),
  company: z.string().max(40),
  pace: z.string().max(40),
  interests: z.array(z.string().max(40)).max(12),
  origin: z.string().max(120),
  budget: z.number().min(100).max(10000),
  days: z.number().int().min(1).max(30).optional(),
});

export const suggestTrips = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const { generateSuggestions } = await import("./ai.server");
    try {
      return { ok: true as const, trips: await generateSuggestions(data), fallback: false };
    } catch (e) {
      // Modo rescate: si la IA no está disponible (sin clave, sin créditos, etc.) usamos el catálogo local
      console.error("suggestTrips error, usando modo rescate", e);
      const { fallbackSuggestions } = await import("./fallback.server");
      return { ok: true as const, trips: fallbackSuggestions(data), fallback: true };
    }
  });
