import { useState, useEffect } from 'react'
import ListingForm from './components/ListingForm'
import ListingResult from './components/ListingResult'
import CreditBadge from './components/CreditBadge'
import PaywallModal from './components/PaywallModal'

export type CreditsState = {
  freeRemaining: number
  paidCredits: number
  email: string | null
}

export type ListingOutput = {
  title: string
  description: string
}

export default function App() {
  const [credits, setCredits] = useState<CreditsState | null>(null)
  const [result, setResult] = useState<ListingOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { fetchCredits() }, [])

  async function fetchCredits() {
    try {
      const res = await fetch('/api/credits')
      if (res.ok) setCredits(await res.json())
    } catch {}
  }

  async function handleGenerate(formData: Record<string, string>) {
    const hasCredits = credits && (credits.freeRemaining > 0 || credits.paidCredits > 0)
    if (!hasCredits) { setShowPaywall(true); return }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.status === 402) { setShowPaywall(true); return }
      if (!res.ok) { setError('Something went wrong. Please try again.'); return }
      const data: ListingOutput = await res.json()
      setResult(data)
      await fetchCredits()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white text-sm font-bold">L</div>
            <span className="font-display font-bold text-lg text-slate-800">
              List<span className="text-teal-600">Mate</span>
            </span>
            <span className="hidden sm:block text-xs text-slate-400 ml-1">AI Trade Me Listings</span>
          </div>
          <CreditBadge credits={credits} onBuy={() => setShowPaywall(true)} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 mb-3 leading-tight">
            Write Trade Me listings<br />
            <span className="text-teal-600">in seconds</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-lg mx-auto">
            Describe what you're selling. AI writes a catchy title and compelling description — ready to paste.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-slate-400">
            <span>✓ 3 free listings</span>
            <span>✓ No signup</span>
            <span>✓ Copy in one click</span>
          </div>
        </div>

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ListingForm onSubmit={handleGenerate} loading={loading} />
          <ListingResult result={result} loading={loading} error={error} />
        </div>

      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-8 mt-4">
        Day 007 · 1000-day challenge · Built with ASP.NET Core + React
      </footer>

      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          onPurchased={() => { setShowPaywall(false); fetchCredits() }}
        />
      )}
    </div>
  )
}
