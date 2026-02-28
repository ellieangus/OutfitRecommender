import { Heart, Trash2 } from 'lucide-react'

export default function ClothingCard({ item, onFavorite, onDelete, onClick }) {
  const { image_url, ai_attributes, category, is_favorite } = item

  return (
    <div
      className="group relative rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Photo */}
      <div className="aspect-square bg-rose-50">
        {image_url ? (
          <img
            src={image_url}
            alt={ai_attributes?.type || category}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-rose-200">
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
              ${is_favorite ? 'bg-rose-400 text-white' : 'bg-white/90 text-gray-400 hover:text-rose-400'}`}
          >
            <Heart size={13} fill={is_favorite ? 'currentColor' : 'none'} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="p-1.5 rounded-full bg-white/90 text-gray-400 hover:text-red-400 shadow transition-all"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Info footer */}
      <div className="px-2.5 py-2">
        <p className="text-sm font-medium text-gray-700 capitalize truncate leading-tight">
          {ai_attributes?.type || category}
        </p>
        {ai_attributes?.color?.length > 0 && (
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {ai_attributes.color.slice(0, 2).join(', ')}
          </p>
        )}
        {ai_attributes?.formality && (
          <span className="inline-block mt-1 px-1.5 py-0.5 bg-rose-50 text-rose-400 text-xs rounded-full capitalize">
            {ai_attributes.formality}
          </span>
        )}
      </div>
    </div>
  )
}
