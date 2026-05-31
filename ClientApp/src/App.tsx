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
      setResult(await res.json())
      await fetchCredits()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── MASTHEAD ──────────────────────────────────────────── */}
      <header className="px-6 pt-8 pb-0 max-w-7xl mx-auto w-full">

        <div className="anim-fade-up">
          {/* Top rule */}
          <div className="amber-rule mb-3" />

          {/* Brand row */}
          <div className="flex items-end justify-between gap-4 mb-3">
            <div className="flex items-baseline gap-4">
              <h1 className="font-display font-black text-5xl sm:text-6xl leading-none tracking-tight"
                style={{ color: '#EDE5D8' }}>
                List<span style={{ color: '#E8A020' }}>Mate</span>
              </h1>
              <div className="hidden sm:block">
                <div className="text-xs font-body font-medium uppercase tracking-widest" style={{ color: '#7A7268' }}>
                  Vol. VII · Est. 2026
                </div>
                <div className="text-xs font-body font-medium uppercase tracking-widest" style={{ color: '#7A7268' }}>
                  Trade Me Edition
                </div>
              </div>
            </div>
            <div className="anim-fade-up anim-delay-2 flex-shrink-0">
              <CreditBadge credits={credits} onBuy={() => setShowPaywall(true)} />
            </div>
          </div>

          {/* Bottom rule + tagline */}
          <div className="amber-rule-double" />
          <div className="flex items-center justify-between py-2">
            <p className="font-body text-xs uppercase tracking-widest" style={{ color: '#7A7268' }}>
              AI–powered classified writer · NZD · No signup required
            </p>
            <p className="font-body text-xs uppercase tracking-widest hidden md:block" style={{ color: '#504A44' }}>
              ✦ Write · Polish · Publish ✦
            </p>
          </div>
          <div className="ink-rule" />
        </div>
      </header>

      {/* ── BODY ──────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-0">

          {/* LEFT — Form */}
          <div className="col-rule-right pr-0 lg:pr-8 anim-fade-up anim-delay-2">
            <div className="sticky top-6">
              <ListingForm onSubmit={handleGenerate} loading={loading} />
            </div>
          </div>

          {/* RIGHT — Result */}
          <div className="pl-0 lg:pl-8 pt-8 lg:pt-0 anim-fade-up anim-delay-3">
            <ListingResult result={result} loading={loading} error={error} />
          </div>

        </div>
      </main>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="max-w-7xl mx-auto w-full px-6 pb-8">
        <div className="ink-rule pt-4 flex items-center justify-between">
          <span className="font-body text-xs uppercase tracking-widest" style={{ color: '#3E3A34' }}>
            Day 007 · 1000-day challenge
          </span>
          <span className="font-body text-xs uppercase tracking-widest" style={{ color: '#3E3A34' }}>
            ASP.NET Core + React + Claude
          </span>
        </div>
      </footer>

      {/* ── PAYWALL ───────────────────────────────────────────── */}
      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          onPurchased={() => { setShowPaywall(false); fetchCredits() }}
        />
      )}
    </div>
  )
}
