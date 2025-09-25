import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertTriangle, X, ExternalLink, Settings, Shield } from 'lucide-react';

interface PermissionErrorDetectorProps {
  onPermissionError: (hasError: boolean) => void;
}

export const PermissionErrorDetector: React.FC<PermissionErrorDetectorProps> = ({ onPermissionError }) => {
  const [showNotice, setShowNotice] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    // Enhanced error detection for permission issues
    const originalConsoleError = console.error;
    
    console.error = (...args) => {
      const message = args.join(' ');
      
      // Detect various forms of permission errors
      if (
        message.includes('permission-denied') ||
        message.includes('Missing or insufficient permissions') ||
        message.includes('FIRESTORE_RULES_ERROR') ||
        (message.includes('FirebaseError') && message.includes('[code=permission-denied]'))
      ) {
        console.warn('🔒 Permission error detected by global monitor');
        setErrorCount(prev => prev + 1);
        setShowNotice(true);
        onPermissionError(true);
      }
      
      // Call original console.error
      originalConsoleError.apply(console, args);
    };

    // Listen for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      const message = error?.message || error?.toString() || '';
      
      if (
        error?.code === 'permission-denied' ||
        message.includes('permission-denied') ||
        message.includes('Missing or insufficient permissions')
      ) {
        console.warn('🔒 Permission error detected in promise rejection');
        setErrorCount(prev => prev + 1);
        setShowNotice(true);
        onPermissionError(true);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.error = originalConsoleError;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [onPermissionError]);

  const handleDismiss = () => {
    setShowNotice(false);
  };

  const openFirestoreRules = () => {
    window.open('https://console.firebase.google.com/project/studio-4094080917-c3f91/firestore/rules', '_blank');
    handleDismiss();
  };

  if (!showNotice) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
      >
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <strong className="text-red-800 dark:text-red-200">
                    Permission Denied
                  </strong>
                  <Badge variant="destructive" className="text-xs">
                    {errorCount} error{errorCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <p className="text-sm text-red-700 dark:text-red-300">
                Firestore security rules are blocking access. Configure rules to enable all features.
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openFirestoreRules}
                  className="text-xs h-7 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Fix Rules
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-xs h-7 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
};