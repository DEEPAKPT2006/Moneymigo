import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Add a new transaction
export const addTransaction = mutation({
  args: {
    amount: v.number(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    description: v.string(),
    type: v.string(),
    mood: v.optional(v.string()),
    isRecurring: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Calculate impact score based on amount and type
    let impactScore = 0;
    if (args.type === "income") {
      impactScore = Math.min(10, args.amount / 1000); // Positive impact for income
    } else if (args.type === "expense") {
      impactScore = Math.max(-10, -args.amount / 500); // Negative impact for expenses
    } else if (args.type === "investment") {
      impactScore = Math.min(8, args.amount / 1000); // Positive impact for investments
    }

    const transaction = await ctx.db.insert("transactions", {
      userId,
      amount: args.amount,
      category: args.category,
      subcategory: args.subcategory,
      description: args.description,
      date: new Date().toISOString().split('T')[0],
      type: args.type,
      mood: args.mood,
      impactScore,
      isRecurring: args.isRecurring || false,
    });

    // Check if this creates a story event
    if (Math.abs(impactScore) > 5) {
      await ctx.db.insert("storyEvents", {
        userId,
        title: impactScore > 0 ? "Financial Boost!" : "Significant Expense",
        description: `${args.type === "income" ? "Earned" : "Spent"} $${args.amount} on ${args.category}`,
        eventType: impactScore > 0 ? "breakthrough" : "setback",
        impact: impactScore > 0 ? "positive" : "negative",
        date: new Date().toISOString().split('T')[0],
        emotionalContext: args.mood,
      });
    }

    return transaction;
  },
});

// Get recent transactions
export const getRecentTransactions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit || 20);
  },
});

// Get spending by category for current month
export const getSpendingByCategory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .filter((q) => q.and(
        q.gte(q.field("date"), currentMonth + "-01"),
        q.eq(q.field("type"), "expense")
      ))
      .collect();

    // Group by category
    const categoryTotals = transactions.reduce((acc, transaction) => {
      const category = transaction.category;
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
    }));
  },
});
