import { google } from "@ai-sdk/google";
import { generateText, streamText, embed, embedMany } from "ai";
import { z } from "zod";
import {
  AIProvider,
  AICapabilities,
  ChatMessage,
  RAGContext,
  AINotAvailableError,
} from "../types";

export class GeminiProvider implements AIProvider {
  readonly name = "gemini" as const;
  readonly capabilities: AICapabilities = {
    chat: true,
    embeddings: true,
    streaming: true,
    structuredOutput: true,
    maxTokens: 8192,
    embeddingDimensions: 768,
  };

  private get model() {
    // Using gemini-2.0-flash — stable, free tier, confirmed working
    return google("gemini-2.0-flash");
  }

  private get embeddingModel() {
    return google.textEmbeddingModel("text-embedding-004");
  }

  async *chat(messages: ChatMessage[], context?: RAGContext): AsyncIterable<string> {
    const systemPrompt = this.buildSystemPrompt(context);
    const aiMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    const result = streamText({
      model: this.model,
      system: systemPrompt,
      messages: aiMessages,
    });

    for await (const chunk of result.textStream) {
      yield chunk;
    }
  }

  async embed(text: string): Promise<number[]> {
    const { embedding } = await embed({
      model: this.embeddingModel,
      value: text,
    });
    return embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const { embeddings } = await embedMany({
      model: this.embeddingModel,
      values: texts,
    });
    return embeddings;
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

    // Parse and validate with Zod
    const parsed = JSON.parse(text);
    return schema.parse(parsed);
  }

  async isAvailable(): Promise<boolean> {
    try {
      const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      return !!key && key.length > 0;
    } catch {
      return false;
    }
  }

  private buildSystemPrompt(context?: RAGContext): string {
    let prompt = `Eres un asistente experto en planificación estratégica y gestión del talento humano para la plataforma Incorporated. Respondes siempre en español.`;

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
