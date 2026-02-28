import { useState, useRef } from 'react'
import { Upload, ShoppingBag, X, Check, AlertCircle } from 'lucide-react'
import api from '../api/client'
import ClothingCard from '../components/ClothingCard'

const CATEGORIES = ['top', 'bottom', 'shoes', 'jewelry', 'socks', 'bag', 'hat', 'other']

function DropZone({ onFile, file, disabled }) {
  const inputRef = useRef(null)

  const handleDrop = e => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) onFile(f)
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all min-h-[180px]
        ${file ? 'border-rose-300 bg-rose-50' : 'border-gray-200 bg-gray-50 hover:border-rose-300 hover:bg-rose-50/50'}
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
        <div className="relative w-full h-40">
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            className="w-full h-full object-contain rounded-xl"
          />
        </div>
      ) : (
        <>
          <Upload size={28} className="text-gray-300" />
          <p className="text-sm text-gray-400 text-center px-4">
            Drop an image here or <span className="text-rose-400 font-medium">browse</span>
          </p>
        </>
      )}
    </div>
  )
}

function StatusBadge({ state }) {
  if (state === 'loading') return (
    <div className="flex items-center gap-2 text-rose-400 text-sm animate-pulse">
      <span className="text-xl">✨</span> Claude is analyzing…
    </div>
  )
  if (state === 'success') return (
    <div className="flex items-center gap-2 text-green-500 text-sm">
      <Check size={16} /> Done!
    </div>
  )
  if (state === 'error') return (
    <div className="flex items-center gap-2 text-red-400 text-sm">
      <AlertCircle size={16} /> Something went wrong. Try again.
    </div>
  )
  return null
}

/* ── Wardrobe Upload Panel ── */
function WardrobeUpload() {
  const [file, setFile] = useState(null)
  const [category, setCategory] = useState('top')
  const [notes, setNotes] = useState('')
  const [state, setState] = useState('idle')   // idle | loading | success | error
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
    <div className="flex flex-col gap-4 h-full">
      <DropZone onFile={setFile} file={file} disabled={state === 'loading'} />

      {file && state === 'idle' && (
        <>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1 rounded-full text-xs capitalize transition-all
                    ${category === c ? 'bg-rose-400 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. vintage find, runs small…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-300 transition"
            />
          </div>
          <button
            onClick={submit}
            className="w-full py-3 bg-rose-400 text-white rounded-xl font-medium hover:bg-rose-500 transition"
          >
            Add to Wardrobe
          </button>
        </>
      )}

      <StatusBadge state={state} />

      {state === 'success' && result && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Cataloged as:</p>
          <div className="bg-rose-50 rounded-2xl p-4 text-sm space-y-1.5">
            {Object.entries(result.ai_attributes || {}).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-gray-400 capitalize w-20 shrink-0">{k}</span>
                <span className="text-gray-700">
                  {Array.isArray(v) ? v.join(', ') : v}
                </span>
              </div>
            ))}
          </div>
          <button onClick={reset} className="text-rose-400 text-sm underline underline-offset-2 self-start">
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
    <div className="flex flex-col gap-4 h-full">
      <DropZone onFile={setFile} file={file} disabled={state === 'loading'} />

      {file && state === 'idle' && (
        <button
          onClick={analyze}
          className="w-full py-3 bg-burgundy text-white rounded-xl font-medium hover:bg-burgundy-light transition"
        >
          Find Outfit Pairings
        </button>
      )}

      <StatusBadge state={state} />

      {state === 'success' && result && (
        <div className="flex flex-col gap-4">
          {/* Item attributes */}
          {result.shopping_item_attributes && (
            <div className="bg-gray-50 rounded-2xl p-4 text-sm space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Item detected</p>
              {['type', 'color', 'formality'].map(k => (
                result.shopping_item_attributes[k] && (
                  <div key={k} className="flex gap-2">
                    <span className="text-gray-400 capitalize w-20 shrink-0">{k}</span>
                    <span className="text-gray-700">
                      {Array.isArray(result.shopping_item_attributes[k])
                        ? result.shopping_item_attributes[k].join(', ')
                        : result.shopping_item_attributes[k]}
                    </span>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Verdict */}
          {result.overall_verdict && (
            <div className="bg-rose-50 rounded-2xl px-4 py-3">
              <p className="text-rose-700 text-sm italic">"{result.overall_verdict}"</p>
            </div>
          )}

          {/* Outfit pairings */}
          {result.outfits?.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Pairs with your wardrobe</p>
              <div className="flex flex-col gap-4">
                {result.outfits.map((outfit, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <p className="font-semibold text-gray-800 text-sm mb-1">{outfit.outfit_name}</p>
                    {outfit.reasoning && (
                      <p className="text-gray-400 text-xs mb-3 italic">{outfit.reasoning}</p>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      {(outfit.items || []).slice(0, 3).map(item => (
                        <div key={item.id} className="aspect-square rounded-xl overflow-hidden bg-rose-50">
                          {item.image_url ? (
                            <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={reset} className="text-rose-400 text-sm underline underline-offset-2 self-start">
            Try another item
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Main AddPage ── */
export default function AddPage() {
  const [activeTab, setActiveTab] = useState('wardrobe')   // 'wardrobe' | 'shop'

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">Add Item</h1>
      <p className="text-gray-400 text-sm mb-8">Add to your wardrobe or see how something you want to buy would work with your closet.</p>

      {/* Tab toggle */}
      <div className="flex rounded-2xl bg-white shadow-sm p-1 w-fit mb-8 border border-gray-100">
        <button
          onClick={() => setActiveTab('wardrobe')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all
            ${activeTab === 'wardrobe' ? 'bg-rose-400 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Upload size={15} /> Add to Wardrobe
        </button>
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all
            ${activeTab === 'shop' ? 'bg-burgundy text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <ShoppingBag size={15} /> Shop This Item
        </button>
      </div>

      {/* Content */}
      <div className="max-w-md">
        {activeTab === 'wardrobe' ? <WardrobeUpload /> : <ShopUpload />}
      </div>
    </div>
  )
}
