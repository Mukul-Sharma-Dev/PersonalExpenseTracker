import { AlertTriangle, TrendingUp } from 'lucide-react'

export default function BudgetProgressBar({ budget, spent }) {
  const total = Number(budget) || 0
  const usedAmount = Number(spent) || 0
  const remaining = Math.max(0, total - usedAmount)
  const percentage = total > 0 ? Math.min((usedAmount / total) * 100, 100) : 0

  const getColorClass = () => {
    if (percentage >= 80) return 'bg-danger-500'
    if (percentage >= 60) return 'bg-warning-500'
    return 'bg-success-500'
  }

  const getTrackClass = () => {
    if (percentage >= 80) return 'bg-danger-100 dark:bg-danger-900/30'
    if (percentage >= 60) return 'bg-warning-100 dark:bg-warning-900/30'
    return 'bg-success-100 dark:bg-success-900/30'
  }

  const getLabelColor = () => {
    if (percentage >= 80) return 'text-danger-600 dark:text-danger-400'
    if (percentage >= 60) return 'text-warning-600 dark:text-warning-400'
    return 'text-success-600 dark:text-success-400'
  }

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val)

  return (
    <div className="space-y-4">
      {/* Warning banner */}
      {percentage >= 80 && (
        <div className="flex items-start gap-3 rounded-2xl border border-danger-200 bg-danger-50 p-4 dark:border-danger-800 dark:bg-danger-900/20">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger-500" />
          <div>
            <p className="text-sm font-semibold text-danger-700 dark:text-danger-400">
              Budget Alert!
            </p>
            <p className="text-xs text-danger-600 dark:text-danger-500 mt-0.5">
              You've used {percentage.toFixed(1)}% of your monthly budget.
              {percentage >= 100 ? ' You have exceeded your budget.' : ` Only ${formatCurrency(remaining)} remaining.`}
            </p>
          </div>
        </div>
      )}

      {/* Progress section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-700/60 dark:bg-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Monthly Budget Usage
            </span>
          </div>
          <span className={`text-sm font-bold ${getLabelColor()}`}>
            {percentage.toFixed(1)}%
          </span>
        </div>

        {/* Progress bar */}
        <div className={`h-3 w-full overflow-hidden rounded-full ${getTrackClass()}`}>
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${getColorClass()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Amounts */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <div>
            <p className="text-slate-500 dark:text-slate-400">Spent</p>
            <p className={`font-bold text-base ${getLabelColor()}`}>
              {formatCurrency(usedAmount)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-500 dark:text-slate-400">Remaining</p>
            <p className="font-bold text-base text-slate-900 dark:text-white">
              {formatCurrency(remaining)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 dark:text-slate-400">Budget</p>
            <p className="font-bold text-base text-slate-900 dark:text-white">
              {formatCurrency(total)}
            </p>
          </div>
        </div>

        {/* Milestone markers */}
        <div className="mt-2 flex justify-between text-xs text-slate-400">
          <span>0%</span>
          <span>60%</span>
          <span>80%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  )
}
