import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { ArrowUpCircle, ArrowDownCircle, Edit, Trash2, Calendar, Receipt } from 'lucide-react';
import { Transaction } from './types';
import { format, parseISO, isToday, isYesterday, isThisWeek } from 'date-fns';

interface TransactionTimelineProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (transaction: Transaction) => void;
}

export function TransactionTimeline({ transactions, onDeleteTransaction, onEditTransaction }: TransactionTimelineProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Group transactions by date
  const groupedTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .reduce((groups, transaction) => {
      const date = transaction.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as Record<string, Transaction[]>);

  const getDateLabel = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isThisWeek(date)) return format(date, 'EEEE');
    return format(date, 'MMM dd, yyyy');
  };

  const getCategoryColor = (category: string, type: 'income' | 'expense') => {
    if (type === 'income') return 'bg-green-100 text-green-800';
    
    const colors: Record<string, string> = {
      'Food & Dining': 'bg-orange-100 text-orange-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Shopping': 'bg-purple-100 text-purple-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Bills & Utilities': 'bg-red-100 text-red-800',
      'Healthcare': 'bg-teal-100 text-teal-800',
      'Travel': 'bg-indigo-100 text-indigo-800',
      'Education': 'bg-yellow-100 text-yellow-800',
      'Groceries': 'bg-lime-100 text-lime-800',
    };
    
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (transactions.length === 0) {
    return (
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Receipt className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg mb-2 text-gray-600">No Transactions Yet</h3>
          <p className="text-gray-500">Add your first transaction to start tracking your expenses!</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-xl mb-6"
      >
        Transaction Timeline
      </motion.h2>

      <ScrollArea className="h-[600px]">
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([date, dayTransactions], groupIndex) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <h3 className="font-medium text-gray-900">{getDateLabel(date)}</h3>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="space-y-3">
                {dayTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (groupIndex * 0.1) + (index * 0.05) }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="cursor-pointer hover:shadow-md transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                              {transaction.type === 'income' ? (
                                <ArrowUpCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <ArrowDownCircle className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">
                                  {transaction.description || transaction.category}
                                </span>
                                <Badge className={getCategoryColor(transaction.category, transaction.type)}>
                                  {transaction.category}
                                </Badge>
                                {transaction.recurring && (
                                  <Badge variant="outline" className="text-xs">
                                    Recurring
                                  </Badge>
                                )}
                              </div>
                              {transaction.description && (
                                <p className="text-sm text-gray-600 truncate">
                                  {transaction.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                            </span>
                            
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditTransaction(transaction)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this transaction? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => onDeleteTransaction(transaction.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}