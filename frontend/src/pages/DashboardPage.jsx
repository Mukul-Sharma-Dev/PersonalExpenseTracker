import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Tag,
  ArrowUpRight,
  Clock,
  ChevronRight,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { getExpenses } from '../services/expenseService'
import { getDashboard } from '../services/dashboardService'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6']

// Maps category name keywords → emoji icon
const CATEGORY_ICONS = {
  food: '🍔', meal: '🍔', restaurant: '🍔', eat: '🍔', lunch: '🍔', dinner: '🍔', breakfast: '🍔', cafe: '☕', coffee: '☕',
  grocery: '🛒', groceries: '🛒', supermarket: '🛒',
  transport: '🚗', travel: '✈️', fuel: '⛽', petrol: '⛽', cab: '🚕', taxi: '🚕', uber: '🚕', bus: '🚌', metro: '🚇', train: '🚂',
  shopping: '🛍️', clothes: '👗', fashion: '👗', apparel: '👗',
  health: '💊', medical: '🏥', medicine: '💊', doctor: '🏥', hospital: '🏥', pharmacy: '💊',
  entertainment: '🎬', movie: '🎬', cinema: '🎬', games: '🎮', gaming: '🎮', sport: '⚽', gym: '🏋️', fitness: '🏋️',
  utilities: '💡', electricity: '💡', water: '💧', gas: '🔥', internet: '🌐', wifi: '🌐', phone: '📱', mobile: '📱',
  rent: '🏠', house: '🏠', home: '🏠', mortgage: '🏠',
  education: '📚', school: '🏫', college: '🏫', tuition: '📚', course: '📚', book: '📚',
  subscription: '📺', streaming: '📺', netflix: '📺', spotify: '🎵', music: '🎵',
  investment: '📈', savings: '🏦', bank: '🏦', insurance: '🛡️',
  gift: '🎁', donation: '❤️', charity: '❤️',
  salary: '💰', income: '💰',
  beauty: '💄', salon: '💄', spa: '💆',
  pet: '🐾', vet: '🐾',
  travel: '✈️', hotel: '🏨', flight: '✈️',
  tax: '🧾', bill: '🧾',
}

const getCategoryIcon = (exp) => {
  // Use icon directly from API response (category_icon field)
  if (exp?.category_icon) return exp.category_icon
  // Also check nested category object (if ever present)
  if (exp?.category?.icon) return exp.category.icon
  // Fall back to keyword matching on category name
  const name = (exp?.category_name || exp?.category?.name || '').toLowerCase()
  for (const [keyword, icon] of Object.entries(CATEGORY_ICONS)) {
    if (name.includes(keyword)) return icon
  }
  return '💳'
}

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0)

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{payload[0].name}</p>
        <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard summary
        let dashData = null
        try {
          dashData = await getDashboard()
        } catch {
          // Dashboard endpoint may not exist; fall back to expenses
        }

        // Fetch expenses for recent + pie chart
        const now = new Date()
        const expData = await getExpenses({
          start_date: format(startOfMonth(now), 'yyyy-MM-dd'),
          end_date: format(endOfMonth(now), 'yyyy-MM-dd'),
          limit: 100,
          sort_by: 'date',
          order: 'desc',
        })

        const expenses = expData?.expenses || expData?.data || expData || []

        // Recent transactions (last 5)
        setRecent(expenses.slice(0, 5))

        // Category breakdown for pie chart
        const catMap = {}
        expenses.forEach((exp) => {
          const catName = exp.category?.name || exp.category_name || 'Uncategorized'
          catMap[catName] = (catMap[catName] || 0) + Number(exp.amount)
        })
        setCategoryData(
          Object.entries(catMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8),
        )

        // Build stats
        if (dashData) {
          setStats({
            total_monthly: dashData.monthly_expenses,
            today_total: dashData.today_expenses,
            total_transactions: expenses.length,
            highest_category: dashData.highest_category || 'N/A',
          })
        } else {
          const total = expenses.reduce((s, e) => s + Number(e.amount), 0)
          const today = format(now, 'yyyy-MM-dd')
          const todayTotal = expenses
            .filter((e) => e.date?.startsWith(today))
            .reduce((s, e) => s + Number(e.amount), 0)

          setStats({
            total_monthly: total,
            today_total: todayTotal,
            total_transactions: expenses.length,
            highest_category: Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
          })
        }
      } catch (err) {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Financial Overview 📊
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {format(new Date(), 'MMMM yyyy')} — Here's how you're doing this month
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Monthly Spending"
          value={formatCurrency(stats?.total_monthly)}
          icon={DollarSign}
          gradient="gradient-card-indigo"
          trendValue="This month"
          trend="up"
        />
        <StatCard
          label="Today's Expenses"
          value={formatCurrency(stats?.today_total)}
          icon={Calendar}
          gradient="gradient-card-emerald"
          trendValue={format(new Date(), 'MMM d')}
        />
        <StatCard
          label="Transactions"
          value={stats?.total_transactions || 0}
          icon={TrendingUp}
          gradient="gradient-card-amber"
          trendValue="This month"
        />
        <StatCard
          label="Top Category"
          value={stats?.highest_category || 'N/A'}
          icon={Tag}
          gradient="gradient-card-rose"
          subtitle="Highest spending"
        />
      </div>

      {/* Charts + Recent row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Pie Chart */}
        <div className="lg:col-span-2 glass-card-solid p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Category Breakdown</h2>
            <span className="badge bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              {format(new Date(), 'MMM yyyy')}
            </span>
          </div>
          {categoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Tag className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-slate-600 dark:text-slate-400">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-3 glass-card-solid p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
            <Link
              to="/expenses"
              className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
            >
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Clock className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No transactions this month</p>
              <Link to="/expenses" className="mt-2 text-xs text-primary-600 dark:text-primary-400 hover:underline">
                Add your first expense →
              </Link>
            </div>
          ) : (
            <ul className="space-y-1">
              {recent.map((exp, i) => (
                <li
                  key={exp.id || i}
                  className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base"
                    style={{
                      backgroundColor: (exp.category_color || exp.category?.color || '#6366f1') + '22',
                      border: `1.5px solid ${exp.category_color || exp.category?.color || '#6366f1'}44`,
                    }}
                  >
                    {getCategoryIcon(exp)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                      {exp.description}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {exp.category?.name || exp.category_name || 'Uncategorized'} · {exp.payment_method || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(exp.amount)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {exp.date ? format(new Date(exp.date), 'MMM d') : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
