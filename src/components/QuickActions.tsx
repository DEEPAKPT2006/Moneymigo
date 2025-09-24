import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface QuickActionsProps {
  onInsightsGenerated: () => void;
}

export function QuickActions({ onInsightsGenerated }: QuickActionsProps) {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const addTransaction = useMutation(api.transactions.addTransaction);
  const updateGoals = useMutation(api.financialProfile.updateGoals);
  const updateAvatar = useMutation(api.financialProfile.updateAvatar);

  const [transactionForm, setTransactionForm] = useState({
    amount: "",
    category: "",
    description: "",
    type: "expense",
    mood: "",
  });

  const [goalForm, setGoalForm] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
    priority: "medium",
  });

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTransaction({
        amount: parseFloat(transactionForm.amount),
        category: transactionForm.category,
        description: transactionForm.description,
        type: transactionForm.type,
        mood: transactionForm.mood || undefined,
      });
      
      // Update avatar after transaction
      await updateAvatar();
      
      toast.success("Transaction added successfully!");
      setTransactionForm({
        amount: "",
        category: "",
        description: "",
        type: "expense",
        mood: "",
      });
      setShowTransactionForm(false);
    } catch (error) {
      toast.error("Failed to add transaction");
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newGoal = {
        id: Date.now().toString(),
        title: goalForm.title,
        targetAmount: parseFloat(goalForm.targetAmount),
        currentAmount: parseFloat(goalForm.currentAmount) || 0,
        deadline: goalForm.deadline,
        priority: goalForm.priority,
      };

      await updateGoals({ goals: [newGoal] });
      toast.success("Goal added successfully!");
      setGoalForm({
        title: "",
        targetAmount: "",
        currentAmount: "",
        deadline: "",
        priority: "medium",
      });
      setShowGoalForm(false);
    } catch (error) {
      toast.error("Failed to add goal");
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => setShowTransactionForm(true)}
          className="flex items-center justify-center p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <span className="mr-2">💰</span>
          Add Transaction
        </button>

        <button
          onClick={() => setShowGoalForm(true)}
          className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <span className="mr-2">🎯</span>
          Set Goal
        </button>

        <button
          onClick={onInsightsGenerated}
          className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <span className="mr-2">🔮</span>
          Generate Insights
        </button>

        <button
          onClick={async () => {
            try {
              await updateAvatar();
              toast.success("Avatar updated!");
            } catch (error) {
              toast.error("Failed to update avatar");
            }
          }}
          className="flex items-center justify-center p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <span className="mr-2">🔄</span>
          Update Avatar
        </button>
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h4 className="text-lg font-semibold mb-4">Add Transaction</h4>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={transactionForm.type}
                  onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="investment">Investment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={transactionForm.category}
                  onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
                  placeholder="e.g., Food, Transportation, Salary"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                  placeholder="Brief description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mood (Optional)</label>
                <select
                  value={transactionForm.mood}
                  onChange={(e) => setTransactionForm({...transactionForm, mood: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select mood</option>
                  <option value="happy">😊 Happy</option>
                  <option value="stressed">😰 Stressed</option>
                  <option value="confident">😎 Confident</option>
                  <option value="worried">😟 Worried</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add Transaction
                </button>
                <button
                  type="button"
                  onClick={() => setShowTransactionForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Form Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h4 className="text-lg font-semibold mb-4">Set Financial Goal</h4>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({...goalForm, title: e.target.value})}
                  placeholder="e.g., Emergency Fund, Vacation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={goalForm.targetAmount}
                  onChange={(e) => setGoalForm({...goalForm, targetAmount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={goalForm.currentAmount}
                  onChange={(e) => setGoalForm({...goalForm, currentAmount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input
                  type="date"
                  required
                  value={goalForm.deadline}
                  onChange={(e) => setGoalForm({...goalForm, deadline: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={goalForm.priority}
                  onChange={(e) => setGoalForm({...goalForm, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Set Goal
                </button>
                <button
                  type="button"
                  onClick={() => setShowGoalForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
