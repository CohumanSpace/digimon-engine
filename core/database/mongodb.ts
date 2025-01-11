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
