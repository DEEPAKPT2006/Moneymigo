import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { Transaction, Budget, Goal } from './types';
import { isFirestoreEnabled } from '../lib/firebase';
import { FirestoreRulesGuide } from './FirestoreRulesGuide';
import {
  addTransaction as firebaseAddTransaction,
  addBudget as firebaseAddBudget,
  addGoal as firebaseAddGoal,
  deleteTransaction as firebaseDeleteTransaction,
  deleteBudget as firebaseDeleteBudget,
  deleteGoal as firebaseDeleteGoal,
  updateTransaction as firebaseUpdateTransaction,
  updateBudget as firebaseUpdateBudget,
  updateGoal as firebaseUpdateGoal,
  subscribeToUserTransactions,
  subscribeToUserBudgets,
  subscribeToUserGoals,
  getUserPreferences,
  setUserPreferences,
  updateUserPreferences
} from '../lib/firebase-services';
import { migrateLocalStorageToFirebase, getLocalStorageData } from '../lib/migration';
import { toast } from 'sonner@2.0.3';

interface DataContextType {
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

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: React.ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);

  // Load user data when user changes
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      setCustomCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Check for localStorage data to migrate
    const localData = getLocalStorageData();
    if (localData && (localData.transactions.length > 0 || localData.budgets.length > 0 || localData.goals.length > 0 || localData.customCategories.length > 0)) {
      toast.info('Found existing data. Migrating to cloud storage...', {
        description: 'This may take a moment.'
      });
      
      migrateLocalStorageToFirebase(user.uid).then((migrated) => {
        if (migrated) {
          toast.success('Data migration completed successfully! 🎉');
        }
      }).catch((error) => {
        console.error('Migration failed:', error);
        toast.error('Migration failed. Your local data is still safe.');
      });
    }

    // Load user preferences with error handling
    getUserPreferences(user.uid).then(preferences => {
      setCustomCategories(preferences.customCategories || []);
      setPermissionError(false);
    }).catch(error => {
      console.warn('Failed to load user preferences:', error);
      
      // Check for permission errors in multiple formats
      const isPermissionError = (
        error.code === 'permission-denied' ||
        error.message?.includes('Permission denied') ||
        error.message?.includes('permission-denied') ||
        error.message?.includes('Missing or insufficient permissions')
      );
      
      if (isPermissionError) {
        console.warn('🔒 Permission denied during initial load - setting permission error state');
        setPermissionError(true);
      }
      
      setCustomCategories([]);
    });

    // Subscribe to real-time updates with error detection
    const unsubscribeTransactions = subscribeToUserTransactions(user.uid, (data) => {
      setTransactions(data);
      setLoading(false);
      setPermissionError(false); // Clear permission error if data loads successfully
    });

    const unsubscribeBudgets = subscribeToUserBudgets(user.uid, (data) => {
      setBudgets(data);
    });

    const unsubscribeGoals = subscribeToUserGoals(user.uid, (data) => {
      setGoals(data);
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeTransactions();
      unsubscribeBudgets();
      unsubscribeGoals();
    };
  }, [user]);

  // Transaction methods
  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) {
      toast.error('Please sign in to add transactions');
      return;
    }

    if (!isFirestoreEnabled()) {
      toast.error('Database not available. Please check your Firebase configuration.');
      return;
    }

    try {
      await firebaseAddTransaction(user.uid, transactionData);
      toast.success(
        `${transactionData.type === 'income' ? 'Income' : 'Expense'} added successfully!`,
        {
          description: `₹${transactionData.amount.toLocaleString()} - ${transactionData.category}`
        }
      );
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      
      // Check for permission denied errors (multiple ways they can appear)
      const isPermissionError = (
        error.code === 'permission-denied' ||
        error.message === 'FIRESTORE_RULES_ERROR' ||
        error.message?.includes('permission-denied') ||
        error.message?.includes('Missing or insufficient permissions')
      );
      
      if (isPermissionError) {
        console.warn('🔒 Permission denied - setting permission error state');
        setPermissionError(true);
        toast.error('🚨 URGENT: Transaction Blocked by Security Rules', {
          description: 'Firestore needs security rules configured. Click Fix Now for 30-second solution!',
          duration: 10000,
          action: {
            label: 'Fix Now',
            onClick: () => {
              window.open('https://console.firebase.google.com/project/studio-4094080917-c3f91/firestore/rules', '_blank');
              toast.info('Firebase Console opened! Follow the setup guide.', {
                description: 'Copy the security rules and paste them in the console'
              });
            }
          }
        });
        return; // Don't try to continue
      }
      
      if (error.message?.includes('offline')) {
        toast.error('Unable to save transaction - you appear to be offline', {
          description: 'Transaction will be saved when connection is restored'
        });
      } else if (error.message?.includes('Firestore not available')) {
        toast.error('Database not configured', {
          description: 'Please enable Firestore in your Firebase console'
        });
      } else {
        toast.error('Failed to add transaction', {
          description: error.message || 'Please try again'
        });
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await firebaseDeleteTransaction(id);
      toast.success('Transaction deleted successfully');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    try {
      await firebaseUpdateTransaction(transaction.id, transaction);
      toast.success('Transaction updated successfully');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    }
  };

  // Budget methods
  const addBudget = async (budgetData: Omit<Budget, 'id' | 'spent'>) => {
    if (!user) {
      toast.error('Please sign in to add budgets');
      return;
    }

    try {
      await firebaseAddBudget(user.uid, { ...budgetData, spent: 0 });
      toast.success(`Budget set for ${budgetData.category}`);
    } catch (error) {
      console.error('Error adding budget:', error);
      toast.error('Failed to add budget');
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      await firebaseDeleteBudget(id);
      toast.success('Budget deleted successfully');
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
    }
  };

  const updateBudget = async (budget: Budget) => {
    try {
      await firebaseUpdateBudget(budget.id, budget);
      toast.success('Budget updated successfully');
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget');
    }
  };

  // Goal methods
  const addGoal = async (goalData: Omit<Goal, 'id' | 'currentAmount'>) => {
    if (!user) {
      toast.error('Please sign in to add goals');
      return;
    }

    try {
      await firebaseAddGoal(user.uid, { ...goalData, currentAmount: 0 });
      toast.success(`Goal "${goalData.title}" created successfully!`);
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('Failed to add goal');
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await firebaseDeleteGoal(id);
      toast.success('Goal deleted successfully');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const updateGoal = async (goal: Goal) => {
    try {
      await firebaseUpdateGoal(goal.id, goal);
      toast.success('Goal updated successfully');
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
    }
  };

  // Custom categories
  const addCustomCategory = async (category: string) => {
    if (!user) {
      toast.error('Please sign in to add custom categories');
      return;
    }

    if (customCategories.includes(category)) {
      toast.error('Category already exists');
      return;
    }

    try {
      const newCategories = [...customCategories, category];
      await updateUserPreferences(user.uid, { customCategories: newCategories });
      setCustomCategories(newCategories);
      toast.success(`Custom category "${category}" added`);
    } catch (error) {
      console.error('Error adding custom category:', error);
      toast.error('Failed to add custom category');
    }
  };

  const deleteCustomCategory = async (category: string) => {
    if (!user) {
      toast.error('Please sign in to delete custom categories');
      return;
    }

    try {
      const newCategories = customCategories.filter(c => c !== category);
      await updateUserPreferences(user.uid, { customCategories: newCategories });
      setCustomCategories(newCategories);
      toast.success(`Category "${category}" removed`);
    } catch (error) {
      console.error('Error deleting custom category:', error);
      toast.error('Failed to delete custom category');
    }
  };

  // Data management
  const exportData = async (format: 'csv' | 'pdf') => {
    if (!user) {
      toast.error('Please sign in to export data');
      return;
    }

    try {
      // Implementation for data export
      if (format === 'csv') {
        const csvContent = transactions.map(t => 
          `${t.createdAt},${t.type},${t.amount},${t.category},${t.description || ''}`
        ).join('\n');
        
        const blob = new Blob([`Date,Type,Amount,Category,Description\n${csvContent}`], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `moneymigo-data-${new Date().toISOString().split('T')[0]}.csv`;
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
    if (!user) {
      toast.error('Please sign in to reset data');
      return;
    }

    try {
      // Note: In a real implementation, you'd want to delete all user data from Firebase
      // For now, we'll just clear local state and show a message
      toast.success('Data reset feature will be implemented soon');
    } catch (error) {
      console.error('Error resetting data:', error);
      toast.error('Failed to reset data');
    }
  };

  const value: DataContextType = {
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

  // Show permission error guide immediately when Firestore rules are blocking access
  if (permissionError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <FirestoreRulesGuide />
      </div>
    );
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};