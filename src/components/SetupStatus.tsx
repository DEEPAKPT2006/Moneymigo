import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ExternalLink, 
  Database, 
  Shield, 
  Zap,
  Settings,
  X
} from 'lucide-react';
import { isFirebaseConfigured, isAuthEnabled, isFirestoreEnabled } from '../lib/firebase';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'complete' | 'error' | 'pending';
  action?: {
    label: string;
    url: string;
  };
  icon: React.ComponentType<{ className?: string }>;
}

export const SetupStatus: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [steps, setSteps] = useState<SetupStep[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    // Check setup status
    const firebaseConnected = isFirebaseConfigured();
    const authReady = isAuthEnabled();
    const firestoreReady = isFirestoreEnabled();
    
    const setupSteps: SetupStep[] = [
      {
        id: 'firebase',
        title: 'Firebase Project',
        description: 'Connected to Firebase backend',
        status: firebaseConnected ? 'complete' : 'error',
        icon: Database,
        action: !firebaseConnected ? {
          label: 'Configure Firebase',
          url: 'https://console.firebase.google.com/project/studio-4094080917-c3f91'
        } : undefined
      },
      {
        id: 'auth',
        title: 'Authentication',
        description: 'User login and signup features',
        status: authReady ? 'complete' : 'error',
        icon: Shield,
        action: !authReady ? {
          label: 'Enable Auth',
          url: 'https://console.firebase.google.com/project/studio-4094080917-c3f91/authentication/users'
        } : undefined
      },
      {
        id: 'firestore',
        title: 'Firestore Database',
        description: 'Cloud data storage and sync',
        status: firestoreReady ? 'complete' : 'error',
        icon: Database,
        action: !firestoreReady ? {
          label: 'Enable Firestore',
          url: 'https://console.firebase.google.com/project/studio-4094080917-c3f91/firestore'
        } : undefined
      },
      {
        id: 'rules',
        title: 'Security Rules',
        description: 'Data access permissions',
        status: 'pending', // We'll detect this dynamically
        icon: Shield,
        action: {
          label: 'Configure Rules',
          url: 'https://console.firebase.google.com/project/studio-4094080917-c3f91/firestore/rules'
        }
      },
      {
        id: 'indexes',
        title: 'Database Indexes',
        description: 'Performance optimization',
        status: 'pending',
        icon: Zap,
        action: {
          label: 'Create Indexes',
          url: 'https://console.firebase.google.com/project/studio-4094080917-c3f91/firestore/indexes'
        }
      }
    ];

    setSteps(setupSteps);
    
    // Calculate completion percentage
    const completed = setupSteps.filter(step => step.status === 'complete').length;
    const total = setupSteps.length;
    setCompletionPercentage((completed / total) * 100);
    
    // Show setup status if not everything is complete
    setIsVisible(completed < total);
    
    // Auto-hide if everything is working
    if (completed === total) {
      setTimeout(() => setIsVisible(false), 3000);
    }
  }, []);

  // Listen for console errors to detect rules/index issues
  useEffect(() => {
    const originalError = console.error;
    
    console.error = (...args) => {
      const message = args.join(' ');
      
      if (message.includes('permission-denied')) {
        setSteps(prev => prev.map(step => 
          step.id === 'rules' ? { ...step, status: 'error' as const } : step
        ));
      }
      
      if (message.includes('failed-precondition') && message.includes('index')) {
        setSteps(prev => prev.map(step => 
          step.id === 'indexes' ? { ...step, status: 'error' as const } : step
        ));
      }
      
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  const hasErrors = steps.some(step => step.status === 'error');
  const allComplete = steps.every(step => step.status === 'complete');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 left-4 z-50 w-96"
      >
        <Card className={`border-2 ${
          allComplete ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800' :
          hasErrors ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800' :
          'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800'
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  MoneyMigo Setup
                  <Badge variant={allComplete ? "default" : hasErrors ? "destructive" : "secondary"} className="text-xs">
                    {Math.round(completionPercentage)}% Complete
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  {allComplete ? 'Setup complete! All features enabled.' :
                   hasErrors ? 'Some features need configuration' :
                   'Setting up your financial app'}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <Progress value={completionPercentage} className="h-2" />
          </CardHeader>

          <CardContent className="space-y-3">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {step.status === 'complete' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : step.status === 'error' ? (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-600" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <step.icon className="h-3 w-3" />
                    <span className="text-sm font-medium">{step.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                
                {step.action && step.status !== 'complete' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(step.action!.url, '_blank')}
                    className="text-xs h-7"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {step.action.label}
                  </Button>
                )}
              </div>
            ))}
            
            {hasErrors && (
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 mt-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Don't worry!</strong> MoneyMigo works perfectly in demo mode. 
                  Complete the setup for cloud features and multi-device sync.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};