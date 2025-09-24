import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user's financial profile and avatar
export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("financialProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      // Create default profile
      const defaultProfile = {
        userId,
        avatarLevel: 1,
        avatarType: "growing",
        financialDNA: {
          spendingPersonality: "balanced",
          riskTolerance: "moderate",
          goalOrientation: "mixed",
          consistencyScore: 50,
        },
        financialGoals: [],
        lastUpdated: Date.now(),
      };
      
      // Return null for now - profile creation should be done in a mutation
      return null;
    }

    return profile;
  },
});

// Create initial profile
export const createProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingProfile = await ctx.db
      .query("financialProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) return existingProfile;

    const defaultProfile = {
      userId,
      avatarLevel: 1,
      avatarType: "growing",
      financialDNA: {
        spendingPersonality: "balanced",
        riskTolerance: "moderate",
        goalOrientation: "mixed",
        consistencyScore: 50,
      },
      financialGoals: [],
      lastUpdated: Date.now(),
    };
    
    const profileId = await ctx.db.insert("financialProfiles", defaultProfile);
    return { ...defaultProfile, _id: profileId };
  },
});

// Update financial goals
export const updateGoals = mutation({
  args: {
    goals: v.array(v.object({
      id: v.string(),
      title: v.string(),
      targetAmount: v.number(),
      currentAmount: v.number(),
      deadline: v.string(),
      priority: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("financialProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (profile) {
      await ctx.db.patch(profile._id, {
        financialGoals: args.goals,
        lastUpdated: Date.now(),
      });
    }
  },
});

// Update monthly income
export const updateIncome = mutation({
  args: {
    monthlyIncome: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("financialProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (profile) {
      await ctx.db.patch(profile._id, {
        monthlyIncome: args.monthlyIncome,
        lastUpdated: Date.now(),
      });
    }
  },
});

// Calculate and update avatar based on financial health
export const updateAvatar = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("financialProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) return;

    // Get recent transactions to analyze patterns
    const recentTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);

    // Calculate financial health score
    let healthScore = 50; // Base score
    
    // Factor in goal progress
    const goalProgress = profile.financialGoals.reduce((acc, goal) => {
      const progress = goal.currentAmount / goal.targetAmount;
      return acc + Math.min(progress * 20, 20);
    }, 0);
    
    healthScore += goalProgress;

    // Factor in spending consistency
    const avgImpact = recentTransactions.reduce((acc, t) => acc + t.impactScore, 0) / recentTransactions.length || 0;
    healthScore += avgImpact * 5;

    // Determine avatar level (1-10) and type
    const avatarLevel = Math.max(1, Math.min(10, Math.floor(healthScore / 10)));
    
    let avatarType = "growing";
    if (healthScore >= 80) avatarType = "thriving";
    else if (healthScore >= 60) avatarType = "stable";
    else if (healthScore >= 40) avatarType = "growing";
    else avatarType = "rebuilding";

    // Update financial DNA based on transaction patterns
    const spendingPersonality = avgImpact > 2 ? "saver" : avgImpact < -2 ? "spender" : "balanced";
    
    await ctx.db.patch(profile._id, {
      avatarLevel,
      avatarType,
      financialDNA: {
        ...profile.financialDNA,
        spendingPersonality,
        consistencyScore: Math.max(0, Math.min(100, healthScore)),
      },
      lastUpdated: Date.now(),
    });

    return { avatarLevel, avatarType, healthScore };
  },
});
