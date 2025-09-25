import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dashboard } from './components/Dashboard';
import { AddTransaction } from './components/AddTransaction';
import { TransactionTimeline } from './components/TransactionTimeline';
import { Goals } from './components/Goals';
import { Insights } from './components/Insights';
import { Settings } from './components/Settings';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { DataProvider, useData } from './components/DataProvider';
import { DemoModeProvider, useDemoMode } from './components/DemoModeProvider';
import { LoginForm } from './components/LoginForm';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { OfflineIndicator } from './components/OfflineIndicator';
import { DevServerHelper } from './components/DevServerHelper';
import { FirebaseSetupNotice } from './components/FirebaseSetupNotice';
import { FirestoreStatus } from './components/FirestoreStatus';
import { IndexOptimizationNotice } from './components/IndexOptimizationNotice';
import { PermissionErrorDetector } from './components/PermissionErrorDetector';
import { SetupStatus } from './components/SetupStatus';
import { QuickFixButton } from './components/QuickFixButton';
import { PermissionErrorModal } from './components/PermissionErrorModal';
import { PermissionErrorBanner } from './components/PermissionErrorBanner';
import { ConfigDebug } from './components/ConfigDebug';
import { isFirebaseConfigured, isAuthEnabled } from './lib/firebase';
import { developmentDiagnostics } from './lib/service-worker-cleanup';
import { Toaster } from './components/ui/sonner';
import { Home, Receipt, Target, TrendingUp, Settings as SettingsIcon, Plus, LogOut, User } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import moneyMigoLogo from 'figma:asset/b3edf3ddae9003a736a0ff6bbd07af0225591f7b.png';

// Main App Component
const MainApp: React.FC = () => {
  const { user, logout, isDemo } = useAuth();
  const isFirebaseSetup = isFirebaseConfigured();
  const [globalPermissionError, setGlobalPermissionError] = useState(false);
  
  // Use demo mode provider if Firebase is not configured
  const dataHook = isDemo ? useDemoMode : useData;
  const {
    transactions,
    budgets,
    goals,
    customCategories,
    loading,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    addBudget,
    addGoal,
    addCustomCategory,
    deleteCustomCategory,
    exportData,
    resetAllData
  } = dataHook();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const handleEditTransaction = (transaction: any) => {
    // Edit functionality
    updateTransaction(transaction);
  };

  const handleAddCustomCategoryWrapper = (category: string, type: 'income' | 'expense') => {
    addCustomCategory(category);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your financial data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PermissionErrorBanner />
      {/* <OfflineIndicator /> */}
      <DevServerHelper />
      {/* <FirebaseSetupNotice isConfigured={isFirebaseSetup} /> */}
      <FirestoreStatus />
      {/* <IndexOptimizationNotice /> */}
      <PermissionErrorDetector onPermissionError={setGlobalPermissionError} />
      {/* <SetupStatus /> */}
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-6 border-b"
        >
          <div className="flex items-center gap-3">
            <motion.img
              src={moneyMigoLogo}
              alt="MoneyMigo Logo"
              className="w-10 h-10 object-contain"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">
                MoneyMigo
              </h1>
              <p className="text-sm text-muted-foreground">Smart financial management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setShowAddTransaction(true)}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-sm transition-all duration-200 hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-primary-500 to-teal-500 text-white">
                      {user?.email ? user.email[0].toUpperCase() : 'G'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {user?.isAnonymous ? 'Guest User' : user?.email}
                    </p>
                    {(user?.isAnonymous || isDemo) && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {isDemo ? 'Demo Mode - Data stored locally' : 'Your data is stored locally'}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={logout}
                  className="cursor-pointer text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.header>

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                <span className="hidden sm:inline">Timeline</span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Goals</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard
                  transactions={transactions}
                  onAddTransaction={() => setShowAddTransaction(true)}
                  onGoalsClick={() => setActiveTab('goals')}
                  onInsightsClick={() => setActiveTab('insights')}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="timeline" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TransactionTimeline
                  transactions={transactions}
                  onDeleteTransaction={deleteTransaction}
                  onEditTransaction={handleEditTransaction}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="goals" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Goals
                  transactions={transactions}
                  budgets={budgets}
                  goals={goals}
                  onAddBudget={addBudget}
                  onAddGoal={addGoal}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Insights 
                  transactions={transactions} 
                  budgets={budgets}
                  goals={goals}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Settings
                  transactions={transactions}
                  onExportData={exportData}
                  onResetApp={resetAllData}
                  customCategories={customCategories}
                  onAddCustomCategory={handleAddCustomCategoryWrapper}
                  onDeleteCustomCategory={deleteCustomCategory}
                />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.main>

        {/* Add Transaction Modal */}
        <AnimatePresence>
          {showAddTransaction && (
            <AddTransaction
              onAddTransaction={addTransaction}
              onClose={() => setShowAddTransaction(false)}
            />
          )}
        </AnimatePresence>

        {/* Toast Notifications */}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 3000,
          }}
        />
        
        {/* Configuration Debug (development only) */}
        <ConfigDebug />
        
        {/* Quick Fix Button for Permission Errors */}
        <QuickFixButton />
        
        {/* Permission Error Modal - Shows immediately when errors detected */}
        <PermissionErrorModal />
      </div>
    </div>
  );
};

// Root App Component with Providers
export default function App() {
  useEffect(() => {
    // Set up global error handlers for timeout issues
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason?.message || event.reason?.toString() || 'Unknown error';
      
      if (error.includes('getPage') && error.includes('timeout')) {
        console.warn('🔄 Detected getPage timeout error - this is usually a development environment issue');
        event.preventDefault(); // Prevent default error logging
        
        // Try to reload if the error persists
        const timeoutCount = parseInt(sessionStorage.getItem('timeout-count') || '0');
        if (timeoutCount < 3) {
          sessionStorage.setItem('timeout-count', (timeoutCount + 1).toString());
          console.log(`🔄 Timeout error ${timeoutCount + 1}/3, continuing...`);
        } else {
          console.log('🔄 Multiple timeout errors detected, consider refreshing the page');
          sessionStorage.removeItem('timeout-count');
        }
      }
    };

    const handleError = (event: ErrorEvent) => {
      const error = event.message || event.error?.message || 'Unknown error';
      
      if (error.includes('getPage') && error.includes('timeout')) {
        console.warn('🔄 Detected getPage timeout error in global error handler');
        event.preventDefault(); // Prevent default error logging
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Run development diagnostics in development mode
    if (import.meta.env?.DEV) {
      developmentDiagnostics();
    }

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}

// App Content Component that handles authentication state
const AppContent: React.FC = () => {
  const { user, loading, isDemo } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading MoneyMigo...</p>
        </motion.div>
      </div>
    );
  }

  // If auth is not enabled, always show login form (which will show setup guide)
  if (!isAuthEnabled() || (!user && !isDemo)) {
    return <LoginForm />;
  }

  if (isDemo) {
    return (
      <DemoModeProvider>
        <MainApp />
      </DemoModeProvider>
    );
  }

  return (
    <DataProvider>
      <MainApp />
    </DataProvider>
  );
};