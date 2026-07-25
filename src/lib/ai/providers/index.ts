import { AIProvider, AIProviderName } from "../types";
import { GeminiProvider } from "./gemini";
import { NvidiaProvider } from "./nvidia";
import { OllamaProvider } from "./ollama";
import { NoAIProvider } from "./none";

/**
 * Factory: Creates the appropriate AI provider based on configuration.
 * Implements Strategy Pattern — the provider is selected at runtime
 * based on the organization's AI_PROVIDER setting.
 * 
 * @param providerName - The AI provider to use
 * @param apiKey - Optional API key (from org DB record, overrides env var)
 * @param ollamaUrl - Optional custom Ollama base URL
 */
export function createAIProvider(
  providerName?: AIProviderName,
  apiKey?: string,
  ollamaUrl?: string
): AIProvider {
  const name = providerName || (process.env.AI_PROVIDER as AIProviderName) || "none";

  switch (name) {
    case "gemini":
      return new GeminiProvider(apiKey);
    case "nvidia":
      return new NvidiaProvider(apiKey);
    case "ollama":
      return new OllamaProvider(ollamaUrl);
    case "none":
    default:
      return new NoAIProvider();
  }
}

export { GeminiProvider } from "./gemini";
export { NvidiaProvider } from "./nvidia";
export { OllamaProvider } from "./ollama";
export { NoAIProvider } from "./none";
