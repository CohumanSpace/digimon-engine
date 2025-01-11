import MistralClient from "@mistralai/mistralai";
import { BaseAgent, ChatMessage, ModelConfig } from "./base_agent";

export class MistralAgent implements BaseAgent {
  private client: MistralClient;
  modelName: string;
  temperature: number;
  maxTokens: number;

  constructor(config: ModelConfig) {
    this.client = new MistralClient(config.apiKey);
    this.modelName = config.modelName;
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const response = await this.client.chat({
      model: this.modelName,
      messages: this.formatMessages(messages),
      temperature: this.temperature,
      maxTokens: this.maxTokens,
    });
    return response.choices[0].message.content;
  }

  async *stream(messages: ChatMessage[]): AsyncGenerator<string> {
    const stream = await this.client.chatStream({
      model: this.modelName,
      messages: this.formatMessages(messages),
      temperature: this.temperature,
      maxTokens: this.maxTokens,
    });

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        yield chunk.choices[0].delta.content;
      }
    }
  }

  private formatMessages(messages: ChatMessage[]): {
    role: string;
    content: string;
  }[] {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
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
