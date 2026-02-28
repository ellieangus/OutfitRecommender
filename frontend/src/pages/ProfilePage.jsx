import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, Save } from 'lucide-react'
import api from '../api/client'

export default function ProfilePage() {
  const { user, logout } = useAuth()

  // Style preferences state
  const [prefs, setPrefs] = useState('')
  const [prefsSaved, setPrefsSaved] = useState(false)
  const [prefsSaving, setPrefsSaving] = useState(false)
  const [prefsError, setPrefsError] = useState('')

  // Personal info state
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', email: '' })
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')

  // Stats state
  const [stats, setStats] = useState({ wardrobe: 0, outfits: 0 })

  // Sync form states when user object loads
  useEffect(() => {
    if (!user) return

    // Sync style preferences
    const sp = user.style_preferences
    if (Array.isArray(sp)) {
      setPrefs(sp.join(', '))
    } else if (sp && typeof sp === 'string') {
      setPrefs(sp)
    } else {
      setPrefs('')
    }

    // Sync personal info
    setProfileForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
    })
  }, [user])

  // Fetch wardrobe and outfit counts on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [wardrobeRes, outfitsRes] = await Promise.all([
          api.get('/wardrobe/'),
          api.get('/outfits/'),
        ])
        setStats({
          wardrobe: Array.isArray(wardrobeRes.data) ? wardrobeRes.data.length : (wardrobeRes.data?.count ?? 0),
          outfits: Array.isArray(outfitsRes.data) ? outfitsRes.data.length : (outfitsRes.data?.count ?? 0),
        })
      } catch {
        // Stats are non-critical; silently leave at 0
      }
    }
    fetchStats()
  }, [])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fbf0f2]">
        <p className="text-dusty-coral text-base animate-pulse font-body">Loading profile…</p>
      </div>
    )
  }

  const saveProfile = async () => {
    setProfileSaving(true)
    setProfileSaved(false)
    setProfileError('')
    try {
      await api.patch('/user/profile/', {
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        email: profileForm.email,
      })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2500)
    } catch {
      setProfileError('Could not save — please try again.')
    } finally {
      setProfileSaving(false)
    }
  }

  const savePrefs = async () => {
    setPrefsSaving(true)
    setPrefsSaved(false)
    setPrefsError('')
    try {
      const tags = prefs.split(',').map(s => s.trim()).filter(Boolean)
      await api.patch('/user/profile/', { style_preferences: tags })
      setPrefsSaved(true)
      setTimeout(() => setPrefsSaved(false), 2500)
    } catch {
      setPrefsError('Could not save — please try again.')
    } finally {
      setPrefsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fbf0f2] flex flex-col">

      {/* ── Header bar ── */}
      <div className="px-12 py-10 w-full" style={{ background: '#4a0924', color: '#FFF1B5' }}>
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center shrink-0"
            style={{ background: '#f4c2c2', border: '2px solid rgba(255, 241, 181, 0.65)' }}
          >
            <User size={44} style={{ color: '#5F0C2F' }} />
          </div>

          {/* Username + email */}
          <div className="flex-1">
            <h1 className="font-display text-4xl font-bold" style={{ color: '#FFF1B5' }}>{user.username}</h1>
            {user.email && (
              <p className="font-body mt-1" style={{ color: 'rgba(255, 241, 181, 0.78)' }}>{user.email}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            <div className="text-center">
              <p className="font-display text-3xl font-bold" style={{ color: '#FFF1B5' }}>{stats.wardrobe}</p>
              <p className="text-sm font-body" style={{ color: 'rgba(255, 241, 181, 0.78)' }}>Pieces</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl font-bold" style={{ color: '#FFF1B5' }}>{stats.outfits}</p>
              <p className="text-sm font-body" style={{ color: 'rgba(255, 241, 181, 0.78)' }}>Outfits</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-10 flex-1">

        {/* Personal Info card */}
        <div className="bg-white rounded-2xl p-8 shadow border border-brand-pink/20">
          <h2 className="font-display text-2xl font-bold text-burgundy mb-6">Personal Info</h2>

          {/* First name + Last name row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="font-body font-semibold text-burgundy/70 text-sm uppercase tracking-wide mb-1.5 block">
                First Name
              </label>
              <input
                type="text"
                value={profileForm.first_name}
                onChange={e => setProfileForm(f => ({ ...f, first_name: e.target.value }))}
                placeholder="First name"
                className="border border-brand-pink/40 rounded-xl px-4 py-3 text-burgundy placeholder:text-dusty-coral focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 w-full font-body"
              />
            </div>
            <div>
              <label className="font-body font-semibold text-burgundy/70 text-sm uppercase tracking-wide mb-1.5 block">
                Last Name
              </label>
              <input
                type="text"
                value={profileForm.last_name}
                onChange={e => setProfileForm(f => ({ ...f, last_name: e.target.value }))}
                placeholder="Last name"
                className="border border-brand-pink/40 rounded-xl px-4 py-3 text-burgundy placeholder:text-dusty-coral focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 w-full font-body"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="font-body font-semibold text-burgundy/70 text-sm uppercase tracking-wide mb-1.5 block">
              Email
            </label>
            <input
              type="email"
              value={profileForm.email}
              onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
              className="border border-brand-pink/40 rounded-xl px-4 py-3 text-burgundy placeholder:text-dusty-coral focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 w-full font-body"
            />
          </div>

          {profileError && (
            <p className="text-red-400 text-sm font-body mb-3">{profileError}</p>
          )}

          <button
            onClick={saveProfile}
            disabled={profileSaving}
            className="flex items-center gap-2 bg-brand-dark text-cream px-6 py-2.5 rounded-xl font-body font-semibold hover:bg-burgundy transition disabled:opacity-60"
          >
            <Save size={16} />
            {profileSaving ? 'Saving…' : profileSaved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>

        {/* Style Preferences card */}
        <div className="bg-white rounded-2xl p-8 shadow border border-brand-pink/20">
          <h2 className="font-display text-2xl font-bold text-burgundy mb-2">Style Preferences</h2>
          <p className="font-body text-burgundy/60 text-sm mb-6">
            Comma-separated tags used to personalize outfit generation
            (e.g. minimalist, vintage, cozy).
          </p>

          <textarea
            rows={6}
            value={prefs}
            onChange={e => setPrefs(e.target.value)}
            placeholder="minimalist, vintage, cozy…"
            className="border border-brand-pink/40 rounded-xl px-4 py-3 text-burgundy placeholder:text-dusty-coral focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 w-full font-body resize-none mb-4"
          />

          {prefsError && (
            <p className="text-red-400 text-sm font-body mb-3">{prefsError}</p>
          )}

          <button
            onClick={savePrefs}
            disabled={prefsSaving}
            className="flex items-center gap-2 bg-brand-dark text-cream px-6 py-2.5 rounded-xl font-body font-semibold hover:bg-burgundy transition disabled:opacity-60"
          >
            <Save size={16} />
            {prefsSaving ? 'Saving…' : prefsSaved ? '✓ Saved!' : 'Save Preferences'}
          </button>
        </div>
      </div>

      {/* ── Sign Out ── */}
      <div className="px-10 pb-10">
        <button
          onClick={logout}
          className="border-2 border-brand-pink/40 text-burgundy/70 rounded-xl px-8 py-3 hover:border-brand-dark hover:text-brand-dark transition font-body font-semibold flex items-center gap-2"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

    </div>
  )
}
