import { useFinance } from "../../context/FinanceContext";
import { Lightbulb, TrendingUp, TrendingDown, Activity, ArrowRight, PieChart, Calendar, ArrowUpCircle, ArrowDownCircle, Target } from "lucide-react";
import { useState, useMemo } from "react";

export const Insights = () => {
  const { transactions } = useFinance();

  const expenses = transactions.filter(t => t.type === "expense");
  
  // 1. Most Frequent Category & Highest Spending Category
  let highestCategory = { name: "N/A", amount: 0 };
  let mostFrequentCategory = { name: "N/A", count: 0 };
  
  if (expenses.length > 0) {
    const categoryTotals = {};
    const categoryCounts = {};

    expenses.forEach(curr => {
      categoryTotals[curr.category] = (categoryTotals[curr.category] || 0) + Number(curr.amount);
      categoryCounts[curr.category] = (categoryCounts[curr.category] || 0) + 1;
    });

    const maxCat = Object.keys(categoryTotals).reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b);
    highestCategory = { name: maxCat, amount: categoryTotals[maxCat] };

    const freqCat = Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b);
    mostFrequentCategory = { name: freqCat, count: categoryCounts[freqCat] };
  }

  // 2. Average Transaction Value
  const averageTx = expenses.length > 0 
    ? Math.round(expenses.reduce((acc, curr) => acc + Number(curr.amount), 0) / expenses.length) 
    : 0;

  // 3. Smart Insights Engine (Time-based Comparisons)
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 86400000);
  const sixtyDaysAgo = new Date(today.getTime() - 60 * 86400000);

  const currentMonthExpenses = expenses.filter(t => new Date(t.date) >= thirtyDaysAgo);
  const lastMonthExpenses = expenses.filter(t => new Date(t.date) >= sixtyDaysAgo && new Date(t.date) < thirtyDaysAgo);

  const currentMonthSum = currentMonthExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const lastMonthSum = lastMonthExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  
  const expenseDiff = currentMonthSum - lastMonthSum;
  let percentageDiffStr = "No data prior to 30 days to compare.";
  let isPositiveTrend = false; 

  if (lastMonthSum > 0) {
    const percent = Math.abs(Math.round((expenseDiff / lastMonthSum) * 100));
    if (expenseDiff > 0) {
      percentageDiffStr = `Your expenses increased by ${percent}% ($${expenseDiff}) compared to the previous 30 days.`;
      isPositiveTrend = false;
    } else {
      percentageDiffStr = `Great job! You spent ${percent}% ($${Math.abs(expenseDiff)}) less than the previous 30 days.`;
      isPositiveTrend = true;
    }
  } else if (currentMonthSum > 0) {
    percentageDiffStr = `You've spent $${currentMonthSum} in the last 30 days.`;
  }

  // 4. Periodic Comparison State Logic
  const currentInitialMonth = new Date().toISOString().slice(0, 7);
  const [comparisonType, setComparisonType] = useState('month');
  const [comparisonMonth, setComparisonMonth] = useState(currentInitialMonth);
  const [comparisonYear, setComparisonYear] = useState(() => new Date().getFullYear().toString());

  const periodicExpenses = useMemo(() => {
    return expenses.filter(t => {
      if (comparisonType === 'month') {
        return t.date.startsWith(comparisonMonth);
      } else {
        return t.date.startsWith(comparisonYear);
      }
    });
  }, [expenses, comparisonType, comparisonMonth, comparisonYear]);

  let highestPeriodic = { amount: 0, category: "N/A" };
  let lowestPeriodic = { amount: 0, category: "N/A" };
  let averagePeriodic = 0;
  let topPeriodicCategory = { name: "N/A", amount: 0 };

  if (periodicExpenses.length > 0) {
    const amounts = periodicExpenses.map(t => Number(t.amount));
    const maxVal = Math.max(...amounts);
    const minVal = Math.min(...amounts);
    averagePeriodic = Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length);

    const maxTx = periodicExpenses.find(t => Number(t.amount) === maxVal);
    const minTx = periodicExpenses.find(t => Number(t.amount) === minVal);
    
    highestPeriodic = { amount: maxVal, category: maxTx ? maxTx.category : "N/A" };
    lowestPeriodic = { amount: minVal, category: minTx ? minTx.category : "N/A" };

    const catTotals = {};
    periodicExpenses.forEach(t => {
      catTotals[t.category] = (catTotals[t.category] || 0) + Number(t.amount);
    });
    const maxCat = Object.keys(catTotals).reduce((a, b) => catTotals[a] > catTotals[b] ? a : b);
    topPeriodicCategory = { name: maxCat, amount: catTotals[maxCat] };
  }

  const momComparison = useMemo(() => {
    const currentCatTotals = {};
    const prevCatTotals = {};
    const categoriesSet = new Set();
    let prevPeriodExpenses = [];
    let fullHeading = '';
    let prevLabel = '';

    if (comparisonType === 'month') {
      const [yearStr, monthStr] = comparisonMonth.split('-');
      let dateObj = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
      dateObj.setMonth(dateObj.getMonth() - 1);
      const prevYear = dateObj.getFullYear();
      const prevMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
      const prevMonthStr = `${prevYear}-${prevMonth}`;
      prevPeriodExpenses = expenses.filter(t => t.date.startsWith(prevMonthStr));
      const selectedDateObj = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
      const monthName = selectedDateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
      const prevMonthName = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
      fullHeading = `${monthName} vs ${prevMonthName} Breakdown`;
      prevLabel = prevMonthName;
    } else {
      const currYear = parseInt(comparisonYear);
      const prevYear = currYear - 1;
      prevPeriodExpenses = expenses.filter(t => t.date.startsWith(String(prevYear)));
      fullHeading = `${currYear} vs ${prevYear} Breakdown`;
      prevLabel = String(prevYear);
    }

    periodicExpenses.forEach(t => {
      currentCatTotals[t.category] = (currentCatTotals[t.category] || 0) + Number(t.amount);
      categoriesSet.add(t.category);
    });

    prevPeriodExpenses.forEach(t => {
      prevCatTotals[t.category] = (prevCatTotals[t.category] || 0) + Number(t.amount);
      categoriesSet.add(t.category);
    });

    if (categoriesSet.size === 0) return null;

    const categories = Array.from(categoriesSet).map(cat => {
      const curr = currentCatTotals[cat] || 0;
      const prev = prevCatTotals[cat] || 0;
      const diff = curr - prev;
      return { category: cat, curr, prev, diff };
    }).sort((a, b) => b.curr - a.curr);

    let maxSaved = { category: null, amount: 0 };
    let maxSpent = { category: null, amount: 0 };

    categories.forEach(c => {
      if (c.diff < maxSaved.amount) maxSaved = { category: c.category, amount: c.diff };
      if (c.diff > maxSpent.amount) maxSpent = { category: c.category, amount: c.diff };
    });

    return { categories, maxSaved, maxSpent, fullHeading, prevLabel };

  }, [expenses, comparisonType, comparisonMonth, comparisonYear, periodicExpenses]);

  const threePeriodComparison = useMemo(() => {
    const currentCatTotals = {};
    const previousPeriodTotals = {};
    const categoriesSet = new Set();
    let prevPeriod1Expenses = [];
    let prevPeriod2Expenses = [];
    let prevPeriod3Expenses = [];
    let fullHeading = '';
    let prevLabel = '';

    if (comparisonType === 'month') {
      const [yearStr, monthStr] = comparisonMonth.split('-');
      
      const getPrevMonthStr = (offset) => {
        let dateObj = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
        dateObj.setMonth(dateObj.getMonth() - offset);
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
      };

      prevPeriod1Expenses = expenses.filter(t => t.date.startsWith(getPrevMonthStr(1)));
      prevPeriod2Expenses = expenses.filter(t => t.date.startsWith(getPrevMonthStr(2)));
      prevPeriod3Expenses = expenses.filter(t => t.date.startsWith(getPrevMonthStr(3)));
      
      const selectedDateObj = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
      const monthName = selectedDateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      fullHeading = `${monthName} vs Previous 3 Months (Average)`;
      prevLabel = "3-Mo Avg";
    } else {
      const currYear = parseInt(comparisonYear);
      prevPeriod1Expenses = expenses.filter(t => t.date.startsWith(String(currYear - 1)));
      prevPeriod2Expenses = expenses.filter(t => t.date.startsWith(String(currYear - 2)));
      prevPeriod3Expenses = expenses.filter(t => t.date.startsWith(String(currYear - 3)));
      fullHeading = `${currYear} vs Previous 3 Years (Average)`;
      prevLabel = "3-Yr Avg";
    }

    periodicExpenses.forEach(t => {
      currentCatTotals[t.category] = (currentCatTotals[t.category] || 0) + Number(t.amount);
      categoriesSet.add(t.category);
    });

    [...prevPeriod1Expenses, ...prevPeriod2Expenses, ...prevPeriod3Expenses].forEach(t => {
      previousPeriodTotals[t.category] = (previousPeriodTotals[t.category] || 0) + Number(t.amount);
      categoriesSet.add(t.category);
    });

    if (categoriesSet.size === 0) return null;

    const categories = Array.from(categoriesSet).map(cat => {
      const curr = currentCatTotals[cat] || 0;
      const prevSum = previousPeriodTotals[cat] || 0;
      const prevAverage = Math.round(prevSum / 3);
      const diff = curr - prevAverage;
      return { category: cat, curr, prev: prevAverage, diff };
    }).sort((a, b) => b.curr - a.curr);

    return { categories, fullHeading, prevLabel };

  }, [expenses, comparisonType, comparisonMonth, comparisonYear, periodicExpenses]);

  return (
    <div className="relative space-y-8 animate-slide-up stagger-1 mb-10 z-10">

      <div className="relative z-10 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight mb-2 flex items-center gap-2">
            Hello, Kolluri Ravi Teja!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Dive into your spending habits and financial trends.</p>
        </div>

        {/* Primary Smart Insight Banner */}
        <div className={`p-6 rounded-2xl flex items-start space-x-4 animate-slide-up stagger-1 transition-all duration-300 hover:-translate-y-1 ${isPositiveTrend ? 'bg-emerald-50 dark:bg-emerald-900/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] border-2 border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400 dark:hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] dark:hover:shadow-[0_0_25px_rgba(16,185,129,0.35)]' : 'bg-amber-50 dark:bg-amber-900/20 shadow-[0_0_15px_rgba(245,158,11,0.15)] border-2 border-amber-200 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] dark:hover:shadow-[0_0_25px_rgba(245,158,11,0.35)]'}`}>
          <div className={`p-3 rounded-full shrink-0 ${isPositiveTrend ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'}`}>
            {isPositiveTrend ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
          </div>
          <div>
            <h4 className={`text-lg font-bold mb-1 ${isPositiveTrend ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}`}>
              Smart Insight Engine Analysis
            </h4>
            <p className={`font-medium ${isPositiveTrend ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400/80'}`}>
              {percentageDiffStr}
            </p>
          </div>
        </div>

        {/* --- NEW MODULE: Periodic Comparison Insights --- */}
        <div className="relative z-10 bg-[#FFFFF0] dark:bg-slate-800/80 rounded-2xl p-6 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-700 animate-slide-up stagger-2">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-indigo-500" /> Periodic Expense Overview
            </h3>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <select 
                value={comparisonType} 
                onChange={(e) => setComparisonType(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="month">Month view</option>
                <option value="year">Year view</option>
              </select>

              {comparisonType === 'month' ? (
                <input 
                  type="month" 
                  value={comparisonMonth}
                  onChange={(e) => setComparisonMonth(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                />
              ) : (
                <input 
                  type="number" 
                  value={comparisonYear}
                  placeholder="YYYY"
                  min="2000"
                  max="2100"
                  onChange={(e) => setComparisonYear(e.target.value)}
                  className="px-3 py-1.5 w-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 transition-colors"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Highest Spending — rose glow */}
            <div className="bg-[#FFFFF0] dark:bg-slate-800 p-5 rounded-2xl border-2 border-rose-200 dark:border-rose-900/50 shadow-[0_0_15px_rgba(244,63,94,0.12)] dark:shadow-[0_0_18px_rgba(244,63,94,0.18)] flex flex-col justify-center items-center text-center transition-all duration-300 hover:-translate-y-1 hover:border-rose-400 dark:hover:border-rose-500 hover:shadow-[0_0_28px_rgba(244,63,94,0.35)] dark:hover:shadow-[0_0_28px_rgba(244,63,94,0.4)] cursor-default">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center mb-3">
                <ArrowUpCircle className="w-5 h-5 text-rose-500" />
              </div>
              <p className="text-xs font-bold uppercase text-rose-400 dark:text-rose-400 tracking-wider mb-1">Highest Spending</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">${highestPeriodic.amount.toLocaleString()}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[130px] font-medium">{highestPeriodic.category}</p>
            </div>

            {/* Lowest Spending — emerald glow */}
            <div className="bg-[#FFFFF0] dark:bg-slate-800 p-5 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800/50 shadow-[0_0_15px_rgba(16,185,129,0.12)] dark:shadow-[0_0_18px_rgba(16,185,129,0.18)] flex flex-col justify-center items-center text-center transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-[0_0_28px_rgba(16,185,129,0.35)] dark:hover:shadow-[0_0_28px_rgba(16,185,129,0.4)] cursor-default">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                <ArrowDownCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-xs font-bold uppercase text-emerald-500 dark:text-emerald-400 tracking-wider mb-1">Lowest Spending</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">${lowestPeriodic.amount.toLocaleString()}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[130px] font-medium">{lowestPeriodic.category}</p>
            </div>

            {/* Average Spending — indigo glow */}
            <div className="bg-[#FFFFF0] dark:bg-slate-800 p-5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.12)] dark:shadow-[0_0_18px_rgba(99,102,241,0.18)] flex flex-col justify-center items-center text-center transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400 dark:hover:border-indigo-400 hover:shadow-[0_0_28px_rgba(99,102,241,0.35)] dark:hover:shadow-[0_0_28px_rgba(99,102,241,0.4)] cursor-default">
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-indigo-500" />
              </div>
              <p className="text-xs font-bold uppercase text-indigo-500 dark:text-indigo-400 tracking-wider mb-1">Average Spending</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">${averagePeriodic.toLocaleString()}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Per transaction</p>
            </div>

            {/* Top Category — amber glow */}
            <div className="bg-[#FFFFF0] dark:bg-slate-800 p-5 rounded-2xl border-2 border-amber-200 dark:border-amber-700/40 shadow-[0_0_15px_rgba(245,158,11,0.12)] dark:shadow-[0_0_18px_rgba(245,158,11,0.18)] flex flex-col justify-center items-center text-center transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-[0_0_28px_rgba(245,158,11,0.35)] dark:hover:shadow-[0_0_28px_rgba(245,158,11,0.4)] cursor-default">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                <PieChart className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-xs font-bold uppercase text-amber-500 dark:text-amber-400 tracking-wider mb-1">Top Category</p>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">${topPeriodicCategory.amount.toLocaleString()}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[130px] font-medium">{topPeriodicCategory.name}</p>
            </div>
          </div>
          {periodicExpenses.length === 0 && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-amber-50 dark:bg-amber-900/20 py-8 rounded-xl border border-amber-100 dark:border-amber-800/30 flex items-center justify-center text-center">
               <p className="text-amber-700 dark:text-amber-500 font-semibold text-sm">
                 No transactions found for the selected period.
               </p>
            </div>
          )}

          {/* Period Comparison Segment — works for both Month & Year modes */}
          {periodicExpenses.length > 0 && momComparison && (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/60 col-span-1 sm:col-span-2 lg:col-span-4">
              <h4 className="text-md font-bold text-slate-800 dark:text-slate-200 mb-4 tracking-tight flex items-center">
                <Target className="w-4 h-4 mr-2 text-indigo-500" /> {momComparison.fullHeading}
              </h4>

              <div className="bg-[#FFFFF0] dark:bg-slate-800 rounded-2xl border-2 border-indigo-200 dark:border-indigo-500/30 overflow-hidden mb-6 shadow-[0_0_18px_rgba(99,102,241,0.12)] dark:shadow-[0_0_22px_rgba(99,102,241,0.2)] transition-all duration-300 hover:shadow-[0_0_28px_rgba(99,102,241,0.3)] dark:hover:shadow-[0_0_32px_rgba(99,102,241,0.35)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/80">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Category</th>
                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Current Period</th>
                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Previous {comparisonType === 'month' ? 'Month' : 'Year'}</th>
                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {momComparison.categories.map((c, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{c.category}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-200">${c.curr.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-500 dark:text-slate-400">
                            {c.prev > 0 ? `$${c.prev.toLocaleString()}` : <span className="text-slate-300 dark:text-slate-600 italic text-xs">No data</span>}
                          </td>
                          <td className={`px-4 py-3 text-right font-semibold`}>
                            <span className={`inline-flex items-center justify-end gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                              c.diff > 0 ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                              : c.diff < 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                              {c.diff > 0 ? <ArrowUpCircle className="w-3 h-3" /> : c.diff < 0 ? <ArrowDownCircle className="w-3 h-3" /> : null}
                              {c.diff === 0 ? 'No Change' : `${c.diff > 0 ? '+' : '-'}$${Math.abs(c.diff).toLocaleString()}`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {momComparison.maxSaved.category && momComparison.maxSaved.amount < 0 && (
                  <div className="flex items-start space-x-3 bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                    <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 leading-snug">
                      Great job! You saved <span className="font-bold text-emerald-600 dark:text-emerald-400">${Math.abs(momComparison.maxSaved.amount).toLocaleString()}</span> on <span className="font-bold">{momComparison.maxSaved.category}</span> compared to the previous {comparisonType === 'month' ? 'month' : 'year'}.
                    </p>
                  </div>
                )}
                {momComparison.maxSpent.category && momComparison.maxSpent.amount > 0 && (
                  <div className="flex items-start space-x-3 bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-800/30">
                    <TrendingUp className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-rose-800 dark:text-rose-300 leading-snug">
                      Watch out! You spent <span className="font-bold text-rose-600 dark:text-rose-400">+${momComparison.maxSpent.amount.toLocaleString()}</span> more on <span className="font-bold">{momComparison.maxSpent.category}</span> compared to the previous {comparisonType === 'month' ? 'month' : 'year'}.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* 3 Period Comparison Segment */}
          {periodicExpenses.length > 0 && threePeriodComparison && (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/60 col-span-1 sm:col-span-2 lg:col-span-4">
              <h4 className="text-md font-bold text-slate-800 dark:text-slate-200 mb-4 tracking-tight flex items-center">
                <Target className="w-4 h-4 mr-2 text-indigo-500" /> {threePeriodComparison.fullHeading}
              </h4>

              <div className="bg-[#FFFFF0] dark:bg-slate-800 rounded-2xl border-2 border-indigo-200 dark:border-indigo-500/30 overflow-hidden mb-6 shadow-[0_0_18px_rgba(99,102,241,0.12)] dark:shadow-[0_0_22px_rgba(99,102,241,0.2)] transition-all duration-300 hover:shadow-[0_0_28px_rgba(99,102,241,0.3)] dark:hover:shadow-[0_0_32px_rgba(99,102,241,0.35)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/80">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Category</th>
                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Current Period</th>
                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-right">{threePeriodComparison.prevLabel}</th>
                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {threePeriodComparison.categories.map((c, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{c.category}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-200">${c.curr.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-500 dark:text-slate-400">
                            {c.prev > 0 ? `$${c.prev.toLocaleString()}` : <span className="text-slate-300 dark:text-slate-600 italic text-xs">No data</span>}
                          </td>
                          <td className={`px-4 py-3 text-right font-semibold`}>
                            <span className={`inline-flex items-center justify-end gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                              c.diff > 0 ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                              : c.diff < 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                              {c.diff > 0 ? <ArrowUpCircle className="w-3 h-3" /> : c.diff < 0 ? <ArrowDownCircle className="w-3 h-3" /> : null}
                              {c.diff === 0 ? 'No Change' : `${c.diff > 0 ? '+' : '-'}$${Math.abs(c.diff).toLocaleString()}`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Global Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up stagger-3">
          {/* Highest Spending Category */}
          <div className="bg-[#FFFFF0] dark:bg-slate-800 rounded-2xl p-6 shadow-[0_0_15px_rgba(244,63,94,0.15)] dark:shadow-[0_0_15px_rgba(244,63,94,0.1)] border-2 border-rose-200 dark:border-rose-900/50 relative overflow-hidden transition-all hover:-translate-y-1 hover:scale-[1.02] duration-300 hover:border-rose-400 dark:hover:border-rose-500 hover:shadow-[0_0_25px_rgba(244,63,94,0.35)] dark:hover:shadow-[0_0_25px_rgba(244,63,94,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-500 dark:text-slate-400 text-sm uppercase flex items-center">
                <PieChart className="w-4 h-4 mr-2" /> Top Global Expense
              </h4>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1 truncate">{highestCategory.name}</h2>
            <p className="text-slate-600 dark:text-slate-300 font-medium">Costing you ${highestCategory.amount.toLocaleString()}</p>
          </div>

          {/* Average Transaction Value */}
          <div className="bg-[#FFFFF0] dark:bg-slate-800 rounded-2xl p-6 shadow-[0_0_15px_rgba(5,150,105,0.15)] dark:shadow-[0_0_15px_rgba(99,102,241,0.15)] border-2 border-emerald-200 dark:border-indigo-500/30 relative overflow-hidden transition-all hover:-translate-y-1 hover:scale-[1.02] duration-300 hover:border-emerald-400 dark:hover:border-indigo-400 hover:shadow-[0_0_25px_rgba(5,150,105,0.35)] dark:hover:shadow-[0_0_25px_rgba(99,102,241,0.35)]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-500 dark:text-slate-400 text-sm uppercase flex items-center">
                <Activity className="w-4 h-4 mr-2" /> Global Avg Expense
              </h4>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1 truncate">${averageTx.toLocaleString()}</h2>
            <p className="text-slate-600 dark:text-slate-300 font-medium pb-2">Per typical transaction.</p>
          </div>

          {/* Most Frequent Category */}
          <div className="bg-[#FFFFF0] dark:bg-slate-800 rounded-2xl p-6 shadow-[0_0_15px_rgba(234,179,8,0.15)] dark:shadow-[0_0_15px_rgba(234,179,8,0.1)] border-2 border-yellow-200 dark:border-yellow-900/50 flex flex-col justify-between relative overflow-hidden transition-all hover:-translate-y-1 hover:scale-[1.02] duration-300 hover:border-yellow-400 dark:hover:border-yellow-600 hover:shadow-[0_0_25px_rgba(234,179,8,0.35)] dark:hover:shadow-[0_0_25px_rgba(234,179,8,0.3)]">
            <div>
              <div className="flex items-center justify-between mb-4">
                 <h4 className="font-semibold text-slate-500 dark:text-slate-400 text-sm uppercase flex items-center">
                   <ArrowRight className="w-4 h-4 mr-2" /> Most Frequent
                 </h4>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1 truncate">{mostFrequentCategory.name}</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-medium">Recorded {mostFrequentCategory.count} times.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
