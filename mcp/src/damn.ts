import "dotenv/config";
import { ApiClient } from "@damn-fun/sdk";

export function getApiClient() {
  const baseUrl = process.env.API_BASE_URL!;
  const apiKey = process.env.API_KEY!;
  const client = new ApiClient({ baseUrl, apiKey });
  return client;
}

export async function uploadFile(fileUrl: string) {
  const response = await fetch(fileUrl);
  const file = await response.blob();
  if (!file) throw new Error(`${fileUrl} not found`);
  const fileName = fileUrl.split("/").pop()!;
  const res = await getApiClient().upload(file, fileName);
  return res.storageId;
}

export async function createMap(
  storageId: string,
  title: string,
  description: string,
  width: number,
  height: number
) {
  const res = await getApiClient().createMap({
    storageId,
    title,
    description,
    status: "success",
    visibility: "public",
    width,
    height,
  });
  return res.id;
}

export async function createMusic(
  audioStorageId: string,
  coverStorageId: string,
  description: string,
  title: string
) {
  const res = await getApiClient().createMusic({
    audioStorageId,
    coverStorageId,
    description,
    title,
    status: "success",
    visibility: "public",
  });
  return res.id;
}

export async function createAgent(
  avatarStorageId: string,
  spriteStorageId: string,
  prompt: string,
  name: string,
  description: string
) {
  const res = await getApiClient().createAgent({
    avatarStorageId,
    spriteStorageId,
    prompt,
    name,
    description,
    status: "success",
    visibility: "public",
  });
  return res.id;
}

export async function createGame(
  mapId: string,
  agentIds: string[],
  musicId: string,
  logoStorageId: string,
  backgroundStorageId: string,
  twitterHandle: string,
  title: string,
  description: string
) {
  const res = await getApiClient().createGame({
    mapId,
    agentIds,
    musicId,
    logoStorageId,
    backgroundStorageId,
    twitterHandle,
    title,
    description,
    visibility: "public",
  });
  return res.id;
}

export async function getWorldStatus(gameId: string) {
  const worldStatus = await getApiClient().gameData.getWorldStatus(gameId);
  return worldStatus;
}

export async function getAgentPlayerList(gameId: string) {
  const agentPlayerList = await getApiClient().gameData.getAgentPlayerList(
    gameId
  );
  return agentPlayerList;
}

export async function getHumanPlayerList(
  gameId: string,
  numItems: number,
  cursor: string | null
) {
  const humanPlayerList = await getApiClient().gameData.getHumanPlayerList(
    gameId,
    { numItems, cursor }
  );
  return humanPlayerList;
}

export async function getPlayer(gameId: string, playerId: string) {
  const player = await getApiClient().gameData.getPlayer(gameId, playerId);
  return player;
}
