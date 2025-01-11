import { GoogleGenerativeAI } from "@google/generative-ai";
import { BaseAgent, ChatMessage, ModelConfig } from "./base_agent";

export class GeminiAgent implements BaseAgent {
  private client: GoogleGenerativeAI;
  modelName: string;
  temperature: number;
  maxTokens: number;

  constructor(config: ModelConfig) {
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.modelName = config.modelName;
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    const chat = model.startChat({
      generationConfig: {
        temperature: this.temperature,
        maxOutputTokens: this.maxTokens,
      },
    });

    const result = await chat.sendMessage(this.formatMessages(messages));
    return result.response.text();
  }

  async *stream(messages: ChatMessage[]): AsyncGenerator<string> {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    const chat = model.startChat({
      generationConfig: {
        temperature: this.temperature,
        maxOutputTokens: this.maxTokens,
      },
    });

    const result = await chat.sendMessage(this.formatMessages(messages), {
      stream: true,
    });
    for await (const chunk of result.stream) {
      yield chunk.text();
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
