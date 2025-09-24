import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target, Calendar } from 'lucide-react';
import { Transaction } from './types';

interface InsightsProps {
  transactions: Transaction[];
}

export function Insights({ transactions }: InsightsProps) {
  // Calculate predictions and insights
  const currentMonth = new Date().toISOString().slice(0, 7);
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
  
  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  const lastMonthTransactions = transactions.filter(t => t.date.startsWith(lastMonth));
  
  const currentExpenses = currentMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const lastMonthExpenses = lastMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  
  const currentIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const lastMonthIncome = lastMonthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);

  // Simple prediction based on current month trends
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const daysPassed = new Date().getDate();
  const predictedMonthlyExpenses = currentExpenses * (daysInMonth / daysPassed);
  const predictedMonthlySavings = currentIncome - predictedMonthlyExpenses;

  // Spending trend data
  const last6Months = Array.from({length: 6}, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toISOString().slice(0, 7);
  }).reverse();

  const trendData = last6Months.map(month => {
    const monthTransactions = transactions.filter(t => t.date.startsWith(month));
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const income = monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    
    return {
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
      expenses,
      income,
      savings: income - expenses
    };
  });

  // Top spending categories
  const categorySpending = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(categorySpending)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Generate insights
  const insights = [];
  
  if (predictedMonthlyExpenses > lastMonthExpenses * 1.1) {
    insights.push({
      type: 'warning',
      title: 'Spending Alert',
      message: `Your spending is trending ${((predictedMonthlyExpenses / lastMonthExpenses - 1) * 100).toFixed(0)}% higher than last month.`,
      icon: AlertTriangle,
      color: 'text-orange-600'
    });
  }

  if (predictedMonthlySavings > 0) {
    insights.push({
      type: 'positive',
      title: 'Great Progress!',
      message: `You're on track to save ₹${predictedMonthlySavings.toLocaleString()} this month.`,
      icon: TrendingUp,
      color: 'text-green-600'
    });
  }

  if (topCategories.length > 0) {
    const topCategory = topCategories[0];
    insights.push({
      type: 'info',
      title: 'Top Spending Category',
      message: `${topCategory.category} accounts for ₹${topCategory.amount.toLocaleString()} of your expenses this month.`,
      icon: Target,
      color: 'text-blue-600'
    });
  }

  const avgDailySpending = currentExpenses / daysPassed;
  if (avgDailySpending > 0) {
    insights.push({
      type: 'tip',
      title: 'Daily Spending Tip',
      message: `Your average daily spending is ₹${avgDailySpending.toFixed(0)}. Try to keep it under ₹${(avgDailySpending * 0.9).toFixed(0)} to improve savings.`,
      icon: Lightbulb,
      color: 'text-purple-600'
    });
  }

  return (
    <div className="p-6 space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl"
      >
        Financial Insights & Predictions
      </motion.h2>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Predicted Monthly Expenses</p>
                <p className="text-2xl font-bold">₹{predictedMonthlyExpenses.toLocaleString()}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
            <div className="mt-2">
              <Badge variant={predictedMonthlyExpenses > lastMonthExpenses ? 'destructive' : 'default'}>
                {predictedMonthlyExpenses > lastMonthExpenses ? '+' : ''}
                {((predictedMonthlyExpenses / (lastMonthExpenses || 1) - 1) * 100).toFixed(1)}% vs last month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Predicted Savings</p>
                <p className={`text-2xl font-bold ${predictedMonthlySavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{predictedMonthlySavings.toLocaleString()}
                </p>
              </div>
              {predictedMonthlySavings >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Daily Average Spending</p>
                <p className="text-2xl font-bold">₹{avgDailySpending.toFixed(0)}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Spending Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>6-Month Financial Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`₹${value}`, name]} />
                <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} name="Expenses" />
                <Line type="monotone" dataKey="savings" stroke="#3B82F6" strokeWidth={3} name="Savings" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Categories and Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Spending Categories */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Top Spending Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {topCategories.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topCategories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No spending data available for this month
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    <insight.icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
                    <div>
                      <h4 className="font-medium mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-600">{insight.message}</p>
                    </div>
                  </motion.div>
                ))}
                {insights.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Add more transactions to get personalized insights!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              AI Forecast for Next Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Predicted Expenses</p>
                <p className="text-xl font-bold text-red-600">₹{(predictedMonthlyExpenses * 1.05).toLocaleString()}</p>
                <p className="text-xs text-gray-500">+5% seasonal adjustment</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Expected Income</p>
                <p className="text-xl font-bold text-green-600">₹{currentIncome.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Based on current trend</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Projected Savings</p>
                <p className={`text-xl font-bold ${(currentIncome - predictedMonthlyExpenses * 1.05) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{(currentIncome - predictedMonthlyExpenses * 1.05).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">AI prediction</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}