import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

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
        <div className="text-center">
          <div className="text-8xl mb-6 select-none">✨</div>
          <h1 className="text-4xl font-display font-semibold text-rose-700 mb-3">Outfit AI</h1>
          <p className="text-rose-400 text-lg font-light max-w-xs leading-relaxed">
            Your personal stylist, powered by AI. Catalog your wardrobe and generate perfect outfits.
          </p>
          <div className="flex justify-center gap-4 mt-8 text-4xl select-none">
            {['👗', '👠', '👒', '👜', '💄'].map(e => (
              <span key={e} className="opacity-60">{e}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center px-8 py-12 bg-white">
        <div className="max-w-sm mx-auto w-full">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-5xl mb-2">✨</div>
            <h1 className="text-2xl font-display font-semibold text-rose-700">Outfit AI</h1>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            {mode === 'login' ? 'Sign in to your wardrobe' : 'Start cataloging your style'}
          </p>

          {/* Mode toggle */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize
                  ${mode === m ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handle} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Username</label>
              <input
                type="text"
                required
                autoComplete="username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition"
                placeholder="your_username"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition"
                  placeholder="you@example.com"
                />
              </div>
            )}

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Password</label>
              <input
                type="password"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 bg-rose-400 text-white rounded-xl font-medium hover:bg-rose-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? '…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
