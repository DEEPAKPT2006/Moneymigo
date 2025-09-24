import { Transaction, Budget, Goal } from '../types';
import { getEnvValue } from '../../lib/env';

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
    // Load API key from localStorage or environment
    const envApiKey = getEnvValue('VITE_GEMINI_API_KEY', 'AIzaSyAjlFrMFPLr-T_wlTlJUxOBZXF_mKpvLVs');
    this.apiKey = localStorage.getItem('gemini-api-key') || envApiKey;
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

    return this.callAIWithRetry(financialData, requestType, 3);
  }

  private async callAIWithRetry(financialData: FinancialData, requestType: string, maxRetries: number): Promise<string> {
    const apiKey = this.getApiKey();
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
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
          
          let errorInfo;
          try {
            errorInfo = JSON.parse(errorData);
          } catch {
            errorInfo = { error: { message: errorData } };
          }

          // Handle 503 (overloaded) as expected condition, not error
          if (response.status === 503 || (errorInfo.error && errorInfo.error.code === 503)) {
            if (attempt < maxRetries - 1) {
              const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000; // Add jitter
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue; // Retry silently
            } else {
              // Return fallback content instead of throwing error
              return this.getFallbackResponse(requestType, new Error('overloaded'));
            }
          }
          
          // Log other errors for debugging
          console.error('Gemini API Error:', errorData);
          
          if (response.status === 400) {
            throw new Error('Invalid request. Please check your API key configuration.');
          }
          
          if (response.status === 403) {
            throw new Error('API key is invalid or has insufficient permissions. Please check your Gemini API key.');
          }
          
          if (response.status === 429) {
            // Check if it's a quota exceeded error
            if (errorInfo.error && errorInfo.error.message.includes('quota')) {
              return this.getFallbackResponse(requestType, new Error('quota_exceeded'));
            }
            
            if (attempt < maxRetries - 1) {
              const waitTime = (Math.pow(2, attempt) * 1000) + Math.random() * 1000;
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            } else {
              throw new Error('API rate limit exceeded. Please wait a moment and try again.');
            }
          }
          
          throw new Error(`AI service error (${response.status}). Please try again later.`);
        }

        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponse) {
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          throw new Error('No response received from AI service');
        }

        return aiResponse;

      } catch (error) {
        lastError = error as Error;
        
        // Re-throw specific errors immediately (don't retry)
        if (error instanceof Error) {
          if (error.message.includes('API key') || 
              error.message.includes('Invalid request') || 
              error.message.includes('insufficient permissions')) {
            throw error;
          }
          
          // For network errors, retry if not final attempt
          if (attempt < maxRetries - 1) {
            const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 500;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
      }
    }
    
    // All attempts failed - return fallback instead of throwing
    return this.getFallbackResponse(requestType, lastError);
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
- Date (e.g., Sept 17, Wednesday)
- Narrative: A short, friendly 1–2 sentence story about the user's income/expenses for the day. Use emojis to make it casual.
- Tip/Prediction: One helpful suggestion or forecast.

Format example:
📅 Sept 17, Wednesday
💰 You kicked off the week strong! Salary of ₹50,000 credited.
✨ Tip: Consider saving 5% right away to lock in progress.

IMPORTANT: Return ONLY the daily cards content. Do not include any explanatory text, disclaimers, notes about being a text-based AI, formatting instructions, or any other commentary. No asterisks (*), hash symbols (#), or markdown formatting. Just provide the clean, readable daily cards based on the user's actual transaction data.

Use Indian Rupee (₹) currency format. Write in a warm, encouraging tone like a friend giving financial advice.`;

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
    const isOverloadedError = error?.message === 'overloaded';
    const isQuotaError = error?.message === 'quota_exceeded';
    const isApiKeyError = error?.message.includes('API key') || error?.message.includes('Invalid request');
    
    switch (requestType) {
      case 'insights':
        if (isQuotaError) {
          return `📊 **Daily AI Quota Reached**

Your Gemini API free tier (50 requests/day) has been used up. Here's your financial snapshot:

💰 **Today's Analysis:**
• Continue tracking transactions - data is building
• Your spending patterns are being recorded
• Financial awareness grows with each entry
• Tomorrow brings fresh AI insights!

🔄 **Options:**
• Wait for quota reset (resets daily)
• Upgrade to paid tier for unlimited requests
• Focus on manual tracking for now

💡 **Tip:** Your data is safe and ready for AI analysis when quota resets!`;
        }
        
        if (isOverloadedError) {
          return `⏳ **AI Service Busy - High Demand Period**

The AI insights service is currently experiencing high traffic. Here are your basic financial observations:

📊 **Current Analysis:**
• Continue tracking your spending patterns across categories
• Monitor income vs expense ratios for balance
• Regular transaction recording builds valuable data
• Your financial awareness is growing with each entry

💡 **Smart Tip:** The AI will automatically retry when capacity is available. Keep tracking your transactions for richer insights later!

🔄 Try refreshing in a few minutes for personalized AI analysis.`;
        }
        
        return `🤖 **AI Insights Loading...**

${isApiKeyError ? '🔑 Please configure your API key in Settings.' : '⚡ Connecting to AI service...'}

📈 **Your Financial Snapshot:**
• Track spending patterns across different categories  
• Monitor your income vs expense trends
• Set up budgets to stay on financial track
• Regular tracking leads to better money decisions

${!isApiKeyError ? '🔄 Refresh to try loading AI insights again.' : '⚙️ Check Settings to enable AI features.'}`;

      case 'story':
        if (isQuotaError) {
          return `📚 **Story Mode: Daily Limit Reached**

Your AI storyteller has reached today's free tier limit, but your financial journey continues:

✍️ **Today's Chapter So Far:**
• Every transaction logged is progress
• Your personal finance story is growing
• Data patterns are forming for tomorrow's tales
• Consistency builds the best narratives

🌅 **Tomorrow's Story Preview:**
• Fresh quota brings new personalized stories
• Daily cards with friendly advice await
• Your financial journey gets richer each day

💡 **Meanwhile:** Keep tracking - great stories need great data!`;
        }
        
        if (isOverloadedError) {
          return `📚 **Your Financial Journey Continues...**

While our AI storyteller is taking a short break (high demand!), your money story is still being written:

✨ **Today's Chapter:**
• Every expense logged = better financial awareness
• Each transaction builds your personal data story  
• Consistent tracking creates powerful insights
• Your future self will appreciate this dedication

🎯 **Coming Up:** Personalized daily cards with friendly advice, spending stories, and smart tips!

⏰ The AI storyteller will return shortly - keep adding transactions for richer stories.`;
        }
        
        return `📖 **Your Financial Story Awaits**

${isApiKeyError ? '🔑 Enable AI features in Settings to unlock your story.' : '📝 Preparing your personalized financial narrative...'}

🌟 **Story Elements Ready:**
• Transaction patterns recorded
• Spending habits documented  
• Financial progress tracked
• Personal insights building

${!isApiKeyError ? '🔄 Refresh to load your AI-powered story.' : '⚙️ Configure AI to begin storytelling.'}`;

      case 'predictions':
        if (isQuotaError) {
          return `🔮 **Prediction Quota Used for Today**

Your AI crystal ball has reached the daily free tier limit. Here's what we can predict manually:

📈 **Pattern-Based Forecast:**
• Current spending trends suggest consistency
• Your transaction data shows good tracking habits
• Patterns indicate growing financial awareness
• Tomorrow brings fresh AI predictions!

🎯 **Manual Predictions:**
• Keep tracking = better future insights
• Consistent logging = accurate forecasts
• More data = smarter recommendations

⏰ **Reset:** Your quota refreshes daily for new AI predictions!`;
        }
        
        if (isOverloadedError) {
          return `🔮 **AI Crystal Ball Recharging...**

High demand has our prediction engine busy! While it recovers, here's what we can see:

🎯 **Prediction Preview:**
• Your consistent tracking builds prediction accuracy
• More data = better forecasting power
• Spending patterns are forming for analysis
• Future insights will be more personalized

📊 **What's Coming:**
• Monthly spending forecasts
• Budget performance predictions
• Goal achievement timelines  
• Smart savings recommendations

⌛ AI predictions will resume automatically when capacity allows.`;
        }
        
        return `🔮 **Future Insights Loading**

${isApiKeyError ? '🔑 Configure AI in Settings for predictions.' : '🧠 Analyzing patterns for forecasts...'}

📈 **Prediction Foundation:**
• Transaction history building
• Spending patterns emerging
• Budget trends developing
• Goal progress tracking

🎯 **AI Will Predict:**
• Monthly expense forecasts
• Savings opportunities
• Budget performance
• Goal achievement dates

${!isApiKeyError ? '🔄 Refresh for AI-powered predictions.' : ''}`;

      default:
        return `🤖 **AI Features ${isQuotaError ? 'Daily Limit Reached' : isOverloadedError ? 'Temporarily Busy' : 'Loading'}**

${isQuotaError ? '📅 Quota resets daily - check back tomorrow!' : isOverloadedError ? '⏳ High demand period - service will resume shortly.' : isApiKeyError ? '🔑 Configure API key in Settings.' : '⚡ Connecting to AI service...'}`;
    }
  }

  // Validate API key format
  static isValidApiKey(key: string): boolean {
    return key.startsWith('AIzaSy') && key.length > 20;
  }
}