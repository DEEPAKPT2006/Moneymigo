import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Brain, Send, Loader2, Calculator, TrendingUp, Target, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AIService } from './services/aiService';
import { Transaction } from './types';

interface ScenarioSimulatorProps {
  transactions: Transaction[];
}

interface ScenarioResponse {
  explanation: string;
  keyMetrics: Array<{
    label: string;
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  }>;
  chartData?: Array<{
    month: string;
    value: number;
    baseline?: number;
  }>;
  insights: string[];
}

const SAMPLE_SCENARIOS = [
  "If I take a ₹5,00,000 loan at 12% interest, how will it affect my savings?",
  "What happens if I increase my monthly expenses by 20%?",
  "If I save ₹10,000 per month, when will I reach ₹5,00,000?",
  "How would cutting dining out by 50% impact my budget?",
  "If I get a 15% salary increase, what should my new budget look like?"
];

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ transactions }) => {
  const [scenario, setScenario] = useState('');
  const [response, setResponse] = useState<ScenarioResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aiService = AIService.getInstance();

  const calculateFinancialBaseline = () => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const monthlyIncome = totalIncome / Math.max(1, getUniqueMonths());
    const monthlyExpenses = totalExpenses / Math.max(1, getUniqueMonths());
    
    return { monthlyIncome, monthlyExpenses, netSavings: monthlyIncome - monthlyExpenses };
  };

  const getUniqueMonths = () => {
    const months = new Set();
    transactions.forEach(t => {
      const date = new Date(t.date);
      months.add(`${date.getFullYear()}-${date.getMonth()}`);
    });
    return months.size || 1;
  };

  const parseScenarioResponse = (aiResponse: string): ScenarioResponse => {
    // Enhanced parsing logic for AI responses
    const lines = aiResponse.split('\n').filter(line => line.trim());
    
    let explanation = '';
    const keyMetrics: ScenarioResponse['keyMetrics'] = [];
    const insights: string[] = [];
    let chartData: ScenarioResponse['chartData'] = [];

    // Extract explanation (first few lines)
    const explanationLines = lines.slice(0, Math.min(3, lines.length));
    explanation = explanationLines.join(' ').replace(/[*#]/g, '').trim();

    // Extract numerical values and create metrics
    const { monthlyIncome, monthlyExpenses, netSavings } = calculateFinancialBaseline();
    
    // Parse scenario-specific calculations
    if (scenario.toLowerCase().includes('loan')) {
      const loanMatch = scenario.match(/₹([\d,]+)/);
      const interestMatch = scenario.match(/(\d+)%/);
      
      if (loanMatch && interestMatch) {
        const loanAmount = parseInt(loanMatch[1].replace(/,/g, ''));
        const interestRate = parseInt(interestMatch[1]);
        const monthlyEMI = calculateEMI(loanAmount, interestRate, 60); // 5 years
        
        keyMetrics.push(
          { label: 'Monthly EMI', value: `₹${monthlyEMI.toLocaleString()}`, type: 'negative' },
          { label: 'Impact on Savings', value: `₹${(netSavings - monthlyEMI).toLocaleString()}`, type: netSavings > monthlyEMI ? 'positive' : 'negative' },
          { label: 'Total Interest', value: `₹${((monthlyEMI * 60) - loanAmount).toLocaleString()}`, type: 'neutral' }
        );

        // Generate chart data for loan impact
        chartData = Array.from({ length: 12 }, (_, i) => ({
          month: `Month ${i + 1}`,
          value: netSavings - monthlyEMI,
          baseline: netSavings
        }));
      }
    } else if (scenario.toLowerCase().includes('increase') && scenario.includes('%')) {
      const increaseMatch = scenario.match(/(\d+)%/);
      if (increaseMatch) {
        const increasePercent = parseInt(increaseMatch[1]);
        const newExpenses = monthlyExpenses * (1 + increasePercent / 100);
        const newSavings = monthlyIncome - newExpenses;
        
        keyMetrics.push(
          { label: 'New Monthly Expenses', value: `₹${newExpenses.toLocaleString()}`, type: 'negative' },
          { label: 'New Monthly Savings', value: `₹${newSavings.toLocaleString()}`, type: newSavings > 0 ? 'positive' : 'negative' },
          { label: 'Impact', value: `₹${(newSavings - netSavings).toLocaleString()}`, type: 'negative' }
        );

        chartData = Array.from({ length: 12 }, (_, i) => ({
          month: `Month ${i + 1}`,
          value: newSavings,
          baseline: netSavings
        }));
      }
    } else if (scenario.toLowerCase().includes('save') && scenario.includes('₹')) {
      const saveMatch = scenario.match(/₹([\d,]+)/);
      const targetMatch = scenario.match(/₹([\d,]+).*?(?:reach|target)/i);
      
      if (saveMatch) {
        const monthlySaving = parseInt(saveMatch[1].replace(/,/g, ''));
        let targetAmount = 500000; // Default target
        
        if (targetMatch) {
          targetAmount = parseInt(targetMatch[1].replace(/,/g, ''));
        }
        
        const monthsToTarget = Math.ceil(targetAmount / monthlySaving);
        
        keyMetrics.push(
          { label: 'Monthly Savings', value: `₹${monthlySaving.toLocaleString()}`, type: 'positive' },
          { label: 'Target Amount', value: `₹${targetAmount.toLocaleString()}`, type: 'neutral' },
          { label: 'Time to Goal', value: `${monthsToTarget} months`, type: 'positive' }
        );

        chartData = Array.from({ length: Math.min(monthsToTarget, 24) }, (_, i) => ({
          month: `Month ${i + 1}`,
          value: monthlySaving * (i + 1),
          baseline: targetAmount
        }));
      }
    }

    // Extract insights from AI response
    lines.forEach(line => {
      if (line.includes('•') || line.includes('-') || line.includes('*')) {
        insights.push(line.replace(/[•\-*]/g, '').trim());
      }
    });

    // Add default insights if none found
    if (insights.length === 0) {
      insights.push(
        'Monitor your spending patterns regularly',
        'Consider setting up automatic savings',
        'Review and adjust your budget monthly'
      );
    }

    return {
      explanation: explanation || 'Analysis complete. Review the metrics below for detailed insights.',
      keyMetrics: keyMetrics.length > 0 ? keyMetrics : [
        { label: 'Current Monthly Income', value: `₹${monthlyIncome.toLocaleString()}`, type: 'positive' },
        { label: 'Current Monthly Expenses', value: `₹${monthlyExpenses.toLocaleString()}`, type: 'negative' },
        { label: 'Current Net Savings', value: `₹${netSavings.toLocaleString()}`, type: netSavings > 0 ? 'positive' : 'negative' }
      ],
      chartData: chartData.length > 0 ? chartData : undefined,
      insights: insights.slice(0, 4)
    };
  };

  const calculateEMI = (principal: number, rate: number, tenure: number): number => {
    const monthlyRate = rate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  };

  const analyzeScenario = async () => {
    if (!scenario.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use the dedicated scenario analysis method
      const financialData = {
        transactions,
        budgets: [], // Could be passed as prop if available
        goals: [] // Could be passed as prop if available
      };

      const aiResult = await aiService.analyzeScenario(financialData, scenario);
      const parsedResponse = parseScenarioResponse(aiResult);
      setResponse(parsedResponse);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze scenario');
      
      // Provide fallback response
      const fallbackResponse = parseScenarioResponse('Scenario analysis complete. Here are the calculated impacts based on your current financial data.');
      setResponse(fallbackResponse);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleScenario = (sampleScenario: string) => {
    setScenario(sampleScenario);
  };

  const getMetricColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-primary-600 bg-primary-50 border-primary-200';
    }
  };

  const hasApiKey = aiService.hasApiKey();

  return (
    <Card className="bg-gradient-to-br from-primary-50 via-teal-50 to-violet-50 border-primary-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary-900">
          <Brain className="h-5 w-5" />
          Scenario Simulator
          <Badge variant="secondary" className="ml-auto text-xs">
            AI-Powered
          </Badge>
        </CardTitle>
        <p className="text-sm text-text-secondary">
          Explore "what-if" financial scenarios with AI-driven insights and calculations
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!hasApiKey && (
          <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-warning-600" />
            <span className="text-sm text-warning-800">
              Configure your Gemini API key in Settings to enable AI analysis
            </span>
          </div>
        )}

        {/* Input Section */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Type your scenario... (e.g., What if I save ₹15,000 monthly?)"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzeScenario()}
              className="flex-1 bg-white border-primary-200 focus:border-primary-500 placeholder:text-text-placeholder"
            />
            <Button
              onClick={analyzeScenario}
              disabled={loading || !scenario.trim() || !hasApiKey}
              className="bg-primary-500 hover:bg-primary-600 shadow-sm px-4"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Sample Scenarios */}
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SCENARIOS.slice(0, 3).map((sample, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSampleScenario(sample)}
                className="text-xs border-primary-200 text-primary-700 hover:bg-primary-50 h-7"
                disabled={loading}
              >
                {sample.length > 40 ? sample.substring(0, 40) + '...' : sample}
              </Button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-error-50 border border-error-200 rounded-lg"
          >
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}

        {/* Response Section */}
        <AnimatePresence>
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <Separator />
              
              {/* Explanation */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <h4 className="font-medium text-text-primary mb-2 flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary-600" />
                  Analysis
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed">{response.explanation}</p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {response.keyMetrics.map((metric, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border text-center ${getMetricColor(metric.type)}`}
                  >
                    <p className="text-xs font-medium opacity-80 mb-1">{metric.label}</p>
                    <p className="text-sm font-semibold">{metric.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Chart */}
              {response.chartData && (
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <h4 className="font-medium text-text-primary mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary-600" />
                    Visual Impact
                  </h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={response.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        stroke="#64748B"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke="#64748B"
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                        labelStyle={{ color: '#1E293B' }}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#6366F1" 
                        strokeWidth={2}
                        dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
                      />
                      {response.chartData[0]?.baseline && (
                        <Line 
                          type="monotone" 
                          dataKey="baseline" 
                          stroke="#94A3B8" 
                          strokeWidth={1}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Insights */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <h4 className="font-medium text-text-primary mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary-600" />
                  Key Insights
                </h4>
                <ul className="space-y-2">
                  {response.insights.map((insight, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-sm text-text-secondary flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                      {insight}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};