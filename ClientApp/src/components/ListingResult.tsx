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
    <button onClick={copy}
      className="text-xs font-body font-medium uppercase tracking-widest px-3 py-1.5 border transition-all duration-150"
      style={{
        borderColor: copied ? '#E8A020' : 'rgba(255,255,255,0.12)',
        color:       copied ? '#E8A020' : '#7A7268',
        background:  copied ? 'rgba(232,160,32,0.08)' : 'transparent',
      }}>
      {copied ? '✓ Copied' : label}
    </button>
  )
}

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const idx = useRef(0)

  useEffect(() => {
    idx.current = 0
    setDisplayed('')
    setDone(false)
    const interval = setInterval(() => {
      if (idx.current >= text.length) { clearInterval(interval); setDone(true); return }
      setDisplayed(text.slice(0, ++idx.current))
    }, 12)
    return () => clearInterval(interval)
  }, [text])

  return (
    <span className={done ? '' : 'cursor-amber'}>
      {displayed}
    </span>
  )
}

export default function ListingResult({ result, loading, error }: Props) {
  const isEmpty = !result && !loading && !error

  return (
    <div className="min-h-[500px] flex flex-col">

      {/* Section heading */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-body text-xs uppercase tracking-widest font-medium" style={{ color: '#E8A020' }}>
            § Your Classified
          </span>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 py-16">
          <div className="font-display font-bold text-6xl leading-none" style={{ color: '#2C2924' }}>
            AD
          </div>
          <div style={{ borderTop: '1px solid #2C2924', width: '3rem' }} />
          <p className="font-body text-sm max-w-xs leading-relaxed" style={{ color: '#504A44' }}>
            Fill in the form and submit your details — your classified will be set in type and printed here.
          </p>
          <div className="font-mono text-xs uppercase tracking-widest mt-2" style={{ color: '#3E3A34' }}>
            Ready to print
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          {/* Animated press visual */}
          <div className="relative">
            <div className="font-display font-black text-7xl leading-none select-none"
              style={{ color: '#201E1A', animation: 'pressType 1.2s ease-in-out infinite' }}>
              ◆
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="font-display font-black text-7xl leading-none"
                style={{ color: '#E8A020', opacity: 0.15 }}>◆</div>
            </div>
          </div>
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: '#7A7268' }}>
              Setting type
              <span style={{ animation: 'blink 1s step-end infinite' }}>…</span>
            </p>
          </div>
          <style>{`
            @keyframes pressType {
              0%,100% { transform: scaleY(1) scaleX(1); }
              50%      { transform: scaleY(0.96) scaleX(1.02); }
            }
          `}</style>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center justify-center flex-1">
          <div className="border px-6 py-4 text-sm font-body text-center"
            style={{ borderColor: '#C4382A', color: '#C4382A', background: 'rgba(196,56,42,0.06)' }}>
            {error}
          </div>
        </div>
      )}

      {/* Result — newspaper classified format */}
      {result && (
        <div className="flex flex-col gap-5 anim-result">

          {/* Title block */}
          <div className="relative p-5 border amber-glow"
            style={{ borderColor: '#E8A020', background: 'rgba(232,160,32,0.04)' }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className="font-body text-xs uppercase tracking-widest font-medium" style={{ color: '#E8A020' }}>
                Listing Title
              </span>
              <CopyButton text={result.title} />
            </div>
            <p className="font-display font-bold text-xl sm:text-2xl leading-snug" style={{ color: '#EDE5D8' }}>
              <TypewriterText text={result.title} />
            </p>
            <p className="mt-2 font-mono text-xs" style={{ color: '#504A44' }}>
              {result.title.length} / 80 characters
              {result.title.length > 70 && <span style={{ color: '#E8A020' }}> — near limit</span>}
            </p>

            {/* Corner mark */}
            <div className="absolute top-3 right-3 font-body text-xs" style={{ color: '#3E3A34' }}>✦</div>
          </div>

          {/* Description block */}
          <div className="border p-5 flex-1"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="font-body text-xs uppercase tracking-widest font-medium" style={{ color: '#7A7268' }}>
                Description
              </span>
              <CopyButton text={result.description} />
            </div>
            <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: '#C8C0B4', fontFamily: '"DM Mono", Menlo, monospace' }}>
              <TypewriterText text={result.description} />
            </pre>
          </div>

          {/* Copy all */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: '#504A44' }}>
              ◆ Ready to paste into Trade Me
            </span>
            <CopyButton text={`${result.title}\n\n${result.description}`} label="Copy All" />
          </div>

        </div>
      )}
    </div>
  )
}
