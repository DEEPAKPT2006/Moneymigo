import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ExternalLink, Database, Cloud, CheckCircle, AlertCircle } from 'lucide-react';

export const FirestoreSetupGuide: React.FC = () => {
  const openFirebaseConsole = () => {
    window.open('https://console.firebase.google.com/project/studio-4094080917-c3f91/firestore', '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6"
    >
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-blue-800 dark:text-blue-200">
              Firestore Database Setup Required
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              Quick Fix
            </Badge>
          </div>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            Your MoneyMigo app needs Firestore Database to be enabled for cloud data storage and sync.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Connection Issues Detected:</strong> Firestore is not enabled in your Firebase project. 
              This causes the WebChannel connection errors you're seeing.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">
              Quick Setup Steps:
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
                  1
                </span>
                <span className="text-blue-700 dark:text-blue-300">
                  Click the button below to open Firestore in Firebase Console
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
                  2
                </span>
                <span className="text-blue-700 dark:text-blue-300">
                  Click <strong>"Create database"</strong> button
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
                  3
                </span>
                <span className="text-blue-700 dark:text-blue-300">
                  Choose <strong>"Start in test mode"</strong> for easy setup
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
                  4
                </span>
                <span className="text-blue-700 dark:text-blue-300">
                  Select a location (any region is fine)
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium">
                  ✓
                </span>
                <span className="text-green-700 dark:text-green-300">
                  Return here and refresh - all connection errors will be fixed!
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Button 
              onClick={openFirebaseConsole}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Firestore Console
            </Button>
            
            <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded p-3">
              <div className="flex items-start gap-2">
                <Cloud className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>What this enables:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• Real-time data sync across devices</li>
                    <li>• Secure cloud backup</li>
                    <li>• Offline support with auto-sync</li>
                    <li>• Multi-user support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>Good news:</strong> Your Firebase project is properly configured - just needs Firestore enabled!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          Don't want cloud storage right now? 
          <br />
          <strong>MoneyMigo works perfectly in demo mode!</strong> 
          Your data will be stored locally on this device.
        </p>
      </div>
    </motion.div>
  );
};