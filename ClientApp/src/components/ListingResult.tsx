import { useState, useEffect, useRef } from 'react'
import type { ListingOutput } from '../App'

interface Props {
  result: ListingOutput | null
  loading: boolean
  error: string | null
}

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={copy} type="button"
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-150 touch-manipulation"
      style={{
        borderColor: copied ? '#10B981' : '#E2E8F0',
        color:       copied ? '#10B981' : '#64748B',
        background:  copied ? '#F0FDF4' : '#FAFAFA',
      }}>
      {copied ? (
        <><CheckIcon /> Copied!</>
      ) : (
        <><CopyIcon /> {label}</>
      )}
    </button>
  )
}

function TypewriterText({ text, speed = 10 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const idx = useRef(0)

  useEffect(() => {
    idx.current = 0
    setDisplayed('')
    setDone(false)
    const iv = setInterval(() => {
      if (idx.current >= text.length) { clearInterval(iv); setDone(true); return }
      setDisplayed(text.slice(0, ++idx.current))
    }, speed)
    return () => clearInterval(iv)
  }, [text, speed])

  return <span className={done ? '' : 'cursor-blink'}>{displayed}</span>
}

export default function ListingResult({ result, loading, error }: Props) {
  const isEmpty = !result && !loading && !error

  return (
    <div className="flex flex-col gap-4">

      {/* Empty state */}
      {isEmpty && (
        <div className="card p-8 flex flex-col items-center justify-center text-center gap-3 min-h-[280px]">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">📝</div>
          <div>
            <p className="font-semibold text-slate-700 text-sm">Your listing will appear here</p>
            <p className="text-slate-400 text-xs mt-1 max-w-[200px] mx-auto leading-relaxed">
              Fill in the form on the left and tap "Write my listing"
            </p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="card p-5 min-h-[280px] flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-sm font-semibold text-blue-600">Writing your listing…</span>
          </div>
          {/* Skeleton bars */}
          <div className="flex flex-col gap-3 animate-pulse">
            <div className="h-5 bg-slate-100 rounded-lg w-3/4" />
            <div className="h-5 bg-slate-100 rounded-lg w-1/2" />
            <div className="h-px bg-slate-100 my-1" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-5/6" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-4/5" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-2/3" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card p-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-500 flex-shrink-0">!</div>
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <>
          {/* Title card */}
          <div className="card p-4 sm:p-5 anim-slide-up">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Listing Title</span>
              </div>
              <CopyButton text={result.title} />
            </div>
            <p className="font-bold text-lg sm:text-xl leading-snug text-slate-900">
              <TypewriterText text={result.title} speed={8} />
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((result.title.length / 80) * 100, 100)}%`,
                    background: result.title.length > 72 ? '#F59E0B' : '#2563EB',
                  }} />
              </div>
              <span className="text-xs font-medium text-slate-400 flex-shrink-0">
                {result.title.length}/80
              </span>
            </div>
          </div>

          {/* Description card */}
          <div className="card p-4 sm:p-5 anim-slide-up" style={{ animationDelay: '0.08s' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</span>
              </div>
              <CopyButton text={result.description} />
            </div>
            <pre className="font-mono text-sm leading-relaxed text-slate-700 whitespace-pre-wrap"
              style={{ fontFamily: '"JetBrains Mono", Menlo, monospace' }}>
              <TypewriterText text={result.description} speed={6} />
            </pre>
          </div>

          {/* Copy all */}
          <div className="flex justify-end anim-fade-in" style={{ animationDelay: '0.2s' }}>
            <CopyButton
              text={`${result.title}\n\n${result.description}`}
              label="Copy everything" />
          </div>
        </>
      )}
    </div>
  )
}

function CopyIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}
