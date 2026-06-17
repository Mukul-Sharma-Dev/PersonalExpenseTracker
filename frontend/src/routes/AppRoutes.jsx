import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
import LandingPage from '../pages/LandingPage'
import AuthPage from '../pages/AuthPage'
// import LoginPage from '../pages/LoginPage'
// import RegisterPage from '../pages/RegisterPage'
import DashboardPage from '../pages/DashboardPage'
import ExpensesPage from '../pages/ExpensesPage'
import CategoriesPage from '../pages/CategoriesPage'
import BudgetPage from '../pages/BudgetPage'
import AnalyticsPage from '../pages/AnalyticsPage'
import ReportsPage from '../pages/ReportsPage'
import ProfilePage from '../pages/ProfilePage'

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

export default function AppRoutes() {
  const location = useLocation()
  
  // Group auth routes under the same key so AuthPage doesn't unmount when switching between them
  const routeKey = ['/login', '/register'].includes(location.pathname) ? 'auth' : location.pathname;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={routeKey}>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />

      {/* Protected routes — each wrapped in Layout */}
      <Route
        path="/dashboard"
        element={<ProtectedLayout><DashboardPage /></ProtectedLayout>}
      />
      <Route
        path="/expenses"
        element={<ProtectedLayout><ExpensesPage /></ProtectedLayout>}
      />
      <Route
        path="/categories"
        element={<ProtectedLayout><CategoriesPage /></ProtectedLayout>}
      />
      <Route
        path="/budget"
        element={<ProtectedLayout><BudgetPage /></ProtectedLayout>}
      />
      <Route
        path="/analytics"
        element={<ProtectedLayout><AnalyticsPage /></ProtectedLayout>}
      />
      <Route
        path="/reports"
        element={<ProtectedLayout><ReportsPage /></ProtectedLayout>}
      />
      <Route
        path="/profile"
        element={<ProtectedLayout><ProfilePage /></ProtectedLayout>}
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  )
}
