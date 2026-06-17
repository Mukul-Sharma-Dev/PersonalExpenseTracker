import { useEffect, useCallback, useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, FileText, Calendar, Tag, CreditCard } from 'lucide-react'
import { format } from 'date-fns'

const schema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0')
    .max(1_000_000, 'Amount too large'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description too long'),
  date: z.string().min(1, 'Date is required'),
  category_id: z.string().min(1, 'Category is required'),
  payment_method: z.string().min(1, 'Payment method is required'),
  notes: z.string().max(500).optional(),
})

const PAYMENT_METHODS = [
  'Cash',
  'Card',
  'UPI',
  'Bank Transfer',
  'Other',
]

export default function ExpenseModal({ expense, categories, onClose, onSubmit, loading }) {
  const isEdit = Boolean(expense)

  const [categorySearch, setCategorySearch] = useState('')
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const categoryRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredCategories = categories?.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()))

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: expense?.amount ? Number(expense.amount) : undefined,
      description: expense?.description || '',
      date: expense?.date
        ? format(new Date(expense.date), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      category_id: expense?.category_id?.toString() || '',
      payment_method: expense?.payment_method || 'Cash',
      notes: expense?.notes || '',
    },
  })

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Escape') onClose() },
    [onClose],
  )
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleFormSubmit = (data) => {
    onSubmit(data)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg animate-slide-in rounded-t-3xl bg-white shadow-2xl dark:bg-slate-900 sm:rounded-3xl">
        {/* Handle bar (mobile) */}
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {isEdit ? 'Edit Expense' : 'Add Expense'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isEdit ? 'Update the expense details' : 'Record a new expense'}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost h-8 w-8 rounded-xl" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* Amount */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 pointer-events-none">₹</span>
              <input
                {...register('amount', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="0.00"
                className={`input-base pl-9 ${errors.amount ? 'input-error' : ''}`}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-xs text-danger-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                {...register('description')}
                type="text"
                placeholder="What did you spend on?"
                className={`input-base pl-9 ${errors.description ? 'input-error' : ''}`}
              />
            </div>
            {errors.description && (
              <p className="mt-1 text-xs text-danger-500">{errors.description.message}</p>
            )}
          </div>

          {/* Date + Category row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  {...register('date')}
                  type="date"
                  onClick={(e) => e.target.showPicker?.()}
                  className={`input-base pl-9 ${errors.date ? 'input-error' : ''}`}
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-xs text-danger-500">{errors.date.message}</p>
              )}
            </div>

            <div ref={categoryRef}>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Category
              </label>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => {
                  const selectedCat = categories?.find(c => c.id.toString() === field.value)
                  return (
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                      <div 
                        className={`input-base pl-9 flex items-center cursor-pointer ${errors.category_id ? 'input-error' : ''}`}
                        onClick={() => { setIsCategoryOpen(true); setCategorySearch('') }}
                      >
                        {selectedCat ? (
                          <span>{selectedCat.icon ? `${selectedCat.icon} ` : ''}{selectedCat.name}</span>
                        ) : (
                          <span className="text-slate-400">Select...</span>
                        )}
                      </div>
                      
                      {isCategoryOpen && (
                        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden animate-fade-in">
                          <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                            <input
                              type="text"
                              autoFocus
                              placeholder="Search category..."
                              className="w-full bg-slate-50 dark:bg-slate-900 border-none outline-none text-sm px-3 py-1.5 rounded-lg"
                              value={categorySearch}
                              onChange={(e) => setCategorySearch(e.target.value)}
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto p-1">
                            {filteredCategories?.length > 0 ? filteredCategories.map(cat => (
                              <div
                                key={cat.id}
                                className={`px-3 py-2 text-sm cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 ${field.value === cat.id.toString() ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'}`}
                                onClick={() => {
                                  field.onChange(cat.id.toString())
                                  setIsCategoryOpen(false)
                                }}
                              >
                                {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                              </div>
                            )) : (
                              <div className="px-3 py-2 text-sm text-slate-500 text-center">No results</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }}
              />
              {errors.category_id && (
                <p className="mt-1 text-xs text-danger-500">{errors.category_id.message}</p>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Payment Method
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                {...register('payment_method')}
                className={`input-base pl-9 appearance-none ${errors.payment_method ? 'input-error' : ''}`}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            {errors.payment_method && (
              <p className="mt-1 text-xs text-danger-500">{errors.payment_method.message}</p>
            )}
          </div>

          {/* Notes (optional) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="Any additional notes..."
              className="input-base resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : isEdit ? (
                'Update Expense'
              ) : (
                'Add Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
