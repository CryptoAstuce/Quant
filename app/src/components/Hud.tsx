import { Coins, Hammer, ScrollText, Settings, Share2, Wallet } from 'lucide-react'
import { formatToken } from '@/lib/format'
import { levelForXp, xpForNextLevel } from '@/lib/projects'
import type { Position } from '@/lib/types'

export type PanelId = 'treasury' | 'workshop' | 'report' | 'share' | 'settings'

/**
 * Top HUD bar: live treasury summary (with stale marking), World XP level,
 * and panel actions. Exact values always one tap away (PRD FR-5).
 */
export function Hud({
  position,
  isDemo,
  xp,
  tierLabel,
  onOpen,
  address,
  reportAvailable,
}: {
  position: Position | null
  isDemo: boolean
  xp: number
  tierLabel: string
  onOpen: (p: PanelId) => void
  address?: string
  reportAvailable: boolean
}) {
  const level = levelForXp(xp)
  const nextAt = xpForNextLevel(level)
  const prevAt = xpForNextLevel(level - 1)
  const progress = Math.min(1, (xp - prevAt) / Math.max(1, nextAt - prevAt))

  return (
    <header className="flex flex-wrap items-center gap-2 rounded-xl border border-[#2a4547] bg-[#0e2018]/90 px-3 py-2 shadow-[0_3px_0_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="flex items-center gap-2">
        <img src="/assets/mascot-sprite.png" alt="" className="h-7 w-auto pixelated" />
        <div className="leading-tight">
          <div className="font-pixel text-[11px] uppercase tracking-wider text-[#bfe3d0]">Quant</div>
          <div className="text-[10px] text-muted-foreground">for Kinetiq · {tierLabel}</div>
        </div>
      </div>

      <button
        onClick={() => onOpen('treasury')}
        className="ml-auto flex items-center gap-2 rounded-lg border border-[#2a4547] bg-[#123026] px-3 py-1.5 text-left transition-colors hover:border-[#3a6567]"
        title="Open the Treasury for exact on-chain values"
      >
        <Coins className="h-3.5 w-3.5 text-[#f2c14e]" />
        <div className="leading-tight">
          <div className="font-pixel text-[10px] text-[#e8f2e4]">
            {position ? `${formatToken(position.representedHype)} HYPE` : '—'}
          </div>
          <div className="text-[9px] text-muted-foreground">
            {isDemo ? (
              <span className="text-[#f2c14e]">sample data</span>
            ) : position?.stale ? (
              <span className="text-[#e8734a]">stale — RPC unavailable</span>
            ) : (
              'represented value'
            )}
          </div>
        </div>
      </button>

      <div className="flex items-center gap-2 rounded-lg border border-[#2a4547] bg-[#123026] px-3 py-1.5" title="World XP — cosmetic game progression, never kPoints or financial value">
        <div className="leading-tight">
          <div className="font-pixel text-[10px] text-[#f2c14e]">Lv {level}</div>
          <div className="h-1.5 w-16 overflow-hidden rounded bg-[#0a1a14]">
            <div className="h-full bg-[#f2c14e]" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
        <div className="text-[9px] leading-tight text-muted-foreground">
          {xp} XP
          <br />
          <span className="text-[8px]">World XP, not kPoints</span>
        </div>
      </div>

      <nav className="flex items-center gap-1">
        <HudButton label="Workshop" onClick={() => onOpen('workshop')}>
          <Hammer className="h-4 w-4" />
        </HudButton>
        <HudButton label="Away Report" onClick={() => onOpen('report')} highlight={reportAvailable}>
          <ScrollText className="h-4 w-4" />
        </HudButton>
        <HudButton label="Share" onClick={() => onOpen('share')}>
          <Share2 className="h-4 w-4" />
        </HudButton>
        <HudButton label="Settings" onClick={() => onOpen('settings')}>
          <Settings className="h-4 w-4" />
        </HudButton>
      </nav>

      {address && (
        <div className="hidden items-center gap-1 rounded-lg border border-[#2a4547] px-2 py-1.5 text-[10px] text-muted-foreground sm:flex">
          <Wallet className="h-3 w-3" />
          {address.slice(0, 6)}…{address.slice(-4)}
        </div>
      )}
    </header>
  )
}

function HudButton({
  children,
  label,
  onClick,
  highlight,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  highlight?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`relative rounded-lg border border-[#2a4547] p-2 transition-colors hover:border-[#3a6567] hover:bg-[#123026] ${
        highlight ? 'text-[#f2c14e]' : 'text-[#bfe3d0]'
      }`}
    >
      {children}
      {highlight && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#f2c14e]" />}
    </button>
  )
}
