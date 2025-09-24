import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function StoryTimeline() {
  const storyEvents = useQuery(api.storyEvents.getStoryTimeline, { limit: 10 });

  if (storyEvents === undefined) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getEventIcon = (eventType: string, impact: string) => {
    const icons = {
      milestone: "🏆",
      setback: "⚠️",
      breakthrough: "🚀",
      habit_formed: "✅",
    };
    
    return icons[eventType as keyof typeof icons] || (impact === "positive" ? "📈" : "📉");
  };

  const getEventColor = (impact: string) => {
    return impact === "positive" ? "bg-green-100 border-green-300" :
           impact === "negative" ? "bg-red-100 border-red-300" :
           "bg-blue-100 border-blue-300";
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Financial Story</h3>
      
      {storyEvents.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📖</div>
          <p className="text-gray-500">Your story is just beginning</p>
          <p className="text-sm text-gray-400 mt-1">Add transactions and goals to build your financial narrative</p>
        </div>
      ) : (
        <div className="space-y-4">
          {storyEvents.map((event, index) => (
            <div key={event._id} className="relative">
              {index < storyEvents.length - 1 && (
                <div className="absolute left-4 top-8 w-0.5 h-8 bg-gray-200"></div>
              )}
              
              <div className="flex space-x-3">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm ${getEventColor(event.impact)}`}>
                  {getEventIcon(event.eventType, event.impact)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {event.title}
                    </h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {event.description}
                  </p>
                  
                  {event.emotionalContext && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        Feeling: {event.emotionalContext}
                      </span>
                    </div>
                  )}
                  
                  {event.lessonsLearned && event.lessonsLearned.length > 0 && (
                    <div className="mt-2">
                      <details className="text-xs text-gray-600">
                        <summary className="cursor-pointer hover:text-gray-800">
                          Lessons learned
                        </summary>
                        <ul className="mt-1 ml-4 list-disc">
                          {event.lessonsLearned.map((lesson, i) => (
                            <li key={i}>{lesson}</li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
