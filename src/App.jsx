import { useState, useEffect } from 'react'
import DashboardLayout from './components/layout/DashboardLayout'
import Overview from './components/dashboard/Overview'
import TransactionList from './components/transactions/TransactionList'
import Insights from './components/insights/Insights'
import Profile from './components/profile/Profile'
import BudgetsAndAnalytics from './components/dashboard/BudgetsAndAnalytics'

function App() {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || "Dashboard");

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // Conditional Router
  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return <Overview setActiveTab={setActiveTab} />;
      case "Transactions":
        return <TransactionList />;
      case "Profile":
        return <Profile />;
      case "Budgets & Analytics":
        return <BudgetsAndAnalytics />;
      case "Insights":
        return <Insights />;
      default:
        return <Overview />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="w-full">
        {renderContent()}
      </div>
    </DashboardLayout>
  )
}

export default App
