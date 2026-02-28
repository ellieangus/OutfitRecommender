import { useState, useEffect, useCallback } from 'react'
import api from '../api/client'
import ClothingCard from '../components/ClothingCard'

const CATEGORIES = ['all', 'top', 'bottom', 'shoes', 'jewelry', 'socks', 'bag', 'hat', 'other']

export default function GalleryPage() {
  const [items, setItems] = useState([])
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchItems = useCallback(async (cat) => {
    setLoading(true)
    setError('')
    try {
      const params = cat !== 'all' ? { category: cat } : {}
      const res = await api.get('/wardrobe/', { params })
      setItems(res.data)
    } catch {
      setError('Could not load wardrobe.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems(category) }, [category, fetchItems])

  const handleDelete = async (item) => {
    try {
      await api.delete(`/wardrobe/${item.id}/`)
      setItems(prev => prev.filter(i => i.id !== item.id))
    } catch {}
  }

  const handleFavorite = async (item) => {
    try {
      await api.patch(`/wardrobe/${item.id}/`, { is_favorite: !item.is_favorite })
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_favorite: !i.is_favorite } : i))
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">My Wardrobe</h1>
      <p className="text-gray-400 text-sm mb-6">{items.length} item{items.length !== 1 ? 's' : ''}</p>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm capitalize transition-all
              ${category === cat
                ? 'bg-rose-400 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-rose-200 hover:text-rose-400'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center justify-center py-24 text-4xl animate-pulse select-none">
          ✨
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-16 text-red-400 text-sm">{error}</div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center select-none">
          <div className="text-6xl mb-4">👗</div>
          <p className="text-gray-400 text-sm">
            {category === 'all'
              ? 'Your wardrobe is empty — add some items!'
              : `No ${category} items yet.`}
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map(item => (
            <ClothingCard
              key={item.id}
              item={item}
              onDelete={() => handleDelete(item)}
              onFavorite={() => handleFavorite(item)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
