import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user's financial story timeline
export const getStoryTimeline = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("storyEvents")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit || 20);
  },
});

// Add a custom story event
export const addStoryEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    eventType: v.string(),
    impact: v.string(),
    relatedGoalId: v.optional(v.string()),
    emotionalContext: v.optional(v.string()),
    lessonsLearned: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("storyEvents", {
      userId,
      ...args,
      date: new Date().toISOString().split('T')[0],
    });
  },
});

// Get story events by type
export const getEventsByType = query({
  args: {
    eventType: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const events = await ctx.db
      .query("storyEvents")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("eventType"), args.eventType))
      .order("desc")
      .collect();

    return events;
  },
});
