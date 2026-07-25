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
    return this.client("nvidia/llama-3.1-nemotron-70b-instruct");
  }

  private get chatModel() {
    return this.client("meta/llama-3.1-8b-instruct");
  }

  async *chat(messages: ChatMessage[], context?: RAGContext): AsyncIterable<string> {
    const systemPrompt = this.buildSystemPrompt(context);
    const aiMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    const result = streamText({
      model: this.chatModel,
      system: systemPrompt,
      messages: aiMessages,
    });

    for await (const chunk of result.textStream) {
      yield chunk;
    }
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
    const systemPrompt = this.buildSystemPrompt(context);

    const { text } = await generateText({
      model: this.model,
      system: systemPrompt + "\n\nResponde SOLO con JSON válido según el schema solicitado.",
      prompt,
    });

    const parsed = JSON.parse(text);
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
