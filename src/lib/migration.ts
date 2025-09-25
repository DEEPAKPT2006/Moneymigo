import { Transaction, Budget, Goal } from '../components/types';
import {
  addTransaction,
  addBudget,
  addGoal,
  setUserPreferences
} from './firebase-services';
import { toast } from 'sonner@2.0.3';

export interface LocalStorageData {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  customCategories: string[];
}

export const getLocalStorageData = (): LocalStorageData | null => {
  try {
    const transactions = localStorage.getItem('expense-tracker-transactions');
    const budgets = localStorage.getItem('expense-tracker-budgets');
    const goals = localStorage.getItem('expense-tracker-goals');
    const customCategories = localStorage.getItem('expense-tracker-custom-categories');

    if (!transactions && !budgets && !goals && !customCategories) {
      return null;
    }

    return {
      transactions: transactions ? JSON.parse(transactions) : [],
      budgets: budgets ? JSON.parse(budgets) : [],
      goals: goals ? JSON.parse(goals) : [],
      customCategories: customCategories ? JSON.parse(customCategories) : []
    };
  } catch (error) {
    console.error('Error reading localStorage data:', error);
    return null;
  }
};

export const migrateLocalStorageToFirebase = async (userId: string): Promise<boolean> => {
  const localData = getLocalStorageData();
  
  if (!localData) {
    return false;
  }

  const { transactions, budgets, goals, customCategories } = localData;
  const hasData = transactions.length > 0 || budgets.length > 0 || goals.length > 0 || customCategories.length > 0;

  if (!hasData) {
    return false;
  }

  try {
    // Show migration progress
    toast.loading('Migrating your data to the cloud...', { id: 'migration' });

    // Migrate transactions
    for (const transaction of transactions) {
      const { id, createdAt, ...transactionData } = transaction;
      await addTransaction(userId, transactionData);
    }

    // Migrate budgets
    for (const budget of budgets) {
      const { id, ...budgetData } = budget;
      await addBudget(userId, budgetData);
    }

    // Migrate goals
    for (const goal of goals) {
      const { id, ...goalData } = goal;
      await addGoal(userId, goalData);
    }

    // Migrate user preferences
    if (customCategories.length > 0) {
      await setUserPreferences(userId, {
        customCategories,
        theme: 'system'
      });
    }

    // Clear localStorage after successful migration
    localStorage.removeItem('expense-tracker-transactions');
    localStorage.removeItem('expense-tracker-budgets');
    localStorage.removeItem('expense-tracker-goals');
    localStorage.removeItem('expense-tracker-custom-categories');

    toast.success('✅ Data migrated successfully!', { id: 'migration' });
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    toast.error('Failed to migrate data. Please try again.', { id: 'migration' });
    return false;
  }
};

export const clearLocalStorageData = () => {
  try {
    localStorage.removeItem('expense-tracker-transactions');
    localStorage.removeItem('expense-tracker-budgets');
    localStorage.removeItem('expense-tracker-goals');
    localStorage.removeItem('expense-tracker-custom-categories');
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};