import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ExternalLink, Shield, Lock, CheckCircle, Copy } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const FirestoreRulesGuide: React.FC = () => {
  const openFirestoreRules = () => {
    window.open('https://console.firebase.google.com/project/studio-4094080917-c3f91/firestore/rules', '_blank');
  };

  const rulesCode = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own data
    match /transactions/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /budgets/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /goals/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /userPreferences/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;

  const copyRulesToClipboard = () => {
    navigator.clipboard.writeText(rulesCode);
    toast.success('Rules copied to clipboard!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto p-6"
    >
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
            <CardTitle className="text-red-800 dark:text-red-200">
              Firestore Security Rules Setup Required
            </CardTitle>
            <Badge variant="destructive" className="text-xs">
              Permission Denied
            </Badge>
          </div>
          <CardDescription className="text-red-700 dark:text-red-300">
            Firestore is blocking access due to security rules. You need to configure rules to allow your app to read/write data.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
            <Lock className="h-4 w-4" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Current Issue:</strong> Firestore is enabled but security rules are blocking all access. 
              This is the default secure behavior to protect your data.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-medium text-red-800 dark:text-red-200">
              Quick Fix Steps:
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-xs font-medium">
                  1
                </span>
                <span className="text-red-700 dark:text-red-300">
                  Click the button below to open Firestore Rules in Firebase Console
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-xs font-medium">
                  2
                </span>
                <span className="text-red-700 dark:text-red-300">
                  Copy the security rules from the box below
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-xs font-medium">
                  3
                </span>
                <span className="text-red-700 dark:text-red-300">
                  Replace the existing rules and click <strong>"Publish"</strong>
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium">
                  ✓
                </span>
                <span className="text-green-700 dark:text-green-300">
                  Return here and refresh - all permission errors will be fixed!
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-red-800 dark:text-red-200">
                Security Rules for MoneyMigo:
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={copyRulesToClipboard}
                className="text-xs border-red-200 dark:border-red-700"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy Rules
              </Button>
            </div>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
              <pre>{rulesCode}</pre>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Button 
              onClick={openFirestoreRules}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Firestore Rules Console
            </Button>
            
            <div className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded p-3">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>What these rules do:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• Allow users to read/write only their own data</li>
                    <li>• Require authentication for all operations</li>
                    <li>• Protect data from unauthorized access</li>
                    <li>• Enable MoneyMigo's full functionality</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Security Note:</strong> These rules ensure only authenticated users can access their own data, 
              providing both functionality and security for your MoneyMigo app.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          Need simpler rules for testing? You can temporarily use more permissive rules, 
          but we recommend the secure rules above for production use.
        </p>
      </div>
    </motion.div>
  );
};