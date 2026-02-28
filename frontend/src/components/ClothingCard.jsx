import { Heart, Trash2 } from 'lucide-react'

export default function ClothingCard({ item, onFavorite, onDelete, onClick }) {
  const { image_url, ai_attributes, category, is_favorite } = item

  return (
    <div
      className="group relative rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Photo */}
      <div className="aspect-square bg-[#FFF1B5]/30">
        {image_url ? (
          <img
            src={image_url}
            alt={ai_attributes?.type || category}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-brand-dark/20">
            👗
          </div>
        )}
      </div>

      {/* Action buttons — visible on hover */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onFavorite && (
          <button
            onClick={e => { e.stopPropagation(); onFavorite() }}
            className={`p-1.5 rounded-full shadow transition-all
              ${is_favorite ? 'bg-brand-dark text-cream' : 'bg-white/90 text-burgundy/60 hover:text-brand-dark'}`}
          >
            <Heart size={13} fill={is_favorite ? 'currentColor' : 'none'} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="p-1.5 rounded-full bg-white/90 text-burgundy/60 hover:text-red-400 shadow transition-all"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Info footer */}
      <div className="px-3 py-3">
        <p className="text-sm font-body font-medium text-burgundy capitalize truncate leading-tight">
          {ai_attributes?.type || category}
        </p>
        {ai_attributes?.color?.length > 0 && (
          <p className="text-xs text-burgundy/60 truncate mt-0.5">
            {ai_attributes.color.slice(0, 2).join(', ')}
          </p>
        )}
        {ai_attributes?.formality && (
          <span className="inline-block mt-1 px-1.5 py-0.5 bg-cream text-brand-dark text-xs rounded-full capitalize">
            {ai_attributes.formality}
          </span>
        )}
      </div>
    </div>
  )
}
