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
