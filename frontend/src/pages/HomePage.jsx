import { useState, useEffect, useRef } from 'react'
import { Heart, RefreshCw } from 'lucide-react'
import api from '../api/client'

const EMOJIS   = ['👗', '👠', '👒', '👜', '💄', '✨', '👑', '🛍️', '💅', '🪞', '🎀', '💎']
const AESTHETICS = ['Minimalist', 'Y2K', 'Dark Academia', 'Cottagecore', 'Streetwear', 'Preppy', 'Boho', 'Vintage', '60s Mod', 'Old Money', 'Coastal', 'Grunge']
const OCCASIONS  = ['Casual', 'Work', 'Date Night', 'Dinner Out', 'Weekend Brunch', 'Outdoor', 'Formal']
const PALETTE    = [
  { name: 'White',      hex: '#FFFFFF', border: true },
  { name: 'Cream',      hex: '#F5E6D3' },
  { name: 'Beige',      hex: '#C9A96E' },
  { name: 'Black',      hex: '#1A1A1A' },
  { name: 'Navy',       hex: '#1B2A4A' },
  { name: 'Red',        hex: '#C0392B' },
  { name: 'Pink',       hex: '#FF6B9D' },
  { name: 'Dusty Rose', hex: '#C9A0A0' },
  { name: 'Sage',       hex: '#7CAE7A' },
  { name: 'Olive',      hex: '#6B7C45' },
  { name: 'Burgundy',   hex: '#6D2B3D' },
  { name: 'Camel',      hex: '#C19A6B' },
]

export default function HomePage() {
  const [filters, setFilters] = useState({ aesthetic: '', occasion: '', colors: [] })
  const [outfit, setOutfit] = useState(null)
  const [loading, setLoading] = useState(false)
  const [emojiIdx, setEmojiIdx] = useState(0)
  const [emojiKey, setEmojiKey] = useState(0)
  const [error, setError] = useState('')
  const timer = useRef(null)

  // Cycle emojis while loading
  useEffect(() => {
    if (loading) {
      timer.current = setInterval(() => {
        setEmojiIdx(i => (i + 1) % EMOJIS.length)
        setEmojiKey(k => k + 1)
      }, 600)
    } else {
      clearInterval(timer.current)
    }
    return () => clearInterval(timer.current)
  }, [loading])

  const buildOccasion = () => {
    const parts = []
    if (filters.aesthetic) parts.push(`${filters.aesthetic} aesthetic`)
    if (filters.occasion)  parts.push(filters.occasion.toLowerCase())
    if (filters.colors.length) parts.push(`with ${filters.colors.join(' and ')} tones`)
    return parts.length ? parts.join(', ') : 'casual'
  }

  const generate = async (surprise = false) => {
    setLoading(true)
    setError('')
    setOutfit(null)
    try {
      const occasion = surprise
        ? OCCASIONS[Math.floor(Math.random() * OCCASIONS.length)].toLowerCase()
        : buildOccasion()
      const res = await api.post('/outfits/generate/', { occasion })
      setOutfit(res.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong — try again!')
    } finally {
      setLoading(false)
    }
  }

  const toggleColor = name =>
    setFilters(f => ({
      ...f,
      colors: f.colors.includes(name) ? f.colors.filter(c => c !== name) : [...f.colors, name],
    }))

  const toggleFav = async () => {
    if (!outfit) return
    try {
      await api.patch(`/outfits/${outfit.outfit.id}/`, { is_favorite: !outfit.outfit.is_favorite })
      setOutfit(o => ({ ...o, outfit: { ...o.outfit, is_favorite: !o.outfit.is_favorite } }))
    } catch {}
  }

  return (
    <div className="flex h-full min-h-screen">

      {/* ── LEFT: outfit display ── */}
      <div className="flex-1 polka-dot-bg flex flex-col items-center justify-center p-8 relative min-h-screen">

        {/* Idle state */}
        {!outfit && !loading && !error && (
          <div className="text-center select-none">
            <div className="text-9xl mb-6">✨</div>
            <p className="text-rose-400 text-2xl font-display font-light mb-2">
              Your perfect outfit awaits
            </p>
            <p className="text-rose-300 text-sm">
              Choose your vibe on the right →
            </p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center select-none">
            <div key={emojiKey} className="text-9xl mb-6 emoji-pop">
              {EMOJIS[emojiIdx]}
            </div>
            <p className="text-rose-400 text-lg font-light animate-pulse">
              Claude is styling your look…
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-rose-500 bg-white/70 rounded-xl px-5 py-3 text-sm">{error}</p>
            <button
              onClick={() => generate(false)}
              className="mt-4 text-rose-400 text-sm underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        {/* Outfit result */}
        {outfit && !loading && (
          <div className="w-full max-w-xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-2xl font-display font-semibold text-rose-800 leading-tight">
                  {outfit.outfit.name}
                </h2>
                <span className="inline-block mt-1.5 px-3 py-0.5 bg-rose-100 text-rose-500 rounded-full text-xs capitalize tracking-wide">
                  {outfit.outfit.occasion_tag}
                </span>
              </div>
              <button
                onClick={toggleFav}
                className={`p-2.5 rounded-full transition-all shadow-sm
                  ${outfit.outfit.is_favorite
                    ? 'bg-rose-400 text-white shadow-rose-200'
                    : 'bg-white/80 text-rose-300 hover:text-rose-400'}`}
              >
                <Heart size={18} fill={outfit.outfit.is_favorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Item photos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              {outfit.outfit.clothing_items.map(item => (
                <div
                  key={item.id}
                  className="aspect-square rounded-2xl overflow-hidden shadow-md bg-white"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.ai_attributes?.type || item.category}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-rose-200">
                      👗
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Reasoning */}
            {outfit.reasoning && (
              <div className="bg-white/60 rounded-2xl px-4 py-3 mb-4">
                <p className="text-rose-700/70 text-sm italic text-center leading-relaxed">
                  "{outfit.reasoning}"
                </p>
              </div>
            )}

            {/* Regenerate */}
            <button
              onClick={() => generate(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/70 text-rose-400 hover:bg-white/90 transition text-sm font-medium"
            >
              <RefreshCw size={14} /> Try another look
            </button>
          </div>
        )}
      </div>

      {/* ── RIGHT: filter menu ── */}
      <div className="w-72 bg-burgundy flex flex-col p-5 overflow-y-auto shrink-0">
        <h2 className="text-white text-xl font-display font-semibold leading-tight mb-0.5">
          What are we
        </h2>
        <p className="text-white text-xl font-display font-semibold mb-5">
          wearing today?
        </p>

        {/* Aesthetic */}
        <section className="mb-5">
          <label className="text-rose-200/70 text-xs uppercase tracking-widest mb-2 block">
            Aesthetic
          </label>
          <input
            type="text"
            placeholder="e.g. Dark Academia, Y2K…"
            value={filters.aesthetic}
            onChange={e => setFilters(f => ({ ...f, aesthetic: e.target.value }))}
            className="w-full bg-white/10 text-white placeholder-rose-200/30 border border-rose-200/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-300/60 transition"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {AESTHETICS.map(s => (
              <button
                key={s}
                onClick={() => setFilters(f => ({ ...f, aesthetic: f.aesthetic === s ? '' : s }))}
                className={`px-2 py-0.5 rounded-full text-xs border transition-all
                  ${filters.aesthetic === s
                    ? 'bg-rose-400 border-rose-400 text-white'
                    : 'border-rose-200/25 text-rose-200/60 hover:border-rose-200/50 hover:text-rose-200/90'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* Occasion */}
        <section className="mb-5">
          <label className="text-rose-200/70 text-xs uppercase tracking-widest mb-2 block">
            Occasion
          </label>
          <div className="flex flex-wrap gap-1.5">
            {OCCASIONS.map(occ => (
              <button
                key={occ}
                onClick={() => setFilters(f => ({ ...f, occasion: f.occasion === occ ? '' : occ }))}
                className={`px-3 py-1.5 rounded-full text-xs transition-all
                  ${filters.occasion === occ
                    ? 'bg-rose-400 text-white'
                    : 'bg-white/10 text-rose-200/70 hover:bg-white/20 hover:text-rose-200'}`}
              >
                {occ}
              </button>
            ))}
          </div>
        </section>

        {/* Color palette */}
        <section className="mb-6">
          <label className="text-rose-200/70 text-xs uppercase tracking-widest mb-2.5 block">
            Color Palette
          </label>
          <div className="grid grid-cols-6 gap-2">
            {PALETTE.map(({ name, hex, border }) => (
              <button
                key={name}
                title={name}
                onClick={() => toggleColor(name)}
                style={{ backgroundColor: hex }}
                className={`w-8 h-8 rounded-full transition-all
                  ${filters.colors.includes(name) ? 'ring-2 ring-white ring-offset-2 ring-offset-burgundy scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}
                  ${border ? 'border border-rose-200/30' : ''}`}
              />
            ))}
          </div>
        </section>

        <div className="flex-1" />

        {/* CTA buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => generate(false)}
            disabled={loading}
            className="w-full py-3 bg-rose-400 text-white rounded-xl font-medium hover:bg-rose-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating…' : 'Generate Outfit'}
          </button>
          <button
            onClick={() => generate(true)}
            disabled={loading}
            className="w-full py-3 bg-transparent text-rose-200 border border-rose-200/30 rounded-xl font-medium hover:bg-white/8 active:scale-95 transition-all disabled:opacity-50"
          >
            ✨ Surprise Me!
          </button>
        </div>
      </div>
    </div>
  )
}
