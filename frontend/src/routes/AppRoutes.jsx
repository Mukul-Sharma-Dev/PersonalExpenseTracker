import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
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
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

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
  )
}
