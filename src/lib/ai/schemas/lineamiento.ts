import { z } from "zod";

/**
 * Schema for AI-generated lineamientos.
 * This defines the structured output that the AI must produce
 * when generating strategic objectives for a cargo.
 */
export const LineamientoGeneradoSchema = z.object({
  objetivos: z
    .array(
      z.object({
        titulo: z.string().describe("Título conciso del objetivo estratégico"),
        descripcion: z.string().describe("Descripción detallada del objetivo"),
        tipo: z.enum(["estratégico", "operativo"]),
        alineamiento_pei: z
          .string()
          .describe("Qué eje/objetivo del PEI atiende este objetivo"),
        kpis: z
          .array(
            z.object({
              nombre: z.string(),
              metrica: z.string().describe("Cómo se mide"),
              meta: z.string().describe("Valor objetivo"),
              frecuencia: z.enum(["mensual", "trimestral", "semestral", "anual"]),
            })
          )
          .min(2)
          .max(3),
        actividades: z
          .array(
            z.object({
              descripcion: z.string(),
              plazo_dias: z.enum(["30", "60", "90"]),
              prioridad: z.enum(["alta", "media", "baja"]),
            })
          )
          .min(3)
          .max(5),
      })
    )
    .min(3)
    .max(5),

  plan_insercion: z.object({
    dia_30: z.array(z.string()).describe("Hitos para los primeros 30 días"),
    dia_60: z.array(z.string()).describe("Hitos para los primeros 60 días"),
    dia_90: z.array(z.string()).describe("Hitos para los primeros 90 días"),
  }),

  documentos_sugeridos: z
    .array(z.string())
    .describe("Documentos adicionales que el usuario debería consultar o solicitar"),

  observaciones: z
    .string()
    .describe("Observaciones o recomendaciones adicionales de la IA"),
});

export type LineamientoGenerado = z.infer<typeof LineamientoGeneradoSchema>;
