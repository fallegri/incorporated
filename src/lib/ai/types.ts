import { z } from "zod";

export type AIProviderName = "gemini" | "ollama" | "none";

export interface AICapabilities {
  chat: boolean;
  embeddings: boolean;
  streaming: boolean;
  structuredOutput: boolean;
  maxTokens: number;
  embeddingDimensions: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface RAGContext {
  chunks: { content: string; source: string; page?: number }[];
  cargoInfo?: {
    nombre: string;
    area: string;
    descripcion: string;
    reportaA?: string;
  };
}

export interface AIProvider {
  readonly name: AIProviderName;
  readonly capabilities: AICapabilities;

  /** Conversational chat with optional RAG context */
  chat(messages: ChatMessage[], context?: RAGContext): AsyncIterable<string>;

  /** Generate embeddings for a text */
  embed(text: string): Promise<number[]>;

  /** Generate embeddings for multiple texts */
  embedBatch(texts: string[]): Promise<number[][]>;

  /** Generate structured output validated by a Zod schema */
  generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    context?: RAGContext
  ): Promise<T>;

  /** Check if the provider is available and properly configured */
  isAvailable(): Promise<boolean>;
}

export class AINotAvailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AINotAvailableError";
  }
}
