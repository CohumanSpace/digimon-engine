import { CohereClient } from "cohere-ai";
import { BaseAgent, ChatMessage, ModelConfig } from "./base_agent";

export class CohereAgent implements BaseAgent {
  private client: CohereClient;
  modelName: string;
  temperature: number;
  maxTokens: number;

  constructor(config: ModelConfig) {
    this.client = new CohereClient({ apiKey: config.apiKey });
    this.modelName = config.modelName;
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const response = await this.client.chat({
      model: this.modelName,
      message: this.formatMessages(messages),
      temperature: this.temperature,
      max_tokens: this.maxTokens,
    });
    return response.text;
  }

  async *stream(messages: ChatMessage[]): AsyncGenerator<string> {
    const stream = await this.client.chat({
      model: this.modelName,
      message: this.formatMessages(messages),
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  }

  private formatMessages(messages: ChatMessage[]): string {
    return messages.map((msg) => msg.content).join("\n");
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
