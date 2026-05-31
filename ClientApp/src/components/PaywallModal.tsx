import { useState } from 'react'

const PACKS = [
  { id: 'pack_20',  credits: 20,  price: 5,  label: 'Starter',    each: '25¢/listing' },
  { id: 'pack_50',  credits: 50,  price: 10, label: 'Value',      each: '20¢/listing', best: true },
  { id: 'pack_120', credits: 120, price: 20, label: 'Power user', each: '17¢/listing' },
]

interface Props {
  onClose: () => void
  onPurchased: () => void
}

export default function PaywallModal({ onClose, onPurchased }: Props) {
  const [selected, setSelected] = useState('pack_50')
  const [email, setEmail]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleBuy() {
    if (!email.includes('@')) { setError('Enter a valid email address'); return }
    setLoading(true); setError(null)
    try {
      const res  = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: selected, email }),
      })
      const data = await res.json()
      if (data.url)        window.location.href = data.url
      else if (data.simulated) onPurchased()
      else setError('Something went wrong.')
    } catch { setError('Network error.') }
    finally  { setLoading(false) }
  }

  const pack = PACKS.find(p => p.id === selected)!

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="w-full sm:max-w-[400px] bg-white sm:rounded-2xl rounded-t-3xl anim-slide-up pb-safe"
        style={{ boxShadow: '0 -4px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)' }}>

        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-9 h-1 rounded-full bg-slate-200" />
        </div>

        <div className="p-5 sm:p-6">

          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="font-bold text-xl text-slate-900">Get more listings</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Your 3 free listings are used. Credits never expire.
              </p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors touch-manipulation">
              ×
            </button>
          </div>

          {/* Pack selector */}
          <div className="flex flex-col gap-2 my-5">
            {PACKS.map(p => (
              <button key={p.id} type="button" onClick={() => setSelected(p.id)}
                className="relative flex items-center justify-between w-full px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150 touch-manipulation"
                style={{
                  borderColor: selected === p.id ? '#2563EB' : '#E2E8F0',
                  background:  selected === p.id ? '#EFF6FF' : '#FAFAFA',
                }}>
                {p.best && (
                  <span className="absolute -top-2 left-4 text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    Best value
                  </span>
                )}
                <div>
                  <span className="font-semibold text-slate-900 text-sm">{p.credits} listings</span>
                  <span className="text-slate-400 text-xs ml-2">{p.each}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">${p.price} NZD</span>
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: selected === p.id ? '#2563EB' : '#CBD5E1' }}>
                    {selected === p.id && (
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="field-label">
              Email — credits linked to this address
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="field-input" />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-medium mb-3">{error}</p>
          )}

          <button onClick={handleBuy} disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-150 touch-manipulation min-h-[52px]"
            style={{
              background: loading
                ? 'linear-gradient(135deg, #93C5FD, #60A5FA)'
                : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              boxShadow: loading ? 'none' : '0 2px 12px rgba(37,99,235,0.35)',
            }}>
            {loading ? 'Redirecting…' : `Pay $${pack.price} → ${pack.credits} listings`}
          </button>

          <p className="text-center text-xs text-slate-400 mt-3">
            Secure payment via Stripe · Credits never expire
          </p>

        </div>
      </div>
    </div>
  )
}
