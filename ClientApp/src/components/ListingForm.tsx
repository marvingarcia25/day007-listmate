import { useState, FormEvent } from 'react'

const CATEGORIES = [
  'Electronics', 'Clothing & Accessories', 'Home & Garden', 'Sports & Fitness',
  'Books & Magazines', 'Toys & Games', 'Tools & DIY', 'Vehicles & Parts',
  'Furniture', 'Baby & Toddler', 'Collectables', 'Other',
]

const CONDITIONS = ['New', 'Like new', 'Good', 'Fair', 'Used for parts']

const TONES = [
  { value: 'friendly',     emoji: '😊', label: 'Friendly'     },
  { value: 'professional', emoji: '💼', label: 'Professional'  },
  { value: 'punchy',       emoji: '⚡', label: 'Punchy'        },
]

const DELIVERY_OPTIONS = [
  { value: 'pickup',   label: 'Pickup only'       },
  { value: 'shipping', label: 'Shipping available' },
  { value: 'both',     label: 'Pickup or ship'    },
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

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const onSubmitForm = (e: FormEvent) => { e.preventDefault(); onSubmit(form) }

  return (
    <form onSubmit={onSubmitForm} className="card p-4 sm:p-5 flex flex-col gap-4">

      <h2 className="font-bold text-base text-slate-800">What are you selling?</h2>

      {/* Item name */}
      <div>
        <label className="field-label">Item name *</label>
        <input required value={form.title} onChange={e => set('title', e.target.value)}
          placeholder="e.g. Sony WH-1000XM4 headphones"
          className="field-input" />
      </div>

      {/* Category + Condition — 2 col on all sizes (narrow enough) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Category</label>
          <div className="relative">
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className="field-input pr-8 cursor-pointer">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronIcon />
          </div>
        </div>
        <div>
          <label className="field-label">Condition</label>
          <div className="relative">
            <select value={form.condition} onChange={e => set('condition', e.target.value)}
              className="field-input pr-8 cursor-pointer">
              {CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronIcon />
          </div>
        </div>
      </div>

      {/* Brand */}
      <div>
        <label className="field-label">
          Brand <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input value={form.brand} onChange={e => set('brand', e.target.value)}
          placeholder="e.g. Sony, Apple, IKEA"
          className="field-input" />
      </div>

      {/* Key details */}
      <div>
        <label className="field-label">Key details *</label>
        <textarea required value={form.details} onChange={e => set('details', e.target.value)}
          rows={4} placeholder="Condition, what's included, any flaws, why you're selling…"
          className="field-input resize-none leading-relaxed" />
      </div>

      {/* Price + Delivery */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Price (NZD)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 pointer-events-none">$</span>
            <input type="number" min="0" step="1" value={form.price}
              onChange={e => set('price', e.target.value)} placeholder="0"
              className="field-input pl-7" />
          </div>
        </div>
        <div>
          <label className="field-label">Delivery</label>
          <div className="relative">
            <select value={form.delivery} onChange={e => set('delivery', e.target.value)}
              className="field-input pr-8 cursor-pointer">
              {DELIVERY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronIcon />
          </div>
        </div>
      </div>

      {/* Tone */}
      <div>
        <label className="field-label">Writing tone</label>
        <div className="grid grid-cols-3 gap-2">
          {TONES.map(t => (
            <button key={t.value} type="button" onClick={() => set('tone', t.value)}
              className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all duration-150 touch-manipulation"
              style={{
                borderColor: form.tone === t.value ? '#2563EB' : '#E2E8F0',
                background:  form.tone === t.value ? '#EFF6FF' : '#FAFAFA',
                color:       form.tone === t.value ? '#2563EB' : '#64748B',
              }}>
              <span className="text-lg leading-none">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button type="submit" disabled={loading}
        className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-150 touch-manipulation flex items-center justify-center gap-2 min-h-[52px]"
        style={{
          background: loading
            ? 'linear-gradient(135deg, #93C5FD, #60A5FA)'
            : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          boxShadow: loading ? 'none' : '0 2px 12px rgba(37,99,235,0.35)',
        }}>
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Writing your listing…
          </>
        ) : (
          <><span>✨</span> Write my listing</>
        )}
      </button>

    </form>
  )
}

function ChevronIcon() {
  return (
    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
      style={{ color: '#94A3B8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}
