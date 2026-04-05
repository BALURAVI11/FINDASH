import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { FinanceProvider } from './context/FinanceContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Setting up the top level state provider for the dashboard */}
    <FinanceProvider>
      <App />
    </FinanceProvider>
  </StrictMode>,
)
