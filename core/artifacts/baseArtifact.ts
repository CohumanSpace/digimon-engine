import { GameEnvironment } from "../types";

export interface ArtifactEffect {
  type: string;
  value: number | string | boolean;
  duration?: number; // in game turns/ticks
}

export abstract class BaseArtifact {
  protected id: string;
  protected name: string;
  protected description: string;
  protected effects: ArtifactEffect[];

  constructor(
    id: string,
    name: string,
    description: string,
    effects: ArtifactEffect[] = [],
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.effects = effects;
  }

  // Method to apply artifact effects to game environment
  public applyEffects(environment: GameEnvironment): void {
    this.effects.forEach((effect) => {
      this.modifyEnvironment(environment, effect);
    });
  }

  // Method to remove artifact effects from game environment
  public removeEffects(environment: GameEnvironment): void {
    this.effects.forEach((effect) => {
      this.modifyEnvironment(environment, {
        ...effect,
        value: this.reverseEffectValue(effect.value),
      });
    });
  }

  protected abstract modifyEnvironment(
    environment: GameEnvironment,
    effect: ArtifactEffect,
  ): void;

  private reverseEffectValue(
    value: number | string | boolean,
  ): number | string | boolean {
    if (typeof value === "number") {
      return -value;
    }
    if (typeof value === "boolean") {
      return !value;
    }
    return value;
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description;
  }

  public getEffects(): ArtifactEffect[] {
    return [...this.effects];
  }
}
