import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Receipt,
  Tag,
  Wallet,
  BarChart3,
  FileText,
  User,
  X,
  TrendingUp,
  Sparkles,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/expenses',    label: 'Expenses',     icon: Receipt },
  { to: '/categories',  label: 'Categories',   icon: Tag },
  { to: '/budget',      label: 'Budget',       icon: Wallet },
  { to: '/analytics',   label: 'Analytics',    icon: BarChart3 },
  { to: '/reports',     label: 'Reports',      icon: FileText },
  { to: '/profile',     label: 'Profile',      icon: User },
]

const BACKEND = 'http://localhost:8000'
const getAvatarUrl = (url) => {
  if (!url) return null
  return url.startsWith('http') ? url : `${BACKEND}${url}`
}

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const location = useLocation()

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-72 flex-col
          border-r border-slate-200/80 bg-white shadow-2xl
          transition-transform duration-300 ease-in-out
          dark:border-slate-800 dark:bg-slate-900
          lg:translate-x-0 lg:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 shadow-lg shadow-primary-500/25">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">
                ExpenseTracker
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Personal Finance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden btn-ghost h-8 w-8 rounded-lg p-1"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Menu
          </p>
          <ul className="space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={() => { if (window.innerWidth < 1024) onClose() }}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                  }
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{label}</span>
                  {location.pathname === to && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-500" />
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Quick tip card */}
          <div className="mt-6 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 p-4 shadow-lg shadow-primary-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-white/80" />
              <span className="text-xs font-semibold text-white/80">Pro Tip</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Set a monthly budget to track your spending habits and achieve your financial goals!
            </p>
          </div>
        </nav>

        {/* User info at bottom */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            {user?.avatar_url ? (
              <img
                src={getAvatarUrl(user.avatar_url)}
                alt={user?.name || 'User'}
                className="h-9 w-9 rounded-xl object-cover shadow ring-2 ring-primary-200 dark:ring-primary-800"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-violet-500 text-sm font-bold text-white shadow">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {user?.name || 'User'}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {user?.email || ''}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
