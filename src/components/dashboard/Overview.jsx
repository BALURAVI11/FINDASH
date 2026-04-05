import { useState, useMemo } from "react";
import { useFinance } from "../../context/FinanceContext";
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import SpendingAnalysis from "./SpendingAnalysis";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import TypewriterText from "../TypewriterText";

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

export const Overview = ({ setActiveTab }) => {
  const { transactions, theme, setPieCategoryFilter } = useFinance();

  // Global Dashboard Filter State (Defaulting to March 2026 for data visibility)
  const [dashViewMode, setDashViewMode] = useState('Month');
  const defaultDay = '2026-04-06';
  const defaultMonth = '2026-04';
  const defaultYear = '2026';

  const [dashDay, setDashDay] = useState(defaultDay);
  const [dashMonth, setDashMonth] = useState(defaultMonth);
  const [dashYear, setDashYear] = useState(defaultYear);

  // Filter Transactions Based on Global Selection
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (dashViewMode === 'Day') return t.date === dashDay;
      if (dashViewMode === 'Month') return t.date.startsWith(dashMonth);
      if (dashViewMode === 'Year') return t.date.startsWith(dashYear);
      return true;
    });
  }, [transactions, dashViewMode, dashDay, dashMonth, dashYear]);

  // Summary Calculations from Filtered Data
  const totalIncome = useMemo(() =>
    filteredTransactions.filter(t => t.type === "income").reduce((acc, curr) => acc + Number(curr.amount), 0)
    , [filteredTransactions]);

  const totalExpense = useMemo(() =>
    filteredTransactions.filter(t => t.type === "expense").reduce((acc, curr) => acc + Number(curr.amount), 0)
    , [filteredTransactions]);

  const balance = totalIncome - totalExpense;

  const isDark = theme === "dark";
  const textColor = isDark ? "#f1f5f9" : "#475569";

  // --- Category Breakdown (Pie Chart & Table) ---
  const expensesByCategory = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === "expense");
    return expenses.reduce((acc, curr) => {
      const existing = acc.find(item => item.name === curr.category);
      if (existing) {
        existing.value += Number(curr.amount);
      } else {
        acc.push({ name: curr.category, value: Number(curr.amount) });
      }
      return acc;
    }, []);
  }, [filteredTransactions]);

  const handlePieClick = (data) => {
    // Navigational click interaction explicitly removed per user request.
  };

  return (
    <div className="space-y-6 group animate-slide-up stagger-1">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white/40 dark:bg-slate-900/30 p-4 rounded-2xl border border-white/60 dark:border-slate-700/40 relative z-10 backdrop-blur-sm shadow-sm transition-all hover:border-emerald-200 dark:hover:border-indigo-500/30">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <TypewriterText text="Welcome, Kolluri Ravi Teja" />
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Check your budget limits and save your money.</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 items-center space-x-1 border border-slate-200 dark:border-slate-700 shadow-inner">
          <select
            value={dashViewMode}
            onChange={(e) => setDashViewMode(e.target.value)}
            className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 text-xs font-bold rounded-lg px-3 py-1.5 border-none outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            <option value="Day">Day</option>
            <option value="Month">Month</option>
            <option value="Year">Year</option>
          </select>

          {dashViewMode === 'Day' && (
            <input
              type="date"
              value={dashDay}
              onChange={(e) => setDashDay(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-100 text-xs font-bold outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark] px-2"
            />
          )}

          {dashViewMode === 'Month' && (
            <input
              type="month"
              value={dashMonth}
              onChange={(e) => setDashMonth(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-100 text-xs font-bold outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark] px-2"
            />
          )}

          {dashViewMode === 'Year' && (
            <input
              type="number"
              value={dashYear}
              onChange={(e) => setDashYear(e.target.value)}
              min="2000"
              max="2100"
              className="w-20 bg-transparent text-slate-800 dark:text-slate-100 text-xs font-bold outline-none cursor-pointer px-2"
            />
          )}
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Balance */}
        <div className="bg-[#FFFFF0] dark:bg-slate-800 p-6 rounded-2xl shadow-[0_0_15px_rgba(5,150,105,0.15)] dark:shadow-[0_0_15px_rgba(99,102,241,0.15)] border-2 border-emerald-200 dark:border-indigo-500/30 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400 dark:hover:border-indigo-400 hover:shadow-[0_0_25px_rgba(5,150,105,0.35)] dark:hover:shadow-[0_0_25px_rgba(99,102,241,0.35)] group/card">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Balance</p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">${balance.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 bg-yellow-50 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
            <Wallet className="w-6 h-6 text-emerald-800 dark:text-indigo-400" />
          </div>
        </div>

        {/* Income */}
        <div className="bg-[#FFFFF0] dark:bg-slate-800 p-6 rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.15)] dark:shadow-[0_0_15px_rgba(16,185,129,0.1)] border-2 border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] dark:hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] group/card">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Income</p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">${totalIncome.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-[#FFFFF0] dark:bg-slate-800 p-6 rounded-2xl shadow-[0_0_15px_rgba(244,63,94,0.15)] dark:shadow-[0_0_15px_rgba(244,63,94,0.1)] border-2 border-rose-200 dark:border-rose-900/50 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:border-rose-400 dark:hover:border-rose-500 hover:shadow-[0_0_25px_rgba(244,63,94,0.35)] dark:hover:shadow-[0_0_25px_rgba(244,63,94,0.3)] group/card">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Expenses</p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">${totalExpense.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/50 rounded-full flex items-center justify-center">
            <ArrowDownRight className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Main Spending Analysis Box */}
        <div className="w-full relative z-10">
          <SpendingAnalysis
            dashViewMode={dashViewMode}
            dashDay={dashDay}
            dashMonth={dashMonth}
            dashYear={dashYear}
          />
        </div>

        {/* PIE CHART - Spending Breakdown */}
        <div className="bg-[#FFFFF0] dark:bg-slate-800 p-6 rounded-2xl shadow-[0_0_15px_rgba(5,150,105,0.15)] dark:shadow-[0_0_15px_rgba(99,102,241,0.15)] border-2 border-emerald-200 dark:border-indigo-500/30 flex flex-col transition-all duration-300 hover:border-emerald-400 dark:hover:border-indigo-400 hover:shadow-[0_0_25px_rgba(5,150,105,0.35)] dark:hover:shadow-[0_0_25px_rgba(99,102,241,0.35)] min-h-[500px] w-full relative z-10">

          <div className="flex flex-col mb-6 gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-4">
            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 tracking-tight">Spending Breakdown</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">Detailed overview of your expenditures by category for the selected period.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Chart Area */}
            <div className="flex-1 w-full min-w-0 h-[300px] lg:h-[350px] min-h-[300px] relative">
              {expensesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%" cy="50%"
                      innerRadius={70} outerRadius={110}
                      paddingAngle={6}
                      dataKey="value"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          className="hover:opacity-80 transition-opacity outline-none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                      contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#f1f5f9' : '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: isDark ? '#cbd5e1' : '#334155', fontWeight: 600 }}
                    />
                    <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{ color: textColor, fontSize: '13px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center p-4">
                  <div className="bg-amber-50 dark:bg-amber-900/20 px-6 py-4 rounded-xl border border-amber-100 dark:border-amber-800/30 text-center text-amber-700 dark:text-amber-500 font-semibold text-sm shadow-sm">
                    No transactions found for the selected period.
                  </div>
                </div>
              )}
            </div>

            {/* Tabular Area */}
            {expensesByCategory.length > 0 && (
              <div className="w-full lg:w-80 bg-white/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden shadow-sm animate-in fade-in slide-in-from-right-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Amount Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {expensesByCategory.map((item, index) => (
                      <tr
                        key={index}
                        className="group/row hover:bg-white dark:hover:bg-slate-800 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover/row:text-emerald-600 dark:group-hover/row:text-indigo-400 transition-colors">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">${item.value.toLocaleString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-emerald-50/30 dark:bg-indigo-900/10">
                      <td className="px-4 py-3 text-sm font-bold text-emerald-800 dark:text-indigo-300">Total</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-800 dark:text-indigo-300">
                        ${expensesByCategory.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
