import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { CloudSchedulerClient } from "@google-cloud/scheduler";
import { Storage } from "@google-cloud/storage";
import { CloudRunClient } from "@google-cloud/run";
import { Compute } from "@google-cloud/compute";

export class GCPUtils {
  private secretManager: SecretManagerServiceClient;
  private scheduler: CloudSchedulerClient;
  private storage: Storage;
  private cloudRun: CloudRunClient;
  private compute: Compute;
  private projectId: string;

  constructor(projectId: string) {
    this.projectId = projectId;
    this.secretManager = new SecretManagerServiceClient();
    this.scheduler = new CloudSchedulerClient();
    this.storage = new Storage();
    this.cloudRun = new CloudRunClient();
    this.compute = new Compute();
  }

  // Secret Manager Methods
  async getSecret(secretName: string, version = "latest"): Promise<string> {
    try {
      const name = `projects/${this.projectId}/secrets/${secretName}/versions/${version}`;
      const [response] = await this.secretManager.accessSecretVersion({ name });
      return response.payload?.data?.toString() || "";
    } catch (error) {
      throw new Error(`Failed to get secret: ${error}`);
    }
  }

  async createSecret(secretId: string, payload: string): Promise<void> {
    try {
      const parent = `projects/${this.projectId}`;
      await this.secretManager.createSecret({
        parent,
        secretId,
        secret: {
          replication: {
            automatic: {},
          },
        },
      });
      await this.secretManager.addSecretVersion({
        parent: `projects/${this.projectId}/secrets/${secretId}`,
        payload: {
          data: Buffer.from(payload, "utf8"),
        },
      });
    } catch (error) {
      throw new Error(`Failed to create secret: ${error}`);
    }
  }

  // Cloud Storage Methods
  async uploadFile(
    bucketName: string,
    filePath: string,
    destination: string,
  ): Promise<void> {
    try {
      const bucket = this.storage.bucket(bucketName);
      await bucket.upload(filePath, {
        destination,
      });
    } catch (error) {
      throw new Error(`Failed to upload file: ${error}`);
    }
  }

  async downloadFile(
    bucketName: string,
    fileName: string,
    destination: string,
  ): Promise<void> {
    try {
      const bucket = this.storage.bucket(bucketName);
      await bucket.file(fileName).download({
        destination,
      });
    } catch (error) {
      throw new Error(`Failed to download file: ${error}`);
    }
  }

  // Cloud Scheduler Methods
  async createJob(
    jobName: string,
    schedule: string,
    targetUrl: string,
  ): Promise<void> {
    try {
      const parent = `projects/${this.projectId}/locations/us-central1`;
      await this.scheduler.createJob({
        parent,
        job: {
          name: `${parent}/jobs/${jobName}`,
          httpTarget: {
            uri: targetUrl,
            httpMethod: "POST",
          },
          schedule,
          timeZone: "UTC",
        },
      });
    } catch (error) {
      throw new Error(`Failed to create job: ${error}`);
    }
  }

  // Cloud Run Methods
  async deployService(
    serviceName: string,
    image: string,
    envVars: Record<string, string> = {},
  ): Promise<void> {
    try {
      const parent = `projects/${this.projectId}/locations/us-central1`;
      await this.cloudRun.createService({
        parent,
        service: {
          name: `${parent}/services/${serviceName}`,
          template: {
            containers: [
              {
                image,
                env: Object.entries(envVars).map(([key, value]) => ({
                  name: key,
                  value,
                })),
              },
            ],
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to deploy service: ${error}`);
    }
  }

  // Helper Methods
  async checkResourceExists(resourcePath: string): Promise<boolean> {
    try {
      await this.secretManager.getProjectParent({
        name: resourcePath,
      });
      return true;
    } catch {
      return false;
    }
  }
}

// Export a singleton instance
export const gcpUtils = new GCPUtils(process.env.GOOGLE_CLOUD_PROJECT || "");
