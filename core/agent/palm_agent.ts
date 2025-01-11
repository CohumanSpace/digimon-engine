import { DiscussServiceClient } from "@google-ai/generativelanguage";
import { GoogleAuth } from "google-auth-library";
import { BaseAgent, ChatMessage, ModelConfig } from "./base_agent";

export class PalmAgent implements BaseAgent {
  private client: DiscussServiceClient;
  modelName: string;
  temperature: number;
  maxTokens: number;

  constructor(config: ModelConfig) {
    const auth = new GoogleAuth({
      credentials: JSON.parse(config.apiKey),
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    this.client = new DiscussServiceClient({ auth });
    this.modelName = config.modelName || "chat-bison";
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const [response] = await this.client.generateMessage({
      model: this.modelName,
      prompt: { messages: this.formatMessages(messages) },
      temperature: this.temperature,
      candidateCount: 1,
    });
    return response.candidates?.[0]?.content || "";
  }

  async *stream(messages: ChatMessage[]): AsyncGenerator<string> {
    const [response] = await this.client.generateMessageStream({
      model: this.modelName,
      prompt: { messages: this.formatMessages(messages) },
      temperature: this.temperature,
    });

    for await (const chunk of response.candidates || []) {
      if (chunk.content) {
        yield chunk.content;
      }
    }
  }

  private formatMessages(messages: ChatMessage[]): Array<{ content: string }> {
    return messages.map((msg) => ({ content: msg.content }));
  }

  getModelConfig(): ModelConfig {
    return {
      modelName: this.modelName,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
      apiKey: "",
    };
  }
}
