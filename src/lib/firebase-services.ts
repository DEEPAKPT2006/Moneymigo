import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured, isFirestoreEnabled, handleFirestoreNetworkError, setPermissionError } from './firebase';
import { Transaction, Budget, Goal } from '../components/types';

export interface FirebaseTransaction extends Omit<Transaction, 'id' | 'createdAt'> {
  userId: string;
  createdAt: Timestamp;
}

export interface FirebaseBudget extends Omit<Budget, 'id'> {
  userId: string;
}

export interface FirebaseGoal extends Omit<Goal, 'id'> {
  userId: string;
}

export interface UserPreferences {
  customCategories: string[];
  theme: 'light' | 'dark' | 'system';
}

// Helper function to handle Firestore errors
const handleFirestoreError = async (error: any, operation: string, retryFn?: () => Promise<any>) => {
  console.error(`Error ${operation}:`, error);
  
  // Handle specific Firestore errors
  if (error.code === 'unavailable' || error.message?.includes('offline')) {
    console.warn('⚠️ Firestore is offline or unavailable');
    
    // Try to reset network connection
    const networkReset = await handleFirestoreNetworkError();
    if (networkReset && retryFn) {
      try {
        return await retryFn();
      } catch (retryError) {
        console.error(`Retry failed for ${operation}:`, retryError);
      }
    }
    
    throw new Error('Database is currently offline. Please check your connection and try again.');
  }
  
  if (error.code === 'permission-denied') {
    console.error('❌ Firestore permission denied - security rules need to be configured');
    setPermissionError(true);
    throw new Error('FIRESTORE_RULES_ERROR');
  }
  
  if (error.code === 'failed-precondition' && error.message?.includes('index')) {
    console.warn('⚠️ Firestore index required for query - falling back to basic query');
    throw new Error('FIRESTORE_INDEX_ERROR');
  }
  
  if (error.code === 'not-found') {
    throw new Error('Document not found.');
  }
  
  throw error;
};

// Transactions
export const addTransaction = async (userId: string, transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
  if (!isFirestoreEnabled()) {
    throw new Error('Firestore not available. Please enable Firestore in your Firebase console.');
  }
  
  const performAdd = async () => {
    const docRef = await addDoc(collection(db, 'transactions'), {
      ...transactionData,
      userId,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  };
  
  try {
    return await performAdd();
  } catch (error) {
    return await handleFirestoreError(error, 'adding transaction', performAdd);
  }
};

export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  if (!isFirestoreEnabled()) {
    console.warn('⚠️ Firestore not available, returning empty transactions');
    return [];
  }
  
  const performGet = async () => {
    try {
      // Try with composite query (requires index)
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toISOString()
      })) as Transaction[];
    } catch (indexError: any) {
      if (indexError.code === 'failed-precondition') {
        console.warn('⚠️ Index not available, falling back to simple query');
        // Fallback to simple query without orderBy
        const simpleQ = query(
          collection(db, 'transactions'),
          where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(simpleQ);
        const transactions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate().toISOString()
        })) as Transaction[];
        
        // Sort manually in JavaScript
        return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      throw indexError;
    }
  };
  
  try {
    return await performGet();
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn('⚠️ Firestore permission denied - returning empty transactions');
      setPermissionError(true);
      return [];
    }
    await handleFirestoreError(error, 'fetching transactions');
    return []; // Return empty array as fallback
  }
};

export const updateTransaction = async (transactionId: string, updates: Partial<Transaction>) => {
  try {
    const docRef = doc(db, 'transactions', transactionId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (transactionId: string) => {
  try {
    await deleteDoc(doc(db, 'transactions', transactionId));
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Budgets
export const addBudget = async (userId: string, budgetData: Omit<Budget, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'budgets'), {
      ...budgetData,
      userId
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding budget:', error);
    throw error;
  }
};

export const getUserBudgets = async (userId: string): Promise<Budget[]> => {
  try {
    const q = query(
      collection(db, 'budgets'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Budget[];
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }
};

export const updateBudget = async (budgetId: string, updates: Partial<Budget>) => {
  try {
    const docRef = doc(db, 'budgets', budgetId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
};

export const deleteBudget = async (budgetId: string) => {
  try {
    await deleteDoc(doc(db, 'budgets', budgetId));
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
};

// Goals
export const addGoal = async (userId: string, goalData: Omit<Goal, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'goals'), {
      ...goalData,
      userId
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding goal:', error);
    throw error;
  }
};

export const getUserGoals = async (userId: string): Promise<Goal[]> => {
  try {
    const q = query(
      collection(db, 'goals'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Goal[];
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
};

export const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
  try {
    const docRef = doc(db, 'goals', goalId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

export const deleteGoal = async (goalId: string) => {
  try {
    await deleteDoc(doc(db, 'goals', goalId));
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

// User Preferences
export const getUserPreferences = async (userId: string): Promise<UserPreferences> => {
  if (!isFirestoreEnabled()) {
    console.warn('⚠️ Firestore not available, returning default preferences');
    return {
      customCategories: [],
      theme: 'system'
    };
  }
  
  const performGet = async () => {
    const docRef = doc(db, 'userPreferences', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserPreferences;
    } else {
      return {
        customCategories: [],
        theme: 'system'
      };
    }
  };
  
  try {
    return await performGet();
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn('⚠️ Firestore permission denied - returning default preferences');
      setPermissionError(true);
      return {
        customCategories: [],
        theme: 'system'
      };
    }
    await handleFirestoreError(error, 'fetching user preferences');
    return {
      customCategories: [],
      theme: 'system'
    };
  }
};

export const updateUserPreferences = async (userId: string, preferences: Partial<UserPreferences>) => {
  try {
    const docRef = doc(db, 'userPreferences', userId);
    await updateDoc(docRef, preferences);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

export const setUserPreferences = async (userId: string, preferences: UserPreferences) => {
  try {
    const docRef = doc(db, 'userPreferences', userId);
    await updateDoc(docRef, preferences);
  } catch (error) {
    // If document doesn't exist, create it
    const batch = writeBatch(db);
    batch.set(docRef, preferences);
    await batch.commit();
  }
};

// Real-time listeners
export const subscribeToUserTransactions = (userId: string, callback: (transactions: Transaction[]) => void) => {
  if (!isFirestoreEnabled()) {
    console.warn('⚠️ Firestore not available, skipping real-time subscription');
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }
  
  // Try to create subscription with composite query first
  let unsubscribe: (() => void) | null = null;
  
  try {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const transactions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate().toISOString()
        })) as Transaction[];
        callback(transactions);
      },
      (error) => {
        console.error('❌ Error in transactions subscription:', error);
        
        if (error.code === 'permission-denied') {
          console.warn('⚠️ Firestore permission denied - subscription cancelled');
          setPermissionError(true);
          callback([]);
          return;
        }
        
        if (error.code === 'failed-precondition' && error.message?.includes('index')) {
          console.warn('⚠️ Index required for real-time query - falling back to simple subscription');
          
          // Fallback to simple subscription without orderBy
          const simpleQ = query(
            collection(db, 'transactions'),
            where('userId', '==', userId)
          );
          
          const fallbackUnsubscribe = onSnapshot(simpleQ,
            (querySnapshot) => {
              const transactions = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate().toISOString()
              })) as Transaction[];
              
              // Sort manually in JavaScript
              const sortedTransactions = transactions.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              callback(sortedTransactions);
            },
            (fallbackError) => {
              console.error('❌ Fallback subscription also failed:', fallbackError);
              callback([]);
            }
          );
          
          // Return the fallback unsubscribe function
          return fallbackUnsubscribe;
        }
        
        if (error.code === 'unavailable') {
          console.warn('⚠️ Firestore subscription offline, will retry automatically');
        } else {
          console.error('❌ Firestore subscription failed:', error);
        }
      }
    );
    
    return unsubscribe;
    
  } catch (error: any) {
    console.error('❌ Failed to create subscription:', error);
    callback([]);
    return () => {};
  }
};

export const subscribeToUserBudgets = (userId: string, callback: (budgets: Budget[]) => void) => {
  if (!isFirestoreEnabled()) {
    console.warn('⚠️ Firestore not available, skipping budgets subscription');
    callback([]);
    return () => {};
  }
  
  const q = query(
    collection(db, 'budgets'),
    where('userId', '==', userId)
  );
  
  return onSnapshot(q, 
    (querySnapshot) => {
      const budgets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Budget[];
      callback(budgets);
    },
    (error) => {
      console.error('❌ Error in budgets subscription:', error);
      if (error.code === 'permission-denied') {
        setPermissionError(true);
      }
      callback([]);
    }
  );
};

export const subscribeToUserGoals = (userId: string, callback: (goals: Goal[]) => void) => {
  if (!isFirestoreEnabled()) {
    console.warn('⚠️ Firestore not available, skipping goals subscription');
    callback([]);
    return () => {};
  }
  
  const q = query(
    collection(db, 'goals'),
    where('userId', '==', userId)
  );
  
  return onSnapshot(q, 
    (querySnapshot) => {
      const goals = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Goal[];
      callback(goals);
    },
    (error) => {
      console.error('❌ Error in goals subscription:', error);
      if (error.code === 'permission-denied') {
        setPermissionError(true);
      }
      callback([]);
    }
  );
};