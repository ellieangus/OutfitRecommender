import { useState, useRef } from 'react'
import { Upload, ShoppingBag, Check, AlertCircle, Sparkles } from 'lucide-react'
import api from '../api/client'

const CATEGORIES = ['top', 'bottom', 'shoes', 'jewelry', 'socks', 'bag', 'hat', 'other']

/* ── Drop Zone ── */
function DropZone({ onFile, file, disabled, accent = 'pink' }) {
  const inputRef = useRef(null)

  const handleDrop = e => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) onFile(f)
  }

  // Use distinct, high-contrast icon colors — NOT the same light pink as the bg
  const iconColor    = accent === 'burgundy' ? 'text-burgundy'   : 'text-brand-dark'
  const iconBg       = accent === 'burgundy' ? 'bg-burgundy/12'  : 'bg-brand-dark/10'
  const borderColor  = accent === 'burgundy'
    ? 'border-burgundy/35 hover:border-burgundy/65'
    : 'border-brand-pink/50 hover:border-brand-pink'
  const bgColor      = accent === 'burgundy'
    ? 'bg-[#faf3f5]'
    : 'bg-[#fdf5f7]'

  return (
    <div
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all
        min-h-[320px] w-full
        ${file ? 'border-brand-pink bg-white' : `${borderColor} ${bgColor}`}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => e.target.files[0] && onFile(e.target.files[0])}
      />
      {file ? (
        <div className="relative w-full h-64 px-4">
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            className="w-full h-full object-contain rounded-xl"
          />
        </div>
      ) : (
        <>
          {/* Icon — dark color on light bg = clear contrast */}
          <div className={`w-16 h-16 rounded-full ${iconBg} flex items-center justify-center`}>
            <Upload size={28} className={iconColor} />
          </div>
          <div className="text-center px-6">
            <p className="text-burgundy font-body text-base font-semibold">
              Drop an image here
            </p>
            <p className="text-burgundy/60 font-body text-sm mt-1">
              or <span className="text-brand-dark font-bold underline underline-offset-2">browse your files</span>
            </p>
          </div>
          <p className="text-burgundy/50 font-body text-xs">JPG, PNG, WEBP supported</p>
        </>
      )}
    </div>
  )
}

/* ── Status Badge ── */
function StatusBadge({ state }) {
  if (state === 'loading') return (
    <div className="flex items-center gap-2 text-brand-dark font-body text-sm animate-pulse">
      <Sparkles size={16} className="text-brand-pink" />
      Claude is analyzing your item…
    </div>
  )
  if (state === 'success') return (
    <div className="flex items-center gap-2 text-green-600 font-body text-sm">
      <Check size={16} /> Done! Item cataloged.
    </div>
  )
  if (state === 'error') return (
    <div className="flex items-center gap-2 text-red-500 font-body text-sm">
      <AlertCircle size={16} /> Something went wrong. Please try again.
    </div>
  )
  return null
}

/* ── Wardrobe Upload Panel ── */
function WardrobeUpload() {
  const [file, setFile] = useState(null)
  const [category, setCategory] = useState('top')
  const [notes, setNotes] = useState('')
  const [state, setState] = useState('idle')
  const [result, setResult] = useState(null)

  const submit = async () => {
    if (!file) return
    setState('loading')
    const fd = new FormData()
    fd.append('image', file)
    fd.append('category', category)
    fd.append('notes', notes)
    try {
      const res = await api.post('/wardrobe/upload/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
      setState('success')
    } catch {
      setState('error')
    }
  }

  const reset = () => {
    setFile(null); setNotes(''); setState('idle'); setResult(null)
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <DropZone onFile={setFile} file={file} disabled={state === 'loading'} accent="pink" />

      {file && state === 'idle' && (
        <>
          {/* Category */}
          <div>
            <label className="font-body text-xs uppercase tracking-widest text-burgundy/70 mb-3 block font-semibold">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-full text-sm capitalize font-body font-medium transition-all
                    ${category === c
                      ? 'bg-brand-dark text-cream shadow-md shadow-brand-dark/30'
                      : 'bg-brand-pink/15 text-burgundy hover:bg-brand-pink/30 border border-brand-pink/20'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-body text-xs uppercase tracking-widest text-burgundy/70 mb-3 block font-semibold">
              Notes <span className="normal-case font-normal text-burgundy/50">(optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. vintage find, runs small, summer only…"
              className="w-full border border-brand-pink/30 rounded-xl px-4 py-3 text-sm font-body
                text-burgundy bg-white focus:outline-none focus:border-brand-pink focus:ring-2
                focus:ring-brand-pink/20 transition placeholder:text-dusty-coral/60"
            />
          </div>

          <button
            onClick={submit}
            className="w-full py-4 bg-brand-dark text-cream rounded-xl font-display font-bold
              text-base tracking-wide hover:bg-burgundy transition-all shadow-lg shadow-brand-dark/25
              hover:shadow-xl hover:shadow-burgundy/30"
          >
            Add to Wardrobe
          </button>
        </>
      )}

      <StatusBadge state={state} />

      {state === 'success' && result && (
        <div className="flex flex-col gap-4">
          <div className="bg-cream rounded-2xl p-5 border border-brand-pink/20">
            <p className="font-body text-xs uppercase tracking-widest text-burgundy/70 mb-3 font-semibold">
              Cataloged as
            </p>
            <div className="space-y-2">
              {Object.entries(result.ai_attributes || {}).map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <span className="text-burgundy/60 font-body text-sm capitalize w-24 shrink-0">{k}</span>
                  <span className="text-burgundy font-body text-sm font-medium">
                    {Array.isArray(v) ? v.join(', ') : v}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={reset}
            className="text-brand-dark font-body text-sm font-semibold underline underline-offset-2 self-start
              hover:text-burgundy transition-colors"
          >
            + Add another item
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Shop Panel ── */
function ShopUpload() {
  const [file, setFile] = useState(null)
  const [state, setState] = useState('idle')
  const [result, setResult] = useState(null)

  const analyze = async () => {
    if (!file) return
    setState('loading')
    const fd = new FormData()
    fd.append('image', file)
    try {
      const res = await api.post('/shopping/analyze/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
      setState('success')
    } catch {
      setState('error')
    }
  }

  const reset = () => { setFile(null); setState('idle'); setResult(null) }

  return (
    <div className="flex flex-col gap-6 h-full">
      <DropZone onFile={setFile} file={file} disabled={state === 'loading'} accent="burgundy" />

      {file && state === 'idle' && (
        <button
          onClick={analyze}
          className="w-full py-4 bg-burgundy text-cream rounded-xl font-display font-bold
            text-base tracking-wide hover:bg-deep-burgundy transition-all shadow-lg shadow-burgundy/25
            hover:shadow-xl hover:shadow-deep-burgundy/30"
        >
          Find Outfit Pairings
        </button>
      )}

      <StatusBadge state={state} />

      {state === 'success' && result && (
        <div className="flex flex-col gap-5">

          {/* Item attributes */}
          {result.shopping_item_attributes && (
            <div className="bg-cream rounded-2xl p-5 border border-brand-pink/20">
              <p className="font-body text-xs uppercase tracking-widest text-burgundy/70 mb-3 font-semibold">
                Item detected
              </p>
              <div className="space-y-2">
                {['type', 'color', 'formality'].map(k =>
                  result.shopping_item_attributes[k] ? (
                    <div key={k} className="flex gap-3">
                      <span className="text-burgundy/60 font-body text-sm capitalize w-24 shrink-0">{k}</span>
                      <span className="text-burgundy font-body text-sm font-medium">
                        {Array.isArray(result.shopping_item_attributes[k])
                          ? result.shopping_item_attributes[k].join(', ')
                          : result.shopping_item_attributes[k]}
                      </span>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Verdict */}
          {result.overall_verdict && (
            <div className="bg-brand-pink/10 rounded-2xl px-5 py-4 border border-brand-pink/20">
              <p className="text-brand-dark font-body text-sm italic leading-relaxed">
                "{result.overall_verdict}"
              </p>
            </div>
          )}

          {/* Outfit pairings */}
          {result.outfits?.length > 0 && (
            <div>
              <p className="font-body text-xs uppercase tracking-widest text-burgundy/50 mb-4 font-semibold">
                Pairs with your wardrobe
              </p>
              <div className="flex flex-col gap-4">
                {result.outfits.map((outfit, i) => (
                  <div key={i} className="bg-white border border-brand-pink/15 rounded-2xl p-5 shadow-sm">
                    <p className="font-display font-semibold text-burgundy text-base mb-1">
                      {outfit.outfit_name}
                    </p>
                    {outfit.reasoning && (
                      <p className="text-burgundy/65 font-body text-xs mb-4 italic leading-relaxed">
                        {outfit.reasoning}
                      </p>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      {(outfit.items || []).slice(0, 3).map(item => (
                        <div key={item.id} className="aspect-square rounded-xl overflow-hidden bg-brand-pink/10">
                          {item.image_url ? (
                            <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-brand-pink/70">
                              <ShoppingBag size={24} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={reset}
            className="text-brand-dark font-body text-sm font-semibold underline underline-offset-2 self-start
              hover:text-burgundy transition-colors"
          >
            Try another item
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Main AddPage ── */
export default function AddPage() {
  return (
    <div className="flex flex-col h-screen bg-[#fbf0f2] overflow-hidden">

      {/* Header */}
      <div className="px-10 pt-9 pb-6 shrink-0">
        <h1 className="font-display text-4xl font-bold text-burgundy tracking-tight">
          Add an Item
        </h1>
        <p className="font-body text-base text-burgundy/65 mt-1.5">
          Catalog a new piece or see how something you love would pair with your closet.
        </p>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 gap-0 px-10 pb-10 overflow-hidden min-h-0">

        {/* Left — Add to Wardrobe */}
        <div className="flex-1 flex flex-col overflow-y-auto pr-8">
          {/* Panel header */}
          <div className="flex items-center gap-3 mb-6 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center shadow-md shadow-brand-dark/30">
              <Upload size={18} className="text-cream" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-burgundy leading-tight">
                Add to Wardrobe
              </h2>
              <p className="font-body text-xs text-burgundy/65 mt-0.5">
                Claude will auto-tag color, style, formality &amp; more
              </p>
            </div>
          </div>

          <WardrobeUpload />
        </div>

        {/* Divider */}
        <div className="w-px bg-brand-pink/20 shrink-0 self-stretch mx-2" />

        {/* Right — Shop This Item */}
        <div className="flex-1 flex flex-col overflow-y-auto pl-8">
          {/* Panel header */}
          <div className="flex items-center gap-3 mb-6 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-burgundy flex items-center justify-center shadow-md shadow-burgundy/30">
              <ShoppingBag size={18} className="text-cream" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-burgundy leading-tight">
                Shop This Item
              </h2>
              <p className="font-body text-xs text-burgundy/65 mt-0.5">
                Upload something you want to buy — Claude finds matches in your closet
              </p>
            </div>
          </div>

          <ShopUpload />
        </div>
      </div>
    </div>
  )
}
