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
      "\n\nResponde SOLO con JSON válido. No incluyas texto antes ni después del JSON.";

    // Use direct fetch (confirmed working) instead of AI SDK (causes 404 on NVIDIA)
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
        temperature: 0.7,
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

    // Extract JSON from response (in case model adds text around it)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("La IA no generó JSON válido. Intenta de nuevo.");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return schema.parse(parsed);
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
