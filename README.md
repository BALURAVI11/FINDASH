# 💰 Finance Tracker Dashboard

A production-grade, feature-rich personal finance dashboard built with **React**, **Tailwind CSS**, and **Recharts**. Designed for real-world usability with role-based access, smart analytics, interactive charts, and a beautiful dark/light theme system featuring glassmorphism and modern UI kinetics.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Status & Upcoming Backend Features](#project-status--upcoming-backend-features)
- [Feature Walkthrough](#feature-walkthrough)
  - [1. Role-Based Access Control](#1-role-based-access-control)
  - [2. Dashboard Overview](#2-dashboard-overview)
  - [3. Spending Analysis Chart](#3-spending-analysis-chart)
  - [4. Spending Breakdown Pie Chart](#4-spending-breakdown-pie-chart)
  - [5. Transaction Log](#5-transaction-log)
  - [6. Financial Insights](#6-financial-insights)
  - [7. Budgets & Analytics](#7-budgets--analytics)
  - [8. Profile Section](#8-profile-section)
  - [9. Sidebar Navigation & Socials](#9-sidebar-navigation--socials)
  - [10. Dark / Light Mode](#10-dark--light-mode)
  - [11. Persistence & State Management](#11-persistence--state-management)
  - [12. Premium GUI Effects & Animations](#12-premium-gui-effects--animations)
- [Design Philosophy](#design-philosophy)
- [Tech Stack](#tech-stack)

---

## Prerequisites

Make sure you have the following installed on your machine before running the project:

| Tool | Minimum Version |
|------|----------------|
| Node.js | v18.x or later |
| npm | v9.x or later |
| Git | Any recent version |

---

## Getting Started

```bash
# 1. Clone the repository
git clone <your-repo-url>

# 2. Navigate into the project directory
cd finance-dashboard

# 3. Install all dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will open at **http://localhost:5173** (Vite default).

> **Note:** The application features a **Dual-Mode Data System**. By default, it operates entirely offline using the browser's `localStorage`. However, we have also integrated a **Mock API (json-server)** mode that simulates a real backend environment, complete with a global data-source toggle and a local migration script. **For effective information and to showcase my work, I added mock data spanning continuously up to April 2026.**

---

## Feature Walkthrough

### 1. Role-Based Access Control

**Why we built it:** To emulate a real-world multi-tenant financial platform where admins can mutate limits while viewers can merely track them. 

**How it works:**
- A **Role dropdown** (`Admin` / `Viewer`) sits at the bottom of the sidebar.
- Persists dynamically to `localStorage`.
- **Admin capabilities:** Add/edit/delete transactions, alter profile information, and generate or wipe budget categories.
- **Viewer capabilities:** Read-only global access. Write controls simply vanish from the UI.

---

### 2. Dashboard Overview

**Why we built it:** To deliver an at-a-glance summary of financial health explicitly highlighting unformatted raw metrics and tracking goals without overwhelming the user.

**What's included:**
- Three high-level cards at the top detailing 💰 Total Balance, 📈 Total Income, and 📉 Total Expenses.
- **Date Formatting:** Dates naturally convert into standardized inputs (Day/Month/Year formats) for easy cross-referencing and understanding.
- A personalized greeting featuring an energetic *Typewriter* reveal animation!

---

### 3. Spending Analysis Chart

**Why we built it:** Users need to see their spending velocity mapped over precise periods.

**How it works:**
- Built utilizing **Recharts LineChart**.
- Lines include: **Income** (green), **Expenditure** (red), **Net Balance** (blue).
- Fully toggleable filter ranges ranging across Daily, Monthly, and Yearly spectrums with customized smart inputs.

---

### 4. Spending Breakdown Pie Chart

**Why we built it:** A quick comparative snapshot representing which distinct areas of a user's life map to specific expenditure volumes.

**How it works:**
- Hover-enhanced donut diagram.
- Clicking any specific slice of the pie **bridges navigation** and warps the user straight to the transaction log, preemptively filtering all inputs to specifically just that clicked category.

---

### 5. Transaction Log

**Why we built it:** To provide a comprehensive ledger with frictionless query speed.

**Key features:**
- Live search matching substrings in descriptions or categories.
- Interactive side-filter panel that spans date ranges and min/max limits.
- Full Admin CRUD capabilities built with native inline editing so users never navigate away from the table.
- A hard export-to-CSV integration for accounting.

---

### 6. Financial Insights

**Why we built it:** To digest the raw transaction numbers and translate them into a coaching companion.

**Sections inside Insights:**
- Smart Insight Engine compares the **last month vs the current month** automatically, returning color-coded warnings or praise logic.
- A **Three-Month Comparison feature** validates against the current selected month with the previous three months. It strictly shares the identical calendar filter options as the Budgets & Analytics section.
- Month-over-Month & Year-over-Year calculations break down differences inside categories indicating absolute `+$X` increases or savings.
- A **Custom Range Analysis Table** allows users to explicitly define a "From" and "To" period to generate a precise, color-coded tabular breakdown of all aggregated income and expenses during that exact window.

---

### 7. Budgets & Analytics

**Why we built it:** A specialized area requested to let users set highly customized expense boundaries per category.

**How it works:**
- **Category Limits Generation:** Users type in a category (with built-in datalist autocomplete options spanning their exact used expenses) and assign maximal permitted spending quantities.
- **Checking Limits & Visual Formatting:** Each limit holds a progress bar. Bars turn amber at exactly 75% and critical-red at 100%+ (to indicate overspending).
- **Expense Limits Logic:** Strict validation ensures we ONLY compare "expense" typed transactions against the specific budget. (Say a user earns income under a "Food" category accidentally; it will carefully ignore that income so your expense limits remain scientifically accurate).
- **Messaging Feedback:** 
  - Sub-limit triggers a green checkmark saying: *"Within budget! $X remaining."*
  - Over-limit triggers an error note saying: *"Over budget by $X"*
- **Period Retention Filters:** Fully persistent toggles (monthly or yearly filtering combinations) automatically memorize your exact position allowing tab-refresh retention. 

---

### 8. Profile Section

A standardized identity hub indicating location, timezone, verifications, and user-avatar cards. Incorporates dynamic form switching allowing admins to rewrite their details immediately upon clicking Edit.

---

### 9. Sidebar Navigation & Socials

- A responsive left-aligned drawer structure. 
- Features standard menu linking.
- Houses placeholder infrastructure menus built for upcoming milestones including: Logout configurations, Contact/Support hubs, and generic Social Media tracking endpoints.

---

### 10. Dark / Light Mode

- Global dark-mode implementation syncing heavily customized Tailwind color palettes extending into Recharts, custom SVG icon fills, native inputs, and shadow blurring depths.

---
## Project Status & Upcoming Backend Features

Currently, the project acts as a deeply functional showcase of UI/UX, but we have laid the foundation for backend operations by implementing a **Database Switcher** (toggling between Offline Local Storage and a Mock JSON API server). 

However, to keep the focus explicitly on the frontend design logic, certain elements trigger stylish **"Feature In Progress"** modals or placeholders demonstrating where extensive server-side features will live:

1. **Log Out Button / Authentication:** Included in the sidebar to visualize where future user sessions will live. Clicking this currently triggers an interactive "In Progress" modal.
2. **Contact / Support:** Currently visual menu items. Clicking Contact displays mock placeholder details (fake company phone, email, etc.), and Support redirects you to a simulated AI chat layout.
3. **Help / FAQs:** A mock-functional Help modal with a search bar (visual only) and a dropdown of frequently asked questions designed to expand to show placeholder backend text.
4. **Notifications:** Mock notification bell icon that, when clicked, triggers a similar "Feature In Progress" modal indicating the future implementation of real-time alerts.
5. **Social Media Icons:** Added as footers for tracking future application updates.

---
### 11. Persistence & State Management

All state runs linearly through a centralized `Context API` utilizing an asynchronous `dataService` abstraction layer. This allows the entire UI to effortlessly switch between:
1. Pure client-side `localStorage` mapping.
2. Asynchronous backend FETCH requests to a `json-server` simulating a true REST API. 

---

### 12. Premium GUI Effects & Animations

**Why we built it:** To stand out contextually from traditional simple datagrids. We approached this utilizing modern responsive web paradigms (glassmorphism layered aesthetic combinations).

**Included Engine Effects:**
1. **Pulsing Ambient Background:** A centralized engine creates 25 randomized glowing 3D spheres drifting across all panes natively independent of tab switches for immersive presence. 
2. **Neon Flicker Effects:** Included heavily within the application brand logo (*FinDash*) simulating varying voltage drops, blur reflections, and animated multi-colored gradient sweeping panning routines to grip user attention correctly.
3. **Typewriter Typography:** Implemented specific inline `TypewriterText` spans to provide staggered character reveals for custom dashboard greetings.
4. **Card Lighting Triggers:** Sections, specifically analytic breakdown cards, react to hover-vectors by illuminating localized drop-shadow lighting effects to highlight focus.

---

## Design Philosophy

Every design decision in this project leans toward an engaging, high-end "glass-pane" aesthetic mimicking bleeding-edge mobile bank applications while guaranteeing maximum real estate for analytics.

- **Lighting Effects:** The reliance on colored shadow "glows" over physical borders enables sections to look like they highlight naturally based on their urgency. 
- **Error Empathy:** Whenever sections find nothing rendered (like skipping a period logic), it replaces visuals gracefully with conversational UI boxes ensuring you never hit traditional ugly web-console 404 breaks.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework with hooks |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling & layout vectors |
| Recharts | Live responsive data visualization |
| Lucide React | Clean, scalable icon sets |
| localStorage | Client-side memory persistence mapping |

---

*Built collaboratively step-by-step from raw wireframes entirely dictated against modern feature requirements and iterative GUI optimizations.*
