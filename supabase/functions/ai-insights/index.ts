import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization")!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Fetch user's expenses
    const { data: expenses, error: expensesError } = await supabase
      .from("expenses")
      .select("amount, category, expense_date")
      .eq("user_id", user.id)
      .order("expense_date", { ascending: false });

    if (expensesError) throw expensesError;

    // Rule-based AI insights
    let insight = "";

    if (!expenses || expenses.length === 0) {
      insight = "Start tracking your expenses to get personalized financial insights! Add your first expense to see AI-powered recommendations.";
    } else {
      // Calculate total spending
      const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0);

      // Get this month's expenses
      const now = new Date();
      const thisMonthExpenses = expenses.filter((exp) => {
        const expDate = new Date(exp.expense_date);
        return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
      });
      const monthlySpent = thisMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0);

      // Category analysis
      const categoryTotals: { [key: string]: number } = {};
      expenses.forEach((exp) => {
        const cat = exp.category;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(exp.amount.toString());
      });

      const highestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
      const categoryPercentage = (highestCategory[1] / totalSpent) * 100;

      // Generate insights based on spending patterns
      const insights: string[] = [];

      insights.push(`You've tracked ₹${totalSpent.toLocaleString("en-IN")} in total expenses across ${expenses.length} transactions.`);

      if (thisMonthExpenses.length > 0) {
        insights.push(`This month, you've spent ₹${monthlySpent.toLocaleString("en-IN")} on ${thisMonthExpenses.length} transactions.`);
      }

      if (highestCategory && categoryPercentage > 40) {
        insights.push(
          `⚠️ ${categoryPercentage.toFixed(0)}% of your spending is on "${highestCategory[0]}". Consider setting a budget for this category to save more.`
        );
      } else if (highestCategory) {
        insights.push(
          `Your top spending category is "${highestCategory[0]}" at ₹${highestCategory[1].toLocaleString("en-IN")}.`
        );
      }

      // Weekly average
      const daysTracked = Math.max(1, (Date.now() - new Date(expenses[expenses.length - 1].expense_date).getTime()) / (1000 * 60 * 60 * 24));
      const weeklyAverage = (totalSpent / daysTracked) * 7;
      insights.push(`Your average weekly spending is approximately ₹${weeklyAverage.toLocaleString("en-IN")}.`);

      // Savings tip
      if (monthlySpent > 15000) {
        insights.push("💡 Tip: Try to reduce discretionary spending by 10% to increase your savings!");
      } else if (monthlySpent > 0) {
        insights.push("✅ You're doing great! Keep tracking your expenses to maintain financial awareness.");
      }

      insight = insights.join(" ");
    }

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-insights function:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
