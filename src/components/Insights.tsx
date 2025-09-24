import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target, Calendar, Brain, BookOpen, Zap, RefreshCw } from 'lucide-react';
import { Transaction, Budget, Goal } from './types';
import { AIService } from './services/aiService';
import { toast } from 'sonner@2.0.3';

interface InsightsProps {
  transactions: Transaction[];
  budgets?: Budget[];
  goals?: Goal[];
}

export function Insights({ transactions, budgets = [], goals = [] }: InsightsProps) {
  const [aiInsights, setAiInsights] = useState<string>('');
  const [aiStory, setAiStory] = useState<string>('');
  const [aiPredictions, setAiPredictions] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingStory, setLoadingStory] = useState(false);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [activeAITab, setActiveAITab] = useState('insights');
  
  const aiService = AIService.getInstance();
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

  // Load AI insights on component mount
  useEffect(() => {
    if (aiService.hasApiKey() && transactions.length > 0) {
      loadAIInsights();
    }
  }, [transactions.length]);

  const getFinancialData = () => ({
    transactions,
    budgets,
    goals
  });

  const loadAIInsights = async () => {
    setLoadingInsights(true);
    try {
      const insights = await aiService.generateInsights(getFinancialData());
      setAiInsights(insights);
    } catch (error) {
      console.error('Failed to load AI insights:', error);
      setAiInsights(error instanceof Error ? error.message : 'Failed to load insights');
    } finally {
      setLoadingInsights(false);
    }
  };

  const loadAIStory = async () => {
    setLoadingStory(true);
    try {
      const story = await aiService.generateStory(getFinancialData());
      setAiStory(story);
    } catch (error) {
      console.error('Failed to load AI story:', error);
      setAiStory(error instanceof Error ? error.message : 'Failed to load story');
    } finally {
      setLoadingStory(false);
    }
  };

  const loadAIPredictions = async () => {
    setLoadingPredictions(true);
    try {
      const predictions = await aiService.generatePredictions(getFinancialData());
      setAiPredictions(predictions);
    } catch (error) {
      console.error('Failed to load AI predictions:', error);
      setAiPredictions(error instanceof Error ? error.message : 'Failed to load predictions');
    } finally {
      setLoadingPredictions(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveAITab(tab);
    if (tab === 'story' && !aiStory && !loadingStory) {
      loadAIStory();
    } else if (tab === 'predictions' && !aiPredictions && !loadingPredictions) {
      loadAIPredictions();
    }
  };

  const refreshAIContent = () => {
    switch (activeAITab) {
      case 'insights':
        loadAIInsights();
        break;
      case 'story':
        loadAIStory();
        break;
      case 'predictions':
        loadAIPredictions();
        break;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-xl">Financial Insights & Predictions</h2>
        {aiService.hasApiKey() && (
          <Button
            onClick={refreshAIContent}
            variant="outline"
            size="sm"
            disabled={loadingInsights || loadingStory || loadingPredictions}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(loadingInsights || loadingStory || loadingPredictions) ? 'animate-spin' : ''}`} />
            Refresh AI
          </Button>
        )}
      </motion.div>

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

      {/* AI-Powered Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI-Powered Financial Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!aiService.hasApiKey() ? (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">AI Insights Available</h3>
                <p className="text-gray-600 mb-4">
                  Configure your Gemini AI API key in Settings to unlock personalized insights, stories, and predictions.
                </p>
                <Badge variant="outline" className="mb-2">
                  Features: Smart Insights • Financial Stories • Future Predictions
                </Badge>
              </div>
            ) : (
              <Tabs value={activeAITab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="insights" className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Smart Insights
                  </TabsTrigger>
                  <TabsTrigger value="story" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Your Story
                  </TabsTrigger>
                  <TabsTrigger value="predictions" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Predictions
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="insights" className="mt-4">
                  <div className="space-y-4">
                    {loadingInsights ? (
                      <div className="flex items-center justify-center py-8">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"
                        />
                        <span className="ml-3 text-gray-600">Analyzing your financial data...</span>
                      </div>
                    ) : aiInsights ? (
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                          {aiInsights}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Click "Refresh AI" to generate personalized insights</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="story" className="mt-4">
                  <div className="space-y-4">
                    {loadingStory ? (
                      <div className="flex items-center justify-center py-8">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"
                        />
                        <span className="ml-3 text-gray-600">Crafting your financial story...</span>
                      </div>
                    ) : aiStory ? (
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                          {aiStory}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Your personalized financial story will appear here</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="predictions" className="mt-4">
                  <div className="space-y-4">
                    {loadingPredictions ? (
                      <div className="flex items-center justify-center py-8">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"
                        />
                        <span className="ml-3 text-gray-600">Predicting your financial future...</span>
                      </div>
                    ) : aiPredictions ? (
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                          {aiPredictions}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>AI predictions about your financial future will appear here</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Monthly Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Basic Forecast (Rule-based)
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
                <p className="text-xs text-gray-500">Basic prediction</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}