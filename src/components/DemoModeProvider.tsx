import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, Budget, Goal } from './types';
import { toast } from 'sonner@2.0.3';

interface DemoModeContextType {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  customCategories: string[];
  loading: boolean;
  
  // Transaction methods
  addTransaction: (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  
  // Budget methods
  addBudget: (budgetData: Omit<Budget, 'id' | 'spent'>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  updateBudget: (budget: Budget) => Promise<void>;
  
  // Goal methods
  addGoal: (goalData: Omit<Goal, 'id' | 'currentAmount'>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  
  // Custom categories
  addCustomCategory: (category: string) => Promise<void>;
  deleteCustomCategory: (category: string) => Promise<void>;
  
  // Data management
  exportData: (format: 'csv' | 'pdf') => Promise<void>;
  resetAllData: () => Promise<void>;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
};

interface DemoModeProviderProps {
  children: React.ReactNode;
}

export const DemoModeProvider: React.FC<DemoModeProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadDemoData = () => {
      try {
        const savedTransactions = localStorage.getItem('moneymigo-demo-transactions');
        const savedBudgets = localStorage.getItem('moneymigo-demo-budgets');
        const savedGoals = localStorage.getItem('moneymigo-demo-goals');
        const savedCategories = localStorage.getItem('moneymigo-demo-custom-categories');

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
      } catch (error) {
        console.error('Error loading demo data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDemoData();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('moneymigo-demo-transactions', JSON.stringify(transactions));
    }
  }, [transactions, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('moneymigo-demo-budgets', JSON.stringify(budgets));
    }
  }, [budgets, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('moneymigo-demo-goals', JSON.stringify(goals));
    }
  }, [goals, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('moneymigo-demo-custom-categories', JSON.stringify(customCategories));
    }
  }, [customCategories, loading]);

  // Transaction methods
  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
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

  const deleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.success('Transaction deleted successfully');
  };

  const updateTransaction = async (transaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
    toast.success('Transaction updated successfully');
  };

  // Budget methods
  const addBudget = async (budgetData: Omit<Budget, 'id' | 'spent'>) => {
    const newBudget: Budget = {
      ...budgetData,
      id: Date.now().toString(),
      spent: 0
    };

    setBudgets(prev => [...prev, newBudget]);
    toast.success(`Budget set for ${budgetData.category}`);
  };

  const deleteBudget = async (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
    toast.success('Budget deleted successfully');
  };

  const updateBudget = async (budget: Budget) => {
    setBudgets(prev => prev.map(b => b.id === budget.id ? budget : b));
    toast.success('Budget updated successfully');
  };

  // Goal methods
  const addGoal = async (goalData: Omit<Goal, 'id' | 'currentAmount'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      currentAmount: 0
    };

    setGoals(prev => [...prev, newGoal]);
    toast.success(`Goal "${goalData.title}" created successfully!`);
  };

  const deleteGoal = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    toast.success('Goal deleted successfully');
  };

  const updateGoal = async (goal: Goal) => {
    setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
    toast.success('Goal updated successfully');
  };

  // Custom categories
  const addCustomCategory = async (category: string) => {
    if (customCategories.includes(category)) {
      toast.error('Category already exists');
      return;
    }

    setCustomCategories(prev => [...prev, category]);
    toast.success(`Custom category "${category}" added`);
  };

  const deleteCustomCategory = async (category: string) => {
    setCustomCategories(prev => prev.filter(c => c !== category));
    toast.success(`Category "${category}" removed`);
  };

  // Data management
  const exportData = async (format: 'csv' | 'pdf') => {
    try {
      if (format === 'csv') {
        const csvContent = transactions.map(t => 
          `${t.createdAt},${t.type},${t.amount},${t.category},${t.description || ''}`
        ).join('\n');
        
        const blob = new Blob([`Date,Type,Amount,Category,Description\n${csvContent}`], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `moneymigo-demo-data-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
      
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const resetAllData = async () => {
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setCustomCategories([]);
    
    localStorage.removeItem('moneymigo-demo-transactions');
    localStorage.removeItem('moneymigo-demo-budgets');
    localStorage.removeItem('moneymigo-demo-goals');
    localStorage.removeItem('moneymigo-demo-custom-categories');
    
    toast.success('All data has been reset');
  };

  const value: DemoModeContextType = {
    transactions,
    budgets,
    goals,
    customCategories,
    loading,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    addBudget,
    deleteBudget,
    updateBudget,
    addGoal,
    deleteGoal,
    updateGoal,
    addCustomCategory,
    deleteCustomCategory,
    exportData,
    resetAllData
  };

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
};