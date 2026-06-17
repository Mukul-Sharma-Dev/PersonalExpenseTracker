import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { login as loginService } from '../services/authService'
import { useAuth } from '../context/AuthContext'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    try {
      const data = await loginService(email, password)
      login(data.user, data.access_token || data.token)
      toast.success(`Welcome back, ${data.user?.name || 'User'}!`, { style: { background: '#f8fafc', color: '#2D1B15', border: '1px solid #F97316' } })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Login failed. Please check your credentials.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ x: '-10%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-10%', opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      style={{ fontFamily: '"Times New Roman", Times, serif', backgroundColor: '#fdfbf7', color: '#2D1B15' }} 
      className="min-h-screen flex w-full overflow-hidden"
    >
      
      {/* Left Split - Image / Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-black items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-80" 
          style={{ backgroundImage: 'url(/images/login_split_1781676361568.png)' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80"></div>
        
        {/* Subtle decorative SVGs */}
        <svg className="absolute top-10 left-10 w-24 h-24 text-orange-500 opacity-30" viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="40" />
        </svg>
        <svg className="absolute bottom-20 right-20 w-40 h-40 text-red-500 opacity-20" viewBox="0 0 100 100" fill="currentColor">
          <rect x="10" y="10" width="80" height="80" transform="rotate(45 50 50)" />
        </svg>

        <div className="relative z-10 p-12 max-w-xl text-center">
          <h2 className="text-5xl font-bold text-white tracking-widest uppercase drop-shadow-2xl mb-6">Welcome Back</h2>
          <p className="text-xl text-orange-200 font-light italic drop-shadow-md">
            "Your financial freedom is just one login away. Continue your journey with Personal Expense Tracker."
          </p>
        </div>
      </div>

      {/* Right Split - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative bg-[#f8fafc]">
        {/* Abstract shape for light theme */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-100 rounded-full blur-3xl opacity-50 -ml-20 -mb-20"></div>

        <div className="w-full max-w-md relative z-10 animate-scale-in">
          
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-[#2D1B15] uppercase tracking-widest mb-2">Sign In</h1>
            <p className="text-slate-500 italic">Enter your details to access your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-bold text-[#2D1B15] uppercase tracking-wide">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border bg-white px-4 py-3 pl-12 text-lg text-[#2D1B15] placeholder-slate-300 outline-none transition-all font-sans shadow-sm
                    focus:ring-2 focus:ring-orange-300
                    ${errors.email ? 'border-red-400' : 'border-slate-200 focus:border-orange-400'}`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 font-sans">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-bold text-[#2D1B15] uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full rounded-xl border bg-white px-4 py-3 pl-12 pr-12 text-lg text-[#2D1B15] placeholder-slate-300 outline-none transition-all font-sans shadow-sm
                    focus:ring-2 focus:ring-orange-300
                    ${errors.password ? 'border-red-400' : 'border-slate-200 focus:border-orange-400'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 font-sans">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-4 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:from-orange-500 hover:to-red-500 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 uppercase tracking-widest"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-8 text-center text-slate-600 italic text-lg">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-orange-600 hover:text-red-600 transition-colors not-italic"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>

    </motion.div>
  )
}
