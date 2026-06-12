import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import {
  Plus, Search, Filter, Trash2, Pencil, ChevronLeft, ChevronRight,
  ArrowUpDown, Receipt, SlidersHorizontal,
} from 'lucide-react'
import ExpenseModal from '../components/ExpenseModal'
import LoadingSpinner from '../components/LoadingSpinner'
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../services/expenseService'
import { getCategories } from '../services/categoryService'

const PAYMENT_METHODS = ['All', 'Cash', 'Card', 'UPI', 'Bank Transfer', 'Other']
const PAGE_SIZE = 10

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0)

// Category name keywords → emoji icon
const CATEGORY_ICONS = {
  food: '🍔', meal: '🍔', restaurant: '🍔', eat: '🍔', lunch: '🍔', dinner: '🍔', breakfast: '🍔', cafe: '☕', coffee: '☕',
  grocery: '🛒', groceries: '🛒', supermarket: '🛒',
  transport: '🚗', fuel: '⛽', petrol: '⛽', cab: '🚕', taxi: '🚕', uber: '🚕', bus: '🚌', metro: '🚇', train: '🚂',
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
  if (exp?.category_icon) return exp.category_icon
  if (exp?.category?.icon) return exp.category.icon
  const name = (exp?.category_name || exp?.category?.name || '').toLowerCase()
  for (const [keyword, icon] of Object.entries(CATEGORY_ICONS)) {
    if (name.includes(keyword)) return icon
  }
  return '💳'
}

const PAYMENT_COLORS = {
  Cash:          'bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-400',
  Card:          'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
  UPI:           'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  'Bank Transfer': 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Other:         'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editExpense, setEditExpense] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('All')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [order, setOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        sort_by: sortBy,
        order,
        ...(search ? { search } : {}),
        ...(categoryFilter ? { category_id: categoryFilter } : {}),
        ...(paymentFilter !== 'All' ? { payment_method: paymentFilter } : {}),
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {}),
        _t: Date.now()
      }

      const data = await getExpenses(params)
      const list = data?.expenses || data?.data || data || []
      setExpenses(Array.isArray(list) ? list : [])
      setTotalPages(data?.total_pages || Math.ceil((data?.total || list.length) / PAGE_SIZE) || 1)
      setTotalCount(data?.total || list.length || 0)
    } catch {
      toast.error('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }, [page, sortBy, order, search, categoryFilter, paymentFilter, startDate, endDate])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data?.categories || data?.data || data || []))
      .catch(() => {})
  }, [])

  const handleAdd = () => { setEditExpense(null); setModalOpen(true) }
  const handleEdit = (exp) => { setEditExpense(exp); setModalOpen(true) }

  const handleSubmit = async (data) => {
    setSaving(true)
    try {
      const payload = {
        ...data,
        amount: Number(data.amount),
        category_id: Number(data.category_id),
      }
      if (editExpense) {
        await updateExpense(editExpense.id, payload)
        toast.success('Expense updated!')
      } else {
        await createExpense(payload)
        toast.success('Expense added!')
      }
      setModalOpen(false)
      fetchExpenses()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save expense')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id)
      toast.success('Expense deleted')
      setDeleteConfirm(null)
      fetchExpenses()
    } catch {
      toast.error('Failed to delete expense')
    }
  }

  const toggleSort = (field) => {
    if (sortBy === field) {
      setOrder(o => o === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setOrder('desc')
    }
    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setCategoryFilter('')
    setPaymentFilter('All')
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  const hasActiveFilters = search || categoryFilter || paymentFilter !== 'All' || startDate || endDate

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Expenses</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {totalCount} transaction{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={handleAdd} className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Expense
        </button>
      </div>

      {/* Search + Filter toolbar */}
      <div className="glass-card-solid p-4 space-y-3">
        <div className="flex gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search expenses..."
              className="input-base pl-9"
            />
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
            className="input-base w-auto min-w-[140px]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>

          {/* Toggle advanced filters */}
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`btn-secondary gap-2 ${showFilters ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-400' : ''}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="h-2 w-2 rounded-full bg-primary-500 inline-block" />
            )}
          </button>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn-ghost text-danger-500 dark:text-danger-400">
              Clear all
            </button>
          )}
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100 dark:border-slate-700 animate-fade-in">
            {/* Payment method */}
            <div className="flex gap-1 flex-wrap">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m}
                  onClick={() => { setPaymentFilter(m); setPage(1) }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    paymentFilter === m
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            {/* Date range */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1) }}
              className="input-base w-auto"
              placeholder="Start date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1) }}
              className="input-base w-auto"
              placeholder="End date"
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="table-wrapper overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="table-header">
              <th
                className="cursor-pointer px-4 py-3 hover:text-slate-700 dark:hover:text-slate-300"
                onClick={() => toggleSort('date')}
              >
                <div className="flex items-center gap-1">
                  Date <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Category</th>
              <th
                className="cursor-pointer px-4 py-3 hover:text-slate-700 dark:hover:text-slate-300"
                onClick={() => toggleSort('amount')}
              >
                <div className="flex items-center gap-1">
                  Amount <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Receipt className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-base font-semibold text-slate-500 dark:text-slate-400">
                      No expenses found
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                      {hasActiveFilters ? 'Try adjusting your filters' : 'Add your first expense to get started'}
                    </p>
                    {!hasActiveFilters && (
                      <button onClick={handleAdd} className="btn-primary mt-4">
                        <Plus className="h-4 w-4" /> Add Expense
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id} className="table-row">
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {exp.date ? format(new Date(exp.date), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                      {exp.description}
                    </p>
                    {exp.notes && (
                      <p className="text-xs text-slate-400 truncate max-w-[200px]">{exp.notes}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm"
                        style={{
                          backgroundColor: (exp.category_color || '#6366f1') + '22',
                          border: `1.5px solid ${exp.category_color || '#6366f1'}44`,
                        }}
                      >
                        {getCategoryIcon(exp)}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400 text-xs">
                        {exp.category_name || exp.category?.name || 'Uncategorized'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {formatCurrency(exp.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${PAYMENT_COLORS[exp.payment_method] || PAYMENT_COLORS.Other}`}>
                      {exp.payment_method || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEdit(exp)}
                        className="btn-ghost h-8 w-8 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(exp.id)}
                        className="btn-ghost h-8 w-8 rounded-lg text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary px-3 py-2 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary px-3 py-2 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 animate-scale-in">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-100 dark:bg-danger-900/30 mb-4">
              <Trash2 className="h-6 w-6 text-danger-600 dark:text-danger-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Expense?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              This action cannot be undone. The expense will be permanently deleted.
            </p>
            <div className="flex gap-3 mt-5">
              <button className="btn-secondary flex-1" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn-danger flex-1" onClick={() => handleDelete(deleteConfirm)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {modalOpen && (
        <ExpenseModal
          expense={editExpense}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          loading={saving}
        />
      )}
    </div>
  )
}
