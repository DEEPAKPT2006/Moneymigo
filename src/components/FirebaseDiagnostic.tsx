import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  Database,
  Shield,
  Zap
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { isFirebaseConfigured, isAuthEnabled, isFirestoreEnabled } from '../lib/firebase';
import { addTransaction, getUserTransactions } from '../lib/firebase-services';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'testing';
  message: string;
  action?: {
    label: string;
    url: string;
  };
}

export const FirebaseDiagnostic: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    const diagnosticResults: DiagnosticResult[] = [];

    // Test 1: Firebase Configuration
    diagnosticResults.push({
      name: 'Firebase Configuration',
      status: isFirebaseConfigured() ? 'success' : 'error',
      message: isFirebaseConfigured() 
        ? 'Firebase project connected successfully'
        : 'Firebase configuration missing or invalid'
    });

    // Test 2: Authentication
    diagnosticResults.push({
      name: 'Authentication Service',
      status: isAuthEnabled() ? 'success' : 'error',
      message: isAuthEnabled()
        ? 'Firebase Authentication enabled'
        : 'Firebase Authentication not available'
    });

    // Test 3: Firestore Database
    diagnosticResults.push({
      name: 'Firestore Database',
      status: isFirestoreEnabled() ? 'success' : 'error',
      message: isFirestoreEnabled()
        ? 'Firestore database connected'
        : 'Firestore database not enabled',
      action: !isFirestoreEnabled() ? {
        label: 'Enable Firestore',
        url: 'https://console.firebase.google.com/project/studio-4094080917-c3f91/firestore'
      } : undefined
    });

    // Test 4: User Authentication
    diagnosticResults.push({
      name: 'User Session',
      status: user ? 'success' : 'warning',
      message: user 
        ? `Authenticated as ${user.email || 'anonymous user'}`
        : 'Not authenticated - using guest mode'
    });

    // Test 5: Database Permissions
    if (user && isFirestoreEnabled()) {
      try {
        // Try to read user transactions
        await getUserTransactions(user.uid);
        diagnosticResults.push({
          name: 'Database Permissions',
          status: 'success',
          message: 'Database read permissions working correctly'
        });

        // Test write permissions by attempting a test transaction
        try {
          const testTransaction = {
            type: 'expense' as const,
            amount: 0.01,
            category: 'Test',
            description: 'Diagnostic test - safe to ignore',
            date: new Date().toISOString().split('T')[0],
            userId: user.uid
          };
          
          await addTransaction(user.uid, testTransaction);
          diagnosticResults.push({
            name: 'Database Write Access',
            status: 'success',
            message: 'Database write permissions working correctly'
          });
        } catch (writeError: any) {
          diagnosticResults.push({
            name: 'Database Write Access',
            status: 'error',
            message: `Write permission denied: ${writeError.message}`,
            action: {
              label: 'Fix Security Rules',
              url: 'https://console.firebase.google.com/project/studio-4094080917-c3f91/firestore/rules'
            }
          });
        }
      } catch (readError: any) {
        diagnosticResults.push({
          name: 'Database Permissions',
          status: 'error',
          message: `Read permission denied: ${readError.message}`,
          action: {
            label: 'Fix Security Rules',
            url: 'https://console.firebase.google.com/project/studio-4094080917-c3f91/firestore/rules'
          }
        });
      }
    } else if (!user) {
      diagnosticResults.push({
        name: 'Database Permissions',
        status: 'warning',
        message: 'Cannot test database permissions - not authenticated'
      });
    } else {
      diagnosticResults.push({
        name: 'Database Permissions',
        status: 'error',
        message: 'Cannot test database permissions - Firestore not enabled'
      });
    }

    // Test 6: Database Indexes
    diagnosticResults.push({
      name: 'Database Indexes',
      status: 'warning',
      message: 'Indexes may be required for optimal performance',
      action: {
        label: 'Create Indexes',
        url: 'https://console.firebase.google.com/project/studio-4094080917-c3f91/firestore/indexes'
      }
    });

    setResults(diagnosticResults);
    setTesting(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'testing':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Working</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge variant="secondary">Warning</Badge>;
      case 'testing':
        return <Badge className="bg-blue-100 text-blue-800">Testing...</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const overallStatus = results.length > 0 
    ? results.some(r => r.status === 'error') 
      ? 'error' 
      : results.some(r => r.status === 'warning') 
        ? 'warning' 
        : 'success'
    : 'testing';

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Firebase Diagnostics
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Testing Firebase configuration and permissions
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runDiagnostics}
            disabled={testing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testing...' : 'Retest'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Status */}
        <Alert className={
          overallStatus === 'success' ? 'border-green-200 bg-green-50' :
          overallStatus === 'error' ? 'border-red-200 bg-red-50' :
          'border-orange-200 bg-orange-50'
        }>
          {getStatusIcon(overallStatus)}
          <AlertDescription>
            <strong>
              {overallStatus === 'success' ? '✅ All systems operational' :
               overallStatus === 'error' ? '❌ Issues detected - transactions may fail' :
               '⚠️ Some warnings detected - app functional with limitations'}
            </strong>
          </AlertDescription>
        </Alert>

        {/* Individual Test Results */}
        <div className="space-y-3">
          {results.map((result, index) => (
            <motion.div
              key={result.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{result.name}</span>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                </div>
              </div>
              
              {result.action && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(result.action!.url, '_blank')}
                  className="ml-2"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {result.action.label}
                </Button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Quick Fix Actions */}
        {overallStatus === 'error' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Quick Fix Actions:</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://console.firebase.google.com/project/studio-4094080917-c3f91/firestore/rules', '_blank')}
                className="text-red-700 border-red-300"
              >
                <Shield className="h-3 w-3 mr-1" />
                Fix Security Rules
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://console.firebase.google.com/project/studio-4094080917-c3f91/firestore/indexes', '_blank')}
                className="text-red-700 border-red-300"
              >
                <Zap className="h-3 w-3 mr-1" />
                Create Indexes
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};