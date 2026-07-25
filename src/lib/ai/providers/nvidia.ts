import { createOpenAI } from "@ai-sdk/openai";
import { generateText, streamText, embed, embedMany } from "ai";
import { z } from "zod";
import {
  AIProvider,
  AICapabilities,
  ChatMessage,
  RAGContext,
  AINotAvailableError,
} from "../types";

export class NvidiaProvider implements AIProvider {
  readonly name = "nvidia" as const;
  readonly capabilities: AICapabilities = {
    chat: true,
    embeddings: true,
    streaming: true,
    structuredOutput: true,
    maxTokens: 4096,
    embeddingDimensions: 1024,
  };

  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  private get resolvedApiKey(): string | undefined {
    return this.apiKey || process.env.NVIDIA_API_KEY;
  }

  private get client() {
    return createOpenAI({
      baseURL: "https://integrate.api.nvidia.com/v1",
      apiKey: this.resolvedApiKey,
    });
  }

  private get model() {
    // meta/llama-3.1-8b-instruct — confirmed working with free tier
    return this.client("meta/llama-3.1-8b-instruct");
  }

  private get chatModel() {
    return this.client("meta/llama-3.1-8b-instruct");
  }

  async *chat(messages: ChatMessage[], context?: RAGContext): AsyncIterable<string> {
    const systemPrompt = this.buildSystemPrompt(context);
    const allMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    // Direct fetch for streaming (AI SDK causes 404 on NVIDIA)
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.resolvedApiKey}`,
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        messages: allMessages,
        max_tokens: 2048,
        stream: false,
      }),
    });

    if (!response.ok) {
      yield "Error al conectar con NVIDIA IA. Verifica tu API key.";
      return;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Sin respuesta";
    yield content;
  }

  async embed(text: string): Promise<number[]> {
    const response = await fetch("https://integrate.api.nvidia.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.resolvedApiKey}`,
      },
      body: JSON.stringify({
        model: "nvidia/nv-embedqa-e5-v5",
        input: [text],
        input_type: "query",
        encoding_format: "float",
        truncate: "END",
      }),
    });

    if (!response.ok) {
      throw new AINotAvailableError(`NVIDIA embeddings error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await fetch("https://integrate.api.nvidia.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.resolvedApiKey}`,
      },
      body: JSON.stringify({
        model: "nvidia/nv-embedqa-e5-v5",
        input: texts,
        input_type: "query",
        encoding_format: "float",
        truncate: "END",
      }),
    });

    if (!response.ok) {
      throw new AINotAvailableError(`NVIDIA embeddings error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.map((item: { embedding: number[] }) => item.embedding);
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    context?: RAGContext
  ): Promise<T> {
    const systemPrompt = this.buildSystemPrompt(context) +
      `\n\nIMPORTANTE: Responde UNICAMENTE con JSON válido. Tu respuesta debe ser SOLO un objeto JSON con esta estructura exacta:
{
  "objetivos": [
    {
      "titulo": "string",
      "descripcion": "string",
      "tipo": "estratégico",
      "alineamiento_pei": "string",
      "kpis": [{ "nombre": "string", "metrica": "string", "meta": "string", "frecuencia": "trimestral" }],
      "actividades": [{ "descripcion": "string", "plazo_dias": "30", "prioridad": "alta" }]
    }
  ],
  "plan_insercion": { "dia_30": ["string"], "dia_60": ["string"], "dia_90": ["string"] },
  "documentos_sugeridos": ["string"],
  "observaciones": "string"
}
No agregues texto antes ni después del JSON. No uses markdown. Solo JSON puro.`;

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.resolvedApiKey}`,
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: 4096,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new AINotAvailableError(
        `NVIDIA API error (${response.status}): ${errText.slice(0, 200)}`
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("La IA no generó JSON válido. Intenta de nuevo.");
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]);

      // Fill defaults for missing fields (model may not generate all)
      const normalized = {
        objetivos: parsed.objetivos || parsed.objectives || [],
        plan_insercion: parsed.plan_insercion || parsed.plan || { dia_30: [], dia_60: [], dia_90: [] },
        documentos_sugeridos: parsed.documentos_sugeridos || parsed.documentos || [],
        observaciones: parsed.observaciones || parsed.notas || "Generado por IA — revisa y ajusta según tu criterio.",
      };

      // Normalize objetivos
      if (normalized.objetivos.length > 0) {
        normalized.objetivos = normalized.objetivos.map((obj: any) => ({
          titulo: obj.titulo || obj.title || "Objetivo",
          descripcion: obj.descripcion || obj.description || "",
          tipo: obj.tipo === "operativo" ? "operativo" : "estratégico",
          alineamiento_pei: obj.alineamiento_pei || obj.alineamiento || "Por definir",
          kpis: (obj.kpis || []).slice(0, 3).map((k: any) => ({
            nombre: k.nombre || k.name || "KPI",
            metrica: k.metrica || k.metric || "",
            meta: k.meta || k.target || "Por definir",
            frecuencia: k.frecuencia || "trimestral",
          })),
          actividades: (obj.actividades || obj.activities || []).slice(0, 5).map((a: any) => ({
            descripcion: a.descripcion || a.description || "Actividad",
            plazo_dias: ["30", "60", "90"].includes(String(a.plazo_dias || a.plazo)) ? String(a.plazo_dias || a.plazo) : "60",
            prioridad: ["alta", "media", "baja"].includes(a.prioridad || a.priority) ? (a.prioridad || a.priority) : "media",
          })),
        }));
      }

      return schema.parse(normalized);
    } catch (parseError: any) {
      // If Zod validation fails, return a minimal valid response
      const fallback = {
        objetivos: [{
          titulo: "Objetivo generado por IA (revisar)",
          descripcion: text.slice(0, 200),
          tipo: "estratégico" as const,
          alineamiento_pei: "Por definir",
          kpis: [{ nombre: "KPI por definir", metrica: "Por definir", meta: "Por definir", frecuencia: "trimestral" as const }],
          actividades: [{ descripcion: "Revisar respuesta de IA y definir actividades", plazo_dias: "30" as const, prioridad: "alta" as const }],
        }],
        plan_insercion: { dia_30: ["Revisar lineamientos generados"], dia_60: ["Ajustar objetivos"], dia_90: ["Evaluar avance"] },
        documentos_sugeridos: ["PEI", "POA"],
        observaciones: "La IA generó una respuesta parcial. Revisa y completa manualmente.",
      };

      try {
        return schema.parse(fallback) as T;
      } catch {
        throw new Error("Error al procesar respuesta de IA: " + parseError.message?.slice(0, 200));
      }
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const key = this.resolvedApiKey;
      return !!key && key.length > 0;
    } catch {
      return false;
    }
  }

  private buildSystemPrompt(context?: RAGContext): string {
    let prompt = `Eres un asistente experto en planificacion estrategica y desarrollo humano para la plataforma Incorporated. Respondes siempre en espanol.`;

    if (context?.cargoInfo) {
      prompt += `\n\nContexto del usuario:\n- Cargo: ${context.cargoInfo.nombre}\n- Área: ${context.cargoInfo.area}\n- Descripción: ${context.cargoInfo.descripcion}`;
      if (context.cargoInfo.reportaA) {
        prompt += `\n- Reporta a: ${context.cargoInfo.reportaA}`;
      }
    }

    if (context?.chunks && context.chunks.length > 0) {
      prompt += `\n\nDocumentos de referencia:\n`;
      for (const chunk of context.chunks) {
        prompt += `\n[Fuente: ${chunk.source}${chunk.page ? ` p.${chunk.page}` : ""}]\n${chunk.content}\n`;
      }
    }

    return prompt;
  }
}
