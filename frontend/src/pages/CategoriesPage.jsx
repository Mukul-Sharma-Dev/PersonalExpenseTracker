import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, Pencil, Trash2, Tag, AlertCircle, LayoutGrid } from 'lucide-react'
import CategoryModal from '../components/CategoryModal'
import LoadingSpinner from '../components/LoadingSpinner'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService'

const DEFAULT_CATEGORY_NAMES = ['Food & Dining', 'Transportation', 'Housing', 'Healthcare', 'Entertainment']

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editCat, setEditCat] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const data = await getCategories()
      setCategories(data?.categories || data?.data || data || [])
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const handleAdd = () => { setEditCat(null); setModalOpen(true) }
  const handleEdit = (cat) => { setEditCat(cat); setModalOpen(true) }

  const handleSubmit = async (data) => {
    setSaving(true)
    try {
      if (editCat) {
        await updateCategory(editCat.id, data)
        toast.success('Category updated!')
      } else {
        await createCategory(data)
        toast.success('Category created!')
      }
      setModalOpen(false)
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id)
      toast.success('Category deleted')
      setDeleteConfirm(null)
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete category')
    }
  }

  const isDefault = (cat) =>
    cat.is_default || DEFAULT_CATEGORY_NAMES.includes(cat.name)

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Categories</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        <button onClick={handleAdd} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary-200/60 bg-primary-50 p-4 dark:border-primary-800/40 dark:bg-primary-900/20">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
        <p className="text-sm text-primary-700 dark:text-primary-300">
          Default categories are provided as a starting point and cannot be deleted. You can add your own custom categories.
        </p>
      </div>

      {/* Grid */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-card-solid">
          <LayoutGrid className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-base font-semibold text-slate-500 dark:text-slate-400">No categories yet</p>
          <button onClick={handleAdd} className="btn-primary mt-4">
            <Plus className="h-4 w-4" /> Create your first category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group glass-card-solid p-5 hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                {/* Icon + Name */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-sm transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: (cat.color || '#6366f1') + '22',
                      border: `2px solid ${cat.color || '#6366f1'}44`,
                    }}
                  >
                    {cat.icon || '🏷️'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {cat.description}
                      </p>
                    )}
                    {isDefault(cat) && (
                      <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 mt-1">
                        Default
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="btn-ghost h-8 w-8 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => !isDefault(cat) && setDeleteConfirm(cat)}
                    disabled={isDefault(cat)}
                    title={isDefault(cat) ? 'Default categories cannot be deleted' : 'Delete'}
                    className={`btn-ghost h-8 w-8 rounded-lg ${isDefault(cat)
                        ? 'opacity-30 cursor-not-allowed'
                        : 'text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20'
                      }`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Expense count */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: cat.color || '#6366f1' }}
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {cat.expense_count ?? 0} expense{(cat.expense_count ?? 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                {cat.total_amount !== undefined && (
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    ₹{Number(cat.total_amount).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 animate-scale-in">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-100 dark:bg-danger-900/30 mb-4">
              <Trash2 className="h-6 w-6 text-danger-600 dark:text-danger-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Delete "{deleteConfirm.name}"?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              This will permanently delete this category. Expenses in this category will be uncategorized.
            </p>
            <div className="flex gap-3 mt-5">
              <button className="btn-secondary flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger flex-1" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <CategoryModal
          category={editCat}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          loading={saving}
        />
      )}
    </div>
  )
}
