import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  gradient = 'gradient-card-indigo',
  subtitle,
}) {
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor =
    trend === 'up'
      ? 'text-success-300'
      : trend === 'down'
      ? 'text-danger-300'
      : 'text-slate-300'

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${gradient}`}
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/5" />

      <div className="relative flex items-start justify-between">
        {/* Left: Label + Value */}
        <div className="flex-1">
          <p className="text-sm font-medium text-white/70">{label}</p>
          <p className="mt-1 text-2xl font-bold text-white tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-white/60">{subtitle}</p>
          )}
          {trendValue !== undefined && (
            <div className={`mt-2 flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{trendValue}</span>
            </div>
          )}
        </div>

        {/* Right: Icon */}
        {Icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-inner">
            <Icon className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
    </div>
  )
}
