import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dashboard } from './components/Dashboard';
import { AddTransaction } from './components/AddTransaction';
import { TransactionTimeline } from './components/TransactionTimeline';
import { Goals } from './components/Goals';
import { Insights } from './components/Insights';
import { Settings } from './components/Settings';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { Home, Receipt, Target, TrendingUp, Settings as SettingsIcon, Plus } from 'lucide-react';
import { Transaction, Budget, Goal } from './components/types';

// Mock data for demo
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 50000,
    category: 'Salary',
    description: 'Monthly salary',
    date: '2024-01-15',
    recurring: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    type: 'expense',
    amount: 1200,
    category: 'Food & Dining',
    description: 'Restaurant dinner',
    date: '2024-01-20',
    recurring: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    type: 'expense',
    amount: 800,
    category: 'Transportation',
    description: 'Uber rides',
    date: '2024-01-22',
    recurring: false,
    createdAt: new Date().toISOString()
  }
];

const mockBudgets: Budget[] = [
  {
    id: '1',
    category: 'Food & Dining',
    limit: 5000,
    spent: 0,
    period: 'monthly'
  },
  {
    id: '2',
    category: 'Transportation',
    limit: 3000,
    spent: 0,
    period: 'monthly'
  }
];

const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Emergency Fund',
    targetAmount: 100000,
    currentAmount: 0,
    targetDate: '2024-12-31',
    category: 'Savings'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('expense-tracker-transactions');
    const savedBudgets = localStorage.getItem('expense-tracker-budgets');
    const savedGoals = localStorage.getItem('expense-tracker-goals');
    const savedCategories = localStorage.getItem('expense-tracker-custom-categories');

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
    if (savedCategories) {
      setCustomCategories(JSON.parse(savedCategories));
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('expense-tracker-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('expense-tracker-budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('expense-tracker-goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('expense-tracker-custom-categories', JSON.stringify(customCategories));
  }, [customCategories]);

  const handleAddTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    setTransactions(prev => [newTransaction, ...prev]);
    
    toast.success(
      `${transactionData.type === 'income' ? 'Income' : 'Expense'} added successfully!`,
      {
        description: `₹${transactionData.amount.toLocaleString()} - ${transactionData.category}`
      }
    );
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.success('Transaction deleted successfully');
  };

  const handleEditTransaction = (transaction: Transaction) => {
    // In a real app, this would open an edit modal
    toast.info('Edit functionality coming soon!');
  };

  const handleAddBudget = (budgetData: Omit<Budget, 'id' | 'spent'>) => {
    const newBudget: Budget = {
      ...budgetData,
      id: Date.now().toString(),
      spent: 0
    };

    setBudgets(prev => [...prev, newBudget]);
    toast.success(`Budget set for ${budgetData.category}`);
  };

  const handleAddGoal = (goalData: Omit<Goal, 'id' | 'currentAmount'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      currentAmount: 0
    };

    setGoals(prev => [...prev, newGoal]);
    toast.success(`Goal "${goalData.title}" created successfully!`);
  };

  const handleExportData = (format: 'csv' | 'pdf') => {
    toast.success(`Data exported as ${format.toUpperCase()}`);
  };

  const handleResetApp = () => {
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setCustomCategories([]);
    localStorage.clear();
    toast.success('All data has been reset');
  };

  const handleAddCustomCategory = (category: string, type: 'income' | 'expense') => {
    if (!customCategories.includes(category)) {
      setCustomCategories(prev => [...prev, category]);
      toast.success(`Custom category "${category}" added`);
    }
  };

  const handleDeleteCustomCategory = (category: string) => {
    setCustomCategories(prev => prev.filter(c => c !== category));
    toast.success(`Category "${category}" removed`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-6 border-b"
        >
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ExpenseTracker AI
            </h1>
            <p className="text-sm text-gray-600">Smart financial management</p>
          </div>
          
          <Button 
            onClick={() => setShowAddTransaction(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </motion.header>

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                <span className="hidden sm:inline">Timeline</span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Goals</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard
                  transactions={transactions}
                  onAddTransaction={() => setShowAddTransaction(true)}
                  onGoalsClick={() => setActiveTab('goals')}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="timeline" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TransactionTimeline
                  transactions={transactions}
                  onDeleteTransaction={handleDeleteTransaction}
                  onEditTransaction={handleEditTransaction}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="goals" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Goals
                  transactions={transactions}
                  budgets={budgets}
                  goals={goals}
                  onAddBudget={handleAddBudget}
                  onAddGoal={handleAddGoal}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Insights transactions={transactions} />
              </motion.div>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Settings
                  transactions={transactions}
                  onExportData={handleExportData}
                  onResetApp={handleResetApp}
                  customCategories={customCategories}
                  onAddCustomCategory={handleAddCustomCategory}
                  onDeleteCustomCategory={handleDeleteCustomCategory}
                />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.main>

        {/* Add Transaction Modal */}
        <AnimatePresence>
          {showAddTransaction && (
            <AddTransaction
              onAddTransaction={handleAddTransaction}
              onClose={() => setShowAddTransaction(false)}
            />
          )}
        </AnimatePresence>

        {/* Toast Notifications */}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 3000,
          }}
        />
      </div>
    </div>
  );
}