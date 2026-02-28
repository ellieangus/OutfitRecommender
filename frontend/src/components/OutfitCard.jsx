import { Heart } from 'lucide-react'
import api from '../api/client'
import { useState } from 'react'

export default function OutfitCard({ outfit: initial }) {
  const [outfit, setOutfit] = useState(initial)

  const toggleFav = async e => {
    e.stopPropagation()
    try {
      await api.patch(`/outfits/${outfit.id}/`, { is_favorite: !outfit.is_favorite })
      setOutfit(o => ({ ...o, is_favorite: !o.is_favorite }))
    } catch {}
  }

  const items = outfit.clothing_items || []
  const preview = items.slice(0, 4)

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all">
      {/* 2×2 photo grid */}
      <div className="grid grid-cols-2 gap-0.5 aspect-square bg-[#FFF1B5]/30">
        {preview.map((item, i) => (
          <div key={item.id || i} className="bg-[#FFF1B5]/30 overflow-hidden">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.ai_attributes?.type || ''}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl text-brand-dark/20">
                👗
              </div>
            )}
          </div>
        ))}
        {/* Fill empty slots */}
        {Array.from({ length: Math.max(0, 4 - preview.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-[#FFF1B5]/20" />
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-base font-display font-semibold text-burgundy truncate">{outfit.name}</p>
          <span className="inline-block mt-0.5 px-2 py-0.5 bg-cream text-brand-dark text-xs rounded-full capitalize">
            {outfit.occasion_tag}
          </span>
          {outfit.notes && (
            <p className="text-xs text-burgundy/60 mt-1 line-clamp-2 italic">
              "{outfit.notes}"
            </p>
          )}
        </div>
        <button
          onClick={toggleFav}
          className={`shrink-0 p-1.5 rounded-full transition-all mt-0.5
            ${outfit.is_favorite ? 'text-brand-dark' : 'text-burgundy/55 hover:text-brand-pink'}`}
        >
          <Heart size={15} fill={outfit.is_favorite ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  )
}
