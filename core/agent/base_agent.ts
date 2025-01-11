import { ChatMessage, ModelConfig } from "../../utils/types";

export interface BaseAgent {
  modelName: string;
  temperature: number;
  maxTokens: number;

  chat(messages: ChatMessage[]): Promise<string>;
  stream(messages: ChatMessage[]): AsyncGenerator<string>;
  getModelConfig(): ModelConfig;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelConfig {
  modelName: string;
  temperature: number;
  maxTokens: number;
  apiKey: string;
}
