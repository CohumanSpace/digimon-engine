import { LettaClient, LettaEnvironment } from "@letta-ai/letta-client";

// connect to a local server
export const localLettaClient = new LettaClient({
  environment: LettaEnvironment.SelfHosted,
});

// connect to Letta Cloud
export const cloudLettaClient = new LettaClient({
  token: "LETTA_API_KEY",
});
