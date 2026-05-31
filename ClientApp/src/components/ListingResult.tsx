import { useState } from 'react'
import type { ListingOutput } from '../App'

interface Props {
  result: ListingOutput | null
  loading: boolean
  error: string | null
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy}
      className="text-xs font-semibold text-teal-600 hover:text-teal-700 border border-teal-200 hover:border-teal-400 rounded-lg px-2.5 py-1 transition">
      {copied ? '✓ Copied!' : 'Copy'}
    </button>
  )
}

export default function ListingResult({ result, loading, error }: Props) {
  const isEmpty = !result && !loading && !error

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4 min-h-[420px]">

      <h2 className="font-display font-bold text-lg text-slate-800">Your listing</h2>

      {isEmpty && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">📝</div>
          <p className="text-slate-400 text-sm max-w-xs">
            Fill in the form and hit <strong>"Write my listing"</strong> — your Trade Me-ready listing will appear here.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p className="text-slate-400 text-sm">AI is writing your listing…</p>
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm text-center">
            {error}
          </div>
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-4 flex-1">

          {/* Title */}
          <div className="rounded-xl bg-teal-50 border border-teal-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide">Listing Title</span>
              <CopyButton text={result.title} />
            </div>
            <p className="text-slate-800 font-semibold text-base leading-snug">{result.title}</p>
            <p className="text-xs text-teal-600 mt-1">{result.title.length}/80 chars</p>
          </div>

          {/* Description */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</span>
              <CopyButton text={result.description} />
            </div>
            <pre className="text-slate-700 text-sm whitespace-pre-wrap font-sans leading-relaxed">
              {result.description}
            </pre>
          </div>

          {/* Copy all */}
          <CopyButton text={`${result.title}\n\n${result.description}`} />

        </div>
      )}
    </div>
  )
}
