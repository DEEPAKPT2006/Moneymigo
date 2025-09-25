// Configuration utilities for MoneyMigo

// Get environment variables safely
export const getEnvVar = (key: string, fallback: string = ''): string => {
  try {
    // In Vite, import.meta.env is available in both client and server
    if (import.meta?.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
    return fallback;
  } catch (error) {
    console.warn(`Failed to read environment variable ${key}:`, error);
    return fallback;
  }
};

// Firebase configuration status with your specific Firebase project
export const getFirebaseConfig = () => {
  return {
    apiKey: getEnvVar('VITE_FIREBASE_API_KEY', 'AIzaSyCu5MoM51Jiq80o9uP_RemXhu_v4s6UTLE'),
    authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', 'studio-4094080917-c3f91.firebaseapp.com'),
    projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', 'studio-4094080917-c3f91'),
    storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', 'studio-4094080917-c3f91.firebasestorage.app'),
    messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', '700956497008'),
    appId: getEnvVar('VITE_FIREBASE_APP_ID', '1:700956497008:web:fd4beeab153e79241250b5')
  };
};

// Check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  const config = getFirebaseConfig();
  
  // Debug logging to help troubleshoot
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('🔍 Firebase Configuration Debug:', {
      apiKeyExists: !!config.apiKey,
      apiKeyLength: config.apiKey.length,
      apiKeyPreview: config.apiKey.substring(0, 10) + '...',
      projectId: config.projectId,
      isDemo: config.apiKey === 'demo-api-key-for-development',
      projectIsDemo: config.projectId === 'demo-project'
    });
  }
  
  const isConfigured = (
    config.apiKey !== 'demo-api-key-for-development' &&
    config.projectId !== 'demo-project' &&
    config.apiKey.length > 20 && // Real Firebase API keys are longer
    config.projectId.length > 5 &&
    config.projectId === 'studio-4094080917-c3f91' // Ensure using correct project
  );
  
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('🔍 Firebase Configured:', isConfigured);
  }
  
  return isConfigured;
};

// Development mode detection
export const isDevelopment = (): boolean => {
  try {
    return (
      getEnvVar('NODE_ENV', 'production') === 'development' ||
      getEnvVar('DEV', 'false') === 'true' ||
      (typeof window !== 'undefined' && window.location.hostname === 'localhost')
    );
  } catch (error) {
    return false;
  }
};

// Get Gemini API key
export const getGeminiApiKey = (): string => {
  return getEnvVar('VITE_GEMINI_API_KEY', 'AIzaSyAjlFrMFPLr-T_wlTlJUxOBZXF_mKpvLVs');
};

// Configuration summary for debugging
export const getConfigSummary = () => {
  const firebaseConfig = getFirebaseConfig();
  return {
    firebase: {
      configured: isFirebaseConfigured(),
      projectId: firebaseConfig.projectId,
      hasApiKey: !!firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10
    },
    environment: {
      isDev: isDevelopment(),
      hasGeminiKey: !!getGeminiApiKey()
    }
  };
};