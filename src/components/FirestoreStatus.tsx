import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { isFirestoreEnabled, handleFirestoreNetworkError } from '../lib/firebase';
import { Database, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

export const FirestoreStatus: React.FC = () => {
  const [isFirestoreReady, setIsFirestoreReady] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    // Check Firestore status periodically
    const checkFirestore = () => {
      const isEnabled = isFirestoreEnabled();
      setIsFirestoreReady(isEnabled);
    };

    checkFirestore();
    
    // Check every 30 seconds
    const interval = setInterval(checkFirestore, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const success = await handleFirestoreNetworkError();
      if (success) {
        setIsFirestoreReady(true);
        setDismissed(true);
      }
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setRetrying(false);
    }
  };

  const openFirestoreConsole = () => {
    window.open('https://console.firebase.google.com/project/studio-4094080917-c3f91/firestore', '_blank');
  };

  if (isFirestoreReady || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
      >
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-amber-800 dark:text-amber-200">
                  Database Connection Issue
                </strong>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDismissed(true)}
                  className="h-6 w-6 p-0 text-amber-600 hover:text-amber-800"
                >
                  ×
                </Button>
              </div>
              
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Firestore Database needs to be enabled in your Firebase console to fix connection errors.
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  disabled={retrying}
                  className="text-xs h-7 border-amber-200 dark:border-amber-700"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${retrying ? 'animate-spin' : ''}`} />
                  Retry
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openFirestoreConsole}
                  className="text-xs h-7 border-amber-200 dark:border-amber-700"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Fix Setup
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
};