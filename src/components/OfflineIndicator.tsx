import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Alert, AlertDescription } from './ui/alert';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show offline message if already offline
    if (!navigator.onLine) {
      setShowOfflineMessage(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showOfflineMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
            <WifiOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              You're offline. Some features may not work until you reconnect.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
      
      {/* Show reconnected message briefly */}
      {isOnline && !showOfflineMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
          onAnimationComplete={() => {
            setTimeout(() => setShowOfflineMessage(false), 2000);
          }}
        >
          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
            <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Back online! Your data will sync automatically.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
};