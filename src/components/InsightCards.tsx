import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface InsightCardsProps {
  insights: any[] | undefined;
}

export function InsightCards({ insights }: InsightCardsProps) {
  const markInsightRead = useMutation(api.insights.markInsightRead);

  if (insights === undefined) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getInsightIcon = (type: string) => {
    const icons = {
      spending_pattern: "📊",
      goal_progress: "🎯",
      saving_opportunity: "💰",
      risk_alert: "⚠️",
      optimization: "⚡",
    };
    
    return icons[type as keyof typeof icons] || "💡";
  };

  const getPriorityColor = (priority: string) => {
    return priority === "high" ? "border-red-300 bg-red-50" :
           priority === "medium" ? "border-yellow-300 bg-yellow-50" :
           "border-green-300 bg-green-50";
  };

  const handleMarkRead = async (insightId: any) => {
    try {
      await markInsightRead({ insightId });
    } catch (error) {
      console.error("Failed to mark insight as read:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
      
      {insights.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔮</div>
          <p className="text-gray-500">No insights yet</p>
          <p className="text-sm text-gray-400 mt-1">Generate insights to get personalized financial advice</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.slice(0, 5).map((insight) => (
            <div 
              key={insight._id} 
              className={`border-2 rounded-lg p-4 transition-all duration-200 ${
                insight.isRead ? 'border-gray-200 bg-gray-50' : getPriorityColor(insight.priority)
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getInsightIcon(insight.insightType)}</span>
                  <h4 className="font-medium text-gray-900 text-sm">
                    {insight.title}
                  </h4>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                    insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {insight.priority}
                  </span>
                  
                  {!insight.isRead && (
                    <button
                      onClick={() => handleMarkRead(insight._id)}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {insight.description}
              </p>
              
              {insight.actionable && insight.suggestedActions && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Suggested Actions:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {insight.suggestedActions.slice(0, 3).map((action: string, index: number) => (
                      <li key={index} className="flex items-start space-x-1">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-3 text-xs text-gray-500">
                {new Date(insight.createdAt).toLocaleDateString()} • {insight.category}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
