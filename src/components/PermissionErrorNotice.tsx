import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertTriangle, X, ExternalLink, Settings } from 'lucide-react';

interface PermissionErrorNoticeProps {
  onShowRulesGuide: () => void;
}

export const PermissionErrorNotice: React.FC<PermissionErrorNoticeProps> = ({ onShowRulesGuide }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
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
                    Firestore Rules
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDismissed(true)}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <p className="text-sm text-red-700 dark:text-red-300">
                Firestore security rules are blocking access. The app will run in demo mode until this is fixed.
              </p>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShowRulesGuide}
                  className="text-xs h-7 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Fix Rules
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://console.firebase.google.com/project/studio-4094080917-c3f91/firestore/rules', '_blank')}
                  className="text-xs h-7 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Console
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
};