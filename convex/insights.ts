import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

// Generate AI-powered insights
export const generateInsights = action({
  args: {},
  handler: async (ctx): Promise<any[]> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get user's financial data
    const profile: any = await ctx.runQuery(api.financialProfile.getProfile);
    const transactions: any[] = await ctx.runQuery(api.transactions.getRecentTransactions, { limit: 100 });
    const spending: any[] = await ctx.runQuery(api.transactions.getSpendingByCategory);

    if (!profile || transactions.length === 0) return [];

    // Analyze spending patterns
    const insights: any[] = [];

    // Check for unusual spending
    const avgMonthlySpending: number = transactions
      .filter((t: any) => t.type === "expense")
      .reduce((sum: number, t: any) => sum + t.amount, 0) / 3; // Rough 3-month average

    const currentMonthSpending: number = spending.reduce((sum: number, cat: any) => sum + cat.amount, 0);

    if (currentMonthSpending > avgMonthlySpending * 1.2) {
      insights.push({
        insightType: "spending_pattern",
        title: "Higher Than Usual Spending",
        description: `You've spent $${currentMonthSpending.toFixed(2)} this month, which is 20% higher than your average. Consider reviewing your recent purchases.`,
        actionable: true,
        suggestedActions: ["Review recent transactions", "Set spending alerts", "Create a monthly budget"],
        priority: "high",
        category: "spending",
      });
    }

    // Check goal progress
    if (profile.financialGoals.length > 0) {
      const stagnantGoals: any[] = profile.financialGoals.filter((goal: any) => {
        const progress = goal.currentAmount / goal.targetAmount;
        return progress < 0.1 && new Date(goal.deadline) > new Date();
      });

      if (stagnantGoals.length > 0) {
        insights.push({
          insightType: "goal_progress",
          title: "Goals Need Attention",
          description: `${stagnantGoals.length} of your goals have less than 10% progress. Consider adjusting your strategy.`,
          actionable: true,
          suggestedActions: ["Increase monthly contributions", "Extend deadlines", "Break goals into smaller steps"],
          priority: "medium",
          category: "goals",
        });
      }
    }

    // Identify saving opportunities
    const topSpendingCategory = spending.sort((a: any, b: any) => b.amount - a.amount)[0];
    if (topSpendingCategory && topSpendingCategory.amount > 500) {
      insights.push({
        insightType: "saving_opportunity",
        title: `Optimize ${topSpendingCategory.category} Spending`,
        description: `You've spent $${topSpendingCategory.amount.toFixed(2)} on ${topSpendingCategory.category} this month. Small reductions here could boost your savings significantly.`,
        actionable: true,
        suggestedActions: ["Find alternatives", "Set category budget", "Track daily expenses"],
        priority: "medium",
        category: "optimization",
      });
    }

    // Save insights to database
    for (const insight of insights) {
      await ctx.runMutation(api.insights.createInsight, {
        ...insight,
        userId,
      });
    }

    return insights;
  },
});

// Mutation to create insight
export const createInsight = mutation({
  args: {
    userId: v.id("users"),
    insightType: v.string(),
    title: v.string(),
    description: v.string(),
    actionable: v.boolean(),
    suggestedActions: v.optional(v.array(v.string())),
    priority: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("insights", {
      ...args,
      createdAt: Date.now(),
      isRead: false,
    });
  },
});

// Get user's insights
export const getInsights = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("insights")
      .withIndex("by_user_priority", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);
  },
});

// Mark insight as read
export const markInsightRead = mutation({
  args: {
    insightId: v.id("insights"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const insight = await ctx.db.get(args.insightId);
    if (insight && insight.userId === userId) {
      await ctx.db.patch(args.insightId, { isRead: true });
    }
  },
});
