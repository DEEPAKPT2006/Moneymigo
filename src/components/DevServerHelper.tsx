import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';

export const DevServerHelper: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionIssues, setConnectionIssues] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionIssues(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionIssues(true);
    };

    // Listen for network changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for unhandled promise rejections (common with dev server issues)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason?.message || event.reason?.toString() || 'Unknown error';
      
      if (error.includes('timeout') || 
          error.includes('getPage') || 
          error.includes('fetch') ||
          error.includes('Failed to fetch')) {
        setConnectionIssues(true);
        setLastError(error);
        
        // For getPage timeout errors, provide specific guidance
        if (error.includes('getPage') && error.includes('timeout')) {
          setLastError('Browser communication timeout - usually fixed by hard refresh');
        }
      }
    };

    // Listen for global errors
    const handleError = (event: ErrorEvent) => {
      const error = event.message || event.error?.message || 'Unknown error';
      
      if (error.includes('timeout') || 
          error.includes('getPage') || 
          error.includes('Loading chunk')) {
        setConnectionIssues(true);
        
        // Provide user-friendly error messages
        if (error.includes('getPage') && error.includes('timeout')) {
          setLastError('Browser communication timeout detected');
        } else if (error.includes('Loading chunk')) {
          setLastError('JavaScript module loading failed');
        } else {
          setLastError(error);
        }
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Check development server connection periodically
    const checkDevServer = async () => {
      if (import.meta.env?.DEV) {
        try {
          // Try to fetch a simple resource to check if dev server is responsive
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          
          await fetch(window.location.origin + '/favicon.ico', {
            method: 'HEAD',
            signal: controller.signal
          });
          
          clearTimeout(timeout);
          setConnectionIssues(false);
        } catch (error) {
          console.warn('Dev server connection check failed:', error);
          setConnectionIssues(true);
          setLastError('Development server connection issues detected');
        }
      }
    };

    // Check every 30 seconds in development
    const interval = import.meta.env?.DEV ? setInterval(checkDevServer, 30000) : null;

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      if (interval) clearInterval(interval);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleClearAndRefresh = () => {
    try {
      // Clear any cached data that might be causing issues
      localStorage.removeItem('dev-server-errors');
      sessionStorage.clear();
      
      // Force reload without cache
      window.location.reload();
    } catch (error) {
      console.error('Error clearing cache:', error);
      window.location.reload();
    }
  };

  // Don't show in production
  if (!import.meta.env?.DEV) {
    return null;
  }

  // Only show if there are connection issues
  if (!connectionIssues && isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-amber-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <strong className="text-amber-800 dark:text-amber-200">
                {!isOnline ? 'Offline' : 'Dev Server Issues'}
              </strong>
            </div>
            
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {!isOnline 
                ? 'You appear to be offline. Some features may not work.'
                : lastError?.includes('getPage') 
                  ? 'Browser communication timeout - try hard refresh (Ctrl+F5)'
                  : 'Development server connection issues detected.'
              }
            </p>

            {lastError && (
              <p className="text-xs text-amber-600 dark:text-amber-400 truncate">
                {lastError}
              </p>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="text-xs h-7 border-amber-200 dark:border-amber-700"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAndRefresh}
                className="text-xs h-7 border-amber-200 dark:border-amber-700"
              >
                Clear & Refresh
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};