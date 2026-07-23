import { z } from "zod";
import {
  AIProvider,
  AICapabilities,
  ChatMessage,
  RAGContext,
  AINotAvailableError,
} from "../types";

/**
 * NoAI Provider — Fallback when no AI is configured.
 * The system works 100% without AI for all CRUD operations.
 * AI-specific features (chat, lineamiento generation) are gracefully disabled.
 */
export class NoAIProvider implements AIProvider {
  readonly name = "none" as const;
  readonly capabilities: AICapabilities = {
    chat: false,
    embeddings: false,
    streaming: false,
    structuredOutput: false,
    maxTokens: 0,
    embeddingDimensions: 0,
  };

  async *chat(_messages: ChatMessage[], _context?: RAGContext): AsyncIterable<string> {
    yield "El asistente IA no está configurado en este momento. ";
    yield "Puede buscar información directamente en la sección de Documentos ";
    yield "o consultar con su jefe de área.";
    yield "\n\nPara activar el asistente, un administrador debe configurar ";
    yield "un proveedor de IA (Gemini o Ollama) en la configuración del sistema.";
  }

  async embed(_text: string): Promise<number[]> {
    throw new AINotAvailableError(
      "Embeddings no disponibles. Configure un proveedor de IA (Gemini u Ollama) para habilitar la búsqueda semántica en documentos."
    );
  }

  async embedBatch(_texts: string[]): Promise<number[][]> {
    throw new AINotAvailableError(
      "Embeddings no disponibles. Configure un proveedor de IA."
    );
  }

  async generateStructured<T>(
    _prompt: string,
    _schema: z.ZodType<T>,
    _context?: RAGContext
  ): Promise<T> {
    throw new AINotAvailableError(
      "La generación de lineamientos requiere un proveedor de IA activo (Gemini u Ollama). Configure uno en Ajustes → Proveedor IA."
    );
  }

  async isAvailable(): Promise<boolean> {
    return true; // Always "available" as the fallback
  }
}
