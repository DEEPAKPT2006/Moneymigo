// Service Worker Cleanup Utility
// Helps resolve issues with stale service workers and cached resources

export const cleanupServiceWorkers = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    if (registrations.length === 0) {
      console.log('No service workers found');
      return true;
    }

    console.log(`Found ${registrations.length} service worker(s), cleaning up...`);
    
    const unregisterPromises = registrations.map(async (registration) => {
      try {
        const result = await registration.unregister();
        console.log('Service worker unregistered:', result);
        return result;
      } catch (error) {
        console.error('Failed to unregister service worker:', error);
        return false;
      }
    });

    const results = await Promise.all(unregisterPromises);
    const allSuccessful = results.every(result => result === true);
    
    if (allSuccessful) {
      console.log('✅ All service workers cleaned up successfully');
    } else {
      console.warn('⚠️ Some service workers could not be cleaned up');
    }
    
    return allSuccessful;
  } catch (error) {
    console.error('Error cleaning up service workers:', error);
    return false;
  }
};

export const clearAllCaches = async (): Promise<boolean> => {
  if (!('caches' in window)) {
    console.log('Cache API not supported');
    return false;
  }

  try {
    const cacheNames = await caches.keys();
    
    if (cacheNames.length === 0) {
      console.log('No caches found');
      return true;
    }

    console.log(`Found ${cacheNames.length} cache(s), clearing...`);
    
    const deletePromises = cacheNames.map(async (cacheName) => {
      try {
        const result = await caches.delete(cacheName);
        console.log(`Cache '${cacheName}' deleted:`, result);
        return result;
      } catch (error) {
        console.error(`Failed to delete cache '${cacheName}':`, error);
        return false;
      }
    });

    const results = await Promise.all(deletePromises);
    const allSuccessful = results.every(result => result === true);
    
    if (allSuccessful) {
      console.log('✅ All caches cleared successfully');
    } else {
      console.warn('⚠️ Some caches could not be cleared');
    }
    
    return allSuccessful;
  } catch (error) {
    console.error('Error clearing caches:', error);
    return false;
  }
};

export const detectStaleResources = (): string[] => {
  const issues: string[] = [];
  
  // Check for common stale resource indicators
  const scripts = Array.from(document.scripts);
  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  
  // Check for failed script loads
  scripts.forEach((script, index) => {
    if (script.src && !script.src.startsWith('data:')) {
      // Check if script seems stale (basic heuristic)
      if (script.src.includes('chunk') && script.onerror) {
        issues.push(`Potentially stale script chunk: ${script.src}`);
      }
    }
  });
  
  // Check for missing stylesheets
  stylesheets.forEach((link) => {
    const linkElement = link as HTMLLinkElement;
    if (linkElement.href && linkElement.sheet === null) {
      issues.push(`Failed to load stylesheet: ${linkElement.href}`);
    }
  });
  
  return issues;
};

export const performFullCleanup = async (): Promise<void> => {
  console.log('🧹 Starting full cleanup...');
  
  try {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear service workers
    await cleanupServiceWorkers();
    
    // Clear caches
    await clearAllCaches();
    
    // Clear IndexedDB (if any)
    if ('indexedDB' in window) {
      try {
        // This is a basic cleanup - specific DB names would need to be known for thorough cleanup
        console.log('IndexedDB cleanup may require manual intervention for specific databases');
      } catch (error) {
        console.warn('IndexedDB cleanup failed:', error);
      }
    }
    
    console.log('✅ Full cleanup completed');
    
    // Force a hard reload
    window.location.reload();
    
  } catch (error) {
    console.error('❌ Full cleanup failed:', error);
    // Still try to reload even if cleanup failed
    window.location.reload();
  }
};

// Development helper to detect and fix common issues
export const developmentDiagnostics = () => {
  if (!import.meta.env?.DEV) {
    return;
  }
  
  console.group('🔍 Development Diagnostics');
  
  // Check for stale resources
  const staleResources = detectStaleResources();
  if (staleResources.length > 0) {
    console.warn('Stale resources detected:', staleResources);
  }
  
  // Check for service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      if (registrations.length > 0) {
        console.log(`Active service workers: ${registrations.length}`);
        registrations.forEach((reg, index) => {
          console.log(`SW ${index + 1}:`, reg.scope);
        });
      }
    });
  }
  
  // Check for caches
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      if (cacheNames.length > 0) {
        console.log(`Active caches: ${cacheNames.length}`, cacheNames);
      }
    });
  }
  
  // Check network connectivity
  console.log('Network status:', {
    online: navigator.onLine,
    connection: (navigator as any).connection?.effectiveType || 'unknown'
  });
  
  console.groupEnd();
};

// Auto-run diagnostics in development
if (import.meta.env?.DEV) {
  // Run diagnostics after a short delay to let the app initialize
  setTimeout(developmentDiagnostics, 2000);
}