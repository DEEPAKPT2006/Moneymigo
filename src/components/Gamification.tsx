import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  Trophy, 
  Flame, 
  Target, 
  Star, 
  Award, 
  TrendingUp, 
  Calendar,
  ShieldCheck,
  Coins,
  PiggyBank,
  Users,
  Medal,
  Crown
} from 'lucide-react';
import { Transaction } from './types';

interface GamificationProps {
  transactions: Transaction[];
}

export function Gamification({ transactions }: GamificationProps) {
  // Calculate streak based on consecutive days with transactions (savings behavior)
  const calculateSavingsStreak = () => {
    if (transactions.length === 0) return 0;
    
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);
    
    // Check for consecutive days with positive net balance or income > expenses
    for (let i = 0; i < 30; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayTransactions = transactions.filter(t => t.date === dateStr);
      
      if (dayTransactions.length === 0) {
        break;
      }
      
      const dayBalance = dayTransactions.reduce((acc, t) => 
        acc + (t.type === 'income' ? t.amount : -t.amount), 0
      );
      
      if (dayBalance >= 0) {
        streak++;
      } else {
        break;
      }
      
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  };

  // Calculate total savings
  const totalSavings = transactions.reduce((acc, t) => 
    acc + (t.type === 'income' ? t.amount : -t.amount), 0
  );

  // Calculate monthly savings average
  const monthlySavingsAverage = Math.max(0, totalSavings / Math.max(1, transactions.length / 30));

  const savingsStreak = calculateSavingsStreak();

  // Define badges with unlock conditions
  const badges = [
    {
      id: 'first-save',
      name: 'First Save',
      description: 'Made your first positive transaction',
      icon: PiggyBank,
      unlocked: totalSavings > 0,
      color: 'from-green-400 to-green-600'
    },
    {
      id: 'streak-master',
      name: 'Streak Master',
      description: 'Maintained a 7-day savings streak',
      icon: Flame,
      unlocked: savingsStreak >= 7,
      color: 'from-orange-400 to-red-600'
    },
    {
      id: 'big-saver',
      name: 'Big Saver',
      description: 'Saved over ₹10,000',
      icon: Trophy,  
      unlocked: totalSavings >= 10000,
      color: 'from-yellow-400 to-orange-600'
    },
    {
      id: 'consistent-tracker',
      name: 'Consistent Tracker',
      description: 'Added 20+ transactions',
      icon: Target,
      unlocked: transactions.length >= 20,
      color: 'from-primary-400 to-primary-600'
    },
    {
      id: 'expense-cutter',
      name: 'Expense Cutter',
      description: 'Reduced monthly expenses by 20%',
      icon: ShieldCheck,
      unlocked: false, // This would need historical data comparison
      color: 'from-purple-400 to-violet-600'
    },
    {
      id: 'crypto-explorer',
      name: 'Crypto Explorer',
      description: 'Made crypto-related transactions',
      icon: Coins,
      unlocked: transactions.some(t => 
        t.description?.toLowerCase().includes('crypto') ||
        t.description?.toLowerCase().includes('bitcoin') ||
        t.description?.toLowerCase().includes('ethereum')
      ),
      color: 'from-amber-400 to-yellow-600'
    }
  ];

  const unlockedBadges = badges.filter(badge => badge.unlocked);
  const lockedBadges = badges.filter(badge => !badge.unlocked);

  // Challenge progress
  const dailySavingsChallenge = {
    name: 'Save ₹500 daily for 30 days',
    target: 30,
    current: Math.min(savingsStreak, 30),
    reward: '₹15,000 total savings + Big Saver badge'
  };

  // Leaderboard data (placeholder)
  const leaderboard = [
    { name: 'You', streak: savingsStreak, savings: totalSavings },
    { name: 'Alex M.', streak: 15, savings: 25000 },
    { name: 'Sarah K.', streak: 12, savings: 18500 },
    { name: 'Mike R.', streak: 8, savings: 12300 }
  ].sort((a, b) => b.streak - a.streak);

  const userRank = leaderboard.findIndex(user => user.name === 'You') + 1;

  return (
    <div className="space-y-6">
      {/* Motivational Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 via-teal-600 to-violet-600 bg-clip-text text-transparent">
          Your Financial Journey
        </h2>
        <p className="text-muted-foreground mt-1">
          {savingsStreak > 0 
            ? `🔥 You're on a ${savingsStreak}-day savings streak, keep it up!`
            : "Start your savings streak today! 💪"
          }
        </p>
      </motion.div>

      {/* Main Gamification Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Badges Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-primary-50 via-violet-50 to-teal-50 border-primary-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-primary-900">
                <Award className="h-5 w-5" />
                Achievement Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {unlockedBadges.slice(0, 6).map((badge) => (
                  <motion.div
                    key={badge.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-center group cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center mb-2 mx-auto shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <badge.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-xs font-medium text-text-secondary group-hover:text-primary-700 transition-colors">
                      {badge.name}
                    </p>
                  </motion.div>
                ))}
                {lockedBadges.slice(0, 3 - unlockedBadges.length).map((badge) => (
                  <motion.div
                    key={badge.id}
                    className="text-center opacity-40"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mb-2 mx-auto">
                      <badge.icon className="h-6 w-6 text-gray-500" />
                    </div>
                    <p className="text-xs text-text-muted">{badge.name}</p>
                  </motion.div>
                ))}
              </div>
              <Badge variant="secondary" className="w-full justify-center">
                {unlockedBadges.length}/{badges.length} Unlocked
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        {/* Streak Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 via-warning-50 to-orange-100 border-orange-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <Flame className="h-5 w-5" />
                Savings Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {savingsStreak}
                </div>
                <p className="text-sm text-orange-700">
                  {savingsStreak === 1 ? 'day in a row' : 'days in a row'}
                </p>
              </div>
              
              {/* Streak Calendar View */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {Array.from({ length: 14 }, (_, i) => {
                  const isActive = i < savingsStreak;
                  return (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs ${
                        isActive 
                          ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white' 
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isActive ? '🔥' : ''}
                    </div>
                  );
                })}
              </div>
              
              <div className="text-center">
                <p className="text-xs text-orange-600 font-medium">
                  Next milestone: {Math.ceil((savingsStreak + 1) / 7) * 7} days
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Challenge Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-teal-50 via-teal-100 to-primary-50 border-teal-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-teal-900">
                <Target className="h-5 w-5" />
                Active Challenge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h4 className="font-medium text-teal-800 mb-2">
                  {dailySavingsChallenge.name}
                </h4>
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-teal-700 mb-1">
                    <span>{dailySavingsChallenge.current}/{dailySavingsChallenge.target} days</span>
                    <span>{Math.round((dailySavingsChallenge.current / dailySavingsChallenge.target) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(dailySavingsChallenge.current / dailySavingsChallenge.target) * 100} 
                    className="h-2"
                  />
                </div>
                <p className="text-xs text-teal-600 mb-4">
                  Reward: {dailySavingsChallenge.reward}
                </p>
              </div>
              
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-sm"
              >
                {dailySavingsChallenge.current === dailySavingsChallenge.target ? 'Claim Reward!' : 'Keep Going!'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Leaderboard Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-r from-primary-50 to-violet-50 border-primary-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary-900">
              <Users className="h-5 w-5" />
              Community Leaderboard
              <Badge variant="secondary" className="ml-auto">
                #{userRank}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.slice(0, 4).map((user, index) => (
                <motion.div
                  key={user.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    user.name === 'You' 
                      ? 'bg-gradient-to-r from-primary-100 to-violet-100 border border-primary-200' 
                      : 'bg-white/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {index === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
                    {index === 1 && <Medal className="h-4 w-4 text-gray-400" />}
                    {index === 2 && <Medal className="h-4 w-4 text-amber-600" />}
                    <span className="font-medium text-sm">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${user.name === 'You' ? 'text-purple-900' : 'text-gray-900'}`}>
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {user.streak} day streak • ₹{user.savings.toLocaleString()} saved
                    </p>
                  </div>
                  {user.name === 'You' && (
                    <Badge className="bg-purple-600">You</Badge>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}