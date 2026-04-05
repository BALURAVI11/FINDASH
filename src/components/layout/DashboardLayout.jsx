import { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import {
  LayoutDashboard,
  Wallet,
  BarChart3,
  Lightbulb,
  HandCoins,
  Moon,
  Sun,
  Menu,
  X,
  UserCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  MessageCircle, 
  Briefcase, 
  Camera,
  HelpCircle,
  Headphones,
  MessageSquare,
  Bell,
  Search,
} from "lucide-react";

// ── Centralized Floating Ball config (spanning entire right pane) ──
const colours = [
  "rgba(99,102,241,",   // indigo
  "rgba(16,185,129,",  // emerald
  "rgba(245,158,11,",  // amber
  "rgba(244,63,94,",   // rose
  "rgba(139,92,246,",  // violet
  "rgba(6,182,212,",   // cyan
];
const staticBalls = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  size:    Math.random() * 120 + 35,        // 35–155 px
  top:     Math.random() * 94 + 3,          // 3%–97% from top
  left:    Math.random() * 94 + 3,          // 3%–97% from left
  colour:  colours[i % colours.length],
  opacity: Math.random() * 0.18 + 0.10,     // 0.10–0.28 (Increased intensity)
  dur:     Math.random() * 14 + 10,         // 10–24s per cycle
  delay:   Math.random() * 10,              // 0–10s start delay
  driftX:  (Math.random() - 0.5) * 180,     // ±90px horizontal wander
  driftY:  (Math.random() - 0.5) * 180,     // ±90px vertical wander
  scaleMax: Math.random() * 0.6 + 1.2,      // 1.2–1.8× scale at peak
}));

const navItems = [
  { name: "Dashboard",          icon: LayoutDashboard },
  { name: "Transactions",       icon: Wallet           },
  { name: "Insights",           icon: Lightbulb        },
  { name: "Budgets & Analytics", icon: BarChart3       },
  { name: "Profile",            icon: UserCircle       },
];

/* ─────────────────────────────────────────────────────────────
   SidebarContent — shared between desktop & mobile drawer
───────────────────────────────────────────────────────────── */
const SidebarContent = ({ 
  collapsed = false, 
  forMobile = false,
  activeTab,
  setActiveTab,
  setIsMobileOpen,
  role,
  setRole,
  theme,
  toggleTheme,
  setModal
}) => (
  <div
    className={`flex flex-col h-full bg-[#FDFBF7] dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 transition-colors duration-300 overflow-y-auto overflow-x-hidden`}
  >
    {/* Logo */}
    <button 
      className={`w-full flex items-center shrink-0 transition-all duration-300 hover:opacity-80 focus:outline-none ${collapsed ? "justify-center p-4 mb-4" : "p-6 space-x-3 mb-6"}`}
      onClick={() => { setActiveTab("Dashboard"); if (setIsMobileOpen) setIsMobileOpen(false); }}
      title="Go to Dashboard"
    >
      <div className="bg-emerald-800 p-2 rounded-xl shadow-sm shrink-0">
        <HandCoins className="w-5 h-5 text-yellow-400" />
      </div>
      {!collapsed && (
        <div className="logo-flicker-wrapper flex items-center justify-center">
          <span className="text-xl font-extrabold tracking-widest whitespace-nowrap overflow-hidden transition-all duration-300 dynamic-logo-text">
            FINDASH
          </span>
        </div>
      )}
    </button>

    {/* Nav */}
    <nav className="flex-none px-2 space-y-1 mb-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.name;
        return (
          <button
            key={item.name}
            onClick={() => { setActiveTab(item.name); setIsMobileOpen(false); }}
            title={collapsed ? item.name : ""}
            className={`group relative w-full flex items-center rounded-xl transition-all duration-300 ease-out font-medium overflow-hidden active:scale-95
              ${collapsed ? "justify-center p-3" : "space-x-3 px-4 py-3"}
              ${isActive
                ? "bg-yellow-100 dark:bg-indigo-900/60 text-emerald-900 dark:text-indigo-300 shadow-[0_0_15px_rgba(6,78,59,0.3)] dark:shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-emerald-800 dark:hover:text-indigo-300"
              }`}
          >
            {/* Shine overlay */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[850ms] ease-in-out bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent pointer-events-none" />

            <Icon className={`w-5 h-5 relative z-10 shrink-0 transition-transform duration-300 ${isActive ? "text-emerald-800 dark:text-indigo-400 scale-110" : "group-hover:scale-110"}`} />

            {!collapsed && (
              <span className="relative z-10 whitespace-nowrap overflow-hidden transition-all duration-300">
                {item.name}
              </span>
            )}

            {/* Tooltip when collapsed */}
            {collapsed && (
              <span className="absolute left-full ml-3 px-2 py-1 text-xs font-semibold bg-slate-800 dark:bg-slate-700 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                {item.name}
              </span>
            )}
          </button>
        );
      })}
    </nav>

    {/* Sidebar Additional Info and Logout */}
    <div className={`mt-auto flex-none border-t border-slate-200 dark:border-slate-800 transition-all duration-300 ${collapsed ? "p-2" : "p-4"}`}>
      {/* Logout Button */}
      <button
        onClick={() => setModal("logout")}
        title={collapsed ? "Log Out" : ""}
        className={`w-full flex items-center rounded-xl px-4 py-3 transition-all duration-300 active:scale-95 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-semibold mb-2 ${collapsed ? "justify-center" : "space-x-3"}`}
      >
        <LogOut className="w-5 h-5 flex-shrink-0" />
        {!collapsed && <span>Log Out</span>}
      </button>

      <hr className="border-slate-200 dark:border-slate-800 my-4" />

      {!collapsed && (
        <>
          <div className="space-y-3 mb-6 px-2">
            <button onClick={() => setModal("contact")} className="flex items-center space-x-3 text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-800 dark:hover:text-indigo-400 transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span>Contact</span>
            </button>
            <button onClick={() => setModal("support")} className="flex items-center space-x-3 text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-800 dark:hover:text-indigo-400 transition-colors">
              <Headphones className="w-4 h-4" />
              <span>Support</span>
            </button>
            <button onClick={() => setModal("help")} className="flex items-center space-x-3 text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-800 dark:hover:text-indigo-400 transition-colors">
              <HelpCircle className="w-4 h-4" />
              <span>Help</span>
            </button>
          </div>

          {/* Social Icons */}
          <div className="flex items-center justify-center space-x-4 px-2 pt-2">
            <button className="p-2 text-slate-400 hover:text-[#1DA1F2] transition-colors" title="Twitter">
              <MessageCircle className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-[#0A66C2] transition-colors" title="LinkedIn">
              <Briefcase className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-[#E4405F] transition-colors" title="Instagram">
              <Camera className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
      
      {collapsed && (
         <div className="flex flex-col items-center space-y-4 pt-2">
            <button onClick={() => setModal("help")} title="Help" className="p-2 text-slate-400 hover:text-emerald-800 dark:hover:text-indigo-400 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
         </div>
      )}

      {/* Mobile-only Toggles (Moved from top header on desktop) */}
      {forMobile && (
        <div className="mt-6 space-y-4 px-2 border-t border-slate-200 dark:border-slate-800 pt-6">
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl border border-emerald-400 dark:border-indigo-500 shadow-[0_0_15px_rgba(52,211,153,0.3)] dark:shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(52,211,153,0.5)] transition-all duration-300">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase">
              <UserCircle className="w-4 h-4" />
              <span>Role</span>
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-800 dark:text-slate-100 outline-none"
            >
              <option value="Viewer">Viewer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl border border-amber-400 dark:border-sky-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] dark:shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:shadow-[0_0_20px_rgba(251,191,36,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
            {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>
        </div>
      )}
    </div>
  </div>
);

const DashboardLayout = ({ children, activeTab, setActiveTab }) => {
  const { role, setRole, theme, toggleTheme, isLoading } = useFinance();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [modal, setModal] = useState(null); // 'contact', 'support', 'help', null

  return (
    <div className="flex h-screen bg-[#FFFFF0] dark:bg-slate-900 transition-colors duration-300 font-sans overflow-hidden">

      {/* ── Desktop Sidebar ─────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col h-full shrink-0 relative transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-[72px]" : "w-64"
        }`}
      >
        <SidebarContent 
          collapsed={isCollapsed} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          setIsMobileOpen={setIsMobileOpen}
          role={role} 
          setRole={setRole} 
          theme={theme} 
          toggleTheme={toggleTheme}
          setModal={setModal}
        />

        {/* ── Collapse / Expand toggle button ── */}
        {/* Positioned absolutely on the right edge, vertically centred */}
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="absolute top-1/2 -translate-y-1/2 -right-4 z-50
            w-8 h-8 rounded-full
            bg-emerald-800 hover:bg-emerald-700
            text-white shadow-lg
            flex items-center justify-center
            transition-all duration-300 ease-in-out
            hover:scale-110 active:scale-95
            border-2 border-white dark:border-slate-900"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft  className="w-4 h-4" />
          }
        </button>
      </aside>

      {/* ── Mobile Drawer ───────────────────────────── */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[80%] h-full bg-[#FDFBF7] dark:bg-slate-900 shadow-2xl flex flex-col animate-slide-up">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-6 right-4 p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent 
              collapsed={false} 
              forMobile 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              setIsMobileOpen={setIsMobileOpen}
              role={role} 
              setRole={setRole} 
              theme={theme} 
              toggleTheme={toggleTheme}
              setModal={setModal}
            />
          </aside>
        </div>
      )}

      {/* ── Main Content Area ────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300 ease-in-out">
        
        {/* Desktop Header for Global Controls (Toggles) */}
        <header className="hidden md:flex items-center justify-end px-10 h-16 shrink-0 z-20 relative">
          <div className="flex items-center space-x-6">
            {/* Notification Icon */}
            <button className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-2 rounded-2xl border border-emerald-400 dark:border-indigo-500 shadow-[0_0_15px_rgba(52,211,153,0.4)] dark:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all hover:shadow-[0_0_25px_rgba(52,211,153,0.6)] dark:hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 group">
              <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-emerald-800 dark:group-hover:text-indigo-400 transition-colors" />
              <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            </button>

            {/* Role Switcher */}
            <div className="flex items-center space-x-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-emerald-400 dark:border-indigo-500 shadow-[0_0_15px_rgba(52,211,153,0.4)] dark:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(52,211,153,0.6)] dark:hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] hover:-translate-y-0.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <UserCircle className="w-4 h-4" />
                <span>Role</span>
              </div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
              >
                <option value="Viewer" className="bg-white dark:bg-slate-800">Viewer</option>
                <option value="Admin" className="bg-white dark:bg-slate-800">Admin</option>
              </select>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="group flex items-center space-x-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-400 dark:border-sky-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] dark:shadow-[0_0_15px_rgba(56,189,248,0.4)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(251,191,36,0.6)] dark:hover:shadow-[0_0_25px_rgba(56,189,248,0.6)] hover:scale-105 active:scale-95 z-20 relative"
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-amber-400 transition-transform duration-500 group-hover:rotate-90" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-600 transition-transform duration-500 group-hover:-rotate-12" />
                )}
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                {theme === "dark" ? "Light" : "Dark"}
              </span>
            </button>
          </div>
        </header>

        {/* ── Unified Ambient Animation Layer ── */}
        <style>{`
          ${staticBalls.map((b) => `
            @keyframes globalFloat${b.id} {
              0%   { transform: translate(0px, 0px)          scale(1);          opacity: 0; }
              15%  { opacity: ${b.opacity}; }
              35%  { transform: translate(${b.driftX * 0.5}px, ${b.driftY * 0.5}px) scale(${b.scaleMax}); opacity: ${b.opacity}; }
              65%  { transform: translate(${b.driftX}px,       ${b.driftY}px)       scale(1.0); opacity: ${b.opacity * 0.75}; }
              85%  { transform: translate(${b.driftX * 0.3}px, ${b.driftY * 0.3}px) scale(${b.scaleMax * 0.85}); opacity: ${b.opacity}; }
              100% { transform: translate(0px, 0px)          scale(1);          opacity: 0; }
            }
          `).join('')}
        `}</style>

        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          {staticBalls.map((b) => (
            <span
              key={b.id}
              style={{
                position: "absolute",
                width:  `${b.size}px`,
                height: `${b.size}px`,
                top:    `${b.top}%`,
                left:   `${b.left}%`,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, ${b.colour}1.0), ${b.colour}0.25))`,
                animation: `globalFloat${b.id} ${b.dur}s ${b.delay}s ease-in-out infinite`,
                filter: `blur(${b.size > 80 ? 14 : b.size > 50 ? 10 : 5}px)`,
              }}
            />
          ))}
        </div>

        {/* Mobile header */}
        <header className="md:hidden bg-[#FFFFF0] dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center px-4 shrink-0 justify-between transition-colors duration-300">
          <button 
            onClick={() => setActiveTab("Dashboard")}
            className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-100 hover:opacity-80 transition-opacity focus:outline-none"
          >
            <HandCoins className="w-6 h-6 text-emerald-800" />
            <div className="logo-flicker-wrapper inline-block">
              <span className="dynamic-logo-text">FINDASH</span>
            </div>
          </button>
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-4 py-8 md:p-10 w-full relative">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-emerald-800 animate-spin" />
                <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">
                  Syncing transactions from secure mock server...
                </p>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>

      {/* ── Modals Layer ── */}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 animate-slide-up overflow-hidden">
            <button onClick={() => setModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            {modal === "contact" && (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Customer Care</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">You can reach us through any of the following fake placeholder channels:</p>
                <div className="space-y-3 text-slate-700 dark:text-slate-300">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="font-semibold block text-xs uppercase text-slate-500 mb-1">Phone Number</span>
                    +1 800-FINDASH-00
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="font-semibold block text-xs uppercase text-slate-500 mb-1">Email Address</span>
                    support@findash.sample.com
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="font-semibold block text-xs uppercase text-slate-500 mb-1">Website</span>
                    www.findash-sample.com
                  </div>
                </div>
              </div>
            )}

            {modal === "support" && (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-400 border-dashed animate-spin-slow"></div>
                  <Headphones className="w-8 h-8 text-indigo-600 dark:text-indigo-400 relative z-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Live Support</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-[250px] mx-auto">
                  Chat with our smart AI assistant to quickly resolve your queries without waiting in line!
                </p>
                <button 
                  onClick={() => setModal(null)} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200"
                >
                  Start Mock Chat
                </button>
              </div>
            )}

            {modal === "help" && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Help & FAQs</h3>
                </div>
                
                {/* Dummy search bar */}
                <div className="relative mb-6">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search for answers..." 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                {/* FAQ List */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {[
                    "How can I reset my password?",
                    "How to use Role Based view?",
                    "How to create a budget limit?",
                    "How to add a transaction?",
                    "How to filter my expenses?",
                    "How to edit my information?"
                  ].map((q, i) => (
                    <div key={i} className="group p-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-lg cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">{q}</p>
                      <p className="text-xs text-slate-400 mt-1 h-0 overflow-hidden group-hover:h-auto group-hover:mt-2 transition-all">Mock answer goes here. This functionality will be built out in the future.</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {modal === "logout" && (
              <div className="space-y-4 text-center pb-2">
                <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/40 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-rose-400 border-dashed animate-spin-slow"></div>
                  <LogOut className="w-8 h-8 text-rose-600 dark:text-rose-400 relative z-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Feature In Progress</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-[280px] mx-auto">
                  Just to let you know, this app is purely a frontend showcase! The backend authentication features (like Logging Out) are not yet developed. Feel free to hold tight as this functionality will be built in the future.
                </p>
                <button 
                  onClick={() => setModal(null)} 
                  className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition duration-200"
                >
                  Got it, thanks!
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardLayout;
