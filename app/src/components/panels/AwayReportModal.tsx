import { PixelModal } from './PixelModal'
import { formatDelta, formatDuration, formatTimestamp, formatToken } from '@/lib/format'
import type { GameState, Snapshot } from '@/lib/types'

/**
 * Away Report (PRD FR-6 / §8.2): change between two stored snapshots plus
 * completed game events. Neutral language only — "represented value changed"
 * — and transfers are never described as yield. With no prior snapshot the
 * user gets a first-visit welcome, never a fabricated history.
 */
export function AwayReportModal({
  prev,
  latest,
  game,
  isDemo,
  onClose,
  onOpenWorkshop,
}: {
  prev: Snapshot | null
  latest: Snapshot | null
  game: GameState
  isDemo: boolean
  onClose: () => void
  onOpenWorkshop: () => void
}) {
  if (!prev || !latest) {
    return (
      <PixelModal title="Away Report" onClose={onClose}>
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <img src="/assets/mascot-portrait.png" alt="Quant" className="h-20 w-auto" />
          <h3 className="font-pixel text-[12px] text-[#bfe3d0]">This is your first recorded visit</h3>
          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
            There's no earlier snapshot to compare against, so there is nothing to report yet — Quant never invents
            history. From here on, daily snapshots (stored on this device with your consent) power your Away Report.
          </p>
          <p className="text-[10px] text-muted-foreground">Come back later and see what changed while you were away.</p>
        </div>
      </PixelModal>
    )
  }

  const period = latest.timestamp - prev.timestamp
  const representedDelta = latest.representedHype - prev.representedHype
  const khypeDelta = latest.khype - prev.khype
  const hypeDelta = latest.hype - prev.hype
  const balanceMoved = Math.abs(khypeDelta) > 1e-9 || Math.abs(hypeDelta) > 1e-9

  const sinceEvents = game.xpEvents.filter((e) => e.at >= prev.timestamp && e.at <= latest.timestamp + 60_000)
  const xpInPeriod = sinceEvents.reduce((sum, e) => sum + e.amount, 0)
  const completedInPeriod = sinceEvents.filter((e) => e.type === 'project_complete')

  return (
    <PixelModal title="Away Report" onClose={onClose} wide>
      {isDemo && (
        <div className="mb-3 rounded-lg border border-[#8a6a1f] bg-[#2a2108] px-3 py-2 text-xs text-[#f2c14e]">
          Sample report — demo snapshots on this device.
        </div>
      )}

      <p className="mb-3 text-xs text-muted-foreground">
        {formatTimestamp(prev.timestamp)} → {formatTimestamp(latest.timestamp)} ({formatDuration(period)} away) · blocks #
        {prev.blockNumber.toLocaleString()} → #{latest.blockNumber.toLocaleString()}
      </p>

      {/* financial change — neutral language */}
      <section className="mb-3 rounded-lg border-l-4 border-[#2a5a4a] bg-[#0d211a] px-3 py-2">
        <h3 className="mb-1 font-pixel text-[9px] uppercase tracking-wider text-[#5fd08a]">Position (on-chain facts)</h3>
        <div className="flex items-baseline justify-between py-0.5 text-xs">
          <span className="text-muted-foreground">Represented value changed</span>
          <span className={`font-pixel text-[12px] ${representedDelta >= 0 ? 'text-[#5fd08a]' : 'text-[#e8734a]'}`}>
            {formatDelta(representedDelta)} HYPE
          </span>
        </div>
        <div className="flex items-baseline justify-between py-0.5 text-[11px]">
          <span className="text-muted-foreground">from {formatToken(prev.representedHype)} HYPE</span>
          <span className="text-muted-foreground">to {formatToken(latest.representedHype)} HYPE</span>
        </div>
        {balanceMoved && (
          <p className="mt-1 border-t border-[#1d3a30] pt-1 text-[10px] leading-relaxed text-[#d8d06a]">
            Your balances also moved ({formatDelta(khypeDelta)} kHYPE, {formatDelta(hypeDelta)} HYPE). Quant can't
            determine whether that was a transfer, a stake, or something else — so it is not described as staking
            yield.
          </p>
        )}
        <p className="mt-1 text-[10px] text-muted-foreground">
          Change between two stored snapshots. No extrapolation, no attribution beyond what the chain states.
        </p>
      </section>

      {/* game change — separate */}
      <section className="mb-3 rounded-lg border-l-4 border-[#6a4a7a] bg-[#0d211a] px-3 py-2">
        <h3 className="mb-1 font-pixel text-[9px] uppercase tracking-wider text-[#c49ae8]">World (game state)</h3>
        {completedInPeriod.length === 0 && xpInPeriod === 0 ? (
          <p className="text-xs text-muted-foreground">No cosmetic projects finished and no World XP earned in this period.</p>
        ) : (
          <>
            {completedInPeriod.map((e, i) => (
              <div key={i} className="flex items-baseline justify-between py-0.5 text-xs">
                <span className="text-muted-foreground">Finished: {e.note}</span>
                <span className="font-pixel text-[11px] text-[#f2c14e]">+{e.amount} XP</span>
              </div>
            ))}
            <div className="flex items-baseline justify-between py-0.5 text-xs">
              <span className="text-muted-foreground">World XP earned while away</span>
              <span className="font-pixel text-[11px] text-[#f2c14e]">+{xpInPeriod} XP</span>
            </div>
          </>
        )}
        <p className="mt-1 text-[10px] text-muted-foreground">World XP is cosmetic game progression — never kPoints.</p>
      </section>

      <button
        onClick={onOpenWorkshop}
        className="pixel-btn w-full border-[#1d6b63] bg-[#2fa4a8] px-4 py-2.5 text-[#06282a] hover:bg-[#3fbcc0]"
      >
        Choose the next project
      </button>
    </PixelModal>
  )
}
