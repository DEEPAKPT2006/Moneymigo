import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Direct Firebase configuration for MoneyMigo
const firebaseConfig = {
  apiKey: "AIzaSyCu5MoM51Jiq80o9uP_RemXhu_v4s6UTLE",
  authDomain: "studio-4094080917-c3f91.firebaseapp.com",
  projectId: "studio-4094080917-c3f91",
  storageBucket: "studio-4094080917-c3f91.firebasestorage.app",
  messagingSenderId: "700956497008",
  appId: "1:700956497008:web:fd4beeab153e79241250b5"
};

// Initialize Firebase
let app: any = null;
let db: any = null;
let auth: any = null;
let authEnabled = false;
let firestoreEnabled = false;

try {
  console.log('🔥 Initializing Firebase with project:', firebaseConfig.projectId);
  
  app = initializeApp(firebaseConfig);
  
  // Initialize Firestore with error handling
  try {
    db = getFirestore(app);
    firestoreEnabled = true;
    console.log('✅ Firestore initialized successfully');
  } catch (firestoreError) {
    console.warn('⚠️ Firestore initialization failed:', firestoreError);
    db = null;
    firestoreEnabled = false;
  }
  
  // Initialize Auth with error handling
  try {
    auth = getAuth(app);
    authEnabled = true;
    console.log('✅ Firebase Authentication initialized successfully');
  } catch (authError) {
    console.warn('⚠️ Firebase Auth initialization failed:', authError);
    auth = null;
    authEnabled = false;
  }

  console.log('🔥 MoneyMigo connected to Firebase project:', firebaseConfig.projectId);
  console.log('📊 Services status:', { 
    auth: authEnabled ? 'enabled' : 'disabled',
    firestore: firestoreEnabled ? 'enabled' : 'disabled'
  });
  
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  console.error('Config used:', JSON.stringify(firebaseConfig, null, 2));
  
  // Continue with limited functionality
  app = null;
  db = null;
  auth = null;
  authEnabled = false;
  firestoreEnabled = false;
}

// Export configuration check functions
export const isFirebaseConfigured = () => {
  return !!(app && firebaseConfig.projectId === 'studio-4094080917-c3f91');
};

export const isAuthEnabled = () => {
  return authEnabled && !!auth;
};

export const isFirestoreEnabled = () => {
  return firestoreEnabled && !!db;
};

// Permission error state management
let permissionErrorDetected = false;

export const setPermissionError = (hasError: boolean) => {
  permissionErrorDetected = hasError;
};

export const hasPermissionError = () => {
  return permissionErrorDetected;
};

// Function to handle Firestore network issues
export const handleFirestoreNetworkError = async () => {
  if (!db) return false;
  
  try {
    await disableNetwork(db);
    await enableNetwork(db);
    console.log('🔄 Firestore network reset successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to reset Firestore network:', error);
    return false;
  }
};

export { db, auth, firebaseConfig, authEnabled, firestoreEnabled };
export default app;