const API_URL = "http://localhost:5000";

// --- LOCAL STORAGE HELPERS ---
const getLocalTransactions = () => JSON.parse(localStorage.getItem("dashboard_transactions_v3") || "null");
const setLocalTransactions = (txs) => localStorage.setItem("dashboard_transactions_v3", JSON.stringify(txs));

const getLocalBudgets = () => JSON.parse(localStorage.getItem("dashboard_budgets_v4") || "null");
const setLocalBudgets = (b) => localStorage.setItem("dashboard_budgets_v4", JSON.stringify(b));

// --- API FETCHERS ---

export const fetchTransactions = async (mode) => {
  if (mode === "local") {
    return getLocalTransactions();
  }
  try {
    const res = await fetch(`${API_URL}/transactions`);
    if (!res.ok) throw new Error("Failed to fetch transactions from Mock API");
    return await res.json();
  } catch (error) {
    console.error("Mock API fetch failed.", error);
    throw error;
  }
};

export const fetchBudgets = async (mode) => {
  if (mode === "local") {
    return getLocalBudgets();
  }
  try {
    const res = await fetch(`${API_URL}/budgetDb`);
    if (!res.ok) throw new Error("Failed to fetch budgets from Mock API");
    const data = await res.json();
    return data.budgets || {};
  } catch (error) {
    console.error("Mock API fetch failed.", error);
    throw error;
  }
};

// --- CRUD OPERATIONS ---

// Sync entire transactions array (for initialization/reset)
export const syncTransactions = async (mode, txs) => {
  if (mode === "local") {
    setLocalTransactions(txs);
    return txs;
  }
  // For simplicity if we need to dump an entire array into the mock DB, 
  // we would ideally clear it and map POSTs. We will rely on FinanceContext logic for this.
  throw new Error("Bulk rewrite not implemented for Mock API. Use resetData in local mode.");
};

export const syncBudgets = async (mode, bMap) => {
  if (mode === "local") {
    setLocalBudgets(bMap);
    return bMap;
  }
  
  const payload = {
    id: "root",
    budgets: bMap
  };
  const res = await fetch(`${API_URL}/budgetDb`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to save budgets via Mock API");
  const data = await res.json();
  return data.budgets;
}

export const addTransactionApi = async (mode, currentTxs, newTx) => {
  if (mode === "local") {
    const updated = [newTx, ...currentTxs];
    setLocalTransactions(updated);
    return updated;
  }
  
  const res = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTx),
  });
  if (!res.ok) throw new Error("Failed to add transaction via Mock API");
  const savedTx = await res.json();
  return [savedTx, ...currentTxs];
};

export const editTransactionApi = async (mode, currentTxs, id, updatedTx) => {
  if (mode === "local") {
    const updated = currentTxs.map(t => (t.id === id ? { ...t, ...updatedTx } : t));
    setLocalTransactions(updated);
    return updated;
  }

  const res = await fetch(`${API_URL}/transactions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedTx),
  });
  if (!res.ok) throw new Error("Failed to edit transaction via Mock API");
  const savedTx = await res.json();
  return currentTxs.map(t => (t.id === id ? savedTx : t));
};

export const deleteTransactionApi = async (mode, currentTxs, id) => {
  if (mode === "local") {
    const updated = currentTxs.filter(t => t.id !== id);
    setLocalTransactions(updated);
    return updated;
  }

  const res = await fetch(`${API_URL}/transactions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete transaction via Mock API");
  
  return currentTxs.filter(t => t.id !== id);
};
