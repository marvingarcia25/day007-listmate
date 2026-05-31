import { useState } from 'react'

const PACKS = [
  { id: 'pack_20',  credits: 20,  price: 5,  edition: 'Standard',  perListing: '25¢' },
  { id: 'pack_50',  credits: 50,  price: 10, edition: 'Value',     perListing: '20¢', featured: true },
  { id: 'pack_120', credits: 120, price: 20, edition: 'Press Run', perListing: '17¢' },
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
      if (data.url)        { window.location.href = data.url }
      else if (data.simulated) { onPurchased() }
      else { setError('Something went wrong.') }
    } catch { setError('Network error.') }
    finally  { setLoading(false) }
  }

  const pack = PACKS.find(p => p.id === selected)!

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(13,12,10,0.88)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="w-full max-w-md anim-fade-up"
        style={{ background: '#171512', border: '1px solid rgba(255,255,255,0.1)' }}>

        {/* Masthead-style header */}
        <div className="px-6 pt-6 pb-4">
          <div style={{ borderTop: '3px double #E8A020', marginBottom: '0.75rem' }} />
          <div className="flex items-start justify-between">
            <div>
              <p className="font-body text-xs uppercase tracking-widest font-medium mb-1" style={{ color: '#E8A020' }}>
                Premium Access
              </p>
              <h2 className="font-display font-black text-3xl leading-tight" style={{ color: '#EDE5D8' }}>
                Buy More<br />Listings
              </h2>
            </div>
            <button onClick={onClose}
              className="font-body text-xs uppercase tracking-widest mt-1 px-2 py-1 border transition-all"
              style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#7A7268' }}>
              Close ×
            </button>
          </div>
          <p className="font-body text-sm mt-2 leading-relaxed" style={{ color: '#7A7268' }}>
            Your 3 free listings are gone. Pick a credit pack — they never expire.
          </p>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '1rem' }} />
        </div>

        {/* Credit packs */}
        <div className="px-6 pb-4 flex flex-col gap-2">
          {PACKS.map(p => (
            <button key={p.id} onClick={() => setSelected(p.id)}
              className="relative w-full text-left px-4 py-3.5 border transition-all duration-150"
              style={{
                borderColor: selected === p.id ? '#E8A020' : 'rgba(255,255,255,0.08)',
                background:  selected === p.id ? 'rgba(232,160,32,0.06)' : 'rgba(255,255,255,0.02)',
              }}>
              {p.featured && (
                <span className="absolute top-2.5 right-3 font-mono text-xs uppercase tracking-widest"
                  style={{ color: '#E8A020' }}>★ best value</span>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-body text-xs uppercase tracking-widest font-medium mr-2" style={{ color: '#7A7268' }}>
                    {p.edition}
                  </span>
                  <span className="font-display font-bold text-base" style={{ color: '#EDE5D8' }}>
                    {p.credits} listings
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-xl" style={{ color: '#EDE5D8' }}>${p.price}</div>
                  <div className="font-mono text-xs" style={{ color: '#504A44' }}>{p.perListing} each</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Email + buy */}
        <div className="px-6 pb-6">
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginBottom: '1rem' }} />

          <label className="label-ink">Your Email — credits are linked to this</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input-ink px-3.5 py-2.5 w-full mb-4" />

          {error && (
            <p className="font-body text-xs mb-3" style={{ color: '#C4382A' }}>{error}</p>
          )}

          <button onClick={handleBuy} disabled={loading}
            className="w-full py-3.5 font-body font-semibold text-sm uppercase tracking-widest transition-all"
            style={{
              background: loading ? 'rgba(232,160,32,0.5)' : '#E8A020',
              color: '#0D0C0A',
            }}>
            {loading ? 'Redirecting…' : `Pay $${pack.price} for ${pack.credits} listings →`}
          </button>

          <p className="font-mono text-xs text-center mt-3" style={{ color: '#3E3A34' }}>
            Secure payment via Stripe · Credits never expire
          </p>
        </div>
      </div>
    </div>
  )
}
