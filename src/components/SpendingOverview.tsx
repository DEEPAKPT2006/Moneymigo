import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function SpendingOverview() {
  const spendingData = useQuery(api.transactions.getSpendingByCategory);
  const recentTransactions = useQuery(api.transactions.getRecentTransactions, { limit: 5 });

  if (spendingData === undefined || recentTransactions === undefined) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const totalSpending = spendingData.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month's Spending</h3>
      
      {spendingData.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">💸</div>
          <p className="text-gray-500">No spending data yet</p>
          <p className="text-sm text-gray-400 mt-1">Add some transactions to see your spending breakdown</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              ${totalSpending.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Total spent this month</p>
          </div>

          <div className="space-y-3 mb-6">
            {spendingData.slice(0, 5).map((category, index) => {
              const percentage = (category.amount / totalSpending) * 100;
              return (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-3 h-3 rounded-full" style={{
                      backgroundColor: `hsl(${index * 60}, 70%, 60%)`
                    }}></div>
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {category.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      ${category.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Transactions</h4>
            <div className="space-y-2">
              {recentTransactions.slice(0, 3).map((transaction) => (
                <div key={transaction._id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-500' :
                      transaction.type === 'expense' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}></span>
                    <span className="text-gray-700 truncate max-w-[120px]">
                      {transaction.description}
                    </span>
                  </div>
                  <span className={`font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
