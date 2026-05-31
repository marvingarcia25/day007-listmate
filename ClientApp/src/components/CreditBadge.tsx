import type { CreditsState } from '../App'

interface Props {
  credits: CreditsState | null
  onBuy: () => void
}

export default function CreditBadge({ credits, onBuy }: Props) {
  if (!credits) return null

  const total   = credits.freeRemaining + credits.paidCredits
  const isFree  = credits.freeRemaining > 0
  const isEmpty = total === 0

  return (
    <div className="flex items-center gap-2">
      {/* Counter pill */}
      {!isEmpty && (
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            background: isFree ? '#EFF6FF' : '#F8FAFC',
            color:      isFree ? '#2563EB' : '#475569',
          }}>
          <span className="w-1.5 h-1.5 rounded-full"
            style={{ background: isFree ? '#2563EB' : '#94A3B8' }} />
          {isFree
            ? `${credits.freeRemaining} free left`
            : `${credits.paidCredits} credits`}
        </div>
      )}

      {isEmpty && (
        <span className="hidden sm:block text-xs font-medium text-red-500">Out of credits</span>
      )}

      {/* Buy button */}
      <button onClick={onBuy}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 touch-manipulation border"
        style={{
          background:  isEmpty ? '#EFF6FF' : '#F8FAFC',
          borderColor: isEmpty ? '#BFDBFE' : '#E2E8F0',
          color:       isEmpty ? '#2563EB' : '#475569',
        }}>
        {isEmpty ? 'Buy credits' : '+ Credits'}
      </button>
    </div>
  )
}
