import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Target, Plus, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Budget, Goal, Transaction, EXPENSE_CATEGORIES } from './types';

interface GoalsProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  onAddBudget: (budget: Omit<Budget, 'id' | 'spent'>) => Promise<void>;
  onAddGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => Promise<void>;
}

export function Goals({ transactions, budgets, goals, onAddBudget, onAddGoal }: GoalsProps) {
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    category: '',
    limit: '',
    period: 'monthly' as 'monthly' | 'weekly'
  });
  const [goalForm, setGoalForm] = useState({
    title: '',
    targetAmount: '',
    targetDate: '',
    category: ''
  });

  // Calculate spending by category for current month
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlySpending = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Update budgets with current spending
  const updatedBudgets = budgets.map(budget => ({
    ...budget,
    spent: monthlySpending[budget.category] || 0
  }));

  const handleAddBudget = async () => {
    if (!budgetForm.category || !budgetForm.limit) return;
    
    try {
      await onAddBudget({
        category: budgetForm.category,
        limit: parseFloat(budgetForm.limit),
        period: budgetForm.period
      });
      
      setBudgetForm({ category: '', limit: '', period: 'monthly' });
      setIsAddingBudget(false);
    } catch (error) {
      console.error('Error adding budget:', error);
    }
  };

  const handleAddGoal = async () => {
    if (!goalForm.title || !goalForm.targetAmount || !goalForm.targetDate) return;
    
    try {
      await onAddGoal({
        title: goalForm.title,
        targetAmount: parseFloat(goalForm.targetAmount),
        targetDate: goalForm.targetDate,
        category: goalForm.category || undefined
      });
      
      setGoalForm({ title: '', targetAmount: '', targetDate: '', category: '' });
      setIsAddingGoal(false);
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const getBudgetStatus = (budget: Budget) => {
    const percentage = (budget.spent / budget.limit) * 100;
    if (percentage >= 100) return { status: 'exceeded', color: 'text-red-600', bgColor: 'bg-red-500' };
    if (percentage >= 80) return { status: 'warning', color: 'text-orange-600', bgColor: 'bg-orange-500' };
    return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-500' };
  };

  const getGoalProgress = (goal: Goal) => {
    // Calculate progress based on savings (income - expenses)
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const currentSavings = Math.max(0, totalIncome - totalExpenses);
    
    return Math.min((currentSavings / goal.targetAmount) * 100, 100);
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-xl">Goals & Budgets</h2>
        <div className="flex gap-2">
          <Dialog open={isAddingBudget} onOpenChange={setIsAddingBudget}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Budget</DialogTitle>
                <DialogDescription>
                  Set a spending limit for a category to track your expenses.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Category</Label>
                  <Select value={budgetForm.category} onValueChange={(value) => setBudgetForm(prev => ({...prev, category: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Budget Limit</Label>
                  <Input
                    type="number"
                    placeholder="₹5000"
                    value={budgetForm.limit}
                    onChange={(e) => setBudgetForm(prev => ({...prev, limit: e.target.value}))}
                  />
                </div>
                <div>
                  <Label>Period</Label>
                  <Select value={budgetForm.period} onValueChange={(value: 'monthly' | 'weekly') => setBudgetForm(prev => ({...prev, period: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddBudget} className="w-full">
                  Add Budget
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Target className="h-4 w-4 mr-2" />
                Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Savings Goal</DialogTitle>
                <DialogDescription>
                  Create a financial target to work towards with a specific deadline.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Goal Title</Label>
                  <Input
                    placeholder="Emergency Fund"
                    value={goalForm.title}
                    onChange={(e) => setGoalForm(prev => ({...prev, title: e.target.value}))}
                  />
                </div>
                <div>
                  <Label>Target Amount</Label>
                  <Input
                    type="number"
                    placeholder="₹50000"
                    value={goalForm.targetAmount}
                    onChange={(e) => setGoalForm(prev => ({...prev, targetAmount: e.target.value}))}
                  />
                </div>
                <div>
                  <Label>Target Date</Label>
                  <Input
                    type="date"
                    value={goalForm.targetDate}
                    onChange={(e) => setGoalForm(prev => ({...prev, targetDate: e.target.value}))}
                  />
                </div>
                <Button onClick={handleAddGoal} className="w-full">
                  Add Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Budgets Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg mb-4">Monthly Budgets</h3>
        {updatedBudgets.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No budgets set yet. Create your first budget to track spending!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {updatedBudgets.map((budget, index) => {
              const status = getBudgetStatus(budget);
              const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
              
              return (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{budget.category}</h4>
                          {status.status === 'exceeded' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          {status.status === 'warning' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                          {status.status === 'good' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                        <span className={status.color}>
                          ₹{budget.spent.toLocaleString()} / ₹{budget.limit.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-3" />
                      <div className="mt-2 text-sm text-gray-600">
                        {budget.limit - budget.spent > 0 
                          ? `₹${(budget.limit - budget.spent).toLocaleString()} remaining`
                          : `₹${(budget.spent - budget.limit).toLocaleString()} over budget`
                        }
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Goals Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg mb-4">Savings Goals</h3>
        {goals.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No goals set yet. Create your first savings goal!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {goals.map((goal, index) => {
              const progress = getGoalProgress(goal);
              const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{goal.title}</h4>
                        <span className="text-sm text-gray-600">
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Goal date passed'}
                        </span>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                      </div>
                      <div className="text-sm text-gray-600">
                        Target: ₹{goal.targetAmount.toLocaleString()} by {new Date(goal.targetDate).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* AI Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {updatedBudgets.some(b => b.spent > b.limit * 0.8) && (
                <div className="p-3 bg-orange-100 rounded-lg">
                  <p className="text-sm">⚠️ You're approaching your budget limits in some categories. Consider reducing discretionary spending.</p>
                </div>
              )}
              {transactions.filter(t => t.type === 'expense').length > 0 && (
                <div className="p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm">💡 Set up a budget for your top spending category to better track your expenses.</p>
                </div>
              )}
              {goals.length === 0 && (
                <div className="p-3 bg-green-100 rounded-lg">
                  <p className="text-sm">🎯 Consider setting a savings goal to stay motivated and track your progress!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}