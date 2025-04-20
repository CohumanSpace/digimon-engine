import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  createAgent,
  createGame,
  createMap,
  createMusic,
  getAgentPlayerList,
  getHumanPlayerList,
  getPlayer,
  getWorldStatus,
  uploadFile,
} from "./damn";

// Create server instance
export const server = new McpServer({
  name: "mcp-demo",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.tool(
  "upload-file",
  "upload a file to the server",
  {
    fileUrl: z.string(),
  },
  async ({ fileUrl }) => {
    const storageId = await uploadFile(fileUrl);
    return {
      content: [{ type: "text", text: `File uploaded: ${storageId}` }],
    };
  }
);

server.tool(
  "create-map",
  "create a map",
  {
    storageId: z.string(),
    title: z.string(),
    description: z.string(),
    width: z.number(),
    height: z.number(),
  },
  async ({ storageId, title, description, width, height }) => {
    const mapId = await createMap(storageId, title, description, width, height);
    return {
      content: [{ type: "text", text: `Map created: ${mapId}` }],
    };
  }
);

server.tool(
  "create-music",
  "create a music",
  {
    audioStorageId: z.string(),
    coverStorageId: z.string(),
    description: z.string(),
    title: z.string(),
  },
  async ({ audioStorageId, coverStorageId, description, title }) => {
    const musicId = await createMusic(
      audioStorageId,
      coverStorageId,
      description,
      title
    );
    return {
      content: [{ type: "text", text: `Music created: ${musicId}` }],
    };
  }
);

server.tool(
  "create-agent",
  "create an agent",
  {
    avatarStorageId: z.string(),
    spriteStorageId: z.string(),
    prompt: z.string(),
    name: z.string(),
    description: z.string(),
  },
  async ({ avatarStorageId, spriteStorageId, prompt, name, description }) => {
    const agentId = await createAgent(
      avatarStorageId,
      spriteStorageId,
      prompt,
      name,
      description
    );
    return {
      content: [{ type: "text", text: `Agent created: ${agentId}` }],
    };
  }
);

server.tool(
  "create-game",
  "create a game",
  {
    mapId: z.string(),
    agentIds: z.array(z.string()),
    musicId: z.string(),
    logoStorageId: z.string(),
    backgroundStorageId: z.string(),
    twitterHandle: z.string(),
    title: z.string(),
    description: z.string(),
  },
  async ({
    mapId,
    agentIds,
    musicId,
    logoStorageId,
    backgroundStorageId,
    twitterHandle,
    title,
    description,
  }) => {
    const gameId = await createGame(
      mapId,
      agentIds,
      musicId,
      logoStorageId,
      backgroundStorageId,
      twitterHandle,
      title,
      description
    );
    return {
      content: [{ type: "text", text: `Game created: ${gameId}` }],
    };
  }
);

server.tool(
  "get-world-status",
  "get the world status",
  { gameId: z.string() },
  async ({ gameId }) => {
    const worldStatus = await getWorldStatus(gameId);
    return {
      content: [{ type: "text", text: `World status: ${worldStatus}` }],
    };
  }
);

server.tool(
  "get-agent-player-list",
  "get the agent player list",
  { gameId: z.string() },
  async ({ gameId }) => {
    const agentPlayerList = await getAgentPlayerList(gameId);
    return {
      content: [
        { type: "text", text: `Agent player list: ${agentPlayerList}` },
      ],
    };
  }
);

server.tool(
  "get-human-player-list",
  "get the human player list",
  { gameId: z.string(), numItems: z.number(), cursor: z.string().optional() },
  async ({ gameId, numItems, cursor }) => {
    const humanPlayerList = await getHumanPlayerList(
      gameId,
      numItems,
      cursor || null
    );
    return {
      content: [
        { type: "text", text: `Human player list: ${humanPlayerList}` },
      ],
    };
  }
);

server.tool(
  "get-player",
  "get a player",
  { gameId: z.string(), playerId: z.string() },
  async ({ gameId, playerId }) => {
    const player = await getPlayer(gameId, playerId);
    return {
      content: [{ type: "text", text: `Player: ${player}` }],
    };
  }
);
