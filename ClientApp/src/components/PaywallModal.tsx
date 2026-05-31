import { useState } from 'react'

const PACKS = [
  { id: 'pack_20',  credits: 20,  price: 5,  label: 'Starter',  perCredit: '25¢' },
  { id: 'pack_50',  credits: 50,  price: 10, label: 'Value',    perCredit: '20¢', popular: true },
  { id: 'pack_120', credits: 120, price: 20, label: 'Pro',      perCredit: '17¢' },
]

interface Props {
  onClose: () => void
  onPurchased: () => void
}

export default function PaywallModal({ onClose, onPurchased }: Props) {
  const [selected, setSelected] = useState('pack_50')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleBuy() {
    if (!email.includes('@')) { setError('Enter a valid email'); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: selected, email }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.simulated) {
        // Dev stub mode — no real Stripe
        onPurchased()
      } else {
        setError('Something went wrong.')
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  const pack = PACKS.find(p => p.id === selected)!

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl animate-[slideUp_0.2s_ease]">

        {/* Handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display font-bold text-xl text-slate-900">Get more listings</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
          </div>
          <p className="text-slate-500 text-sm mb-5">You've used your 3 free listings. Buy credits to keep going.</p>

          {/* Packs */}
          <div className="flex flex-col gap-2.5 mb-5">
            {PACKS.map(p => (
              <button key={p.id} onClick={() => setSelected(p.id)}
                className={`relative rounded-xl border-2 p-3.5 text-left transition ${
                  selected === p.id
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-slate-200 hover:border-teal-300'
                }`}>
                {p.popular && (
                  <span className="absolute top-2 right-2 text-xs font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full">
                    Best value
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800">{p.credits} listings</span>
                    <span className="text-slate-400 text-xs ml-2">{p.perCredit} each</span>
                  </div>
                  <span className="font-bold text-slate-900">${p.price}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Email — your credits will be linked to this
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>

          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

          <button onClick={handleBuy} disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold rounded-xl py-3 text-sm transition">
            {loading ? 'Redirecting…' : `Pay $${pack.price} for ${pack.credits} listings →`}
          </button>

          <p className="text-center text-xs text-slate-400 mt-3">
            Secure payment via Stripe · Credits never expire
          </p>
        </div>
      </div>
    </div>
  )
}
