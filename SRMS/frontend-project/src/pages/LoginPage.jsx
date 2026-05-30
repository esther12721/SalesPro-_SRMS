import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginUser } from '../api'
import { useTheme } from '../context/ThemeContext'
import { TrendingUp, Eye, EyeOff, Sun, Moon, Lock, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await loginUser(form)
      login(data)
      toast.success(`Welcome back, ${data.username}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Theme toggle */}
        <div className="flex justify-end mb-4">
          <button onClick={toggle} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-white/10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/40 mx-auto mb-4">
              <TrendingUp size={24} className="text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sign in to SalesPro SRMS</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={show ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-center">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in...</span> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Create one</Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          © 2026 SalesPro Ltd · Huye District, Rwanda
        </p>
      </div>
    </div>
  )
}
