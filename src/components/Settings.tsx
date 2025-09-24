import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Badge } from './ui/badge';
import { Download, Trash2, Plus, X, Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './types';

interface SettingsProps {
  transactions: Transaction[];
  onExportData: (format: 'csv' | 'pdf') => void;
  onResetApp: () => void;
  customCategories: string[];
  onAddCustomCategory: (category: string, type: 'income' | 'expense') => void;
  onDeleteCustomCategory: (category: string) => void;
}

export function Settings({ 
  transactions, 
  onExportData, 
  onResetApp, 
  customCategories, 
  onAddCustomCategory, 
  onDeleteCustomCategory 
}: SettingsProps) {
  const [newCategory, setNewCategory] = useState('');
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState('INR');

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    onAddCustomCategory(newCategory.trim(), categoryType);
    setNewCategory('');
  };

  const exportToCsv = () => {
    const csvContent = [
      ['Date', 'Type', 'Category', 'Amount', 'Description', 'Recurring'].join(','),
      ...transactions.map(t => [
        t.date,
        t.type,
        t.category,
        t.amount,
        `"${t.description}"`,
        t.recurring ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'expense-tracker-data.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportToPdf = () => {
    // Simple PDF export - in a real app, you'd use a library like jsPDF
    const content = `
      EXPENSE TRACKER REPORT
      Generated on: ${new Date().toLocaleDateString()}
      
      SUMMARY:
      Total Transactions: ${transactions.length}
      Total Income: ₹${transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
      Total Expenses: ₹${transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
      Net Balance: ₹${transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0).toLocaleString()}
      
      TRANSACTIONS:
      ${transactions.map(t => `${t.date} | ${t.type.toUpperCase()} | ${t.category} | ₹${t.amount} | ${t.description}`).join('\n')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'expense-tracker-report.txt');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <SettingsIcon className="h-6 w-6" />
        <h2 className="text-xl">Settings</h2>
      </motion.div>

      {/* App Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>App Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-gray-600">Switch to dark theme</p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
                <Moon className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications</Label>
                <p className="text-sm text-gray-600">Get budget and goal alerts</p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Currency</Label>
                <p className="text-sm text-gray-600">Primary currency for display</p>
              </div>
              <Badge variant="outline">₹ INR</Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Custom Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Manage Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add custom category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <Button
                onClick={() => setCategoryType(categoryType === 'expense' ? 'income' : 'expense')}
                variant="outline"
                size="sm"
              >
                {categoryType}
              </Button>
              <Button onClick={handleAddCategory} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {customCategories.length > 0 && (
              <div>
                <Label className="text-sm">Custom Categories</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {customCategories.map(category => (
                    <Badge key={category} variant="secondary" className="flex items-center gap-1">
                      {category}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => onDeleteCustomCategory(category)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm">Default Categories</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-xs text-gray-600 mb-2">Expense Categories</p>
                  <div className="flex flex-wrap gap-1">
                    {EXPENSE_CATEGORIES.map(category => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-2">Income Categories</p>
                  <div className="flex flex-wrap gap-1">
                    {INCOME_CATEGORIES.map(category => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm mb-2 block">Export Data</Label>
              <div className="flex gap-2">
                <Button onClick={exportToCsv} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={exportToPdf} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Export all your transaction data for backup or analysis
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset All Data</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your transactions, 
                    budgets, and goals. Make sure to export your data first if you want to keep a backup.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onResetApp}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Yes, Reset Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </motion.div>

      {/* App Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>App Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Transactions</p>
                <p className="font-medium">{transactions.length}</p>
              </div>
              <div>
                <p className="text-gray-600">App Version</p>
                <p className="font-medium">1.0.0</p>
              </div>
              <div>
                <p className="text-gray-600">Data Storage</p>
                <p className="font-medium">Local Storage</p>
              </div>
              <div>
                <p className="text-gray-600">Last Backup</p>
                <p className="font-medium">Never</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500 text-center">
                Built with React, Tailwind CSS, and Recharts<br />
                Your data is stored locally on your device
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}