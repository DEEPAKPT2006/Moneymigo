import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ExternalLink, Database, Zap, CheckCircle, Info } from 'lucide-react';

export const FirestoreIndexGuide: React.FC = () => {
  const openIndexConsole = () => {
    window.open('https://console.firebase.google.com/project/studio-4094080917-c3f91/firestore/indexes', '_blank');
  };

  const openTransactionIndex = () => {
    // This is the direct link from the error message
    window.open('https://console.firebase.google.com/v1/r/project/studio-4094080917-c3f91/firestore/indexes?create_composite=Clxwcm9qZWN0cy9zdHVkaW8tNDA5NDA4MDkxNy1jM2Y5MS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvdHJhbnNhY3Rpb25zL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI', '_blank');
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
              Firestore Index Setup Required
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              Performance
            </Badge>
          </div>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            Your queries need database indexes for optimal performance. This is a one-time setup that takes 30 seconds.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>What's happening:</strong> MoneyMigo uses optimized queries that require composite indexes. 
              The app is currently working with slower fallback queries.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">
              Super Quick Fix (Automatic):
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
                  1
                </span>
                <span className="text-blue-700 dark:text-blue-300">
                  Click the <strong>"Create Transaction Index"</strong> button below
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
                  2
                </span>
                <span className="text-blue-700 dark:text-blue-300">
                  Firebase will open with the index pre-configured - just click <strong>"Create Index"</strong>
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
                  3
                </span>
                <span className="text-blue-700 dark:text-blue-300">
                  Wait for index creation (usually 1-2 minutes)
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium">
                  ✓
                </span>
                <span className="text-green-700 dark:text-green-300">
                  Return here and refresh - ultra-fast queries will be active!
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Button 
              onClick={openTransactionIndex}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              Create Transaction Index (Auto-configured)
            </Button>
            
            <Button 
              onClick={openIndexConsole}
              variant="outline"
              className="w-full border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Index Console (Manual)
            </Button>
            
            <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded p-3">
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>What indexes do for you:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• Lightning-fast transaction loading</li>
                    <li>• Real-time updates with minimal delay</li>
                    <li>• Efficient data sorting and filtering</li>
                    <li>• Better performance for large datasets</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>Good news:</strong> The app is working perfectly right now with fallback queries. 
              Creating indexes will just make it faster!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          <strong>Don't want to create indexes right now?</strong> 
          <br />
          No problem! MoneyMigo is fully functional with the current fallback queries.
          Indexes just make things faster.
        </p>
      </div>
    </motion.div>
  );
};