import { useState, useEffect } from "react";
import BudgetTracker from "./BudgetTracker";
import BudgetAnalysis from "./BudgetAnalysis";
import TypewriterText from "../TypewriterText";

export const BudgetsAndAnalytics = () => {
  const [viewMode, setViewMode] = useState(() => localStorage.getItem("budget_view_mode") || "month"); // 'month' or 'year'
  const [viewPeriod, setViewPeriod] = useState(() => localStorage.getItem("budget_view_period") || new Date().toISOString().slice(0, 7));

  useEffect(() => {
    localStorage.setItem("budget_view_mode", viewMode);
    localStorage.setItem("budget_view_period", viewPeriod);
  }, [viewMode, viewPeriod]);

  return (
    <div className="relative space-y-6 animate-slide-up stagger-1 mb-10 z-10">

      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight mb-2 flex items-center gap-2">
          <TypewriterText text="Hello, Kolluri Ravi Teja !" />
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6 animate-fade-in">
          Check your budget limits and save your money.
        </p>
        <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl w-fit mb-6 border border-slate-200 dark:border-slate-700/50">
          <button 
            onClick={() => setViewMode("month")}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === "month" ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            Monthly View
          </button>
          <button 
            onClick={() => setViewMode("year")}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === "year" ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            Yearly View
          </button>
        </div>

        <BudgetTracker viewPeriod={viewPeriod} setViewPeriod={setViewPeriod} viewMode={viewMode} />
        {viewMode === "month" && <BudgetAnalysis currentPeriod={viewPeriod} />}
      </div>
    </div>
  );
};

export default BudgetsAndAnalytics;
