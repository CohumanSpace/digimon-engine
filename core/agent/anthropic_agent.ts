import Anthropic from "@anthropic-ai/sdk";
import { BaseAgent, ChatMessage, ModelConfig } from "./base_agent";

export class AnthropicAgent implements BaseAgent {
  private client: Anthropic;
  modelName: string;
  temperature: number;
  maxTokens: number;

  constructor(config: ModelConfig) {
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.modelName = config.modelName;
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
  }
  async chat(messages: ChatMessage[]): Promise<string> {
    const response = await this.client.messages.create({
      model: this.modelName,
      system: "",
      messages: [
        {
          role: "user",
          content: messages[messages.length - 1].content,
        },
      ],
      temperature: this.temperature,
      max_tokens: this.maxTokens,
    });
    return response.content[0].text;
  }

  async *stream(messages: ChatMessage[]): AsyncGenerator<string> {
    const stream = await this.client.messages.create({
      model: this.modelName,
      messages: this.formatMessages(messages),
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta") {
        yield chunk.delta.text;
      }
    }
  }

  private formatMessages(messages: ChatMessage[]): Array<{
    role: string;
    content: string;
  }> {
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
      apiKey: this.client.apiKey,
    };
  }
}
