import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, TrendingUp, TrendingDown, Target, AlertCircle, Brain } from 'lucide-react';
import { Transaction, Category } from './types';
import { AIService } from './services/aiService';

interface DashboardProps {
  transactions: Transaction[];
  onAddTransaction: () => void;
  onGoalsClick: () => void;
  onInsightsClick?: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function Dashboard({ transactions, onAddTransaction, onGoalsClick, onInsightsClick }: DashboardProps) {
  const aiService = AIService.getInstance();
  // Calculate financial metrics
  const balance = transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  // Category breakdown for pie chart
  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  // Weekly trend data
  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const trendData = last7Days.map(date => {
    const dayTransactions = transactions.filter(t => t.date === date);
    const dayBalance = dayTransactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      balance: dayBalance
    };
  });

  return (
    <div className="p-6 space-y-6">
      {/* Balance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <h2 className="text-lg opacity-90 mb-2">Total Balance</h2>
            <p className="text-3xl font-bold">₹{balance.toLocaleString()}</p>
            <div className="flex justify-between mt-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Income: ₹{totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                <span>Expenses: ₹{totalExpenses.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 gap-4"
      >
        <Button 
          onClick={onAddTransaction}
          className="h-16 bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105"
        >
          <Plus className="h-6 w-6 mr-2" />
          Add Transaction
        </Button>
        <Button 
          onClick={onGoalsClick}
          variant="outline"
          className="h-16 border-2 hover:bg-blue-50 transition-all duration-200 hover:scale-105"
        >
          <Target className="h-6 w-6 mr-2" />
          Set Goals
        </Button>
      </motion.div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Weekly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value}`, 'Balance']} />
                  <Line type="monotone" dataKey="balance" stroke="#8884d8" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expense Categories */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-500">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No expense data yet</p>
                    <p className="text-sm">Add some transactions to see your spending breakdown</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Features Available */}
      {aiService.hasApiKey() && transactions.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-purple-900">AI Insights Ready!</h4>
                  <p className="text-sm text-purple-700">Get personalized insights, financial stories, and predictions based on your data.</p>
                </div>
                <Button 
                  size="sm" 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => onInsightsClick?.()}
                >
                  View Insights
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Budget Alert */}
      {totalExpenses > 5000 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <h4 className="font-medium text-orange-900">Spending Alert</h4>
                  <p className="text-sm text-orange-700">You've spent ₹{totalExpenses.toLocaleString()} this month. Consider reviewing your budget.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}