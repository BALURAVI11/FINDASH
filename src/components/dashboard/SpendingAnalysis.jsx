import { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';

export const SpendingAnalysis = ({ dashViewMode, dashDay, dashMonth, dashYear }) => {
  const { transactions, theme, formatDateDisplay } = useFinance();

  const isDark = theme === "dark";
  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "#334155" : "#e2e8f0";

  const chartData = useMemo(() => {
    let data = [];
    
    if (dashViewMode === 'Day') {
      const dayTx = transactions.filter(t => t.date === dashDay).sort((a, b) => new Date(a.date) - new Date(b.date));
      // Since all time is stripped, we just list them sequentially
      data = dayTx.map((t, idx) => {
        const inc = t.type === 'income' ? Number(t.amount) : 0;
        const exp = t.type === 'expense' ? Number(t.amount) : 0;
        return {
          name: t.category, // Display category on axis since it's an intra-day breakdown
          Income: inc,
          Expenditure: exp,
          Net: inc - exp
        };
      });
      // If none, return empty array to trigger no-data UI
      if (data.length === 0) {
        return [];
      }
    } 
    else if (dashViewMode === 'Month') {
      const [year, month] = dashMonth.split('-');
      const daysInMonth = new Date(year, month, 0).getDate();
      
      const monthTx = transactions.filter(t => t.date.startsWith(`${year}-${month}`));
      if (monthTx.length === 0) return [];
      
      for (let i = 1; i <= daysInMonth; i++) {
        const dayStr = String(i).padStart(2, '0');
        const filterDate = `${year}-${month}-${dayStr}`;
        const dayRecords = monthTx.filter(t => t.date === filterDate);
        
        let inc = 0, exp = 0;
        dayRecords.forEach(t => {
          if (t.type === 'income') inc += Number(t.amount);
          if (t.type === 'expense') exp += Number(t.amount);
        });
        
        data.push({
          name: `${dayStr}/${month}`,
          Income: inc,
          Expenditure: exp,
          Net: inc - exp
        });
      }
    }
    else if (dashViewMode === 'Year') {
      const yearTx = transactions.filter(t => t.date.startsWith(dashYear));
      if (yearTx.length === 0) return [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let m = 0; m < 12; m++) {
        const monthStr = String(m + 1).padStart(2, '0');
        const monthRecords = yearTx.filter(t => t.date.startsWith(`${dashYear}-${monthStr}`));
        
        let inc = 0, exp = 0;
        monthRecords.forEach(t => {
          if (t.type === 'income') inc += Number(t.amount);
          if (t.type === 'expense') exp += Number(t.amount);
        });
        
        data.push({
          name: monthNames[m],
          Income: inc,
          Expenditure: exp,
          Net: inc - exp
        });
      }
    }
    
    return data;
  }, [transactions, dashViewMode, dashDay, dashMonth, dashYear]);

  return (
    <div className="bg-[#FFFFF0] dark:bg-slate-800 rounded-2xl shadow-[0_0_15px_rgba(5,150,105,0.15)] dark:shadow-[0_0_15px_rgba(99,102,241,0.15)] border-2 border-emerald-200 dark:border-indigo-500/30 p-6 animate-slide-up transition-all duration-300 hover:border-emerald-400 dark:hover:border-indigo-400 hover:shadow-[0_0_25px_rgba(5,150,105,0.35)] dark:hover:shadow-[0_0_25px_rgba(99,102,241,0.35)] relative z-20">
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4 border-b border-slate-100 dark:border-slate-700/60 pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 uppercase tracking-tight">
            Spending Analysis
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Comparison of Income, Expenditure and Net performance.</p>
        </div>
      </div>

      <div className="h-80 w-full flex flex-col">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#f1f5f9' : '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontWeight: 500 }}
                labelFormatter={(label) => {
                  if (dashViewMode === 'Day') return label;
                  if (dashViewMode === 'Month') {
                    const [d, m] = label.split('/');
                    const [y] = dashMonth.split('-');
                    return `${d}/${m}/${y}`;
                  }
                  return label;
                }}
                formatter={(value, name) => [`$${value.toLocaleString()}`, name]}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
              <Line type="monotone" name="Income" dataKey="Income" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              <Line type="monotone" name="Expenditure" dataKey="Expenditure" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              <Line type="monotone" name="Net" dataKey="Net" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 px-6 py-4 rounded-xl border border-amber-100 dark:border-amber-800/30 text-center text-amber-700 dark:text-amber-500 font-semibold text-sm shadow-sm inline-flex items-center">
              No transactions found for the selected period.
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default SpendingAnalysis;
