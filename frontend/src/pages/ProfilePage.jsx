import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User } from 'lucide-react'
import api from '../api/client'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [prefs, setPrefs] = useState(user?.style_preferences?.join(', ') || '')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const savePrefs = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const tags = prefs.split(',').map(s => s.trim()).filter(Boolean)
      await api.patch('/user/profile/', { style_preferences: tags })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {} finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-8">Profile</h1>

      {/* Avatar + username */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center">
          <User size={28} className="text-rose-400" />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">{user?.username}</p>
          {user?.email && <p className="text-sm text-gray-400">{user.email}</p>}
        </div>
      </div>

      {/* Style preferences */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-5 max-w-md">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">Style Preferences</h2>
        <p className="text-xs text-gray-400 mb-3">
          Comma-separated tags used to personalize outfit generation (e.g. minimalist, vintage, cozy).
        </p>
        <textarea
          rows={3}
          value={prefs}
          onChange={e => setPrefs(e.target.value)}
          placeholder="minimalist, vintage, cozy…"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-300 transition resize-none"
        />
        <button
          onClick={savePrefs}
          disabled={saving}
          className="mt-3 px-5 py-2 bg-rose-400 text-white text-sm rounded-xl font-medium hover:bg-rose-500 transition disabled:opacity-60"
        >
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save'}
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:border-rose-200 hover:text-rose-400 transition"
      >
        <LogOut size={15} /> Sign Out
      </button>
    </div>
  )
}
