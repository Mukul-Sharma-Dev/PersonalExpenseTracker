import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { User, Mail, Calendar, DollarSign, Receipt, TrendingUp, Camera, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { getExpenses } from '../services/expenseService'
import { getProfile, uploadAvatar } from '../services/authService'

const BACKEND = 'http://localhost:8000'
const getAvatarUrl = (url) => {
  if (!url) return null
  return url.startsWith('http') ? url : `${BACKEND}${url}`
}

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0)

export default function ProfilePage() {
  const { user: authUser, updateUser } = useAuth()
  const [profile, setProfile] = useState(authUser)
  const [stats, setStats] = useState({ total: 0, count: 0, avg: 0 })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  // Avatar URL — Cloudinary https:// or legacy relative path
  const avatarUrl = getAvatarUrl(profile?.avatar_url)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Always fetch fresh profile from API (has avatar_url from DB)
        try {
          const p = await getProfile()
          setProfile(p?.user || p)
        } catch {
          // Fall back to auth context user
        }

        // Get expense stats
        const expData = await getExpenses({ limit: 2000 })
        const expenses = expData?.expenses || expData?.data || expData || []
        const total = expenses.reduce((s, e) => s + Number(e.amount), 0)
        setStats({
          total,
          count: expenses.length,
          avg: expenses.length > 0 ? total / expenses.length : 0,
        })
      } catch {
        toast.error('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB')
      return
    }

    setUploading(true)
    try {
      // Upload to Cloudinary → URL saved in DB
      const updatedUser = await uploadAvatar(file)
      setProfile(updatedUser)
      // Sync avatar_url to global AuthContext so Navbar updates instantly
      updateUser({ avatar_url: updatedUser.avatar_url })
      toast.success('Profile photo updated! ✅')
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to upload photo')
    } finally {
      setUploading(false)
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (loading) return <LoadingSpinner />

  const memberSince = profile?.created_at || profile?.createdAt
    ? format(new Date(profile.created_at || profile.createdAt), 'MMMM d, yyyy')
    : 'N/A'

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Your account information and statistics
        </p>
      </div>

      {/* Profile card */}
      <div className="glass-card-solid overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-primary-500 via-violet-600 to-purple-700 relative">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-4 left-8 h-16 w-16 rounded-full bg-white/20 blur-xl" />
            <div className="absolute bottom-2 right-12 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          </div>
        </div>

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="relative -mt-12 mb-4 inline-block">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="h-24 w-24 rounded-2xl object-cover shadow-xl ring-4 ring-white dark:ring-slate-800"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-violet-600 text-3xl font-bold text-white shadow-xl shadow-primary-500/30 ring-4 ring-white dark:ring-slate-800">
                {initials}
              </div>
            )}

            {/* Hidden file input — accept any image, no forced camera */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handlePhotoChange}
            />

            {/* Camera button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-xl bg-white shadow-md dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-60"
              title="Change profile photo"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 text-primary-500 animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
              )}
            </button>
          </div>

          {/* Name + Email */}
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {profile?.name || 'User'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{profile?.email || ''}</p>

          {/* Info pills */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs text-slate-600 dark:text-slate-400">{profile?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Member since {memberSince}</span>
            </div>
            {profile?.role && (
              <div className="flex items-center gap-2 rounded-xl bg-primary-50 px-3 py-2 dark:bg-primary-900/30">
                <User className="h-3.5 w-3.5 text-primary-500" />
                <span className="text-xs text-primary-700 dark:text-primary-400 capitalize">{profile.role}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-card-solid p-5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/30 mx-auto mb-3">
            <Receipt className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.count}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total Transactions</p>
        </div>

        <div className="glass-card-solid p-5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success-50 dark:bg-success-900/30 mx-auto mb-3">
            <DollarSign className="h-5 w-5 text-success-600 dark:text-success-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(stats.total)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total Amount Spent</p>
        </div>

        <div className="glass-card-solid p-5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/30 mx-auto mb-3">
            <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(stats.avg)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Avg. per Transaction</p>
        </div>
      </div>

      {/* Account details */}
      <div className="glass-card-solid p-6">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Account Details</h2>
        <div className="space-y-3">
          {[
            { label: 'Full Name', value: profile?.name || 'N/A', icon: User },
            { label: 'Email Address', value: profile?.email || 'N/A', icon: Mail },
            { label: 'Member Since', value: memberSince, icon: Calendar },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-700">
                <Icon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
