import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/dear-wardrobe-logo.svg'

export default function LoginPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')   // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.username, form.password)
      } else {
        await register(form.username, form.email, form.password)
      }
    } catch (err) {
      const data = err.response?.data
      if (data) {
        const msg = Object.values(data).flat().join(' ')
        setError(msg || 'Something went wrong.')
      } else {
        setError('Could not connect to server.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 polka-dot-bg flex-col items-center justify-center p-12">
        <div className="flex flex-col items-center text-center">
          <h1 className="font-display text-5xl font-bold italic text-burgundy mb-4">
            Dear Wardrobe
          </h1>
          <p className="font-body text-burgundy/70 text-lg max-w-xs leading-relaxed mx-auto">
            Your personal stylist, powered by AI. Catalog your wardrobe and generate perfect outfits.
          </p>
          <div className="flex items-center justify-center gap-3 mt-10 w-full">
            {['#5F0C2F', '#A92F50', '#d292a8', '#E5A2A0', '#D3968C'].map((color, i) => (
              <span
                key={i}
                className="block rounded-full"
                style={{ width: 14, height: 14, backgroundColor: color, opacity: 0.75 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 lg:max-w-lg flex flex-col justify-center px-10 py-14 bg-white">
        <div className="max-w-md mx-auto w-full">
          <div className="flex justify-center mb-5">
            <img src={logo} alt="Dear Wardrobe logo" className="w-24 h-16 object-contain" />
          </div>

          {/* Mobile brand title */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="font-display text-3xl font-bold italic text-burgundy">Dear Wardrobe</h1>
          </div>

          <h2 className="font-display text-3xl font-bold text-burgundy mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="font-body text-burgundy/60 text-base mb-8">
            {mode === 'login' ? 'Sign in to your wardrobe' : 'Start cataloging your style'}
          </p>

          {/* Mode toggle */}
          <div className="flex rounded-xl bg-brand-pink/20 p-1 mb-7">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-body font-medium transition-all capitalize
                  ${mode === m
                    ? 'bg-white text-brand-dark shadow-sm'
                    : 'text-burgundy/50 hover:text-burgundy/70'}`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handle} className="flex flex-col gap-5">
            <div>
              <label className="font-body text-sm text-burgundy/70 mb-1.5 block">Username</label>
              <input
                type="text"
                required
                autoComplete="username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full border border-brand-pink/40 rounded-xl px-4 py-3 font-body text-burgundy placeholder:text-dusty-coral focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 transition"
                placeholder="your_username"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="font-body text-sm text-burgundy/70 mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-brand-pink/40 rounded-xl px-4 py-3 font-body text-burgundy placeholder:text-dusty-coral focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 transition"
                  placeholder="you@example.com"
                />
              </div>
            )}

            <div>
              <label className="font-body text-sm text-burgundy/70 mb-1.5 block">Password</label>
              <input
                type="password"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border border-brand-pink/40 rounded-xl px-4 py-3 font-body text-burgundy placeholder:text-dusty-coral focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="font-body text-brand-dark text-sm bg-brand-pink/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-3.5 bg-brand-dark text-cream font-body font-semibold rounded-xl hover:bg-burgundy transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? '…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
