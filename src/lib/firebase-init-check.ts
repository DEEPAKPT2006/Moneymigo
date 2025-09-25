// Firebase initialization verification
import { auth, db, firebaseConfig, isAuthEnabled, isFirebaseConfigured } from './firebase';

export const verifyFirebaseInit = (): boolean => {
  return isAuthEnabled();
};

export const getFirebaseStatus = () => {
  return {
    authReady: isAuthEnabled(),
    dbReady: isFirebaseConfigured(),
    projectId: firebaseConfig?.projectId,
    configured: isFirebaseConfigured(),
    authEnabled: isAuthEnabled()
  };
};