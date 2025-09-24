import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { RefreshCw, AlertTriangle, Bug } from 'lucide-react';

interface AppErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

const AppErrorFallback: React.FC<AppErrorFallbackProps> = ({ error, resetError }) => {
  const isTimeoutError = error.message?.includes('timeout') || error.message?.includes('getPage');
  const isDevelopmentError = error.message?.includes('HMR') || error.message?.includes('hot reload');

  const handleClearCache = () => {
    try {
      // Clear localStorage
      localStorage.clear();
      // Clear sessionStorage
      sessionStorage.clear();
      // Clear service worker cache if available
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => registration.unregister());
        });
      }
      // Clear browser cache (this will cause a reload)
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      // Force reload
      window.location.reload();
    } catch (error) {
      console.error('Error clearing cache:', error);
      window.location.reload();
    }
  };

  const handleHardRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-800 dark:text-red-200">
              {isTimeoutError ? 'Connection Timeout' : 'Application Error'}
            </CardTitle>
          </div>
          <CardDescription>
            {isTimeoutError 
              ? 'A communication timeout occurred. This is usually a temporary issue.'
              : 'Something went wrong with the application.'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isTimeoutError && (
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
              <Bug className="h-4 w-4" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong>Common causes:</strong> Browser extensions, service worker conflicts, 
                or development server issues. Try the solutions below.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button 
              onClick={resetError}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>

            <Button 
              onClick={handleHardRefresh}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Hard Refresh Page
            </Button>

            {isTimeoutError && (
              <Button 
                onClick={handleClearCache}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Cache & Reload
              </Button>
            )}
          </div>

          {isTimeoutError && (
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>If the issue persists:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Disable browser extensions temporarily</li>
                <li>Try opening in an incognito/private window</li>
                <li>Restart your development server</li>
                <li>Check browser console for additional errors</li>
                <li>Clear browser data completely</li>
              </ul>
            </div>
          )}

          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground">
              Error Details
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {error.message}
              {error.stack && '\n\nStack trace:\n' + error.stack}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  );
};

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

export const AppErrorBoundary: React.FC<AppErrorBoundaryProps> = ({ children }) => {
  return (
    <ErrorBoundary fallback={AppErrorFallback}>
      {children}
    </ErrorBoundary>
  );
};