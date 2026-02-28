import { useState, useEffect } from 'react'
import { X, Tag } from 'lucide-react'
import api from '../api/client'

function Row({ label, value }) {
  return (
    <div className="flex gap-3">
      <span className="text-xs font-body uppercase tracking-widest text-burgundy/65 w-20 shrink-0 capitalize pt-0.5">{label}</span>
      <span className="text-xs text-burgundy capitalize leading-relaxed">{value}</span>
    </div>
  )
}

export default function ItemDetailPanel({ item, onClose, onUpdate }) {
  const [tags, setTags]       = useState([])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    if (item) {
      setTags(Array.isArray(item.user_tags) ? item.user_tags : [])
      setTagInput('')
    }
  }, [item])

  if (!item) return null

  const { image_url, ai_attributes, category } = item
  const attrs = ai_attributes || {}

  const saveTags = async (newTags) => {
    setSaving(true)
    try {
      const res = await api.patch(`/wardrobe/${item.id}/`, { user_tags: newTags })
      onUpdate?.(res.data)
    } catch {}
    finally { setSaving(false) }
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      const next = [...tags, tag]
      setTags(next)
      saveTags(next)
    }
    setTagInput('')
  }

  const removeTag = (t) => {
    const next = tags.filter(x => x !== t)
    setTags(next)
    saveTags(next)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-pink/20">
          <h2 className="text-base font-display font-semibold text-burgundy capitalize">
            {attrs.type || category}
          </h2>
          <button onClick={onClose} className="text-burgundy/50 hover:text-burgundy transition">
            <X size={20} />
          </button>
        </div>

        {/* Image */}
        <div className="bg-[#FFF1B5]/30 aspect-square w-full shrink-0">
          {image_url ? (
            <img
              src={image_url}
              alt={attrs.type || category}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-brand-dark/20">
              👗
            </div>
          )}
        </div>

        {/* AI Attributes */}
        <div className="px-6 py-5 space-y-2.5 border-b border-brand-pink/20">
          <p className="text-xs font-body font-semibold text-burgundy/65 uppercase tracking-widest mb-3">Details</p>
          {attrs.type     && <Row label="Type"      value={attrs.type} />}
          {attrs.color?.length > 0 && <Row label="Colors" value={attrs.color.join(', ')} />}
          {attrs.formality && <Row label="Formality" value={attrs.formality} />}
          {attrs.style?.length > 0 && (
            <Row label="Style" value={[].concat(attrs.style).join(', ')} />
          )}
          {attrs.material  && <Row label="Material"  value={attrs.material} />}
          {attrs.season?.length > 0 && (
            <Row label="Season" value={[].concat(attrs.season).join(', ')} />
          )}
          <Row label="Category" value={category} />
        </div>

        {/* User Tags */}
        <div className="px-6 py-5 flex-1">
          <p className="text-xs font-body font-semibold text-burgundy/65 uppercase tracking-widest mb-3">
            Your Tags {saving && <span className="text-brand-dark/65 normal-case font-normal">saving…</span>}
          </p>

          {/* Existing tags */}
          <div className="flex flex-wrap gap-2 mb-4 min-h-6">
            {tags.length === 0 && (
              <p className="text-burgundy/55 text-xs italic">No tags yet — add one below!</p>
            )}
            {tags.map(t => (
              <span
                key={t}
                className="flex items-center gap-1 px-2.5 py-1 bg-cream text-brand-dark text-xs rounded-full"
              >
                {t}
                <button
                  onClick={() => removeTag(t)}
                  className="hover:text-deep-burgundy transition leading-none"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>

          {/* Add tag input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTag()}
              placeholder="Add a tag…"
              className="flex-1 border border-brand-pink/40 rounded-xl px-3 py-2 text-sm text-burgundy focus:outline-none focus:border-brand-pink transition placeholder:text-dusty-coral"
            />
            <button
              onClick={addTag}
              disabled={!tagInput.trim()}
              className="px-3 py-2 bg-brand-dark text-cream rounded-xl text-sm hover:bg-burgundy transition disabled:opacity-40"
            >
              <Tag size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
