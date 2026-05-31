import { useState, useEffect, useRef } from 'react'
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
  const [credits, setCredits]         = useState<CreditsState | null>(null)
  const [result, setResult]           = useState<ListingOutput | null>(null)
  const [loading, setLoading]         = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [rateLimitSecs, setRateLimitSecs] = useState(0)
  const resultRef = useRef<HTMLDivElement>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { fetchCredits() }, [])

  // Countdown ticker for rate-limit message
  useEffect(() => {
    if (rateLimitSecs <= 0) return
    countdownRef.current = setInterval(() => {
      setRateLimitSecs(s => {
        if (s <= 1) { clearInterval(countdownRef.current!); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(countdownRef.current!)
  }, [rateLimitSecs])

  async function fetchCredits() {
    try {
      const res = await fetch('/api/credits')
      if (res.ok) setCredits(await res.json())
    } catch {}
  }

  async function handleGenerate(formData: Record<string, string>) {
    if (rateLimitSecs > 0) return                                    // still cooling down
    const hasCredits = credits && (credits.freeRemaining > 0 || credits.paidCredits > 0)
    if (!hasCredits) { setShowPaywall(true); return }

    setLoading(true)
    setError(null)
    setResult(null)

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}))
        const secs = data.retryAfterSeconds ?? 60
        setRateLimitSecs(secs)
        setError(`Rate limit reached — 5 per minute. Try again in ${secs}s.`)
        return
      }
      if (res.status === 402) { setShowPaywall(true); return }
      if (!res.ok) { setError('Something went wrong. Please try again.'); return }

      const data: ListingOutput = await res.json()
      setResult(data)
      await fetchCredits()
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col">

      {/* ── STICKY HEADER ─────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 pt-safe">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}>
              L
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900">
              List<span className="text-blue-600">Mate</span>
            </span>
          </div>
          <CreditBadge credits={credits} onBuy={() => setShowPaywall(true)} />
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 anim-fade-up">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
            AI Trade Me Listing Writer
          </p>
          <h1 className="font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight mb-1.5">
            Write a great listing<br className="sm:hidden" /> in seconds
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-md">
            Describe what you're selling — AI writes a catchy title and compelling description, ready to paste into Trade Me.
          </p>
          <div className="flex flex-wrap gap-3 mt-3">
            {['3 free listings', 'No signup', 'Copy in one click'].map(t => (
              <span key={t} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN ─────────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 sm:py-6">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_1.1fr] gap-5">

          {/* Form */}
          <div className="anim-fade-up anim-d1">
            <ListingForm onSubmit={handleGenerate} loading={loading} rateLimitSecs={rateLimitSecs} />
          </div>

          {/* Result */}
          <div ref={resultRef} className="anim-fade-up anim-d2">
            <ListingResult result={result} loading={loading} error={error} />
          </div>

        </div>
      </main>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white pb-safe">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-400">Day 007 · 1000-day challenge</span>
          <span className="text-xs text-slate-400">ASP.NET Core + React + Claude AI</span>
        </div>
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
