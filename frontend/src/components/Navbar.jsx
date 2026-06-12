import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Sun, Moon, ChevronDown, User, LogOut, Bell, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const DEMO_NOTIFICATIONS = []

const PAGE_TITLES = {
  '/dashboard':   'Dashboard',
  '/expenses':    'Expenses',
  '/categories':  'Categories',
  '/budget':      'Budget',
  '/analytics':   'Analytics',
  '/reports':     'Reports',
  '/profile':     'Profile',
}

const BACKEND = 'http://localhost:8000'

// Cloudinary URLs are full https:// — local legacy URLs need BACKEND prefix
const getAvatarUrl = (url) => {
  if (!url) return null
  return url.startsWith('http') ? url : `${BACKEND}${url}`
}

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(DEMO_NOTIFICATIONS.some((n) => n.unread))
  const dropdownRef = useRef(null)
  const notifRef = useRef(null)

  const pageTitle = PAGE_TITLES[location.pathname] || 'ExpenseTracker'

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md md:px-6 dark:border-slate-800 dark:bg-slate-900/80">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="btn-ghost lg:hidden h-9 w-9 rounded-xl"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {pageTitle}
          </h2>
          <p className="hidden text-xs text-slate-500 dark:text-slate-400 md:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="btn-ghost h-9 w-9 rounded-xl"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-4.5 w-4.5" />
          ) : (
            <Moon className="h-4.5 w-4.5" />
          )}
        </button>

        {/* Notifications bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(prev => !prev); setHasUnread(false) }}
            className="btn-ghost relative h-9 w-9 rounded-xl"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            {hasUnread && (
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger-500" />
            )}
          </button>

          {/* Notification panel */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 animate-scale-in rounded-2xl border border-slate-200/80 bg-white shadow-xl dark:border-slate-700/60 dark:bg-slate-800 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Notifications</p>
                <button onClick={() => setNotifOpen(false)} className="btn-ghost h-7 w-7 rounded-lg">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {DEMO_NOTIFICATIONS.length > 0 ? (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                    {DEMO_NOTIFICATIONS.map((n) => (
                      <li
                        key={n.id}
                        className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors ${
                          n.unread ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{n.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.body}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{n.time}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No new notifications
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline w-full text-center"
                  onClick={() => setNotifOpen(false)}
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(prev => !prev)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {/* Avatar: photo if set, else gradient initials */}
            {user?.avatar_url ? (
              <img
                src={getAvatarUrl(user.avatar_url)}
                alt={user?.name || 'User'}
                className="h-8 w-8 rounded-lg object-cover shadow ring-2 ring-primary-200 dark:ring-primary-800"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-violet-500 text-xs font-bold text-white shadow">
                {initials}
              </div>
            )}
            <span className="hidden max-w-[120px] truncate md:block">
              {user?.name || 'User'}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 animate-scale-in rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-xl dark:border-slate-700/60 dark:bg-slate-800">
              {/* User info with avatar */}
              <div className="px-3 py-2 mb-1 flex items-center gap-3">
                {user?.avatar_url ? (
                  <img
                    src={getAvatarUrl(user.avatar_url)}
                    alt={user?.name || 'User'}
                    className="h-10 w-10 rounded-xl object-cover shrink-0 ring-2 ring-primary-100 dark:ring-primary-900"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-violet-500 text-sm font-bold text-white">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-700 mb-1" />
              <button
                onClick={() => { navigate('/profile'); setDropdownOpen(false) }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <User className="h-4 w-4 text-slate-400" />
                View Profile
              </button>
              <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
              <button
                onClick={() => { logout(); setDropdownOpen(false) }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-danger-600 transition-colors hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-900/20"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
