import { useState, FormEvent } from 'react'

const CATEGORIES = [
  'Electronics', 'Clothing & Accessories', 'Home & Garden', 'Sports & Fitness',
  'Books & Magazines', 'Toys & Games', 'Tools & DIY', 'Vehicles & Parts',
  'Furniture', 'Baby & Toddler', 'Collectables', 'Other',
]

const CONDITIONS = ['New', 'Like new', 'Good', 'Fair', 'Used for parts']

const TONES = [
  { value: 'friendly',     label: 'Friendly',     glyph: '◎' },
  { value: 'professional', label: 'Professional',  glyph: '◆' },
  { value: 'punchy',       label: 'Punchy',        glyph: '▲' },
]

interface Props {
  onSubmit: (data: Record<string, string>) => void
  loading: boolean
}

export default function ListingForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState({
    title: '', category: CATEGORIES[0], condition: CONDITIONS[0],
    brand: '', details: '', price: '', delivery: 'pickup', tone: 'friendly',
  })

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); onSubmit(form) }

  return (
    <form onSubmit={handleSubmit}>

      {/* Section heading */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-body text-xs uppercase tracking-widest font-medium" style={{ color: '#E8A020' }}>
            § Submit Ad Details
          </span>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
      </div>

      <div className="flex flex-col gap-5">

        {/* Item name */}
        <div>
          <label className="label-ink">Item Name *</label>
          <input required value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="e.g. Sony WH-1000XM4 headphones"
            className="input-ink px-3.5 py-2.5 w-full" />
        </div>

        {/* Category + Condition */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-ink">Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className="input-ink px-3 py-2.5 w-full cursor-pointer">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label-ink">Condition</label>
            <select value={form.condition} onChange={e => set('condition', e.target.value)}
              className="input-ink px-3 py-2.5 w-full cursor-pointer">
              {CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Brand */}
        <div>
          <label className="label-ink">
            Brand <span className="normal-case" style={{ color: '#504A44' }}>— optional</span>
          </label>
          <input value={form.brand} onChange={e => set('brand', e.target.value)}
            placeholder="e.g. Sony, Apple, IKEA"
            className="input-ink px-3.5 py-2.5 w-full" />
        </div>

        {/* Key details */}
        <div>
          <label className="label-ink">Key Details *</label>
          <textarea required value={form.details} onChange={e => set('details', e.target.value)}
            rows={5} placeholder="Describe condition, what's included, any flaws, reason for selling…"
            className="input-ink px-3.5 py-2.5 w-full resize-none leading-relaxed" />
        </div>

        {/* Price + Delivery */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-ink">Asking Price (NZD)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-medium" style={{ color: '#7A7268' }}>$</span>
              <input type="number" min="0" step="1" value={form.price}
                onChange={e => set('price', e.target.value)} placeholder="0"
                className="input-ink pl-7 pr-3.5 py-2.5 w-full" />
            </div>
          </div>
          <div>
            <label className="label-ink">Delivery</label>
            <select value={form.delivery} onChange={e => set('delivery', e.target.value)}
              className="input-ink px-3 py-2.5 w-full cursor-pointer">
              <option value="pickup">Pickup only</option>
              <option value="shipping">Shipping available</option>
              <option value="both">Pickup or ship</option>
            </select>
          </div>
        </div>

        {/* Tone */}
        <div>
          <label className="label-ink">Writing Tone</label>
          <div className="flex gap-2">
            {TONES.map(t => (
              <button key={t.value} type="button" onClick={() => set('tone', t.value)}
                className="flex-1 py-2.5 px-3 text-center text-xs font-body font-medium uppercase tracking-wider transition-all duration-150 rounded-sm border"
                style={{
                  borderColor: form.tone === t.value ? '#E8A020' : 'rgba(255,255,255,0.08)',
                  background:  form.tone === t.value ? 'rgba(232,160,32,0.10)' : 'rgba(255,255,255,0.03)',
                  color:       form.tone === t.value ? '#E8A020' : '#7A7268',
                }}>
                <span className="block text-base mb-0.5">{t.glyph}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="relative w-full py-3.5 text-sm font-body font-semibold uppercase tracking-widest transition-all duration-200 overflow-hidden"
          style={{
            background:   loading ? 'rgba(232,160,32,0.5)' : '#E8A020',
            color:        '#0D0C0A',
            letterSpacing:'0.14em',
          }}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-flex gap-1">
                {[0,1,2].map(i => (
                  <span key={i} className="inline-block w-1 h-1 rounded-full"
                    style={{
                      background: '#0D0C0A',
                      animation: `bounce 0.8s ${i * 0.15}s ease-in-out infinite`,
                    }} />
                ))}
              </span>
              Setting type…
            </span>
          ) : (
            <>Write My Listing <span className="ml-1">→</span></>
          )}
        </button>

      </div>

      <style>{`
        @keyframes bounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
      `}</style>
    </form>
  )
}
