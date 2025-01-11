import { OpenAI } from "openai";
import { BaseAgent, ChatMessage, ModelConfig } from "./base_agent";

export class OpenAIAgent implements BaseAgent {
  private client: OpenAI;
  modelName: string;
  temperature: number;
  maxTokens: number;

  constructor(config: ModelConfig) {
    this.client = new OpenAI({ apiKey: config.apiKey });
    this.modelName = config.modelName;
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.modelName,
      messages,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
    });
    return response.choices[0].message.content || "";
  }

  async *stream(messages: ChatMessage[]): AsyncGenerator<string> {
    const stream = await this.client.chat.completions.create({
      model: this.modelName,
      messages,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        yield chunk.choices[0].delta.content;
      }
    }
  }

  getModelConfig(): ModelConfig {
    return {
      modelName: this.modelName,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
      apiKey: this.client.apiKey,
    };
  }
}
