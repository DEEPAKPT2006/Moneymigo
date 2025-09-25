import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, isFirebaseConfigured, isAuthEnabled } from '../lib/firebase';
import { toast } from 'sonner@2.0.3';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemo = !isAuthEnabled();

  useEffect(() => {
    // Check if authentication is properly enabled
    if (!isAuthEnabled()) {
      console.log('🔧 Running in demo mode - Firebase Authentication not enabled or configured');
      // In demo mode, create a mock user
      const demoUser = {
        uid: 'demo-user-id',
        email: 'demo@moneymigo.app',
        isAnonymous: false,
        emailVerified: true,
        displayName: 'Demo User'
      } as User;
      
      setUser(demoUser);
      setLoading(false);
      return;
    }

    console.log('🔥 Setting up Firebase auth listener');
    
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('🔥 Auth state changed:', user ? `User logged in: ${user.uid}` : 'User logged out');
        setUser(user);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up auth listener:', error);
      // If there's an error with auth, fall back to demo mode
      const demoUser = {
        uid: 'demo-user-id',
        email: 'demo@moneymigo.app',
        isAnonymous: false,
        emailVerified: true,
        displayName: 'Demo User'
      } as User;
      
      setUser(demoUser);
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isAuthEnabled()) {
      toast.error('Authentication not available - Firebase Auth needs to be enabled in your Firebase console');
      return;
    }
    
    try {
      console.log('🔐 Attempting to sign in user:', email);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back! 👋');
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      
      // Handle specific authentication configuration error
      let errorMessage = 'Failed to sign in';
      if (error.code === 'auth/configuration-not-found') {
        errorMessage = 'Firebase Authentication is not enabled. Please enable Authentication in your Firebase console.';
        toast.error(errorMessage, { 
          duration: 6000,
          description: 'Go to Firebase Console → Authentication → Get Started to enable auth features'
        });
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.code !== 'auth/configuration-not-found') {
        toast.error(errorMessage);
      }
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!isAuthEnabled()) {
      toast.error('Authentication not available - Firebase Auth needs to be enabled in your Firebase console');
      return;
    }
    
    try {
      console.log('🔐 Attempting to create account for:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Account created successfully:', userCredential.user.uid);
      toast.success('Account created successfully! 🎉');
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Failed to create account';
      if (error.code === 'auth/configuration-not-found') {
        errorMessage = 'Firebase Authentication is not enabled. Please enable Authentication in your Firebase console.';
        toast.error(errorMessage, { 
          duration: 6000,
          description: 'Go to Firebase Console → Authentication → Get Started to enable auth features'
        });
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.code !== 'auth/configuration-not-found') {
        toast.error(errorMessage);
      }
      throw error;
    }
  };

  const signInAsGuest = async () => {
    if (!isAuthEnabled()) {
      toast.success('Welcome to MoneyMigo Demo! 👋');
      return;
    }
    
    try {
      console.log('🔐 Signing in as guest...');
      await signInAnonymously(auth);
      toast.success('Welcome! You\'re using MoneyMigo as a guest 👋');
    } catch (error: any) {
      console.error('❌ Guest sign in error:', error);
      
      if (error.code === 'auth/configuration-not-found') {
        toast.error('Firebase Authentication not enabled. Please enable in Firebase console.', {
          duration: 6000,
          description: 'Go to Firebase Console → Authentication → Get Started'
        });
      } else {
        toast.error('Failed to sign in as guest');
      }
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!isAuthEnabled()) {
      toast.error('Firebase authentication not available in demo mode');
      return;
    }
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Welcome! Signed in with Google 🎉');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error('Failed to sign in with Google');
      throw error;
    }
  };

  const logout = async () => {
    if (!isAuthEnabled()) {
      toast.info('Demo session ended');
      window.location.reload();
      return;
    }
    
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out');
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isDemo,
    signIn,
    signUp,
    signInAsGuest,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};