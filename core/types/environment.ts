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
