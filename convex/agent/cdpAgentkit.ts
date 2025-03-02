import {
  AgentKit,
  CdpWalletProvider,
  ActionProvider,
} from "@coinbase/agentkit";
import { cdpApiActionProvider, pythActionProvider } from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";

interface CdpAgentConfig {
  cdpApiKeyName: string;
  cdpApiKeyPrivate: string;
  networkId?: string;
  actionProviders?: ActionProvider<any>[];
}

export class CdpAgent {
  private constructor(public agentKit: AgentKit) {}

  static async from(config: CdpAgentConfig): Promise<CdpAgent> {
    // Configure wallet provider
    const walletProvider = await CdpWalletProvider.configureWithWallet({
      apiKeyName: config.cdpApiKeyName,
      apiKeyPrivateKey: config.cdpApiKeyPrivate,
      networkId: config.networkId || "base-mainnet",
    });

    // Set up default action providers if none provided
    const actionProviders = config.actionProviders || [
      cdpApiActionProvider({
        apiKeyName: config.cdpApiKeyName,
        apiKeyPrivateKey: config.cdpApiKeyPrivate,
      }),
      pythActionProvider(),
    ];

    const agentKit = await AgentKit.from({
      walletProvider,
      actionProviders,
    });

    return new CdpAgent(agentKit);
  }

  async getLangChainTools() {
    return getLangChainTools(this.agentKit);
  }

  async createLangChainAgent() {
    const tools = await this.getLangChainTools();
    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
    });

    return createReactAgent({
      llm,
      tools,
    });
  }
}

const agent = await CdpAgent.from({
  cdpApiKeyName: "your-key-name",
  cdpApiKeyPrivate: "your-private-key",
  networkId: "base-mainnet",
});

const langChainAgent = await agent.createLangChainAgent();

const response = await langChainAgent.invoke({
  input: "What is the current price of BTC?",
});

console.log(response);
