import { useState, useEffect } from 'react'
import api from '../api/client'
import ClothingCard from '../components/ClothingCard'
import OutfitCard from '../components/OutfitCard'
import ItemDetailPanel from '../components/ItemDetailPanel'

export default function FavoritesPage() {
  const [tab, setTab] = useState('outfits')   // 'outfits' | 'items'
  const [outfits, setOutfits] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [oRes, iRes] = await Promise.all([
          api.get('/outfits/'),
          api.get('/wardrobe/', { params: { favorites: 'true' } }),
        ])
        setOutfits((oRes.data || []).filter(o => o.is_favorite))
        setItems(iRes.data || [])
      } catch {} finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const handleUnfavItem = async (item) => {
    try {
      await api.patch(`/wardrobe/${item.id}/`, { is_favorite: false })
      setItems(prev => prev.filter(i => i.id !== item.id))
      if (selectedItem?.id === item.id) setSelectedItem(null)
    } catch {}
  }

  const list = tab === 'outfits' ? outfits : items
  const empty = !loading && list.length === 0

  return (
    <div className="min-h-screen bg-[#fbf0f2] p-10">
      <h1 className="text-2xl font-display font-bold text-burgundy mb-1">Favorites</h1>
      <p className="font-body text-burgundy/60 text-sm mb-6">Your saved looks and pieces</p>

      {/* Tab toggle */}
      <div className="flex rounded-2xl bg-white shadow-sm p-1 w-fit mb-8 border border-brand-pink/30">
        {[['outfits', 'Outfits'], ['items', 'Pieces']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`px-7 py-3 rounded-xl text-base font-medium transition-all
              ${tab === val ? 'bg-brand-dark text-cream shadow-sm' : 'text-burgundy/60 hover:text-burgundy'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24 text-4xl animate-pulse select-none text-brand-pink">✨</div>
      )}

      {empty && (
        <div className="flex flex-col items-center justify-center py-24 text-center select-none">
          <div className="text-6xl mb-4">🤍</div>
          <h2 className="font-display font-bold text-burgundy/50 text-lg mb-2">
            {tab === 'outfits' ? 'No favorite outfits yet' : 'No favorite pieces yet'}
          </h2>
          <p className="text-burgundy/50 text-base">
            {tab === 'outfits'
              ? 'Heart one on the home page!'
              : 'Heart items in your wardrobe!'}
          </p>
        </div>
      )}

      {!loading && tab === 'outfits' && outfits.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {outfits.map(outfit => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          ))}
        </div>
      )}

      {!loading && tab === 'items' && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map(item => (
            <ClothingCard
              key={item.id}
              item={item}
              onClick={() => setSelectedItem(item)}
              onFavorite={() => handleUnfavItem(item)}
            />
          ))}
        </div>
      )}

      {/* ── Detail panel ── */}
      <ItemDetailPanel
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  )
}
