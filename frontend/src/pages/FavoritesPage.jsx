import { useState, useEffect } from 'react'
import api from '../api/client'
import ClothingCard from '../components/ClothingCard'
import OutfitCard from '../components/OutfitCard'

export default function FavoritesPage() {
  const [tab, setTab] = useState('outfits')   // 'outfits' | 'items'
  const [outfits, setOutfits] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

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
    } catch {}
  }

  const list = tab === 'outfits' ? outfits : items
  const empty = !loading && list.length === 0

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">Favorites</h1>
      <p className="text-gray-400 text-sm mb-6">Your saved looks and pieces</p>

      {/* Tab toggle */}
      <div className="flex rounded-2xl bg-white shadow-sm p-1 w-fit mb-8 border border-gray-100">
        {[['outfits', 'Outfits'], ['items', 'Pieces']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all
              ${tab === val ? 'bg-rose-400 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24 text-4xl animate-pulse select-none">✨</div>
      )}

      {empty && (
        <div className="flex flex-col items-center justify-center py-24 text-center select-none">
          <div className="text-6xl mb-4">🤍</div>
          <p className="text-gray-400 text-sm">
            {tab === 'outfits'
              ? 'No favorite outfits yet — heart one on the home page!'
              : 'No favorite pieces yet — heart items in your wardrobe!'}
          </p>
        </div>
      )}

      {!loading && tab === 'outfits' && outfits.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {outfits.map(outfit => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          ))}
        </div>
      )}

      {!loading && tab === 'items' && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map(item => (
            <ClothingCard
              key={item.id}
              item={item}
              onFavorite={() => handleUnfavItem(item)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
