import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { Wallet, CalendarDays, DollarSign, Save, History } from 'lucide-react'
import BudgetProgressBar from '../components/BudgetProgressBar'
import LoadingSpinner from '../components/LoadingSpinner'
import { getBudget, setBudget } from '../services/budgetService'
import { getExpenses } from '../services/expenseService'

const schema = z.object({
  month: z.string().min(1, 'Month is required'),
  year: z.string().min(1, 'Year is required'),
  amount: z
    .number({ invalid_type_error: 'Enter a valid amount' })
    .positive('Budget must be greater than 0')
    .max(10_000_000),
})

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0)

export default function BudgetPage() {
  const [budgets, setBudgets] = useState([])
  const [currentBudget, setCurrentBudget] = useState(null)
  const [monthlySpent, setMonthlySpent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const now = new Date()
  const currentMonth = String(now.getMonth() + 1)
  const currentYearStr = String(now.getFullYear())

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      month: currentMonth,
      year: currentYearStr,
      amount: undefined,
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [budgetData, expData] = await Promise.allSettled([
          getBudget({ month: currentMonth, year: currentYearStr }),
          getExpenses({
            start_date: format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd'),
            end_date: format(new Date(now.getFullYear(), now.getMonth() + 1, 0), 'yyyy-MM-dd'),
            limit: 1000,
          }),
        ])

        if (budgetData.status === 'fulfilled') {
          const list = budgetData.value?.budgets || budgetData.value?.data || [budgetData.value]
          setBudgets(Array.isArray(list) ? list.filter(Boolean) : [])
          const current = list.find(
            (b) => String(b?.month) === currentMonth && String(b?.year) === currentYearStr,
          )
          if (current) {
            setCurrentBudget(current)
            setValue('amount', Number(current.amount))
          }
        }

        if (expData.status === 'fulfilled') {
          const expenses = expData.value?.expenses || expData.value?.data || expData.value || []
          const total = expenses.reduce((s, e) => s + Number(e.amount), 0)
          setMonthlySpent(total)
        }
      } catch {
        toast.error('Failed to load budget data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      await setBudget({
        month: Number(data.month),
        year: Number(data.year),
        amount: data.amount,
      })
      toast.success('Budget saved!')
      if (data.month === currentMonth && data.year === currentYearStr) {
        setCurrentBudget({ ...currentBudget, amount: data.amount })
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save budget')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Budget</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Set and track your monthly spending limits
        </p>
      </div>

      {/* Current month progress */}
      {currentBudget?.amount ? (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary-500" />
            {MONTHS[now.getMonth()]} {now.getFullYear()} Budget
          </h2>
          <BudgetProgressBar budget={currentBudget.amount} spent={monthlySpent} />
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-900/20">
          <Wallet className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              No budget set for {MONTHS[now.getMonth()]} {now.getFullYear()}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
              Set a budget below to start tracking your spending against it.
            </p>
          </div>
        </div>
      )}

      {/* Set budget form */}
      <div className="glass-card-solid p-6">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary-500" />
          {currentBudget ? 'Update Budget' : 'Set Budget'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Month */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Month</label>
              <select {...register('month')} className={`input-base ${errors.month ? 'input-error' : ''}`}>
                {MONTHS.map((m, i) => (
                  <option key={m} value={String(i + 1)}>{m}</option>
                ))}
              </select>
              {errors.month && <p className="mt-1 text-xs text-danger-500">{errors.month.message}</p>}
            </div>

            {/* Year */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Year</label>
              <select {...register('year')} className={`input-base ${errors.year ? 'input-error' : ''}`}>
                {YEARS.map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
              {errors.year && <p className="mt-1 text-xs text-danger-500">{errors.year.message}</p>}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Budget Amount (₹)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                {...register('amount', { valueAsNumber: true })}
                type="number"
                step="100"
                placeholder="e.g. 50000"
                className={`input-base pl-9 ${errors.amount ? 'input-error' : ''}`}
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-danger-500">{errors.amount.message}</p>}
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Budget
              </>
            )}
          </button>
        </form>
      </div>

      {/* Budget history */}
      {budgets.length > 0 && (
        <div className="glass-card-solid p-6">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <History className="h-4 w-4 text-primary-500" />
            Budget History
          </h2>
          <div className="space-y-2">
            {budgets.map((b, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl p-3 bg-slate-50 dark:bg-slate-800"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {MONTHS[Number(b.month) - 1]} {b.year}
                </span>
                <span className="text-sm font-bold text-primary-700 dark:text-primary-400">
                  {formatCurrency(b.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
