import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, TrendingUp, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { register as registerService } from '../services/authService'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export default function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async ({ name, email, password }) => {
    setLoading(true)
    try {
      await registerService(name, email, password)
      toast.success('Account created! Please sign in.')
      navigate('/login', { replace: true })
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Registration failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-950 to-primary-950" />
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md animate-scale-in">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-primary-500 shadow-lg shadow-violet-500/30 mb-4">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="mt-1 text-sm text-white/60">Start tracking your expenses today</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  {...register('name')}
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  className={`w-full rounded-xl border bg-white/10 px-4 py-3 pl-10 text-sm text-white placeholder-white/30 outline-none transition-all backdrop-blur-sm
                    focus:ring-2 focus:ring-violet-400/50
                    ${errors.name ? 'border-danger-400/60' : 'border-white/20 focus:border-violet-400/50'}`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-danger-300">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border bg-white/10 px-4 py-3 pl-10 text-sm text-white placeholder-white/30 outline-none transition-all backdrop-blur-sm
                    focus:ring-2 focus:ring-violet-400/50
                    ${errors.email ? 'border-danger-400/60' : 'border-white/20 focus:border-violet-400/50'}`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-danger-300">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  className={`w-full rounded-xl border bg-white/10 px-4 py-3 pl-10 pr-10 text-sm text-white placeholder-white/30 outline-none transition-all backdrop-blur-sm
                    focus:ring-2 focus:ring-violet-400/50
                    ${errors.password ? 'border-danger-400/60' : 'border-white/20 focus:border-violet-400/50'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-danger-300">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  {...register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  className={`w-full rounded-xl border bg-white/10 px-4 py-3 pl-10 text-sm text-white placeholder-white/30 outline-none transition-all backdrop-blur-sm
                    focus:ring-2 focus:ring-violet-400/50
                    ${errors.confirmPassword ? 'border-danger-400/60' : 'border-white/20 focus:border-violet-400/50'}`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-danger-300">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-all duration-200 hover:shadow-violet-500/50 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-white/50">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-violet-300 hover:text-violet-200 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
