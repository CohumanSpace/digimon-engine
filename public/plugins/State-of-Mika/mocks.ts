// Create mock types for testing
export interface DigimonPlugin {
  name: string;
  onInitialize: (engine: any) => void;
  onDisable: () => void;
}

export class DigimonEngine {
  getLogger() { return console; }
  registerPlugin() {}
  getPlugin() {}
  start() {}
}

export interface AgentContext {
  agent: any;
  memory?: any;
  world?: any;
  engine: DigimonEngine;
}

export interface Logger {
  info: (message: string) => void;
  debug: (message: string) => void;
  error: (message: string) => void;
} 