import { Transaction, Budget, Goal } from '../types';

interface FinancialData {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export class AIService {
  private static instance: AIService;
  private apiKey: string | null = null;

  private constructor() {
    // Load API key from localStorage or use provided key
    this.apiKey = localStorage.getItem('gemini-api-key') || 'AIzaSyAjlFrMFPLr-T_wlTlJUxOBZXF_mKpvLVs';
    // Save the API key if it wasn't already stored
    if (!localStorage.getItem('gemini-api-key')) {
      localStorage.setItem('gemini-api-key', this.apiKey);
    }
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  setApiKey(key: string): void {
    this.apiKey = key;
    localStorage.setItem('gemini-api-key', key);
  }

  getApiKey(): string | null {
    return this.apiKey || localStorage.getItem('gemini-api-key');
  }

  clearApiKey(): void {
    this.apiKey = null;
    localStorage.removeItem('gemini-api-key');
  }

  hasApiKey(): boolean {
    return !!this.getApiKey();
  }

  async generateInsights(financialData: FinancialData): Promise<string> {
    return this.callAI(financialData, 'insights');
  }

  async generateStory(financialData: FinancialData): Promise<string> {
    return this.callAI(financialData, 'story');
  }

  async generatePredictions(financialData: FinancialData): Promise<string> {
    return this.callAI(financialData, 'predictions');
  }

  private async callAI(financialData: FinancialData, requestType: string): Promise<string> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw new Error('AI API key not configured. Please set your Gemini API key in Settings.');
    }

    if (financialData.transactions.length === 0) {
      return this.getFallbackResponse(requestType);
    }

    try {
      const prompt = this.generatePrompt(financialData, requestType);
      
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API Error:', errorData);
        throw new Error('Failed to generate AI insights. Please check your API key.');
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      return aiResponse;

    } catch (error) {
      console.error('AI Service Error:', error);
      
      // Return fallback response on error
      if (error instanceof Error && error.message.includes('API key')) {
        throw error; // Re-throw API key errors
      }
      
      return this.getFallbackResponse(requestType, error as Error);
    }
  }

  private generatePrompt(data: FinancialData, requestType: string): string {
    const { transactions, budgets, goals } = data;
    
    // Calculate financial metrics
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const netBalance = totalIncome - totalExpenses;
    
    // Category breakdown
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const incomeByCategory = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    // Recent transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTransactions = transactions.filter(t => 
      new Date(t.date) >= thirtyDaysAgo
    );

    const baseContext = `
Financial Data Analysis:
- Total Income: ₹${totalIncome.toLocaleString()}
- Total Expenses: ₹${totalExpenses.toLocaleString()}
- Net Balance: ₹${netBalance.toLocaleString()}
- Total Transactions: ${transactions.length}
- Recent Transactions (30 days): ${recentTransactions.length}

Income Sources:
${Object.entries(incomeByCategory).map(([category, amount]) => 
  `- ${category}: ₹${amount.toLocaleString()}`
).join('\n')}

Expense Categories:
${Object.entries(expensesByCategory).map(([category, amount]) => 
  `- ${category}: ₹${amount.toLocaleString()}`
).join('\n')}

Budgets:
${budgets.map(b => 
  `- ${b.category}: ₹${b.spent.toLocaleString()} / ₹${b.limit.toLocaleString()} (${((b.spent/b.limit)*100).toFixed(1)}%)`
).join('\n')}

Goals:
${goals.map(g => 
  `- ${g.title}: ₹${g.currentAmount.toLocaleString()} / ₹${g.targetAmount.toLocaleString()} by ${g.targetDate}`
).join('\n')}

Recent Transaction Pattern:
${recentTransactions.slice(0, 10).map(t => 
  `- ${t.date}: ${t.type} ₹${t.amount.toLocaleString()} (${t.category}) - ${t.description}`
).join('\n')}
`;

    switch (requestType) {
      case 'insights':
        return `${baseContext}

Based on this financial data, provide detailed AI-powered insights including:
1. Spending pattern analysis
2. Income vs expense trends
3. Budget performance evaluation
4. Recommendations for financial improvement
5. Potential risk alerts
6. Next month predictions with specific numbers

Please provide actionable insights in a structured format with bullet points and specific monetary recommendations. Keep the tone professional but friendly. Use Indian Rupee (₹) currency format.`;

      case 'story':
        return `${baseContext}

Create a weekly financial storyline made of daily cards based on this data. Each card should include:

Date (e.g., Sept 17, Wednesday)
Narrative: A short, friendly 1–2 sentence story about the user's income/expenses for the day. Use emojis to make it casual.
Tip/Prediction: One helpful suggestion or forecast in a smaller font or highlighted style.

Layout: Vertical scroll of cards, each with rounded corners, light background, and soft shadow.
Tone: Conversational, supportive, like a friend giving financial advice.

Here is an example structure for one day:

📅 Sept 17, Wednesday
💰 You kicked off the week strong! Salary of ₹50,000 credited.
✨ Tip: Consider saving 5% right away to lock in progress.

Use the income and expenses details from the app data. Make it visually appealing and friendly. Don't use asterisks (*) or hash symbols (#) in the output - make it clean and readable. Focus on the user's actual transaction patterns and provide encouraging, practical advice.

Write in a warm, encouraging tone as if you're a financial advisor who knows the user well. Use Indian Rupee (₹) currency format and make each daily card engaging and actionable.`;

      case 'predictions':
        return `${baseContext}

Based on the current financial patterns, provide specific predictions for:
1. Next month's likely expenses by category (with amounts)
2. Projected savings for the next 3 months
3. Goal achievement timeline predictions
4. Budget overspend risks with percentages
5. Income stability analysis
6. Recommended actions to improve financial health

Provide specific numbers and percentages. Be realistic but optimistic. Use Indian Rupee (₹) currency format.`;

      default:
        return `${baseContext}

Analyze this financial data and provide comprehensive insights about the user's financial health, spending patterns, and recommendations for improvement.`;
    }
  }

  private getFallbackResponse(requestType: string, error?: Error): string {
    const errorMessage = error ? ` (${error.message})` : '';
    
    switch (requestType) {
      case 'insights':
        return `Unable to generate AI insights at this time${errorMessage}. Here are some basic observations:

• Add more transactions to get detailed AI-powered insights
• Track your spending patterns across different categories
• Set up budgets to monitor your financial goals
• Regular income tracking helps with better predictions

Please check your API key configuration and internet connection.`;

      case 'story':
        return `Your financial journey is just beginning! 📊

While I couldn't generate a personalized story right now${errorMessage}, here's what I can see:
• Every transaction you record is a step toward better financial awareness
• Consistent tracking leads to powerful insights
• Your future self will thank you for starting this journey

Add more transactions and configure your AI settings to unlock personalized financial stories!`;

      case 'predictions':
        return `Unable to generate AI predictions${errorMessage}. 

To get accurate predictions:
• Ensure you have at least 2 weeks of transaction data
• Check your API key configuration in Settings
• Verify your internet connection

With sufficient data, AI can predict:
• Monthly spending trends
• Budget performance
• Goal achievement timelines
• Personalized recommendations`;

      default:
        return `AI analysis temporarily unavailable${errorMessage}. Please check your settings and try again.`;
    }
  }

  // Validate API key format
  static isValidApiKey(key: string): boolean {
    return key.startsWith('AIzaSy') && key.length > 20;
  }
}