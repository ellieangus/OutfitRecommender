import { useState, useEffect, useCallback, useMemo } from 'react'
import api from '../api/client'
import ClothingCard from '../components/ClothingCard'
import ItemDetailPanel from '../components/ItemDetailPanel'

// ── Category fuzzy matching ─────────────────────────────────────────────────
const CATEGORIES = ['all', 'top', 'bottom', 'shoes', 'jewelry', 'socks', 'bag', 'hat', 'other']

const CATEGORY_KEYWORDS = {
  top:     ['top', 'shirt', 't-shirt', 'tee', 'blouse', 'sweater', 'hoodie', 'jacket', 'coat',
             'cardigan', 'turtleneck', 'tank', 'crop', 'polo', 'vest', 'sweatshirt', 'pullover',
             'tunic', 'bodysuit', 'flannel', 'button', 'blazer', 'overcoat'],
  bottom:  ['bottom', 'pants', 'jeans', 'skirt', 'shorts', 'trousers', 'leggings', 'joggers',
             'chinos', 'culottes', 'wide-leg', 'miniskirt', 'dress', 'jumpsuit', 'romper'],
  shoes:   ['shoes', 'sneakers', 'boots', 'heels', 'sandals', 'flats', 'loafers', 'pumps',
             'mules', 'slides', 'oxfords', 'shoe', 'slipper', 'wedge', 'clog'],
  jewelry: ['jewelry', 'necklace', 'bracelet', 'earrings', 'ring', 'watch', 'anklet',
             'choker', 'pendant', 'chain', 'brooch', 'cuff'],
  socks:   ['socks', 'sock', 'stockings', 'tights', 'hosiery'],
  bag:     ['bag', 'purse', 'handbag', 'backpack', 'tote', 'clutch', 'wallet',
             'satchel', 'crossbody', 'pouch', 'fanny'],
  hat:     ['hat', 'cap', 'beanie', 'beret', 'fedora', 'bucket', 'baseball', 'visor', 'bonnet'],
  other:   ['other', 'belt', 'scarf', 'sunglasses', 'glasses', 'accessory', 'gloves',
             'tie', 'bow', 'headband', 'hair', 'mask'],
}

function matchesCategory(item, cat) {
  if (cat === 'all') return true
  if (item.category === cat) return true          // exact DB match
  const type = (item.ai_attributes?.type || '').toLowerCase()
  return (CATEGORY_KEYWORDS[cat] || []).some(kw => type.includes(kw))
}

// ── Color name → hex ────────────────────────────────────────────────────────
const COLOR_HEX = {
  'black': '#1a1a1a', 'white': '#f7f7f7', 'cream': '#f5f0e0', 'ivory': '#fffff0',
  'beige': '#d4b896', 'tan': '#d2b48c', 'camel': '#c19a6b', 'brown': '#8b5e3c',
  'grey': '#9e9e9e', 'gray': '#9e9e9e', 'charcoal': '#36454f', 'silver': '#bdbdbd',
  'navy': '#1a237e', 'blue': '#1565c0', 'light blue': '#90caf9', 'denim': '#5c7fa3',
  'teal': '#00897b', 'mint': '#a8e6ce', 'green': '#2e7d32', 'olive': '#827717',
  'sage': '#7b9e7b', 'lime': '#8bc34a',
  'red': '#c62828', 'burgundy': '#6d1a36', 'maroon': '#800000', 'wine': '#722f37',
  'rust': '#b7410e', 'terracotta': '#cc6b49', 'coral': '#ff7043', 'orange': '#e65100',
  'pink': '#e91e8c', 'hot pink': '#ff1493', 'dusty rose': '#d4a5a5', 'blush': '#f7c5c5',
  'rose': '#e8a0a0', 'mauve': '#c9a0a0',
  'yellow': '#f9a825', 'mustard': '#ffdb58', 'gold': '#daa520',
  'purple': '#6a1b9a', 'lavender': '#ce93d8', 'lilac': '#b39ddb', 'plum': '#8e24aa',
  'white and': '#f7f7f7', 'off-white': '#faf9f6',
}

function colorToHex(name) {
  const lower = name.toLowerCase()
  for (const [key, hex] of Object.entries(COLOR_HEX)) {
    if (lower.includes(key)) return hex
  }
  return '#d1d5db'
}

// ── Component ────────────────────────────────────────────────────────────────
export default function GalleryPage() {
  const [items, setItems]           = useState([])
  const [category, setCategory]     = useState('all')
  const [selectedColor, setColor]   = useState(null)
  const [selectedItem, setSelected] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      // Fetch all items; filter client-side so fuzzy category matching works
      const res = await api.get('/wardrobe/')
      setItems(res.data || [])
    } catch {
      setError('Could not load wardrobe.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  // Collect unique colors from all items
  const allColors = useMemo(() => {
    const seen = new Map()
    items.forEach(item => {
      ;(item.ai_attributes?.color || []).forEach(c => {
        const key = c.toLowerCase().trim()
        if (key && !seen.has(key)) seen.set(key, c)
      })
    })
    return [...seen.keys()].sort()
  }, [items])

  // Apply category + color filters
  const filtered = useMemo(() => items.filter(item => {
    const catOk   = matchesCategory(item, category)
    const colorOk = !selectedColor ||
      (item.ai_attributes?.color || []).some(c => c.toLowerCase().includes(selectedColor))
    return catOk && colorOk
  }), [items, category, selectedColor])

  const handleDelete = async (item) => {
    try {
      await api.delete(`/wardrobe/${item.id}/`)
      setItems(prev => prev.filter(i => i.id !== item.id))
      if (selectedItem?.id === item.id) setSelected(null)
    } catch {}
  }

  const handleFavorite = async (item) => {
    try {
      await api.patch(`/wardrobe/${item.id}/`, { is_favorite: !item.is_favorite })
      const update = i => i.id === item.id ? { ...i, is_favorite: !i.is_favorite } : i
      setItems(prev => prev.map(update))
      if (selectedItem?.id === item.id)
        setSelected(prev => ({ ...prev, is_favorite: !prev.is_favorite }))
    } catch {}
  }

  const handleUpdate = (updated) => {
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
    setSelected(updated)
  }

  return (
    <div className="min-h-screen bg-[#fbf0f2] p-10">
      <h1 className="text-2xl font-display font-bold text-burgundy mb-1">My Wardrobe</h1>
      <p className="font-body text-burgundy/60 text-sm mb-6">
        {filtered.length} of {items.length} item{items.length !== 1 ? 's' : ''}
      </p>

      {/* ── Category tabs ── */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm capitalize transition-all
              ${category === cat
                ? 'bg-brand-dark text-cream shadow-sm'
                : 'bg-white text-burgundy/70 border border-brand-pink/40 hover:border-brand-pink hover:text-brand-dark'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Color filter ── */}
      {allColors.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 items-center">
          <span className="text-xs text-burgundy/60 mr-1 shrink-0">Color:</span>

          {/* "All" rainbow swatch */}
          <button
            onClick={() => setColor(null)}
            title="All colors"
            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110
              ${!selectedColor ? 'border-brand-dark scale-110 shadow-sm' : 'border-white shadow-sm'}`}
            style={{ background: 'conic-gradient(#fda4af, #fbbf24, #86efac, #93c5fd, #c4b5fd, #fda4af)' }}
          />

          {allColors.slice(0, 24).map(color => (
            <button
              key={color}
              onClick={() => setColor(selectedColor === color ? null : color)}
              title={color}
              className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110
                ${selectedColor === color ? 'border-brand-dark scale-110 shadow-sm' : 'border-white shadow-sm'}`}
              style={{ backgroundColor: colorToHex(color) }}
            />
          ))}

          {selectedColor && (
            <span className="text-xs text-brand-dark ml-1 capitalize">{selectedColor}</span>
          )}
        </div>
      )}

      {/* ── States ── */}
      {loading && (
        <div className="flex items-center justify-center py-24 text-4xl animate-pulse select-none text-brand-pink">✨</div>
      )}
      {error && !loading && (
        <div className="text-center py-16 text-red-400 text-sm">{error}</div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center select-none">
          <div className="text-6xl mb-4">👗</div>
          <p className="text-burgundy/50 text-sm">
            {items.length === 0 ? 'Your wardrobe is empty — add some items!' : 'No items match your filters.'}
          </p>
        </div>
      )}

      {/* ── Grid ── */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(item => (
            <ClothingCard
              key={item.id}
              item={item}
              onClick={() => setSelected(item)}
              onDelete={() => handleDelete(item)}
              onFavorite={() => handleFavorite(item)}
            />
          ))}
        </div>
      )}

      {/* ── Detail panel ── */}
      <ItemDetailPanel
        item={selectedItem}
        onClose={() => setSelected(null)}
        onUpdate={handleUpdate}
      />
    </div>
  )
}
