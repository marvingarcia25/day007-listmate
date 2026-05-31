import type { CreditsState } from '../App'

interface Props {
  credits: CreditsState | null
  onBuy: () => void
}

export default function CreditBadge({ credits, onBuy }: Props) {
  if (!credits) return null

  const total = credits.freeRemaining + credits.paidCredits
  const isFree = credits.freeRemaining > 0
  const isEmpty = total === 0

  return (
    <div className="flex items-center gap-3">
      <div className="text-right hidden sm:block">
        <div className="font-mono text-xs uppercase tracking-widest"
          style={{ color: isEmpty ? '#C4382A' : isFree ? '#E8A020' : '#7A7268' }}>
          {isEmpty
            ? '— out of credits —'
            : isFree
              ? `${credits.freeRemaining} free remaining`
              : `${credits.paidCredits} credits`}
        </div>
        {!isEmpty && (
          <div className="font-body text-xs mt-0.5" style={{ color: '#504A44' }}>
            {isFree ? 'no account needed' : `linked: ${credits.email}`}
          </div>
        )}
      </div>
      <button onClick={onBuy}
        className="font-body font-semibold text-xs uppercase tracking-widest px-4 py-2 border transition-all duration-150"
        style={{
          borderColor: '#E8A020',
          color:       '#E8A020',
          background:  'transparent',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(232,160,32,0.12)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'transparent'
        }}>
        {isEmpty ? 'Buy Credits →' : '+ Buy More'}
      </button>
    </div>
  )
}
