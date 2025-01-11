import { Ollama } from "ollama";
import { BaseAgent, ChatMessage, ModelConfig } from "./base_agent";

interface OllamaMessage {
  role: string;
  content: string;
}

export class OllamaAgent implements BaseAgent {
  private client: Ollama;
  modelName: string;
  temperature: number;
  maxTokens: number;

  constructor(config: ModelConfig) {
    this.client = new Ollama();
    this.modelName = config.modelName;
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const response = await this.client.chat({
      model: this.modelName,
      messages: this.formatMessages(messages),
      options: {
        temperature: this.temperature,
        num_predict: this.maxTokens,
      },
    });
    return response.message.content;
  }

  async *stream(messages: ChatMessage[]): AsyncGenerator<string> {
    const stream = await this.client.chat({
      model: this.modelName,
      messages: this.formatMessages(messages),
      options: {
        temperature: this.temperature,
        num_predict: this.maxTokens,
      },
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.message?.content) {
        yield chunk.message.content;
      }
    }
  }

  private formatMessages(messages: ChatMessage[]): OllamaMessage[] {
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
