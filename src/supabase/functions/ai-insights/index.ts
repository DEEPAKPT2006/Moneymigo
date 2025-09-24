import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  recurring?: boolean;
}

interface FinancialData {
  transactions: Transaction[];
  budgets: Array<{
    category: string;
    limit: number;
    spent: number;
  }>;
  goals: Array<{
    title: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
  }>;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { apiKey, financialData, requestType } = await req.json()

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!financialData || !requestType) {
      return new Response(
        JSON.stringify({ error: 'Financial data and request type are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const prompt = generatePrompt(financialData, requestType)
    
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
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Gemini API Error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to generate AI insights' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const data = await response.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiResponse) {
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        requestType 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function generatePrompt(data: FinancialData, requestType: string): string {
  const { transactions, budgets, goals } = data
  
  // Calculate financial metrics
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
  const netBalance = totalIncome - totalExpenses
  
  // Category breakdown
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const incomeByCategory = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  // Recent transactions (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentTransactions = transactions.filter(t => 
    new Date(t.date) >= thirtyDaysAgo
  )

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
`

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

Please provide actionable insights in a structured format with bullet points and specific monetary recommendations. Keep the tone professional but friendly. Use Indian Rupee (₹) currency format.`

    case 'story':
      return `${baseContext}

Create an engaging financial story based on this data. Write it as a personalized narrative that:
1. Tells the user's financial journey over the period
2. Highlights key achievements and challenges
3. Uses metaphors or analogies to make it interesting
4. Includes specific insights about spending habits
5. Ends with motivational advice for the future

Write in a warm, encouraging tone as if you're a financial advisor who knows the user well. Make it personal and relatable while being informative. Use Indian Rupee (₹) currency format.`

    case 'predictions':
      return `${baseContext}

Based on the current financial patterns, provide specific predictions for:
1. Next month's likely expenses by category (with amounts)
2. Projected savings for the next 3 months
3. Goal achievement timeline predictions
4. Budget overspend risks with percentages
5. Income stability analysis
6. Recommended actions to improve financial health

Provide specific numbers and percentages. Be realistic but optimistic. Use Indian Rupee (₹) currency format.`

    default:
      return `${baseContext}

Analyze this financial data and provide comprehensive insights about the user's financial health, spending patterns, and recommendations for improvement.`
  }
}