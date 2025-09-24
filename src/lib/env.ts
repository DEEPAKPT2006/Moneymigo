// Environment variable utilities specifically for Vite

// Type-safe environment variable access
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_GEMINI_API_KEY?: string;
}

// Safe environment variable getter
export const getViteEnv = (): ImportMetaEnv => {
  try {
    return import.meta.env || {};
  } catch (error) {
    console.warn('Could not access import.meta.env:', error);
    return {};
  }
};

// Get a specific environment variable with fallback
export const getEnvValue = (key: keyof ImportMetaEnv, fallback: string = ''): string => {
  const env = getViteEnv();
  return env[key] || fallback;
};

// Firebase configuration with your specific Firebase project
export const getFirebaseEnvConfig = () => {
  return {
    apiKey: getEnvValue('VITE_FIREBASE_API_KEY', 'AIzaSyCu5MoM51Jiq80o9uP_RemXhu_v4s6UTLE'),
    authDomain: getEnvValue('VITE_FIREBASE_AUTH_DOMAIN', 'studio-4094080917-c3f91.firebaseapp.com'),
    projectId: getEnvValue('VITE_FIREBASE_PROJECT_ID', 'studio-4094080917-c3f91'),
    storageBucket: getEnvValue('VITE_FIREBASE_STORAGE_BUCKET', 'studio-4094080917-c3f91.firebasestorage.app'),
    messagingSenderId: getEnvValue('VITE_FIREBASE_MESSAGING_SENDER_ID', '700956497008'),
    appId: getEnvValue('VITE_FIREBASE_APP_ID', '1:700956497008:web:fd4beeab153e79241250b5')
  };
};

// Check if Firebase is properly configured
export const checkFirebaseConfig = (): boolean => {
  const config = getFirebaseEnvConfig();
  
  const isValid = (
    config.apiKey !== 'demo-api-key-for-development' &&
    config.projectId !== 'demo-project' &&
    config.apiKey.length > 30 && // Firebase API keys are typically 39 characters
    config.projectId.length > 5 &&
    config.authDomain.includes('.firebaseapp.com') &&
    config.projectId === 'studio-4094080917-c3f91' // Ensure it's using the correct project
  );

  // Debug logging in development
  if (import.meta.env?.DEV) {
    console.log('🔍 Firebase Config Check:', {
      apiKeyValid: config.apiKey !== 'demo-api-key-for-development' && config.apiKey.length > 30,
      projectIdValid: config.projectId !== 'demo-project' && config.projectId.length > 5,
      authDomainValid: config.authDomain.includes('.firebaseapp.com'),
      overall: isValid,
      config: {
        apiKey: config.apiKey.substring(0, 10) + '...',
        projectId: config.projectId,
        authDomain: config.authDomain
      }
    });
  }

  return isValid;
};

// Get Gemini API key
export const getGeminiApiKey = (): string => {
  return getEnvValue('VITE_GEMINI_API_KEY', 'AIzaSyAjlFrMFPLr-T_wlTlJUxOBZXF_mKpvLVs');
};