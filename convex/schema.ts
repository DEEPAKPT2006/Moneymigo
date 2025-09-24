import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // User's financial profile and avatar
  financialProfiles: defineTable({
    userId: v.id("users"),
    avatarLevel: v.number(), // 1-10 based on financial health
    avatarType: v.string(), // "growing", "stable", "adventurous", "cautious"
    financialDNA: v.object({
      spendingPersonality: v.string(), // "saver", "spender", "balanced", "impulsive"
      riskTolerance: v.string(), // "conservative", "moderate", "aggressive"
      goalOrientation: v.string(), // "short-term", "long-term", "mixed"
      consistencyScore: v.number(), // 0-100
    }),
    monthlyIncome: v.optional(v.number()),
    financialGoals: v.array(v.object({
      id: v.string(),
      title: v.string(),
      targetAmount: v.number(),
      currentAmount: v.number(),
      deadline: v.string(),
      priority: v.string(), // "high", "medium", "low"
    })),
    lastUpdated: v.number(),
  }).index("by_user", ["userId"]),

  // Financial transactions and events
  transactions: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    description: v.string(),
    date: v.string(),
    type: v.string(), // "income", "expense", "transfer", "investment"
    mood: v.optional(v.string()), // "happy", "stressed", "confident", "worried"
    impactScore: v.number(), // How much this affects financial health (-10 to +10)
    isRecurring: v.boolean(),
  }).index("by_user_date", ["userId", "date"]),

  // Financial story events - key moments in financial journey
  storyEvents: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    eventType: v.string(), // "milestone", "setback", "breakthrough", "habit_formed"
    impact: v.string(), // "positive", "negative", "neutral"
    date: v.string(),
    relatedGoalId: v.optional(v.string()),
    emotionalContext: v.optional(v.string()),
    lessonsLearned: v.optional(v.array(v.string())),
  }).index("by_user_date", ["userId", "date"]),

  // Predictive insights and forecasts
  predictions: defineTable({
    userId: v.id("users"),
    predictionType: v.string(), // "goal_completion", "spending_trend", "savings_potential"
    title: v.string(),
    description: v.string(),
    confidence: v.number(), // 0-100
    timeframe: v.string(), // "1_month", "3_months", "6_months", "1_year"
    predictedValue: v.optional(v.number()),
    factors: v.array(v.string()), // What influences this prediction
    createdAt: v.number(),
    status: v.string(), // "active", "achieved", "missed", "updated"
  }).index("by_user_type", ["userId", "predictionType"]),

  // Financial insights and patterns
  insights: defineTable({
    userId: v.id("users"),
    insightType: v.string(), // "spending_pattern", "saving_opportunity", "risk_alert"
    title: v.string(),
    description: v.string(),
    actionable: v.boolean(),
    suggestedActions: v.optional(v.array(v.string())),
    priority: v.string(), // "high", "medium", "low"
    category: v.string(),
    createdAt: v.number(),
    isRead: v.boolean(),
  }).index("by_user_priority", ["userId", "priority"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
