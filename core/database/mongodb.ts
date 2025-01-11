import { MongoClient, Collection } from "mongodb";
import { ChatMessage } from "../types";

// Connection URI and DB settings
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = "ai_chat_history";
const COLLECTION_NAME = "conversations";

// Singleton instance for connection pooling
let client: MongoClient | null = null;

/**
 * Get MongoDB connection instance (creates new if doesn't exist)
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client;
}

/**
 * Get conversations collection
 */
export async function getConversationsCollection(): Promise<
  Collection<ConversationRecord>
> {
  const client = await getMongoClient();
  const db = client.db(DB_NAME);
  return db.collection<ConversationRecord>(COLLECTION_NAME);
}

interface ConversationRecord {
  agentType: string;
  messages: ChatMessage[];
  timestamp: Date;
  sessionId: string;
}

interface Position {
  x: number;
  y: number;
  z: number;
}

interface AgentMovementRecord {
  agentId: string;
  position: Position;
  timestamp: Date;
}

interface AgentInteractionRecord {
  agentId1: string;
  agentId2: string;
  interactionType: string;
  details: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Save conversation to MongoDB
 */
export async function saveConversation(
  agentType: string,
  messages: ChatMessage[],
  sessionId: string,
): Promise<void> {
  try {
    const collection = await getConversationsCollection();
    const record: ConversationRecord = {
      agentType,
      messages,
      timestamp: new Date(),
      sessionId,
    };
    await collection.insertOne(record);
  } catch (error) {
    console.error("Failed to save conversation:", error);
    throw error;
  }
}

/**
 * Get conversation history by session ID
 */
export async function getConversationHistory(
  sessionId: string,
): Promise<ConversationRecord[]> {
  try {
    const collection = await getConversationsCollection();
    return await collection
      .find({ sessionId })
      .sort({ timestamp: -1 })
      .toArray();
  } catch (error) {
    console.error("Failed to get conversation history:", error);
    throw error;
  }
}

/**
 * Close MongoDB connection
 */
export async function closeMongoConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
  }
}

/**
 * Save agent movement to MongoDB
 */
export async function saveAgentMovement(
  agentId: string,
  position: { x: number; y: number; z: number },
  timestamp: Date = new Date(),
): Promise<void> {
  try {
    const collection = await getCollection("agent_movements");
    const record = {
      agentId,
      position,
      timestamp,
    };
    await collection.insertOne(record);
  } catch (error) {
    console.error("Failed to save agent movement:", error);
    throw error;
  }
}

/**
 * Save agent interaction to MongoDB
 */
export async function saveAgentInteraction(
  agentId1: string,
  agentId2: string,
  interactionType: string,
  details: Record<string, unknown>,
  timestamp: Date = new Date(),
): Promise<void> {
  try {
    const collection = await getCollection("agent_interactions");
    const record = {
      agentId1,
      agentId2,
      interactionType,
      details,
      timestamp,
    };
    await collection.insertOne(record);
  } catch (error) {
    console.error("Failed to save agent interaction:", error);
    throw error;
  }
}

/**
 * Get agent movement history
 */
export async function getAgentMovements(
  agentId: string,
  startTime?: Date,
  endTime?: Date,
): Promise<AgentMovementRecord[]> {
  try {
    const collection = await getCollection("agent_movements");
    const query: Record<string, unknown> = { agentId };
    if (startTime || endTime) {
      query.timestamp = {};
      if (startTime) query.timestamp.$gte = startTime;
      if (endTime) query.timestamp.$lte = endTime;
    }
    return await collection.find(query).sort({ timestamp: -1 }).toArray();
  } catch (error) {
    console.error("Failed to get agent movements:", error);
    throw error;
  }
}

/**
 * Get agent interaction history
 */
export async function getAgentInteractions(
  agentId: string,
  startTime?: Date,
  endTime?: Date,
): Promise<AgentInteractionRecord[]> {
  try {
    const collection = await getCollection("agent_interactions");
    const query: Record<string, unknown> = {
      $or: [{ agentId1: agentId }, { agentId2: agentId }],
    };
    if (startTime || endTime) {
      query.timestamp = {};
      if (startTime) query.timestamp.$gte = startTime;
      if (endTime) query.timestamp.$lte = endTime;
    }
    return await collection.find(query).sort({ timestamp: -1 }).toArray();
  } catch (error) {
    console.error("Failed to get agent interactions:", error);
    throw error;
  }
}

/**
 * Helper function to get collection
 */
async function getCollection(collectionName: string) {
  if (!client) {
    await connectToMongo();
  }
  return client.db().collection(collectionName);
}
