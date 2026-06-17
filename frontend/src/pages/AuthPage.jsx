import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { login as loginService, register as registerService } from '../services/authService'
import { useAuth } from '../context/AuthContext'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export default function AuthPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const isLogin = location.pathname === '/login'

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: regErrors },
  } = useForm({ resolver: zodResolver(registerSchema) })

  const onLogin = async ({ email, password }) => {
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

  const onSignup = async ({ name, email, password }) => {
    setLoading(true)
    try {
      await registerService(name, email, password)
      toast.success('Account created! Please sign in.', { style: { background: '#f8fafc', color: '#2D1B15', border: '1px solid #F97316' } })
      navigate('/login', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: '"Times New Roman", Times, serif', backgroundColor: '#f8fafc', color: '#2D1B15' }} className="w-full h-screen overflow-hidden flex relative">
      
      {/* Background decorations for forms */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-50 -ml-40 -mt-40 z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-50 -mr-40 -mb-40 z-0 pointer-events-none"></div>

      {/* Left Side - Register Form */}
      <div className="absolute top-0 left-0 w-full lg:w-1/2 h-full flex flex-col justify-center px-8 lg:px-24 z-10 transition-all duration-700">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#2D1B15] uppercase tracking-widest mb-2">Create Account</h1>
            <p className="text-slate-500 italic">Sign up for a free account to get started</p>
          </div>
          
          <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-4">
            <div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  {...registerSignup('name')}
                  type="text"
                  placeholder="Full Name"
                  className={`w-full rounded-xl border bg-white px-4 py-3 pl-12 text-lg text-[#2D1B15] placeholder-slate-300 outline-none transition-all font-sans shadow-sm focus:ring-2 focus:ring-orange-300 ${regErrors.name ? 'border-red-400' : 'border-slate-200 focus:border-orange-400'}`}
                />
              </div>
              {regErrors.name && <p className="mt-1 text-xs text-red-500 font-sans">{regErrors.name.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  {...registerSignup('email')}
                  type="email"
                  placeholder="Email address"
                  className={`w-full rounded-xl border bg-white px-4 py-3 pl-12 text-lg text-[#2D1B15] placeholder-slate-300 outline-none transition-all font-sans shadow-sm focus:ring-2 focus:ring-orange-300 ${regErrors.email ? 'border-red-400' : 'border-slate-200 focus:border-orange-400'}`}
                />
              </div>
              {regErrors.email && <p className="mt-1 text-xs text-red-500 font-sans">{regErrors.email.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  {...registerSignup('password')}
                  type={showRegPassword ? 'text' : 'password'}
                  placeholder="Password (Min. 6 characters)"
                  className={`w-full rounded-xl border bg-white px-4 py-3 pl-12 pr-12 text-lg text-[#2D1B15] placeholder-slate-300 outline-none transition-all font-sans shadow-sm focus:ring-2 focus:ring-orange-300 ${regErrors.password ? 'border-red-400' : 'border-slate-200 focus:border-orange-400'}`}
                />
                <button type="button" onClick={() => setShowRegPassword(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors">
                  {showRegPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {regErrors.password && <p className="mt-1 text-xs text-red-500 font-sans">{regErrors.password.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  {...registerSignup('confirmPassword')}
                  type={showRegPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  className={`w-full rounded-xl border bg-white px-4 py-3 pl-12 text-lg text-[#2D1B15] placeholder-slate-300 outline-none transition-all font-sans shadow-sm focus:ring-2 focus:ring-orange-300 ${regErrors.confirmPassword ? 'border-red-400' : 'border-slate-200 focus:border-orange-400'}`}
                />
              </div>
              {regErrors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-sans">{regErrors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="mt-4 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-4 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:from-orange-500 hover:to-red-500 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 uppercase tracking-widest">
              {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <>Create Account <ArrowRight className="h-5 w-5" /></>}
            </button>
          </form>

          {/* Mobile only toggle */}
          <p className="mt-6 text-center text-slate-600 italic text-lg lg:hidden">
            Already have an account? <Link to="/login" className="font-bold text-orange-600 hover:text-red-600 not-italic">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full flex flex-col justify-center px-8 lg:px-24 z-10 transition-all duration-700">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-[#2D1B15] uppercase tracking-widest mb-2">Sign In</h1>
            <p className="text-slate-500 italic">Enter your details to access your account</p>
          </div>
          
          <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-6">
            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  {...registerLogin('email')}
                  type="email"
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border bg-white px-4 py-3 pl-12 text-lg text-[#2D1B15] placeholder-slate-300 outline-none transition-all font-sans shadow-sm focus:ring-2 focus:ring-orange-300 ${loginErrors.email ? 'border-red-400' : 'border-slate-200 focus:border-orange-400'}`}
                />
              </div>
              {loginErrors.email && <p className="mt-1 text-xs text-red-500 font-sans">{loginErrors.email.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  {...registerLogin('password')}
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border bg-white px-4 py-3 pl-12 pr-12 text-lg text-[#2D1B15] placeholder-slate-300 outline-none transition-all font-sans shadow-sm focus:ring-2 focus:ring-orange-300 ${loginErrors.password ? 'border-red-400' : 'border-slate-200 focus:border-orange-400'}`}
                />
                <button type="button" onClick={() => setShowLoginPassword(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors">
                  {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {loginErrors.password && <p className="mt-1 text-xs text-red-500 font-sans">{loginErrors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-4 py-4 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:from-orange-500 hover:to-red-500 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 uppercase tracking-widest">
              {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <>Sign In <ArrowRight className="h-5 w-5" /></>}
            </button>
          </form>

          {/* Mobile only toggle */}
          <p className="mt-8 text-center text-slate-600 italic text-lg lg:hidden">
            Don't have an account? <Link to="/register" className="font-bold text-orange-600 hover:text-red-600 not-italic">Create one</Link>
          </p>
        </div>
      </div>

      {/* The Physical Sliding Overlay Panel (Desktop Only) */}
      <motion.div 
        className="hidden lg:flex absolute top-0 left-0 h-full w-1/2 z-20 overflow-hidden shadow-2xl"
        initial={false}
        animate={{ x: isLogin ? '0%' : '100%' }}
        transition={{ duration: 6.0, ease: [0.22, 1, 0.36, 1] }} /* Super slow cinematic ease */
      >
        {/* Inner container exactly twice the width. When overlay moves, inner moves the opposite way to simulate physical sliding of content. */}
        <motion.div 
          className="absolute top-0 left-0 h-full w-[200%] flex"
          initial={false}
          animate={{ x: isLogin ? '0%' : '-50%' }}
          transition={{ duration: 6.0, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Left Panel Content (Visible when isLogin=true, Overlay is on Left covering Register form) */}
          <div className="w-1/2 h-full relative flex flex-col items-center justify-center p-12 text-center bg-black overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: 'url(/images/login_split_1781676361568.png)' }}></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80"></div>
            
            <svg className="absolute top-10 left-10 w-32 h-32 text-orange-500 opacity-30" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="50" r="40" />
            </svg>
            <svg className="absolute bottom-20 right-20 w-40 h-40 text-red-500 opacity-20" viewBox="0 0 100 100" fill="currentColor">
              <rect x="10" y="10" width="80" height="80" transform="rotate(45 50 50)" />
            </svg>

            <div className="relative z-10 max-w-sm mt-auto pb-12">
              <h2 className="text-4xl font-bold text-white tracking-widest uppercase drop-shadow-2xl mb-4">New Here?</h2>
              <p className="text-lg text-orange-200 font-light italic drop-shadow-md mb-8">
                "Every big financial goal begins with a single step. Create your profile today."
              </p>
              <Link to="/register" className="inline-block px-10 py-3 rounded-xl border-2 border-orange-500 text-orange-500 font-bold uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all duration-300">
                Sign Up
              </Link>
            </div>
          </div>

          {/* Right Panel Content (Visible when isLogin=false, Overlay is on Right covering Login form) */}
          <div className="w-1/2 h-full relative flex flex-col items-center justify-center p-12 text-center bg-black overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: 'url(/images/signup_split_1781676374813.png)' }}></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80"></div>
            
            <svg className="absolute bottom-10 right-10 w-32 h-32 text-orange-500 opacity-30" viewBox="0 0 100 100" fill="currentColor">
              <polygon points="50,10 90,90 10,90" />
            </svg>
            <svg className="absolute top-20 left-20 w-24 h-24 text-red-500 opacity-20" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="50" r="40" />
            </svg>

            <div className="relative z-10 max-w-sm mt-auto pb-12">
              <h2 className="text-4xl font-bold text-white tracking-widest uppercase drop-shadow-2xl mb-4">Welcome Back!</h2>
              <p className="text-lg text-orange-200 font-light italic drop-shadow-md mb-8">
                "Your financial freedom is just one login away. Continue your journey."
              </p>
              <Link to="/login" className="inline-block px-10 py-3 rounded-xl border-2 border-orange-500 text-orange-500 font-bold uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all duration-300">
                Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>

    </div>
  )
}
