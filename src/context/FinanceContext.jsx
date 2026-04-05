import { createContext, useContext, useState, useEffect } from "react";

const FinanceContext = createContext(null);

// Helper to format dates globally as DD/MM/YYYY
export const formatDateDisplay = (dateValue) => {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return dateValue;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};

// Helper to remove exact duplicates based on date, category, amount, and type
const deDuplicateTransactions = (data) => {
  const seen = new Set();
  return data.filter(item => {
    // Unique key excluding ID, since ID might be unique for identical rows
    const key = `${item.date}-${item.category}-${item.amount}-${item.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// Generate Historical Mock Data specifically from Jan 2024 to Apr 2026
const generateHistoricalData = () => {
  const start = new Date('2024-01-01');
  const end = new Date('2026-04-30');
  const tx = [];
  let id = 1;
  
  const cycleTemplate = [
    { cat: "Salary", amt: 4500, type: "income" },
    { cat: "Groceries", amt: 120, type: "expense" },
    { cat: "Transport", amt: 45, type: "expense" },
    { cat: "Dining", amt: 85, type: "expense" },
    { cat: "Utilities", amt: 210, type: "expense" },
    { cat: "Groceries", amt: 150, type: "expense" },
    { cat: "Freelance", amt: 800, type: "income" },
    { cat: "Dining", amt: 110, type: "expense" },
    { cat: "Rent", amt: 1500, type: "expense" }
  ];

  let curr = new Date(start);
  while (curr <= end) {
    const year = curr.getFullYear();
    const month = curr.getMonth();
    
    // Excluded Months Logic
    // May 2024 (m=4), June 2024 (m=5), Dec 2024 (m=11)
    // August 2025 (m=7)
    const isExcluded2024 = year === 2024 && (month === 4 || month === 5 || month === 11);
    const isExcluded2025 = year === 2025 && month === 7;
    
    if (!isExcluded2024 && !isExcluded2025) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      // Strict requirement: March (month 2) and April (month 3) 2026 get everyday records
      if (year === 2026 && (month === 2 || month === 3)) {
        for (let day = 1; day <= daysInMonth; day++) {
          const d = new Date(year, month, day, 12, 0, 0);
          if (d >= start && d <= end) {
            // Random income for every date
            tx.push({
              id: (id++).toString(),
              date: d.toISOString().split('T')[0],
              amount: Math.floor(Math.random() * 500) + 150,
              category: "Salary",
              type: "income"
            });
            // Random expense for every date
            tx.push({
              id: (id++).toString(),
              date: d.toISOString().split('T')[0],
              amount: Math.floor(Math.random() * 200) + 20,
              category: ["Groceries", "Transport", "Dining", "Utilities", "Rent"][Math.floor(Math.random()*5)],
              type: "expense"
            });
          }
        }
      } else {
        const usedDays = new Set();
        
        cycleTemplate.forEach(item => {
          // Find a unique random day within the month
          let randomDay;
          let attempts = 0;
          do {
            randomDay = Math.floor(Math.random() * daysInMonth) + 1;
            attempts++;
          } while (usedDays.has(randomDay) && attempts < 50); // safety break
          
          usedDays.add(randomDay);
          
          const d = new Date(year, month, randomDay, 12, 0, 0); 
          if (d >= start && d <= end) {
            const variance = 1 + (month % 4 - 1.5) * 0.15; 
            const amount = item.type === 'expense' ? Math.round(item.amt * variance) : item.amt;
            
            tx.push({
              id: (id++).toString(),
              date: d.toISOString().split('T')[0],
              amount,
              category: item.cat,
              type: item.type
            });
          }
        });
      }
    }
    // Advance 1 month
    curr.setMonth(curr.getMonth() + 1);
  }
  return tx.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending
};

const MOCK_TRANSACTIONS = deDuplicateTransactions(generateHistoricalData());

const DEFAULT_BUDGETS = {
  "2025-11": { "Groceries": 200, "Dining": 250 },
  "2025-12": { "Groceries": 300, "Dining": 150 },
  "2026-01": { "Transport": 30, "Rent": 1600 },
  "2026-02": { "Transport": 60, "Utilities": 150 },
  "2026-03": { "Groceries": 1500, "Dining": 1200, "Transport": 800, "Utilities": 600, "Rent": 3000 },
  "2026-04": { "Groceries": 1800, "Dining": 1500, "Transport": 900, "Utilities": 700, "Rent": 3200 }
};

export const FinanceProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  
  // Advanced Features: Budgets array & Cross-view Pie Chart Filter binding
  const [budgets, setBudgets] = useState({});
  const [pieCategoryFilter, setPieCategoryFilter] = useState("");

  const [role, setRole] = useState(() => {
    return localStorage.getItem("dashboard_role") || "Viewer";
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("dashboard_theme") || "light";
  });

  // Theme Toggler side effect
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
    localStorage.setItem("dashboard_theme", theme);
  }, [theme]);

  // Role Persister
  useEffect(() => {
    localStorage.setItem("dashboard_role", role);
  }, [role]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  // Mock Asynchronous Database Fetch including Budgets
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const savedTx = localStorage.getItem("dashboard_transactions_v3");
      const savedBudgets = localStorage.getItem("dashboard_budgets_v4");
      
      if (savedTx) {
        const parsedTx = JSON.parse(savedTx);
        setTransactions(deDuplicateTransactions(parsedTx));
      } else {
        setTransactions(MOCK_TRANSACTIONS);
      }
      
      if (savedBudgets) {
        const parsed = JSON.parse(savedBudgets);
        setBudgets({ ...parsed, ...DEFAULT_BUDGETS });
      } else {
        setBudgets(DEFAULT_BUDGETS);
      }

      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Persist transactions to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("dashboard_transactions_v3", JSON.stringify(transactions));
      localStorage.setItem("dashboard_budgets_v4", JSON.stringify(budgets));
    }
  }, [transactions, budgets, isLoading]);

  const addTransaction = (newTransaction) => {
    const transaction = { id: Date.now().toString(), ...newTransaction };
    setTransactions((prev) => [transaction, ...prev]);
  };

  const editTransaction = (id, updatedData) => {
    setTransactions((prev) => 
      prev.map(tx => tx.id === id ? { ...tx, ...updatedData } : tx)
    );
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter(tx => tx.id !== id));
  };

  const setPeriodBudget = (period, category, amount) => {
    setBudgets(prev => ({
      ...prev,
      [period]: {
        ...(prev[period] || {}),
        [category]: Number(amount)
      }
    }));
  };

  const deletePeriodBudget = (period, category) => {
    setBudgets(prev => {
      const currentPeriodBudgets = { ...(prev[period] || {}) };
      delete currentPeriodBudgets[category];
      
      return {
        ...prev,
        [period]: currentPeriodBudgets
      };
    });
  };

  const resetData = () => {
    setTransactions(MOCK_TRANSACTIONS);
    setBudgets(DEFAULT_BUDGETS);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        addTransaction,
        editTransaction,
        deleteTransaction,
        resetData,
        role,
        setRole,
        isLoading,
        theme,
        toggleTheme,
        budgets,
        setPeriodBudget,
        deletePeriodBudget,
        formatDateDisplay,
        pieCategoryFilter,
        setPieCategoryFilter
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};
