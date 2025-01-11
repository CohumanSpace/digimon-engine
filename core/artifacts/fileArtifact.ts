import fs from "fs";
import path from "path";
import { BaseArtifact } from "./baseArtifact";
import { ArtifactUploadResponse, GameEnvironment } from "../types";

export class FileArtifact extends BaseArtifact {
  private baseDir: string;

  constructor(baseDir: string = "agent_data") {
    super("FileArtifact", "Handles file-based storage operations", "storage");
    this.baseDir = baseDir;
    this.ensureDirectoryExists(baseDir);
  }

  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private getFilePath(filename: string): string {
    return path.join(this.baseDir, filename);
  }

  async save(
    data: Record<string, unknown>,
    filename: string,
  ): Promise<ArtifactUploadResponse> {
    try {
      const filePath = this.getFilePath(filename);
      const jsonData = JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, jsonData, "utf8");

      return {
        success: true,
        url: filePath,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        url: null,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async load(filename: string): Promise<Record<string, unknown>> {
    try {
      const filePath = this.getFilePath(filename);
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      throw new Error(
        `Failed to load file: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async delete(filename: string): Promise<boolean> {
    try {
      const filePath = this.getFilePath(filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async list(): Promise<string[]> {
    try {
      return fs.readdirSync(this.baseDir);
    } catch {
      return [];
    }
  }

  async modifyEnvironment(environment: GameEnvironment): Promise<void> {
    // Default implementation - no environment modifications needed for file storage
    console.log("FileArtifact: modifyEnvironment called", environment);
    return Promise.resolve();
  }
}
