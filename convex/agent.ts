import { mutation, query } from './_generated/server';
import { getAuthUserId } from './auth';
import { Id } from './_generated/dataModel';
import { v } from 'convex/values';

export const fetchAgent = query({
  args: { agentId: v.id("agent") },
  handler: async ({ db }, { agentId }) => {
    return await db.get(agentId);
  }
});

export const fetchAllAgents = query(async ({ db }) => {
  return await db.query("agent").collect();
});

export const fetchMyAgents = query(async (ctx) => {
  const authUserId = await getAuthUserId(ctx);
  if (!authUserId) throw new Error("Not authenticated");

  return await ctx.db
    .query("agent")
    .withIndex("by_user", (q) => q.eq("authUserId", authUserId))
    .collect();
});

export const createAgent = mutation(
  async (
    ctx,
    { storageId, prompt, title, description, status, visibility }: {
      storageId: Id<"_storage">;
      prompt: string;
      title: string;
      description: string;
      status: string;
      visibility: string;
    }
  ) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");

    const newAgent = {
      authUserId,
      storageId,
      prompt,
      title,
      description,
      status,
      visibility
    };
    return await ctx.db.insert("agent", newAgent);
  }
);

export const updateAgent = mutation(
  async (
    ctx,
    { agentId, updates }: {
      agentId: Id<"agent">;
      updates: Partial<{
        storageId: Id<"_storage">;
        prompt: string;
        title: string;
        description: string;
        status: string;
        visibility: string;
      }>;
    }
  ) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");

    const existingAgent = await ctx.db.get(agentId);
    if (!existingAgent || existingAgent.authUserId !== authUserId) {
      throw new Error("Not authorized to update this agent");
    }

    await ctx.db.patch(agentId, updates);
    return { success: true };
  }
);

export const deleteAgent = mutation(
  async (ctx, { agentId }: { agentId: Id<"agent"> }) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");

    const existingAgent = await ctx.db.get(agentId);
    if (!existingAgent || existingAgent.authUserId !== authUserId) {
      throw new Error("Not authorized to delete this agent");
    }

    await ctx.db.delete(agentId);
    return { success: true };
  }
);
