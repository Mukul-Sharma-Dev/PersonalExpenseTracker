import { useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Tag } from 'lucide-react'

const schema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(50, 'Name must be under 50 characters'),
  icon: z.string().max(4, 'Use a single emoji').optional(),
  color: z.string().optional(),
  description: z.string().max(200).optional(),
})

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#f59e0b', '#10b981', '#06b6d4',
  '#3b82f6', '#64748b',
]

const PRESET_ICONS = ['🍔', '🏠', '🚗', '💊', '🎮', '👗', '✈️', '📚', '💡', '💰', '🎓', '🏋️', '🎬', '🛒', '🐶']

export default function CategoryModal({ category, onClose, onSubmit, loading }) {
  const isEdit = Boolean(category)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category?.name || '',
      icon: category?.icon || '',
      color: category?.color || '#6366f1',
      description: category?.description || '',
    },
  })

  const selectedColor = watch('color')
  const selectedIcon = watch('icon')

  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Escape') onClose() },
    [onClose],
  )
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md animate-slide-in rounded-t-3xl bg-white shadow-2xl dark:bg-slate-900 sm:rounded-3xl">
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {isEdit ? 'Edit Category' : 'New Category'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Organize your expenses with categories
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost h-8 w-8 rounded-xl">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Preview */}
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-xl shadow-sm"
              style={{ backgroundColor: selectedColor + '22', border: `2px solid ${selectedColor}` }}
            >
              {selectedIcon || '🏷️'}
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">
                {watch('name') || 'Category Name'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Preview
              </p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Category Name
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                {...register('name')}
                type="text"
                placeholder="e.g. Food & Dining"
                className={`input-base pl-9 ${errors.name ? 'input-error' : ''}`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-danger-500">{errors.name.message}</p>
            )}
          </div>

          {/* Icon Picker */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setValue('icon', emoji)}
                  className={`h-9 w-9 rounded-xl text-lg transition-all ${
                    selectedIcon === emoji
                      ? 'ring-2 ring-primary-500 ring-offset-2 bg-primary-50 dark:bg-primary-900/30 scale-110'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input {...register('icon')} type="hidden" />
          </div>

          {/* Color Picker */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  style={{ backgroundColor: color }}
                  className={`h-8 w-8 rounded-xl transition-all ${
                    selectedColor === color
                      ? 'ring-2 ring-offset-2 ring-slate-400 scale-110'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                />
              ))}
            </div>
            <input {...register('color')} type="hidden" />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              {...register('description')}
              type="text"
              placeholder="Brief description..."
              className="input-base"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : isEdit ? 'Update' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
