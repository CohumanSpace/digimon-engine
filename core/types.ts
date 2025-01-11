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

export interface GameEnvironment {
  player: {
    health: number;
    status: Record<string, unknown>;
  };
  world: {
    state: Record<string, unknown>;
    entities: Record<string, unknown>;
  };
}

export interface ArtifactUploadResponse {
  success: boolean;
  url: string | null;
  error: string | null;
}
