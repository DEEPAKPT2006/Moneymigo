import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Settings, Shield, ExternalLink } from 'lucide-react';

export const QuickFixButton: React.FC = () => {
  const [showButton, setShowButton] = useState(false);
  const [permissionErrors, setPermissionErrors] = useState(0);

  useEffect(() => {
    let errorCount = 0;
    const originalError = console.error;
    
    console.error = (...args) => {
      const message = args.join(' ');
      
      if (
        message.includes('permission-denied') ||
        message.includes('Missing or insufficient permissions') ||
        message.includes('FIRESTORE_RULES_ERROR')
      ) {
        errorCount++;
        setPermissionErrors(errorCount);
        setShowButton(true);
      }
      
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  const handleQuickFix = () => {
    window.open('https://console.firebase.google.com/project/studio-4094080917-c3f91/firestore/rules', '_blank');
    toast.success('Firebase Console opened!', {
      description: 'Copy the rules from the documentation and paste them in the console',
      duration: 5000
    });
  };

  if (!showButton) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleQuickFix}
                className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 relative animate-pulse"
              >
                <Shield className="h-7 w-7" />
                {permissionErrors > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-red-600 rounded-full h-7 w-7 flex items-center justify-center text-xs font-bold animate-bounce">
                    {permissionErrors > 9 ? '9+' : permissionErrors}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span>Fix Firestore Permission Errors</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    </AnimatePresence>
  );
};