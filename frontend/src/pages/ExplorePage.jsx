import { useState, useEffect } from 'react'
import api from '../api/client'
import OutfitCard from '../components/OutfitCard'
import ClothingCard from '../components/ClothingCard'

const THEMES = [
  { label: 'Neutrals',      occasion: 'neutral tones casual' },
  { label: 'Date Night',    occasion: 'date night elegant' },
  { label: '60s Mod',       occasion: '60s mod retro aesthetic' },
  { label: 'Cottagecore',   occasion: 'cottagecore whimsical aesthetic' },
  { label: 'Streetwear',    occasion: 'streetwear urban aesthetic' },
  { label: 'Old Money',     occasion: 'old money preppy aesthetic' },
  { label: 'Dark Academia', occasion: 'dark academia moody aesthetic' },
  { label: 'Weekend Brunch',occasion: 'weekend brunch casual chic' },
  { label: 'Boho',          occasion: 'bohemian free spirit aesthetic' },
  { label: 'Y2K',           occasion: 'y2k nostalgic aesthetic' },
  { label: 'Coastal',       occasion: 'coastal breezy summer aesthetic' },
  { label: 'Formal',        occasion: 'formal evening elegant' },
]

export default function ExplorePage() {
  const [theme, setTheme] = useState(null)
  const [outfit, setOutfit] = useState(null)
  const [moodItems, setMoodItems] = useState([])
  const [allItems, setAllItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingItems, setLoadingItems] = useState(true)

  // Load all wardrobe items once for the mood board
  useEffect(() => {
    api.get('/wardrobe/').then(r => {
      setAllItems(r.data || [])
    }).catch(() => {}).finally(() => setLoadingItems(false))
  }, [])

  const pickTheme = async (t) => {
    setTheme(t)
    setOutfit(null)
    setMoodItems([])
    setLoading(true)
    try {
      const res = await api.post('/outfits/generate/', { occasion: t.occasion })
      setOutfit(res.data)
      // Mood board: items from the outfit + random extras from wardrobe
      const outfitIds = new Set((res.data.outfit?.clothing_items || []).map(i => i.id))
      const outfitItems = res.data.outfit?.clothing_items || []
      const extras = allItems
        .filter(i => !outfitIds.has(i.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.max(0, 12 - outfitItems.length))
      setMoodItems([...outfitItems, ...extras])
    } catch {} finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">Explore</h1>
      <p className="text-gray-400 text-sm mb-6">Pick a vibe and see how your wardrobe rises to the occasion.</p>

      {/* Theme chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {THEMES.map(t => (
          <button
            key={t.label}
            onClick={() => pickTheme(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
              ${theme?.label === t.label
                ? 'bg-rose-400 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-rose-200 hover:text-rose-400'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Idle */}
      {!theme && !loading && (
        <div className="flex flex-col items-center justify-center py-24 text-center select-none">
          <div className="text-6xl mb-4">🎀</div>
          <p className="text-gray-400 text-sm">Choose a vibe above to start exploring</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24 text-4xl animate-pulse select-none">✨</div>
      )}

      {/* Results */}
      {!loading && outfit && (
        <div className="flex flex-col gap-10">

          {/* Outfit card section */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">
              {theme?.label} Outfit
            </p>
            <div className="max-w-xs">
              <OutfitCard outfit={outfit.outfit} />
            </div>
            {outfit.reasoning && (
              <p className="mt-3 text-rose-700/60 text-sm italic max-w-md">
                "{outfit.reasoning}"
              </p>
            )}
          </div>

          {/* Mood board */}
          {moodItems.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">
                Mood Board
              </p>
              <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 space-y-3">
                {moodItems.map((item, i) => (
                  <div
                    key={item.id || i}
                    className={`break-inside-avoid rounded-2xl overflow-hidden bg-white shadow-sm
                      ${i % 3 === 0 ? 'aspect-square' : i % 3 === 1 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.ai_attributes?.type || item.category}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-rose-100">
                        👗
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
