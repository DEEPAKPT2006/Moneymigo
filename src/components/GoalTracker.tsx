interface GoalTrackerProps {
  profile: any;
}

export function GoalTracker({ profile }: GoalTrackerProps) {
  if (!profile || !profile.financialGoals.length) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Goals</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-gray-500">No goals set yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your first goal to start tracking progress</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Goals</h3>
      
      <div className="space-y-4">
        {profile.financialGoals.map((goal: any) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const isOverdue = new Date(goal.deadline) < new Date();
          
          return (
            <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">{goal.title}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                  goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {goal.priority}
                </span>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      progress >= 100 ? 'bg-green-500' :
                      progress >= 75 ? 'bg-blue-500' :
                      progress >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className={`${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                  Due: {new Date(goal.deadline).toLocaleDateString()}
                </span>
                {progress >= 100 && (
                  <span className="text-green-600 font-medium">🎉 Completed!</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
