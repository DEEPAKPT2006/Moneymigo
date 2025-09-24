import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ExternalLink, Shield, Database, Users, CheckCircle } from 'lucide-react';

export const AuthSetupGuide: React.FC = () => {
  const openFirebaseConsole = () => {
    window.open('https://console.firebase.google.com/project/studio-4094080917-c3f91/authentication/users', '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6"
    >
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <CardTitle className="text-orange-800 dark:text-orange-200">
              Authentication Setup Required
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              Quick Fix
            </Badge>
          </div>
          <CardDescription className="text-orange-700 dark:text-orange-300">
            Firebase Authentication needs to be enabled in your Firebase console to use login features.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <Database className="h-4 w-4" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Good news!</strong> Your Firebase project is connected and working. 
              You just need to enable Authentication to unlock user accounts.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-medium text-orange-800 dark:text-orange-200">
              Quick Setup Steps:
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-xs font-medium">
                  1
                </span>
                <span className="text-orange-700 dark:text-orange-300">
                  Click the button below to open your Firebase console
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-xs font-medium">
                  2
                </span>
                <span className="text-orange-700 dark:text-orange-300">
                  Click <strong>"Get Started"</strong> in the Authentication section
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-xs font-medium">
                  3
                </span>
                <span className="text-orange-700 dark:text-orange-300">
                  Enable <strong>"Email/Password"</strong> sign-in method
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium">
                  ✓
                </span>
                <span className="text-green-700 dark:text-green-300">
                  Return here and refresh the page - authentication will work!
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Button 
              onClick={openFirebaseConsole}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Firebase Console
            </Button>
            
            <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 rounded p-3">
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>What you'll get:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• User registration and login</li>
                    <li>• Data sync across devices</li>
                    <li>• Secure cloud storage</li>
                    <li>• Google sign-in (optional)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          Don't want to set up authentication right now? 
          <br />
          <strong>MoneyMigo works perfectly in demo mode!</strong> 
          Your data is stored locally on this device.
        </p>
      </div>
    </motion.div>
  );
};