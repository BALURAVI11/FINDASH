import { useMemo } from "react";
import { useFinance } from "../../context/FinanceContext";
import { Sparkles, TrendingUp, CheckCircle2, Info } from "lucide-react";

export const BudgetAnalysis = ({ currentPeriod }) => {
  const { transactions, budgets } = useFinance();

  const insights = useMemo(() => {
    if (!currentPeriod) return [];
    
    // Calculate previous period string
    const date = new Date(currentPeriod + "-01");
    date.setMonth(date.getMonth() - 1);
    const prevPeriod = date.toISOString().slice(0, 7);

    const currentBudgets = budgets[currentPeriod] || {};
    const prevBudgets = budgets[prevPeriod] || {};

    const calculateActuals = (period) => {
      return transactions.reduce((acc, curr) => {
        if (!curr.date.startsWith(period)) return acc;
        const amt = Number(curr.amount);
        const value = curr.type === "expense" ? amt : -amt;
        acc[curr.category] = (acc[curr.category] || 0) + value;
        return acc;
      }, {});
    };

    const currentActuals = calculateActuals(currentPeriod);
    const prevActuals = calculateActuals(prevPeriod);

    const periodInsights = [];

    // Compare each category that has a budget in the current period
    Object.keys(currentBudgets).forEach(cat => {
      const currentLimit = currentBudgets[cat];
      const currentActual = currentActuals[cat] || 0;
      const isCurrentWithin = currentActual <= currentLimit;

      // Check if it existed in the previous month
      if (prevBudgets[cat]) {
        const prevLimit = prevBudgets[cat];
        const prevActual = prevActuals[cat] || 0;
        const isPrevWithin = prevActual <= prevLimit;

        if (!isPrevWithin && isCurrentWithin) {
          periodInsights.push({
            type: "success",
            category: cat,
            message: `Great job! You were over budget for ${cat} in ${date.toLocaleString('default', { month: 'long' })}, but you've kept it under control this month! 🌟`,
            icon: Sparkles,
            color: "text-emerald-600 dark:text-emerald-400",
            bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
            borderColor: "border-emerald-100 dark:border-emerald-500/20"
          });
        } else if (isPrevWithin && isCurrentWithin) {
          periodInsights.push({
            type: "consistent",
            category: cat,
            message: `Consistent spending! You've stayed within your ${cat} budget for two months in a row. Keep it up! ✅`,
            icon: CheckCircle2,
            color: "text-indigo-600 dark:text-indigo-400",
            bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
            borderColor: "border-indigo-100 dark:border-indigo-500/20"
          });
        } else if (isPrevWithin && !isCurrentWithin) {
           periodInsights.push({
            type: "warning",
            category: cat,
            message: `Watch out! Your ${cat} spending has slipped over the limit this month compared to your disciplined performance last month. ⚠️`,
            icon: TrendingUp,
            color: "text-amber-600 dark:text-amber-400",
            bgColor: "bg-amber-50 dark:bg-amber-900/20",
            borderColor: "border-amber-100 dark:border-amber-500/20"
          });
        }
      }
    });

    return periodInsights;
  }, [transactions, budgets, currentPeriod]);

  if (insights.length === 0) return null;

  return (
    <div className="mt-8 animate-slide-up stagger-3">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Budget Performance Insights</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, idx) => (
          <div 
            key={idx} 
            className={`flex items-start gap-4 p-4 rounded-2xl border ${insight.borderColor} ${insight.bgColor} transition-all hover:scale-[1.01] duration-300`}
          >
            <div className={`p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm ${insight.color} shrink-0`}>
              <insight.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${insight.color} mb-1 flex items-center gap-1.5`}>
                {insight.category} Analysis
              </p>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                {insight.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetAnalysis;
