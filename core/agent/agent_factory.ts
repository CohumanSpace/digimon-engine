import { BaseAgent, ModelConfig } from "./base_agent";
import { OpenAIAgent } from "./openai_agent";
import { AnthropicAgent } from "./anthropic_agent";
import { GeminiAgent } from "./gemini_agent";
import { MistralAgent } from "./mistral_agent";
import { OllamaAgent } from "./ollama_agent";
import { BedrockAgent } from "./bedrock_agent";
import { CohereAgent } from "./cohere_agent";
import { Claude3Agent } from "./claude3_agent";
import { PalmAgent } from "./palm_agent";

export type AgentType =
  | "openai"
  | "anthropic"
  | "gemini"
  | "mistral"
  | "ollama"
  | "bedrock"
  | "cohere"
  | "claude3"
  | "palm";

export class AgentFactory {
  static createAgent(type: AgentType, config: ModelConfig): BaseAgent {
    switch (type) {
      case "openai":
        return new OpenAIAgent(config);
      case "anthropic":
        return new AnthropicAgent(config);
      case "gemini":
        return new GeminiAgent(config);
      case "mistral":
        return new MistralAgent(config);
      case "ollama":
        return new OllamaAgent(config);
      case "bedrock":
        return new BedrockAgent(config);
      case "cohere":
        return new CohereAgent(config);
      case "claude3":
        return new Claude3Agent(config);
      case "palm":
        return new PalmAgent(config);
      default:
        throw new Error(`Unknown agent type: ${type}`);
    }
  }
}
