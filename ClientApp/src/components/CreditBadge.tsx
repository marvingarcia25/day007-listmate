import type { CreditsState } from '../App'

interface Props {
  credits: CreditsState | null
  onBuy: () => void
}

export default function CreditBadge({ credits, onBuy }: Props) {
  if (!credits) return null

  const total = credits.freeRemaining + credits.paidCredits
  const label = credits.freeRemaining > 0
    ? `${credits.freeRemaining} free left`
    : `${credits.paidCredits} credits`

  const isLow = total <= 1
  const isEmpty = total === 0

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
        isEmpty
          ? 'bg-red-100 text-red-600'
          : isLow
            ? 'bg-amber-100 text-amber-700'
            : 'bg-teal-100 text-teal-700'
      }`}>
        {isEmpty ? 'No credits' : label}
      </span>
      <button onClick={onBuy}
        className="text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-full transition">
        Buy credits
      </button>
    </div>
  )
}
