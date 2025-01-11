import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { BaseAgent, ChatMessage, ModelConfig } from "./base_agent";

export class BedrockAgent implements BaseAgent {
  private client: BedrockRuntimeClient;
  modelName: string;
  temperature: number;
  maxTokens: number;

  constructor(config: ModelConfig) {
    this.client = new BedrockRuntimeClient({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
      region: process.env.AWS_REGION || "us-east-1",
    });
    this.modelName = config.modelName;
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const command = new InvokeModelCommand({
      modelId: this.modelName,
      body: JSON.stringify({
        prompt: this.formatMessages(messages),
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      }),
    });

    const response = await this.client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.completion;
  }

  async *stream(messages: ChatMessage[]): AsyncGenerator<string> {
    const command = new InvokeModelCommand({
      modelId: this.modelName,
      body: JSON.stringify({
        prompt: this.formatMessages(messages),
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        stream: true,
      }),
    });

    const response = await this.client.send(command);
    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = JSON.parse(new TextDecoder().decode(value));
      if (chunk.completion) {
        yield chunk.completion;
      }
    }
  }

  private formatMessages(messages: ChatMessage[]): string {
    return messages.map((msg) => `${msg.role}: ${msg.content}`).join("\n");
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
