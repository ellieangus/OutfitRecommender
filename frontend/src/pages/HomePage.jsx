import { useState } from 'react'
import { Heart, Star, Sparkles, Smile, X, RefreshCw } from 'lucide-react'
import api from '../api/client'

// ── Doodle color ─────────────────────────────────────────────────────────────
const TAN = '#C4985E'

// ── Custom SVG doodles ───────────────────────────────────────────────────────
function ButterflyIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12 Q8 7 4 8 Q1 9 2 12 Q3 15 7 14 Q10 13 12 12" />
      <path d="M12 12 Q16 7 20 8 Q23 9 22 12 Q21 15 17 14 Q14 13 12 12" />
      <path d="M12 12 Q9 15 7 17 Q5 19 7 20 Q9 21 11 18 Q12 15 12 12" />
      <path d="M12 12 Q15 15 17 17 Q19 19 17 20 Q15 21 13 18 Q12 15 12 12" />
      <circle cx="12" cy="12" r="0.8" fill={color} stroke="none" />
    </svg>
  )
}

function BowIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12 C10 10 7 7 4 8 C2 9 2 11 4 12 C7 13 10 13 12 12" />
      <path d="M12 12 C14 10 17 7 20 8 C22 9 22 11 20 12 C17 13 14 13 12 12" />
      <path d="M12 12 L8.5 16.5 Q7 18.5 9 17.5 L12 12" />
      <path d="M12 12 L15.5 16.5 Q17 18.5 15 17.5 L12 12" />
      <circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />
    </svg>
  )
}

// ── Doodle cluster — centered, loading only ──────────────────────────────────
const DOODLES = [
  { type: 'heart',     dx: -170, dy:  -90, size: 38, delay: 0,   dur: 3.0, spin: false },
  { type: 'star',      dx:  160, dy: -115, size: 34, delay: 0.4, dur: 2.7, spin: true  },
  { type: 'sparkle',  dx: -155, dy:   95, size: 40, delay: 0.8, dur: 3.3, spin: true  },
  { type: 'bow',       dx:  165, dy:   85, size: 36, delay: 0.3, dur: 3.1, spin: false },
  { type: 'butterfly', dx:    0, dy: -175, size: 34, delay: 1.0, dur: 2.9, spin: false },
  { type: 'smiley',   dx:    0, dy:  175, size: 34, delay: 0.6, dur: 3.2, spin: false },
  { type: 'heart',     dx:  205, dy:  -10, size: 24, delay: 1.3, dur: 2.8, spin: false },
  { type: 'star',      dx: -215, dy:   25, size: 22, delay: 0.7, dur: 3.5, spin: true  },
]

function DoodleCluster() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
      <div className="relative" style={{ width: 0, height: 0 }}>
        {DOODLES.map((d, i) => (
          <div key={i} style={{ position: 'absolute', left: d.dx, top: d.dy, transform: 'translate(-50%, -50%)' }}>
            <div className={d.spin ? 'doodle-spin' : 'doodle-float'}
              style={{ animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }}>
              {d.type === 'heart'     && <Heart      size={d.size} style={{ color: TAN }} strokeWidth={1.5} />}
              {d.type === 'star'      && <Star       size={d.size} style={{ color: TAN }} strokeWidth={1.5} />}
              {d.type === 'sparkle'  && <Sparkles   size={d.size} style={{ color: TAN }} strokeWidth={1.5} />}
              {d.type === 'bow'       && <BowIcon    size={d.size} color={TAN} />}
              {d.type === 'butterfly' && <ButterflyIcon size={d.size} color={TAN} />}
              {d.type === 'smiley'   && <Smile      size={d.size} style={{ color: TAN }} strokeWidth={1.5} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Star rating ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n}
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n === value ? 0 : n)}
          className="transition-transform hover:scale-110"
        >
          <Star size={32} strokeWidth={1.5} style={{
            color: n <= (hover || value) ? '#EDDA8C' : '#5F0C2F22',
            fill:  n <= (hover || value) ? '#EDDA8C' : 'none',
            transition: 'color 0.1s, fill 0.1s',
          }} />
        </button>
      ))}
    </div>
  )
}

// ── Image preview modal ──────────────────────────────────────────────────────
function ImageModal({ src, alt, onClose }) {
  if (!src) return null
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8 backdrop-blur-sm" onClick={onClose}>
      <button className="absolute top-5 right-5 text-cream/70 hover:text-cream transition" onClick={onClose}>
        <X size={30} />
      </button>
      <img src={src} alt={alt}
        className="max-h-[88vh] max-w-[88vw] rounded-2xl object-contain shadow-2xl"
        onClick={e => e.stopPropagation()} />
    </div>
  )
}

// ── Constants ────────────────────────────────────────────────────────────────
const OCCASIONS  = ['Casual', 'Everyday', 'Work', 'Outdoor', 'Formal', 'Date Night', 'Party', 'Brunch', 'Vacation', 'Athletic']
const AESTHETICS = ['Minimalist', 'Y2K', 'Dark Academia', 'Cottagecore', 'Old Money', 'Streetwear', 'Boho', 'Preppy', 'Grunge', 'Coastal', 'Romantic', 'Vintage']
const PALETTE    = [
  { name: 'Black',      hex: '#1A1A1A' },
  { name: 'White',      hex: '#F7F7F7', border: true },
  { name: 'Cream',      hex: '#F5E6D3' },
  { name: 'Blush',      hex: '#f4c2c2' },
  { name: 'Burgundy',   hex: '#800020' },
  { name: 'Navy',       hex: '#1B2A4A' },
  { name: 'Camel',      hex: '#C19A6B' },
  { name: 'Sage',       hex: '#7CAE7A' },
  { name: 'Denim',      hex: '#5C7FA3' },
  { name: 'Lavender',   hex: '#b57bee' },
  { name: 'Terracotta', hex: '#cc6b49' },
  { name: 'Gold',       hex: '#DAA520' },
]

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [filters, setFilters] = useState({ aesthetic: '', occasion: '', customOccasion: '', colors: [] })
  const [outfit,  setOutfit]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [rating,  setRating]  = useState(0)
  const [notes,   setNotes]   = useState('')
  const [saving,  setSaving]  = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [preview, setPreview] = useState(null)

  const buildOccasion = () => {
    const parts = []
    if (filters.aesthetic) parts.push(`${filters.aesthetic} aesthetic`)
    const occ = filters.customOccasion.trim() || filters.occasion
    if (occ) parts.push(occ.toLowerCase())
    if (filters.colors.length) parts.push(`with ${filters.colors.join(' and ')} tones`)
    return parts.length ? parts.join(', ') : 'casual'
  }

  const generate = async (surprise = false) => {
    setLoading(true); setError(''); setOutfit(null)
    setRating(0); setNotes(''); setSaveMsg('')
    try {
      const occasion = surprise
        ? OCCASIONS[Math.floor(Math.random() * OCCASIONS.length)].toLowerCase()
        : buildOccasion()
      const res = await api.post('/outfits/generate/', { occasion })
      setOutfit(res.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Could not generate outfit — make sure your wardrobe has items!')
    } finally { setLoading(false) }
  }

  const saveOutfit = async () => {
    if (!outfit?.outfit?.id) return
    setSaving(true); setSaveMsg('')
    try {
      await api.patch(`/outfits/${outfit.outfit.id}/`, { rating: rating || null, notes })
      setSaveMsg('Saved!')
      setTimeout(() => setSaveMsg(''), 2500)
    } catch { setSaveMsg('Could not save.') }
    finally { setSaving(false) }
  }

  const toggleFav = async () => {
    if (!outfit?.outfit?.id) return
    try {
      const next = !outfit.outfit.is_favorite
      await api.patch(`/outfits/${outfit.outfit.id}/`, { is_favorite: next })
      setOutfit(o => ({ ...o, outfit: { ...o.outfit, is_favorite: next } }))
    } catch {}
  }

  const toggleColor = name =>
    setFilters(f => ({
      ...f,
      colors: f.colors.includes(name) ? f.colors.filter(c => c !== name) : [...f.colors, name],
    }))

  const outfitItems = outfit?.outfit?.clothing_items || []

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ══ LEFT: polka-dot panel ══ */}
      <div className="flex-1 polka-dot-bg relative overflow-y-auto">

        {/* Doodles — ONLY during loading */}
        {loading && <DoodleCluster />}

        <div className="relative z-10 p-10 min-h-full flex flex-col">

          {/* Idle */}
          {!outfit && !loading && !error && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="font-display text-3xl font-bold italic text-burgundy mb-3">
                Your perfect outfit awaits
              </p>
              <p className="font-body text-burgundy/60 text-base">Choose your vibe on the right →</p>
            </div>
          )}

          {/* Loading text */}
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="font-display text-2xl italic text-burgundy animate-pulse">
                Styling your look…
              </p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="font-body text-brand-dark bg-white/80 rounded-2xl px-6 py-4 text-sm mb-4 shadow">{error}</p>
              <button onClick={() => generate(false)} className="font-body text-brand-dark text-sm underline underline-offset-2">
                Try again
              </button>
            </div>
          )}

          {/* Outfit result */}
          {outfit && !loading && (
            <div className="w-full max-w-2xl mx-auto">

              {/* Header */}
              <div className="flex items-start justify-between mb-7">
                <div>
                  <h2 className="font-display text-3xl font-bold text-burgundy leading-tight">
                    {outfit.outfit.name || 'Your Outfit'}
                  </h2>
                  {outfit.outfit.occasion_tag && (
                    <span className="inline-block mt-2 px-3 py-1 bg-cream text-brand-dark rounded-full text-xs font-body uppercase tracking-widest">
                      {outfit.outfit.occasion_tag}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button onClick={toggleFav}
                    className={`p-2.5 rounded-full transition-all shadow-sm
                      ${outfit.outfit.is_favorite ? 'bg-brand-dark text-cream' : 'bg-white/80 text-burgundy/60 hover:text-brand-dark'}`}>
                    <Heart size={18} fill={outfit.outfit.is_favorite ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={() => generate(false)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/80 rounded-xl text-brand-dark text-sm font-body hover:bg-white transition shadow-sm">
                    <RefreshCw size={14} /> Regenerate
                  </button>
                </div>
              </div>

              {/* Photos — click to preview */}
              {outfitItems.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-7">
                  {outfitItems.map(item => (
                    <div key={item.id}
                      className="rounded-2xl overflow-hidden shadow-md bg-white cursor-pointer hover:shadow-xl transition group"
                      onClick={() => setPreview(item)}>
                      <div className="aspect-square bg-[#FFF1B5]/30 overflow-hidden">
                        {item.image_url
                          ? <img src={item.image_url} alt={item.ai_attributes?.type || item.category}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          : <div className="w-full h-full flex items-center justify-center text-brand-dark/20 text-4xl">👗</div>
                        }
                      </div>
                      <div className="px-4 py-3">
                        <p className="font-body font-medium text-burgundy capitalize text-sm">
                          {item.ai_attributes?.type || item.category}
                        </p>
                        {item.ai_attributes?.color?.length > 0 && (
                          <p className="font-body text-burgundy/50 text-xs mt-0.5">
                            {item.ai_attributes.color.slice(0, 2).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Rating + Notes + Save */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-7 space-y-6">
                <div>
                  <p className="font-body font-semibold text-burgundy/60 text-xs uppercase tracking-widest mb-3">Rate this outfit</p>
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <div>
                  <p className="font-body font-semibold text-burgundy/60 text-xs uppercase tracking-widest mb-3">Notes</p>
                  <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. wear this next week, try with different shoes…"
                    className="w-full border border-brand-pink/40 rounded-xl px-4 py-3 font-body text-sm text-burgundy placeholder:text-dusty-coral focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 transition resize-none bg-white"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={saveOutfit} disabled={saving}
                    className="px-7 py-2.5 bg-brand-dark text-cream rounded-xl font-body font-semibold hover:bg-burgundy transition disabled:opacity-60">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  {saveMsg && (
                    <span className={`font-body text-sm ${saveMsg === 'Saved!' ? 'text-green-600' : 'text-red-400'}`}>{saveMsg}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ RIGHT: filter panel ══ */}
      <div className="w-[520px] h-screen flex flex-col overflow-hidden shrink-0" style={{ background: '#4a0924', color: '#FFF1B5' }}>
        <div className="h-full p-7 space-y-5">

          <div>
            <h2 className="font-display text-[1.75rem] font-bold leading-tight" style={{ color: '#FFF1B5' }}>What are we</h2>
            <p className="font-display text-[1.75rem] font-bold" style={{ color: '#FFF1B5' }}>wearing today?</p>
          </div>

          {/* Aesthetic */}
          <section>
            <label className="font-body font-semibold text-xs uppercase tracking-widest mb-2 block" style={{ color: 'rgba(255, 241, 181, 0.9)' }}>Aesthetic Style</label>
            <input type="text" placeholder="e.g. Dark Academia, Y2K…"
              value={filters.aesthetic}
              onChange={e => setFilters(f => ({ ...f, aesthetic: e.target.value }))}
              className="w-full border rounded-xl px-3.5 py-3 font-body text-sm focus:outline-none transition mb-2"
              style={{ background: 'rgba(255,255,255,0.14)', color: '#FFF1B5', borderColor: 'rgba(255,241,181,0.45)' }}
            />
            <div className="flex flex-wrap gap-1.5">
              {AESTHETICS.map(s => (
                <button key={s}
                  onClick={() => setFilters(f => ({ ...f, aesthetic: f.aesthetic === s ? '' : s }))}
                  className={`px-3.5 py-2 rounded-full text-sm border font-body transition-all
                    ${filters.aesthetic === s
                      ? 'bg-brand-pink border-brand-pink text-burgundy font-semibold'
                      : 'hover:border-cream/60 hover:text-cream'}`}
                  style={filters.aesthetic === s ? {} : { borderColor: 'rgba(255, 241, 181, 0.45)', color: '#FFF1B5' }}>
                  {s}
                </button>
              ))}
            </div>
          </section>

          {/* Occasion */}
          <section>
            <label className="font-body font-semibold text-xs uppercase tracking-widest mb-2 block" style={{ color: 'rgba(255, 241, 181, 0.9)' }}>Occasion</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {OCCASIONS.map(occ => (
                <button key={occ}
                  onClick={() => setFilters(f => ({ ...f, occasion: f.occasion === occ ? '' : occ, customOccasion: '' }))}
                  className={`px-3.5 py-2 rounded-full text-sm font-body font-medium transition-all
                    ${filters.occasion === occ
                      ? 'bg-brand-pink text-burgundy font-semibold'
                      : 'hover:bg-white/20 hover:text-cream'}`}
                  style={filters.occasion === occ ? {} : { background: 'rgba(255,255,255,0.14)', color: '#FFF1B5' }}>
                  {occ}
                </button>
              ))}
            </div>
            <input type="text" value={filters.customOccasion}
              onChange={e => setFilters(f => ({ ...f, customOccasion: e.target.value, occasion: '' }))}
              placeholder="Or type a custom occasion…"
              className="w-full border rounded-xl px-3.5 py-3 font-body text-sm focus:outline-none transition"
              style={{ background: 'rgba(255,255,255,0.14)', color: '#FFF1B5', borderColor: 'rgba(255,241,181,0.45)' }}
            />
          </section>

          {/* Color palette */}
          <section>
            <label className="font-body font-semibold text-xs uppercase tracking-widest mb-2 block" style={{ color: 'rgba(255, 241, 181, 0.9)' }}>Color Palette</label>
            <div className="grid grid-cols-6 gap-2.5">
              {PALETTE.map(({ name, hex, border }) => (
                <button key={name} title={name} onClick={() => toggleColor(name)}
                  className={`w-11 h-11 rounded-full transition-all
                    ${filters.colors.includes(name) ? 'ring-2 ring-cream ring-offset-2 scale-110' : 'hover:scale-110 opacity-80 hover:opacity-100'}
                    ${border ? 'border border-cream/30' : ''}`}
                  style={filters.colors.includes(name)
                    ? { backgroundColor: hex, boxShadow: '0 0 0 2px #FFF1B5, 0 0 0 4px #4a0924' }
                    : { backgroundColor: hex }}
                />
              ))}
            </div>
          </section>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <button onClick={() => generate(false)} disabled={loading}
              className="w-full py-4 rounded-xl font-display font-bold text-lg active:scale-95 transition-all disabled:opacity-50"
              style={{ background: '#f4c2c2', color: '#5F0C2F' }}>
              {loading ? 'Generating…' : '✦ Generate Outfit'}
            </button>
            <button onClick={() => generate(true)} disabled={loading}
              className="w-full py-3.5 border rounded-xl font-body font-medium text-base hover:bg-white/20 active:scale-95 transition-all disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.14)', color: '#FFF1B5', borderColor: 'rgba(255, 241, 181, 0.5)' }}>
              🎲 Surprise Me!
            </button>
          </div>

          {error && <p className="font-body text-sm text-center rounded-xl px-4 py-2" style={{ color: '#FFF1B5', background: 'rgba(255,255,255,0.14)' }}>{error}</p>}
        </div>
      </div>

      <ImageModal
        src={preview?.image_url}
        alt={preview?.ai_attributes?.type || preview?.category}
        onClose={() => setPreview(null)}
      />
    </div>
  )
}
