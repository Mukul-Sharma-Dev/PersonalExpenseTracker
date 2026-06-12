import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { FileText, Download, Table, FileSpreadsheet, Search, Calendar } from 'lucide-react'
import * as XLSX from 'xlsx'
import LoadingSpinner from '../components/LoadingSpinner'
import { downloadCSV, getReportPreview } from '../services/reportService'
import { getExpenses } from '../services/expenseService'
import { getCategories } from '../services/categoryService'

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0)

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(
    format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
  )
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [categoryFilter, setCategoryFilter] = useState('')
  const [preview, setPreview] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [downloadingCSV, setDownloadingCSV] = useState(false)
  const [downloadingExcel, setDownloadingExcel] = useState(false)

  useEffect(() => {
    getCategories()
      .then((d) => setCategories(d?.categories || d?.data || d || []))
      .catch(() => {})
    fetchPreview()
  }, [])

  const getParams = () => ({
    start_date: startDate,
    end_date: endDate,
    ...(categoryFilter ? { category_id: categoryFilter } : {}),
    limit: 100,
  })

  const fetchPreview = async () => {
    setLoadingPreview(true)
    try {
      let data
      try {
        data = await getReportPreview(getParams())
      } catch {
        // Fallback to expenses endpoint
        const expData = await getExpenses(getParams())
        data = expData?.expenses || expData?.data || expData
      }
      setPreview(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to load preview')
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleCSV = async () => {
    setDownloadingCSV(true)
    try {
      await downloadCSV(getParams())
      toast.success('CSV downloaded!')
    } catch {
      toast.error('Failed to download CSV')
    } finally {
      setDownloadingCSV(false)
    }
  }

  const handleExcel = async () => {
    if (preview.length === 0) return
    setDownloadingExcel(true)
    try {
      // Try server-side first
      try {
        const { downloadExcel: dlExcel } = await import('../services/reportService')
        await dlExcel(getParams())
        toast.success('Excel file downloaded!')
        return
      } catch {
        // Server failed, generate client-side
      }

      // Client-side Excel generation using SheetJS
      const rows = preview.map((exp, i) => ({
        '#': i + 1,
        Date: exp.date ? format(new Date(exp.date), 'MMM d, yyyy') : '',
        Description: exp.description || '',
        Category: exp.category?.name || exp.category_name || 'Uncategorized',
        'Payment Method': exp.payment_method || '',
        'Amount (₹)': Number(exp.amount),
      }))

      const ws = XLSX.utils.json_to_sheet(rows)
      ws['!cols'] = [{ wch: 4 }, { wch: 14 }, { wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 12 }]
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Expenses')

      const filename = `expenses_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, filename)
      toast.success('Excel file downloaded!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to download Excel')
    } finally {
      setDownloadingExcel(false)
    }
  }

  const totalAmount = preview.reduce((s, e) => s + Number(e.amount), 0)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Export and preview your expense data
        </p>
      </div>

      {/* Filters card */}
      <div className="glass-card-solid p-6">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary-500" />
          Date Range & Filters
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-base"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={fetchPreview}
            disabled={loadingPreview}
            className="btn-secondary gap-2"
          >
            <Search className="h-4 w-4" />
            {loadingPreview ? 'Loading...' : 'Preview'}
          </button>

          <div className="flex gap-3 ml-auto">
            <button
              onClick={handleCSV}
              disabled={downloadingCSV || preview.length === 0}
              className="btn-secondary gap-2 disabled:opacity-50"
            >
              {downloadingCSV ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              ) : (
                <FileText className="h-4 w-4 text-success-600" />
              )}
              Download CSV
            </button>
            <button
              onClick={handleExcel}
              disabled={downloadingExcel || preview.length === 0}
              className="btn-primary gap-2 disabled:opacity-50"
            >
              {downloadingExcel ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              Download Excel
            </button>
          </div>
        </div>
      </div>

      {/* Preview table */}
      <div className="glass-card-solid overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Table className="h-4 w-4 text-primary-500" />
            Preview
            {preview.length > 0 && (
              <span className="badge bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                {preview.length} records
              </span>
            )}
          </h2>
          {preview.length > 0 && (
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Total: {formatCurrency(totalAmount)}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] text-sm">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {loadingPreview ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : preview.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No data for the selected range
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Adjust the filters and click Preview
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                preview.map((exp, i) => (
                  <tr key={exp.id || i} className="table-row">
                    <td className="px-4 py-3 text-slate-400 dark:text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {exp.date ? format(new Date(exp.date), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white max-w-[160px] truncate">
                      {exp.description}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {exp.category?.name || exp.category_name || 'Uncategorized'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {exp.payment_method || '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(exp.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {preview.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 dark:border-slate-600">
                  <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Total ({preview.length} transactions)
                  </td>
                  <td className="px-4 py-3 text-right text-base font-bold text-primary-700 dark:text-primary-400">
                    {formatCurrency(totalAmount)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
