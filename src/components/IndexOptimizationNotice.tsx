import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Zap, X, ExternalLink, TrendingUp } from 'lucide-react';

export const IndexOptimizationNotice: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const [indexError, setIndexError] = useState(false);

  useEffect(() => {
    // Listen for console errors about indexes
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('failed-precondition') && message.includes('index')) {
        setTimeout(() => setIndexError(true), 1000); // Delay to avoid spam
      }
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      if (message.includes('Index not available') || message.includes('falling back to simple query')) {
        setTimeout(() => setIndexError(true), 1000);
      }
      originalWarn.apply(console, args);
    };

    // Check localStorage for previous dismissal
    const previouslyDismissed = localStorage.getItem('index-notice-dismissed');
    if (previouslyDismissed) {
      setDismissed(true);
    }

    // Auto-show after a few seconds of app usage to be helpful but not annoying
    const showTimer = setTimeout(() => {
      if (!previouslyDismissed) {
        setIndexError(true);
      }
    }, 5000);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      clearTimeout(showTimer);
    };
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('index-notice-dismissed', 'true');
  };

  const openTransactionIndex = () => {
    window.open('https://console.firebase.google.com/v1/r/project/studio-4094080917-c3f91/firestore/indexes?create_composite=Clxwcm9qZWN0cy9zdHVkaW8tNDA5NDA4MDkxNy1jM2Y5MS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvdHJhbnNhY3Rpb25zL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI', '_blank');
    handleDismiss(); // Auto-dismiss when user takes action
  };

  if (dismissed || !indexError) {
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
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <strong className="text-blue-800 dark:text-blue-200">
                    Performance Optimization Available
                  </strong>
                  <Badge variant="secondary" className="text-xs">
                    Optional
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Create database indexes to make MoneyMigo even faster. Takes 30 seconds!
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openTransactionIndex}
                  className="text-xs h-7 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Speed Up
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-xs h-7 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
};