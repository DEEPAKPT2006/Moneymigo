import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Info, X, ExternalLink, Settings, Database } from 'lucide-react';

interface FirebaseSetupNoticeProps {
  isConfigured: boolean;
}

export const FirebaseSetupNotice: React.FC<FirebaseSetupNoticeProps> = ({ isConfigured }) => {
  const [dismissed, setDismissed] = useState(false);

  if (isConfigured || dismissed) {
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
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-sm text-blue-800 dark:text-blue-200">
                  Firebase Configured
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  Cloud Ready
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDismissed(true)}
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <CardDescription className="text-blue-700 dark:text-blue-300 mb-3">
              MoneyMigo is now pre-configured with Firebase! This notice indicates you're running in development mode.
            </CardDescription>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-blue-200 text-blue-800 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-800/50"
                onClick={() => window.open('/FIREBASE_SETUP.md', '_blank')}
              >
                <Settings className="h-3 w-3 mr-2" />
                Set up Firebase
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
              
              <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded p-2">
                <strong>Firebase features active:</strong>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>✅ Cloud data backup & sync</li>
                  <li>✅ Multi-device access</li>
                  <li>✅ User authentication</li>
                  <li>✅ Real-time updates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};