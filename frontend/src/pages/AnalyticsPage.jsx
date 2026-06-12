import { useState, useEffect, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts'
import LoadingSpinner from '../components/LoadingSpinner'
import { getExpenses } from '../services/expenseService'

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#f59e0b','#10b981','#06b6d4']

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0)

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{label || payload[0].name}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
            {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const [allExpenses, setAllExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const now = new Date()

  useEffect(() => {
    const fetch6Months = async () => {
      setLoading(true)
      try {
        const sixMonthsAgo = subMonths(startOfMonth(now), 5)
        const data = await getExpenses({
          start_date: format(sixMonthsAgo, 'yyyy-MM-dd'),
          end_date: format(endOfMonth(now), 'yyyy-MM-dd'),
          limit: 2000,
        })
        const list = data?.expenses || data?.data || data || []
        setAllExpenses(Array.isArray(list) ? list : [])
      } catch {
        toast.error('Failed to load analytics data')
      } finally {
        setLoading(false)
      }
    }
    fetch6Months()
  }, [])

  // 1. Category breakdown (current month)
  const categoryData = useMemo(() => {
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const monthly = allExpenses.filter((e) => {
      const d = parseISO(e.date)
      return d >= monthStart && d <= monthEnd
    })
    const map = {}
    monthly.forEach((e) => {
      const name = e.category?.name || e.category_name || 'Uncategorized'
      map[name] = (map[name] || 0) + Number(e.amount)
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [allExpenses])

  // 2. Monthly totals (last 6 months)
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i)
      const start = startOfMonth(d)
      const end = endOfMonth(d)
      const total = allExpenses
        .filter((e) => {
          const ed = parseISO(e.date)
          return ed >= start && ed <= end
        })
        .reduce((s, e) => s + Number(e.amount), 0)
      return { month: format(d, 'MMM yy'), amount: total }
    })
  }, [allExpenses])

  // 3. Daily spending (current month)
  const dailyData = useMemo(() => {
    const start = startOfMonth(now)
    const end = endOfMonth(now)
    const days = eachDayOfInterval({ start, end })
    return days.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const total = allExpenses
        .filter((e) => e.date?.startsWith(dayStr))
        .reduce((s, e) => s + Number(e.amount), 0)
      return { day: format(day, 'd'), amount: total }
    })
  }, [allExpenses])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Visual breakdown of your spending patterns
        </p>
      </div>

      {/* Row 1: Pie + Bar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category Pie Chart */}
        <div className="glass-card-solid p-6">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Category Distribution</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{format(now, 'MMMM yyyy')}</p>
          {categoryData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-400">
              No data for this month
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Bar Chart */}
        <div className="glass-card-solid p-6">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Monthly Expenses</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Last 6 months</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" opacity={0.5} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-slate-500 dark:text-slate-400"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-slate-500 dark:text-slate-400"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="amount"
                fill="#6366f1"
                radius={[8, 8, 0, 0]}
              >
                {monthlyData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === monthlyData.length - 1 ? '#6366f1' : '#818cf8'}
                    opacity={i === monthlyData.length - 1 ? 1 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Daily Line Chart */}
      <div className="glass-card-solid p-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Daily Spending Trend</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{format(now, 'MMMM yyyy')} — day by day</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" opacity={0.5} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: 'currentColor' }}
              className="text-slate-500 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 10, fill: 'currentColor' }}
              className="text-slate-500 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#6366f1' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category totals table */}
      {categoryData.length > 0 && (
        <div className="glass-card-solid p-6">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Category Summary — {format(now, 'MMMM yyyy')}</h2>
          <div className="space-y-3">
            {categoryData.map((cat, i) => {
              const total = categoryData.reduce((s, c) => s + c.value, 0)
              const pct = total > 0 ? (cat.value / total) * 100 : 0
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{pct.toFixed(1)}%</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(cat.value)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
