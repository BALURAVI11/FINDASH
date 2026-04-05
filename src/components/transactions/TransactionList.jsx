import { useState, useEffect, useMemo } from "react";
import { useFinance } from "../../context/FinanceContext";
import { Search, Plus, Filter, Pencil, Check, X, Trash2, Download, RefreshCcw, ArrowUp, ArrowDown, ArrowUpDown, SlidersHorizontal } from "lucide-react";

export const TransactionList = () => {
  const { 
    transactions, 
    role, 
    addTransaction, 
    editTransaction, 
    deleteTransaction, 
    formatDateDisplay,
    pieCategoryFilter, 
    setPieCategoryFilter 
  } = useFinance();
  
  // Sorting States
  const [sortField, setSortField] = useState(null); // 'date', 'category', 'amount'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  // Search State
  const [searchTerm, setSearchTerm] = useState("");

  const defaultFilters = {
    category: "",
    type: "all",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: ""
  };

  // Applied Filters State (Persisted)
  const [appliedFilters, setAppliedFilters] = useState(() => {
    const saved = localStorage.getItem("dashboard_tx_filters");
    return saved ? JSON.parse(saved) : defaultFilters;
  });

  // Draft Filters State (For panel)
  const [draftFilters, setDraftFilters] = useState(appliedFilters);
  
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Sync up Pie Chart interactions auto-filtering
  useEffect(() => {
    if (pieCategoryFilter) {
      const updated = { ...appliedFilters, category: pieCategoryFilter };
      setAppliedFilters(updated);
      setDraftFilters(updated);
    }
  }, [pieCategoryFilter]);

  useEffect(() => {
    localStorage.setItem("dashboard_tx_filters", JSON.stringify(appliedFilters));
  }, [appliedFilters]);

  // Apply drafted filters
  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setIsFilterPanelOpen(false);
  };

  // Completely reset filters
  const resetFilters = () => {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setSearchTerm("");
    setPieCategoryFilter(""); 
  };

  // Remove individual filter chip
  const removeFilter = (key) => {
    const updated = { ...appliedFilters, [key]: key === "type" ? "all" : "" };
    setAppliedFilters(updated);
    setDraftFilters(updated);
    if (key === "category") setPieCategoryFilter("");
  };

  // Active filters count mapping
  const activeFilterChips = Object.entries(appliedFilters).filter(([key, val]) => val !== "" && val !== "all");
  const activeCount = activeFilterChips.length;

  const uniqueCategories = [...new Set(transactions.map(tx => tx.category))].sort();

  // Modal / Inline Edit States
  const [isAdding, setIsAdding] = useState(false);
  const [newTx, setNewTx] = useState({ amount: "", category: "", type: "expense", date: new Date().toISOString().split('T')[0] });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  // Filter Logic
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = appliedFilters.type === "all" || tx.type === appliedFilters.type;
    const matchesCatDropdown = appliedFilters.category === "" || tx.category === appliedFilters.category;
    const matchesStartDate = appliedFilters.startDate ? new Date(tx.date) >= new Date(appliedFilters.startDate) : true;
    const matchesEndDate = appliedFilters.endDate ? new Date(tx.date) <= new Date(appliedFilters.endDate) : true;
    const matchesMinAmt = appliedFilters.minAmount !== "" ? Number(tx.amount) >= Number(appliedFilters.minAmount) : true;
    const matchesMaxAmt = appliedFilters.maxAmount !== "" ? Number(tx.amount) <= Number(appliedFilters.maxAmount) : true;
    
    return matchesSearch && matchesType && matchesCatDropdown && matchesStartDate && matchesEndDate && matchesMinAmt && matchesMaxAmt;
  }).sort((a, b) => {
    if (!sortField) return 0;
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'amount') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    } else if (sortField === 'date') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDateSort = () => {
    if (sortField === 'date') {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField('date');
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 inline ml-1 opacity-50 hover:opacity-100 cursor-pointer transition select-none" onClick={handleDateSort} />;
    if (sortOrder === 'desc') return <ArrowUp className="w-4 h-4 inline ml-1 text-emerald-600 dark:text-emerald-400 cursor-pointer transition select-none" onClick={handleDateSort} title="Descending" />;
    return <ArrowDown className="w-4 h-4 inline ml-1 text-emerald-600 dark:text-emerald-400 cursor-pointer transition select-none" onClick={handleDateSort} title="Ascending" />;
  };

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) return;
    const headers = ["Date", "Category", "Type", "Amount"];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map(tx => `${tx.date},"${tx.category}",${tx.type},${tx.amount}`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "transactions_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.category) return;
    addTransaction({ amount: Number(newTx.amount), category: newTx.category, type: newTx.type, date: newTx.date });
    setIsAdding(false);
    setNewTx({ amount: "", category: "", type: "expense", date: new Date().toISOString().split('T')[0] });
  };

  const startEditing = (tx) => { setEditingId(tx.id); setEditForm({ ...tx }); };
  const cancelEditing = () => { setEditingId(null); setEditForm(null); };

  const handleEditSubmit = () => {
    if (!editForm.amount || !editForm.category) return;
    editTransaction(editingId, { ...editForm, amount: Number(editForm.amount) });
    setEditingId(null); setEditForm(null);
  };

  const EmptyStateBlock = () => (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
        <Filter className="w-10 h-10 text-slate-300 dark:text-slate-600" />
      </div>
      <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No transactions yet 👀</h3>
      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
        We couldn't find any financial records matching your current filter criteria.
      </p>
      <div className="flex gap-3">
        <button onClick={resetFilters} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-[#FDFBF7] dark:hover:bg-slate-800 transition">
          Clear Filters
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative mb-8 z-10">

      <div className="relative z-10 mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight mb-2 flex items-center gap-2">
          Hello, Kolluri Ravi Teja!
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-2 font-medium">Here are your Transactions logs and records.</p>
      </div>

      {/* ── Main card ── */}
      <div className="bg-[#FFFFF0] dark:bg-slate-800 rounded-3xl shadow-[0_0_20px_rgba(5,150,105,0.12)] dark:shadow-[0_0_20px_rgba(99,102,241,0.12)] border-2 border-emerald-200 dark:border-indigo-500/30 overflow-hidden transition-all duration-300 animate-slide-up stagger-3 relative z-10">
      
      {/* HEADER & CONTROLS TOOLBAR */}
      <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col gap-4 relative z-20">
        
        {/* Top Control Strip */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">Transaction Log</h3>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
            
            {/* Search Bar - Always Visible */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-9 pr-4 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 w-full transition-colors" 
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <button 
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)} 
              className={`flex items-center space-x-1 px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${isFilterPanelOpen || activeCount > 0 ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-indigo-900/30 dark:border-indigo-500/30 dark:text-indigo-300" : "bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
            >
              <SlidersHorizontal className="w-4 h-4" /> 
              <span>Filters {activeCount > 0 && `(${activeCount})`}</span>
            </button>
            <button onClick={exportToCSV} className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg text-sm transition-colors font-medium">
              <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
            </button>
            {role === 'Admin' && (
              <button 
                onClick={() => { setIsAdding(!isAdding); setIsFilterPanelOpen(false); }} 
                className="bg-emerald-800 hover:bg-emerald-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center justify-center whitespace-nowrap shadow-sm hover:shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4 mr-1" /> Add New
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Filters Panel */}
        <div className={`grid transition-all duration-300 ease-in-out ${isFilterPanelOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0 mt-0 pointer-events-none"}`}>
          <div className="overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                
                {/* Category Group */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Category</label>
                  <select value={draftFilters.category} onChange={e => setDraftFilters({...draftFilters, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500">
                    <option value="">All Categories</option>
                    {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                {/* Type Group */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Type</label>
                  <div className="relative flex items-center">
                    <select value={draftFilters.type} onChange={e => setDraftFilters({...draftFilters, type: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500">
                      <option value="all">All Types</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                </div>

                {/* Date Group */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" title="Start Date" value={draftFilters.startDate} onChange={e => setDraftFilters({...draftFilters, startDate: e.target.value})} className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 [color-scheme:light] dark:[color-scheme:dark] outline-none focus:border-emerald-500" />
                    <input type="date" title="End Date" value={draftFilters.endDate} onChange={e => setDraftFilters({...draftFilters, endDate: e.target.value})} className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 [color-scheme:light] dark:[color-scheme:dark] outline-none focus:border-emerald-500" />
                  </div>
                </div>

                {/* Amount Group */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Amount Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="Min $" value={draftFilters.minAmount} onChange={e => setDraftFilters({...draftFilters, minAmount: e.target.value})} className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500" />
                    <input type="number" placeholder="Max $" value={draftFilters.maxAmount} onChange={e => setDraftFilters({...draftFilters, maxAmount: e.target.value})} className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500" />
                  </div>
                </div>

              </div>
              
              <div className="flex justify-end items-center gap-3 pt-2 border-t border-slate-200 dark:border-slate-700/50 mt-2">
                <button onClick={() => setDraftFilters(defaultFilters)} className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-2 py-1 transition-colors">
                  Clear Draft
                </button>
                <button onClick={applyFilters} className="px-4 py-1.5 bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-md text-sm font-medium transition-colors">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mr-1">Active:</span>
            {activeFilterChips.map(([k, v]) => {
              let label = v;
              if (k === 'type') label = v === "income" ? "Income" : "Expense";
              if (k === 'minAmount') label = `Min: $${v}`;
              if (k === 'maxAmount') label = `Max: $${v}`;
              if (k === 'startDate') label = `From: ${formatDateDisplay(v)}`;
              if (k === 'endDate') label = `To: ${formatDateDisplay(v)}`;
              
              return (
                <span key={k} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-indigo-900/40 dark:text-indigo-300 border border-emerald-200 dark:border-indigo-500/30 animate-in fade-in zoom-in duration-200">
                  {label}
                  <button onClick={() => removeFilter(k)} className="hover:text-emerald-950 dark:hover:text-white rounded-full transition-colors"><X className="w-3 h-3" /></button>
                </span>
              );
            })}
            <button onClick={resetFilters} className="text-xs text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-medium ml-1 transition-colors">
              Reset All
            </button>
          </div>
        )}
      </div>

      {isAdding && role === "Admin" && (
        <div className="p-6 bg-[#FFFFF0] border-b border-slate-100 dark:bg-slate-800/80 dark:border-slate-700 animate-in slide-in-from-top-2">
          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <input type="date" required value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})} className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md text-sm bg-transparent text-slate-800 dark:text-slate-100 [color-scheme:light] dark:[color-scheme:dark]" />
            <input type="text" required placeholder="Category" value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value})} className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md text-sm bg-transparent text-slate-800 dark:text-slate-100" />
            <input type="number" required placeholder="Amount" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md text-sm bg-transparent text-slate-800 dark:text-slate-100" />
            <select value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value})} className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md text-sm bg-transparent text-slate-800 dark:text-slate-100 appearance-none">
              <option value="expense" className="dark:bg-slate-800">Expense</option>
              <option value="income" className="dark:bg-slate-800">Income</option>
            </select>
            <button type="submit" className="bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-md text-sm hover:bg-slate-900 dark:hover:bg-slate-600 transition">Save</button>
          </form>
        </div>
      )}

      {filteredTransactions.length === 0 ? (
        <EmptyStateBlock />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-[#FFFFF0] dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-medium border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Date {getSortIcon('date')}</th>
                <th className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    Category
                    <select 
                      value={sortField === 'category' ? (sortOrder === 'asc' ? 'A-Z' : 'Z-A') : 'none'}
                      onChange={(e) => {
                        if (e.target.value === 'none') { setSortField(null); }
                        else if (e.target.value === 'A-Z') { setSortField('category'); setSortOrder('asc'); }
                        else { setSortField('category'); setSortOrder('desc'); }
                      }}
                      className="bg-[#FFFFF0] dark:bg-slate-800 text-xs font-semibold normal-case outline-none cursor-pointer border rounded dark:border-slate-600 border-slate-200 px-1 py-0.5 text-slate-600 dark:text-slate-300 transition-colors focus:border-emerald-500"
                    >
                      <option value="none">None</option>
                      <option value="A-Z">A-Z</option>
                      <option value="Z-A">Z-A</option>
                    </select>
                  </div>
                </th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    Amount
                    <select 
                      value={sortField === 'amount' ? (sortOrder === 'asc' ? 'low-high' : 'high-low') : 'none'}
                      onChange={(e) => {
                        if (e.target.value === 'none') { setSortField(null); }
                        else if (e.target.value === 'low-high') { setSortField('amount'); setSortOrder('asc'); }
                        else { setSortField('amount'); setSortOrder('desc'); }
                      }}
                      className="bg-[#FFFFF0] dark:bg-slate-800 text-xs font-semibold normal-case outline-none cursor-pointer border rounded dark:border-slate-600 border-slate-200 px-1 py-0.5 text-slate-600 dark:text-slate-300 transition-colors focus:border-emerald-500 text-left"
                    >
                      <option value="none">None</option>
                      <option value="high-low">High-Low</option>
                      <option value="low-high">Low-High</option>
                    </select>
                  </div>
                </th>
                {role === 'Admin' && <th className="px-6 py-4 text-center w-24">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-emerald-100/50 dark:border-slate-700/50 transition-all duration-300 relative hover:z-10 hover:bg-white dark:hover:bg-slate-700 hover:shadow-[0_0_20px_rgba(5,150,105,0.3)] dark:hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:border-transparent">
                  {editingId === tx.id ? (
                    <>
                      <td className="px-6 py-2"><input type="date" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} className="w-full px-2 py-1 border border-emerald-200 dark:border-indigo-500 rounded text-sm bg-transparent dark:text-white [color-scheme:light] dark:[color-scheme:dark]"/></td>
                      <td className="px-6 py-2"><input type="text" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full px-2 py-1 border border-emerald-200 dark:border-indigo-500 rounded text-sm bg-transparent dark:text-white"/></td>
                      <td className="px-6 py-2">
                        <select value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})} className="w-full px-2 py-1 border border-emerald-200 dark:border-indigo-500 rounded text-sm bg-transparent dark:text-white">
                          <option value="expense" className="dark:bg-slate-800">Expense</option>
                          <option value="income" className="dark:bg-slate-800">Income</option>
                        </select>
                      </td>
                      <td className="px-6 py-2"><input type="number" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} className="w-full px-2 py-1 border border-emerald-200 dark:border-indigo-500 rounded text-sm text-right bg-transparent dark:text-white"/></td>
                      {role === "Admin" && (
                        <td className="px-6 py-2 text-center text-sm font-medium space-x-2 whitespace-nowrap">
                          <button onClick={handleEditSubmit} className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"><Check className="w-5 h-5 inline" /></button>
                          <button onClick={cancelEditing} className="text-rose-600 hover:text-rose-800 dark:text-rose-400"><X className="w-5 h-5 inline" /></button>
                        </td>
                      )}
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDateDisplay(tx.date)}</td>
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{tx.category}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                          {tx.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-300'}`}>
                        {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toLocaleString()}
                      </td>
                      
                      {role === 'Admin' && (
                        <td className="px-6 py-4 text-center space-x-3 whitespace-nowrap">
                          <button 
                            onClick={() => startEditing(tx)} 
                            className="text-emerald-800 hover:text-emerald-950 dark:text-indigo-400 transition-colors" 
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4 inline" />
                          </button>
                          <button 
                            onClick={() => deleteTransaction(tx.id)} 
                            className="text-rose-600 hover:text-rose-800 dark:text-rose-400 transition-colors" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      )}
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
};

export default TransactionList;
