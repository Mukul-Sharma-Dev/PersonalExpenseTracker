export default function LoadingSpinner({ fullScreen = false, size = 'md' }) {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400`}
      />
      <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
        Loading...
      </p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm dark:bg-slate-950/80">
        {spinner}
      </div>
    )
  }

  return (
    <div className="flex min-h-[200px] w-full items-center justify-center">
      {spinner}
    </div>
  )
}
