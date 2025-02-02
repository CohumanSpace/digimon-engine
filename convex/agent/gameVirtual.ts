import { GameAgent } from "@virtuals-protocol/game";
import { CdpAgent } from "./cdpAgentkit";
import dotenv from "dotenv";
dotenv.config();

interface GameVirtualAgentConfig {
  cdpApiKeyName: string;
  cdpApiKeyPrivate: string;
  networkId?: string;
  agentName: string;
  agentGoal: string;
  agentDescription: string;
}

export class GameVirtualAgent {
  private gameAgent: GameAgent;
  private cdpAgentPromise: Promise<CdpAgent>;
  private cdpAgent!: CdpAgent;

  constructor(config: GameVirtualAgentConfig) {
    this.gameAgent = new GameAgent(process.env.API_KEY || "", {
      name: config.agentName,
      goal: config.agentGoal,
      description: config.agentDescription,
      getAgentState: this.getAgentState,
      workers: [], // TODO: Add workers as parameters
    });

    this.cdpAgentPromise = CdpAgent.from({
      cdpApiKeyName: config.cdpApiKeyName,
      cdpApiKeyPrivate: config.cdpApiKeyPrivate,
      networkId: config.networkId || "base-mainnet",
    });
  }

  private getAgentState = async (): Promise<Record<string, any>> => {
    return {
      status: "active",
      lastUpdated: new Date().toISOString(),
      network: "base-mainnet",
    };
  };

  async init() {
    this.cdpAgent = await this.cdpAgentPromise;
    await this.gameAgent.init();
  }

  async run(intervalSeconds: number = 60) {
    await this.gameAgent.run(intervalSeconds, { verbose: true });
  }

  async getLangChainTools() {
    return this.cdpAgent.getLangChainTools();
  }

  async createLangChainAgent() {
    return this.cdpAgent.createLangChainAgent();
  }

  setLogger(loggerFn: (agent: GameAgent, msg: string) => void) {
    this.gameAgent.setLogger(loggerFn);
  }
}

// Main execution function
export async function runVirtualAgent(config: GameVirtualAgentConfig) {
  try {
    const agent = new GameVirtualAgent(config);
    await agent.init();
    await agent.run(Number(process.env.AGENT_INTERVAL) || 60);
    return agent;
  } catch (error) {
    console.error("Error running virtual agent:", error);
    process.exit(1);
  }
}
