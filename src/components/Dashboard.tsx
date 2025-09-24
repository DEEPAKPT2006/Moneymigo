import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FinancialAvatar } from "./FinancialAvatar";
import { StoryTimeline } from "./StoryTimeline";
import { InsightCards } from "./InsightCards";
import { QuickActions } from "./QuickActions";
import { GoalTracker } from "./GoalTracker";
import { SpendingOverview } from "./SpendingOverview";

export function Dashboard() {
  const profile = useQuery(api.financialProfile.getProfile);
  const insights = useQuery(api.insights.getInsights);
  const generateInsights = useAction(api.insights.generateInsights);
  const createProfile = useMutation(api.financialProfile.createProfile);

  if (profile === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (profile === null) {
    // Create profile if it doesn't exist
    createProfile();
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your financial profile...</p>
        </div>
      </div>
    );
  }

  const handleGenerateInsights = async () => {
    try {
      await generateInsights();
    } catch (error) {
      console.error("Failed to generate insights:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Avatar */}
      <div className="text-center">
        <h2 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-cyan-200 via-fuchsia-300 to-purple-300 bg-clip-text text-transparent drop-shadow-xl">
          Welcome to Your Living Financial Story
        </h2>
        <p className="mb-6 text-cyan-100 text-lg drop-shadow-md">
          Your financial identity evolves with every decision you make
        </p>
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 inline-block max-w-lg w-full mx-auto">
          <FinancialAvatar profile={profile} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6">
          <QuickActions onInsightsGenerated={handleGenerateInsights} />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Goals and Spending */}
        <div className="lg:col-span-1 space-y-6">
          <GoalTracker profile={profile} />
          <SpendingOverview />
        </div>

        {/* Middle Column - Story Timeline */}
        <div className="lg:col-span-1">
          <StoryTimeline />
        </div>

        {/* Right Column - Insights */}
        <div className="lg:col-span-1">
          <InsightCards insights={insights} />
        </div>
      </div>
    </div>
  );
}
