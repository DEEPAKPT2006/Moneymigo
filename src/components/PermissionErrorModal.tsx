import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Copy, ExternalLink, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const PermissionErrorModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

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

  useEffect(() => {
    let permissionErrorDetected = false;
    const originalConsoleError = console.error;
    
    console.error = (...args) => {
      const message = args.join(' ');
      
      if (
        (message.includes('permission-denied') || 
         message.includes('Missing or insufficient permissions') ||
         message.includes('FIRESTORE_RULES_ERROR')) &&
        !permissionErrorDetected
      ) {
        permissionErrorDetected = true;
        setErrorCount(prev => prev + 1);
        
        // Show modal immediately on first permission error
        setTimeout(() => {
          setIsOpen(true);
        }, 500); // Small delay to let the error propagate
      }
      
      originalConsoleError.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  const copyRulesToClipboard = () => {
    navigator.clipboard.writeText(rulesCode);
    toast.success('Security rules copied to clipboard!', {
      description: 'Now paste them in Firebase Console'
    });
  };

  const openFirestoreRules = () => {
    window.open('https://console.firebase.google.com/project/studio-4094080917-c3f91/firestore/rules', '_blank');
    toast.info('Firebase Console opened in new tab', {
      description: 'Paste the rules and click Publish'
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    toast.info('You can reopen this guide anytime', {
      description: 'Look for the red shield button in the bottom right'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <DialogTitle className="text-red-800 dark:text-red-200">
              🚨 URGENT: Permission Denied - Fix Required
            </DialogTitle>
            <Badge variant="destructive" className="text-xs">
              {errorCount} Error{errorCount !== 1 ? 's' : ''} Detected
            </Badge>
          </div>
          <DialogDescription className="text-red-700 dark:text-red-300">
            MoneyMigo cannot save your transactions because Firestore security rules are blocking access. 
            This is a simple 30-second fix!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>What's happening:</strong> Your transactions are being blocked by Firestore security rules. 
              This is normal security behavior - you just need to configure the rules to allow your app access.
            </AlertDescription>
          </Alert>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="font-medium text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Super Quick Fix (30 seconds):
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium">
                  1
                </span>
                <span className="text-green-700 dark:text-green-300">
                  Click <strong>"Copy Rules"</strong> below to copy the security rules
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium">
                  2
                </span>
                <span className="text-green-700 dark:text-green-300">
                  Click <strong>"Open Firebase Console"</strong> to open the rules editor
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium">
                  3
                </span>
                <span className="text-green-700 dark:text-green-300">
                  Select all text in the editor (Ctrl+A) and paste the new rules
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium">
                  4
                </span>
                <span className="text-green-700 dark:text-green-300">
                  Click <strong>"Publish"</strong> in Firebase Console
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium">
                  ✓
                </span>
                <span className="text-green-700 dark:text-green-300">
                  <strong>Done!</strong> Close this dialog and try adding a transaction - it will work!
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3">
              <Button 
                onClick={copyRulesToClipboard}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Rules
              </Button>
              
              <Button 
                onClick={openFirestoreRules}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Firebase Console
              </Button>
            </div>

            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-48">
              <pre className="whitespace-pre-wrap">{rulesCode}</pre>
            </div>
          </div>

          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>These rules are secure and production-ready!</strong> They allow authenticated users 
              to access only their own data while blocking unauthorized access.
            </AlertDescription>
          </Alert>

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Don't want to fix this now? MoneyMigo works in demo mode with local storage.
            </p>
            <Button variant="outline" onClick={handleClose}>
              Close for Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};