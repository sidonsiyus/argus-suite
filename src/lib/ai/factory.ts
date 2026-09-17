import { AIProvider } from "./types";
import { OpenRouterProvider } from "./providers/openrouter";
import { GroqProvider } from "./providers/groq";

export function getAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || "openrouter").toLowerCase();

  switch (provider) {
    case "groq":
      return new GroqProvider(process.env.GROQ_API_KEY || "");
    case "openrouter":
    default:
      return new OpenRouterProvider(process.env.OPENROUTER_API_KEY || "");
  }
}

