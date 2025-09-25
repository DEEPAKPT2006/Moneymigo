import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { X, Shield, ExternalLink, AlertTriangle } from 'lucide-react';

export const PermissionErrorBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const originalError = console.error;
    let errorDetected = false;
    
    console.error = (...args) => {
      const message = args.join(' ');
      
      if (
        (message.includes('permission-denied') || 
         message.includes('Missing or insufficient permissions') ||
         message.includes('FIRESTORE_RULES_ERROR')) &&
        !errorDetected &&
        !dismissed
      ) {
        errorDetected = true;
        setShowBanner(true);
      }
      
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, [dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setShowBanner(false);
  };

  const handleFix = () => {
    window.open('https://console.firebase.google.com/project/studio-4094080917-c3f91/firestore/rules', '_blank');
  };

  if (!showBanner) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-3 shadow-lg"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-medium">🚨 Transactions Blocked - Security Rules Need Setup</p>
                <p className="text-sm text-red-100">
                  Quick 30-second fix: Configure Firestore security rules to enable saving transactions
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleFix}
                className="bg-white text-red-600 hover:bg-red-50"
              >
                <Shield className="h-4 w-4 mr-1" />
                Fix Now
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-white hover:bg-red-700 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};