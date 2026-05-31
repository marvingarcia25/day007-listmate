import { useState, FormEvent } from 'react'

const CATEGORIES = [
  'Electronics', 'Clothing & Accessories', 'Home & Garden', 'Sports & Fitness',
  'Books & Magazines', 'Toys & Games', 'Tools & DIY', 'Vehicles & Parts',
  'Furniture', 'Baby & Toddler', 'Collectables', 'Other',
]

const CONDITIONS = ['New', 'Like new', 'Good', 'Fair', 'Used for parts']

const TONES = [
  { value: 'friendly', label: '😊 Friendly', desc: 'Warm and approachable' },
  { value: 'professional', label: '💼 Professional', desc: 'Clear and factual' },
  { value: 'punchy', label: '⚡ Punchy', desc: 'Bold and urgent' },
]

interface Props {
  onSubmit: (data: Record<string, string>) => void
  loading: boolean
}

export default function ListingForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState({
    title: '',
    category: CATEGORIES[0],
    condition: CONDITIONS[0],
    brand: '',
    details: '',
    price: '',
    delivery: 'pickup',
    tone: 'friendly',
  })

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">

      <h2 className="font-display font-bold text-lg text-slate-800">What are you selling?</h2>

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Item name *</label>
        <input
          required
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="e.g. Sony WH-1000XM4 headphones"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
        />
      </div>

      {/* Category + Condition */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Condition</label>
          <select value={form.condition} onChange={e => set('condition', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition">
            {CONDITIONS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Brand */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Brand <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
        <input
          value={form.brand}
          onChange={e => set('brand', e.target.value)}
          placeholder="e.g. Sony, Apple, IKEA"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
        />
      </div>

      {/* Details */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Key details *</label>
        <textarea
          required
          value={form.details}
          onChange={e => set('details', e.target.value)}
          rows={4}
          placeholder="e.g. Barely used, bought 6 months ago. Noise cancelling works perfectly. Includes original box and cable. One small scratch on the right ear cup."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none"
        />
      </div>

      {/* Price + Delivery */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Asking price (NZD)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">$</span>
            <input
              type="number" min="0" step="1"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-7 pr-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Delivery</label>
          <select value={form.delivery} onChange={e => set('delivery', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition">
            <option value="pickup">Pickup only</option>
            <option value="shipping">Shipping available</option>
            <option value="both">Pickup or ship</option>
          </select>
        </div>
      </div>

      {/* Tone */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Writing tone</label>
        <div className="flex gap-2">
          {TONES.map(t => (
            <button key={t.value} type="button"
              onClick={() => set('tone', t.value)}
              className={`flex-1 rounded-xl border-2 py-2 px-2 text-xs font-semibold transition text-center ${
                form.tone === t.value
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-slate-200 text-slate-500 hover:border-teal-300'
              }`}>
              <div>{t.label}</div>
              <div className="font-normal text-slate-400 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="mt-1 w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold rounded-xl py-3 text-sm transition flex items-center justify-center gap-2">
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Writing your listing…
          </>
        ) : '✨ Write my listing'}
      </button>
    </form>
  )
}
