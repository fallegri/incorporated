import { z } from "zod";
import {
  AIProvider,
  AICapabilities,
  ChatMessage,
  RAGContext,
  AINotAvailableError,
} from "../types";

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";
const OLLAMA_EMBED_MODEL = "nomic-embed-text";

export class OllamaProvider implements AIProvider {
  readonly name = "ollama" as const;
  readonly capabilities: AICapabilities = {
    chat: true,
    embeddings: true,
    streaming: true,
    structuredOutput: true,
    maxTokens: 4096,
    embeddingDimensions: 768,
  };

  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  }

  async *chat(messages: ChatMessage[], context?: RAGContext): AsyncIterable<string> {
    const systemPrompt = this.buildSystemPrompt(context);
    const ollamaMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: ollamaMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new AINotAvailableError(`Ollama error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new AINotAvailableError("No response body from Ollama");

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value, { stream: true }).split("\n");
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            yield json.message.content;
          }
        } catch {
          // Skip malformed lines
        }
      }
    }
  }

  async embed(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/api/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: OLLAMA_EMBED_MODEL, input: text }),
    });

    if (!response.ok) {
      throw new AINotAvailableError(`Ollama embed error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embeddings[0];
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    // Ollama processes one at a time
    const results: number[][] = [];
    for (const text of texts) {
      results.push(await this.embed(text));
    }
    return results;
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    context?: RAGContext
  ): Promise<T> {
    const systemPrompt =
      this.buildSystemPrompt(context) +
      "\n\nResponde SOLO con JSON válido. No incluyas texto antes ni después del JSON.";

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        stream: false,
        format: "json",
      }),
    });

    if (!response.ok) {
      throw new AINotAvailableError(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.message.content);
    return schema.parse(parsed);
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private buildSystemPrompt(context?: RAGContext): string {
    let prompt = `Eres un asistente experto en planificacion estrategica y desarrollo humano. Respondes siempre en espanol.`;

    if (context?.cargoInfo) {
      prompt += `\n\nContexto del usuario:\n- Cargo: ${context.cargoInfo.nombre}\n- Área: ${context.cargoInfo.area}`;
    }

    if (context?.chunks && context.chunks.length > 0) {
      prompt += `\n\nDocumentos de referencia:\n`;
      for (const chunk of context.chunks) {
        prompt += `\n[${chunk.source}]: ${chunk.content}\n`;
      }
    }

    return prompt;
  }
}
