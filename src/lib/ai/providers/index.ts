import { AIProvider, AIProviderName } from "../types";
import { GeminiProvider } from "./gemini";
import { NvidiaProvider } from "./nvidia";
import { OllamaProvider } from "./ollama";
import { NoAIProvider } from "./none";

/**
 * Factory: Creates the appropriate AI provider based on configuration.
 * Implements Strategy Pattern — the provider is selected at runtime
 * based on the organization's AI_PROVIDER setting.
 */
export function createAIProvider(providerName?: AIProviderName): AIProvider {
  const name = providerName || (process.env.AI_PROVIDER as AIProviderName) || "none";

  switch (name) {
    case "gemini":
      return new GeminiProvider();
    case "nvidia":
      return new NvidiaProvider();
    case "ollama":
      return new OllamaProvider();
    case "none":
    default:
      return new NoAIProvider();
  }
}

export { GeminiProvider } from "./gemini";
export { NvidiaProvider } from "./nvidia";
export { OllamaProvider } from "./ollama";
export { NoAIProvider } from "./none";
