import { AIProvider } from "./types";
import { GroqProvider } from "./providers/groq";

export function getAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || "groq").toLowerCase();

  switch (provider) {
    case "groq":
    default:
      return new GroqProvider(process.env.GROQ_API_KEY || "");
  }
}
