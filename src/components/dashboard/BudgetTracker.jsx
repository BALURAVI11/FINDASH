import { useState, useMemo } from "react";
import { useFinance } from "../../context/FinanceContext";
import { Target, Plus, X, Pencil, Check, AlertOctagon, TrendingDown } from "lucide-react";

export const BudgetTracker = ({ viewPeriod, setViewPeriod, viewMode }) => {
  const { transactions, budgets, setPeriodBudget, deletePeriodBudget, role, theme } = useFinance();
  const [isAdding, setIsAdding] = useState(false);
  
  // Split viewPeriod into components
  const [y, m] = viewPeriod.split('-');
  
  const [newBudget, setNewBudget] = useState({ 
    category: "", 
    amount: "", 
    month: m,
    year: y
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editAmount, setEditAmount] = useState("");

  // Calculate actuals for the selected view period (Month or Year)
  const categoryTotals = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      const isMatch = viewMode === 'month' 
        ? curr.date.startsWith(viewPeriod)
        : curr.date.startsWith(viewPeriod.split('-')[0]);
        
      if (!isMatch || curr.type !== 'expense') return acc;
      
      const amt = Number(curr.amount);
      const category = curr.category.toLowerCase().trim(); // case insensitive normalization
      acc[category] = (acc[category] || 0) + amt;
      return acc;
    }, {});
  }, [transactions, viewMode, viewPeriod]);

  // Aggregate all known expense categories to populate the datalist for easy selection
  const availableCategories = useMemo(() => {
    const cats = new Set(transactions.filter(t => t.type === 'expense').map(t => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newBudget.category || !newBudget.amount || !newBudget.month || !newBudget.year) return;
    const period = `${newBudget.year}-${newBudget.month.padStart(2, '0')}`;
    setPeriodBudget(period, newBudget.category, newBudget.amount);
    setNewBudget({ ...newBudget, category: "", amount: "" });
    setIsAdding(false);
  };

  const activePeriodBudgets = useMemo(() => {
    if (viewMode === 'month') return budgets[viewPeriod] || {};
    
    // Yearly aggregation: sum limits for each category across all months of that year
    const yearStr = viewPeriod.split('-')[0];
    const yearlyLimits = {};
    
    Object.keys(budgets).forEach(period => {
      if (period.startsWith(yearStr)) {
        const periodBudgets = budgets[period];
        if (periodBudgets && typeof periodBudgets === 'object') {
          Object.keys(periodBudgets).forEach(cat => {
            yearlyLimits[cat] = (yearlyLimits[cat] || 0) + periodBudgets[cat];
          });
        }
      }
    });
    return yearlyLimits;
  }, [budgets, viewPeriod, viewMode]);

  const budgetEntries = Object.keys(activePeriodBudgets).map(categoryKey => {
    const limit = activePeriodBudgets[categoryKey];
    const normalizedKey = categoryKey.toLowerCase().trim();
    const actual = categoryTotals[normalizedKey] || 0;
    const percentage = Math.min((actual / limit) * 100, 100);
    const isExceeded = actual > limit;
    const isWarning = actual > limit * 0.8 && !isExceeded;

    let barColor = "bg-emerald-500 dark:bg-emerald-400";
    if (isWarning) barColor = "bg-amber-400 dark:bg-amber-500";
    if (isExceeded) barColor = "bg-rose-500 dark:bg-rose-500";

    return { category: categoryKey, limit, actual, percentage, isExceeded, isWarning, barColor };
  });

  const startEditing = (cat, limit) => {
    setEditingCategory(cat);
    setEditAmount(limit.toString());
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditAmount("");
  };

  const handleEditSave = (cat) => {
    if (!editAmount) return;
    setPeriodBudget(viewPeriod, cat, editAmount);
    setEditingCategory(null);
  };

  return (
    <div className="relative z-10 bg-[#FFFFF0] dark:bg-slate-800 rounded-3xl shadow-[0_0_20px_rgba(5,150,105,0.12)] dark:shadow-[0_0_20px_rgba(99,102,241,0.12)] border-2 border-emerald-200 dark:border-indigo-500/30 p-6 md:p-8 animate-slide-up stagger-2 transition-all duration-300 hover:border-emerald-400 dark:hover:border-indigo-400 hover:shadow-[0_0_35px_rgba(5,150,105,0.3)] dark:hover:shadow-[0_0_35px_rgba(99,102,241,0.3)]">
      
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400 dark:bg-indigo-600 rounded-full mix-blend-multiply filter blur-[60px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-400 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-[60px] opacity-10 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center space-x-3 min-w-[200px]">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-indigo-900/40 flex items-center justify-center shadow-inner">
            <Target className="w-5 h-5 text-emerald-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">Category Budgets</h3>
        </div>

        <div className="flex flex-1 justify-center items-center w-full md:w-auto">
          <div className="flex items-center gap-2 bg-emerald-50/50 dark:bg-slate-900/40 px-3 py-1.5 rounded-xl border border-emerald-100/50 dark:border-indigo-500/20 shadow-sm transition-all hover:border-emerald-300 dark:hover:border-indigo-400">
            {viewMode === 'month' ? (
              <input 
                type="month" 
                value={viewPeriod}
                onChange={(e) => setViewPeriod(e.target.value)}
                style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }}
                className="text-sm font-bold text-emerald-700 dark:text-indigo-300 bg-transparent border-none outline-none cursor-pointer"
              />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Year:</span>
                <input 
                  type="number" 
                  value={viewPeriod.split('-')[0]}
                  onChange={(e) => setViewPeriod(`${e.target.value}-${viewPeriod.split('-')[1]}`)}
                  min="2000"
                  max="2100"
                  style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }}
                  className="w-20 text-sm font-bold text-emerald-700 dark:text-indigo-300 bg-transparent border-none outline-none cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {role === "Admin" && (
          <div className="min-w-[140px] flex justify-end">
            <button 
              onClick={() => setIsAdding(!isAdding)} 
              className="flex items-center text-sm font-bold text-emerald-700 dark:text-indigo-400 hover:scale-105 transition-all bg-emerald-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl shadow-sm border border-emerald-100 dark:border-indigo-500/20"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Set Budget
            </button>
          </div>
        )}
      </div>

      {isAdding && role === "Admin" && (
        <form onSubmit={handleAddSubmit} className="flex flex-col lg:flex-row gap-3 mb-8 p-4 bg-white/40 dark:bg-slate-900/30 rounded-2xl border border-white/60 dark:border-slate-700/40 animate-in fade-in slide-in-from-top-2">
          <div className="flex gap-2 w-full lg:w-48">
            <select 
              required 
              value={newBudget.month} 
              onChange={e => setNewBudget({ ...newBudget, month: e.target.value })} 
              className="flex-1 px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-indigo-500 transition-all dark:text-white font-medium"
            >
              {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                <option key={m} value={m}>{new Date(2000, parseInt(m)-1).toLocaleString('default', { month: 'short' })}</option>
              ))}
            </select>
            <input 
              type="number" 
              placeholder="Year"
              required 
              value={newBudget.year} 
              onChange={e => setNewBudget({ ...newBudget, year: e.target.value })} 
              className="w-20 px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-indigo-500 transition-all dark:text-white font-medium"
            />
          </div>
          <div className="flex-1 relative">
            <input 
              type="text" 
              list="budget-categories"
              placeholder="Category (ex: Food)" 
              required 
              value={newBudget.category} 
              onChange={e => setNewBudget({ ...newBudget, category: e.target.value })} 
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-indigo-500 transition-all dark:text-white font-medium"
            />
            <datalist id="budget-categories">
              {availableCategories.map(cat => <option key={cat} value={cat} />)}
            </datalist>
          </div>
          <div className="w-full lg:w-32 relative">
            <input 
              type="number" 
              placeholder="Limit $" 
              required 
              value={newBudget.amount} 
              onChange={e => setNewBudget({ ...newBudget, amount: e.target.value })} 
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-indigo-500 transition-all dark:text-white font-medium"
            />
          </div>
          <button type="submit" className="bg-emerald-600 dark:bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 dark:hover:bg-indigo-700 shadow-md active:scale-95 transition-all flex items-center justify-center">
            Save Budget
          </button>
        </form>
      )}

      {budgetEntries.length === 0 ? (
        <div className="text-center py-6 text-slate-400 dark:text-slate-500 font-medium text-sm">
           No active budgets set. Set one to track your limits!
        </div>
      ) : (
        <div className="space-y-6">
          {budgetEntries.map((budget, idx) => (
            <div key={idx} className={`relative group p-4 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50 hover:bg-white/30 dark:hover:bg-slate-900/20 transition-all duration-300 animate-slide-up`} style={{ animationDelay: `${0.1 * idx}s` }}>
              <div className="flex justify-between items-center text-sm mb-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${budget.barColor}`} />
                  {budget.category}
                  {budget.isExceeded && <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse" title="Budget Exceeded" />}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 transition-colors group-hover:text-slate-600 dark:group-hover:text-slate-300">
                    <span className="text-sm text-slate-800 dark:text-slate-200">${budget.actual.toLocaleString()}</span>
                    <span className="mx-1">/</span>
                    {editingCategory === budget.category ? (
                      <div className="inline-flex items-center">
                        <span className="text-slate-500 mr-1">$</span>
                        <input 
                          type="number" 
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-16 px-1.5 py-0.5 border border-emerald-300 dark:border-indigo-500 rounded text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">${budget.limit.toLocaleString()}</span>
                    )}
                  </span>
                  {role === "Admin" && (
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingCategory === budget.category ? (
                        <>
                          <button 
                            onClick={() => handleEditSave(budget.category)} 
                            className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 hover:text-emerald-700 transition-all active:scale-90"
                            title="Save Changes"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={cancelEditing} 
                            className="p-1.5 bg-slate-50 dark:bg-slate-900/40 rounded-lg text-slate-400 hover:text-slate-600 transition-all active:scale-90"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => startEditing(budget.category, budget.limit)} 
                            className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all active:scale-90"
                            title="Edit Budget"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deletePeriodBudget(viewPeriod, budget.category)} 
                            className="p-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all focus:opacity-100 active:scale-90"
                            title="Remove Budget"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="w-full bg-slate-100 dark:bg-slate-700/40 h-3 rounded-full overflow-hidden shadow-inner flex">
                <div 
                  className={`h-full ${budget.barColor} transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_0_10px_rgba(0,0,0,0.1)]`} 
                  style={{ width: `${budget.percentage}%` }}
                />
              </div>
              
              {budget.isExceeded ? (
                <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center">
                  <TrendingDown className="w-3 h-3 mr-1" /> You are over by ${(budget.actual - budget.limit).toLocaleString()}.
                </p>
              ) : (
                <p className="text-xs text-emerald-500 mt-1.5 font-medium flex items-center">
                  <Check className="w-3 h-3 mr-1" /> Within budget! ${(budget.limit - budget.actual).toLocaleString()} remaining.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BudgetTracker;
