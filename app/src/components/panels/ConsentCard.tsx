import { useGame } from '@/state/game'
import { track } from '@/lib/analytics'

/**
 * Snapshot consent prompt (PRD FR-6): history begins only after consent.
 * Non-blocking; the world is fully usable without it.
 */
export function ConsentCard({ onDone }: { onDone: () => void }) {
  const setSnapshotConsent = useGame((s) => s.setSnapshotConsent)
  const awardXp = useGame((s) => s.awardXp)

  const answer = (consent: boolean) => {
    setSnapshotConsent(consent)
    track('snapshot_consent', { consent })
    if (consent) awardXp('first_snapshot')
    onDone()
  }

  return (
    <div className="pointer-events-auto w-full max-w-sm rounded-xl border border-[#2a4547] bg-[#0e2018]/95 p-4 shadow-[0_4px_0_rgba(0,0,0,0.4)] backdrop-blur">
      <h3 className="font-pixel text-[10px] uppercase tracking-wider text-[#bfe3d0]">Power the Away Report?</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        Quant can store a daily snapshot of your position <span className="text-[#d8efe2]">on this device</span> so your
        Away Report can show what changed while you were gone. Nothing leaves your browser, and you can delete it
        anytime in Settings.
      </p>
      <div className="mt-3 flex gap-2">
        <button onClick={() => answer(true)} className="pixel-btn flex-1 border-[#1d6b63] bg-[#2fa4a8] px-3 py-2 text-[9px] text-[#06282a] hover:bg-[#3fbcc0]">
          Store snapshots
        </button>
        <button onClick={() => answer(false)} className="pixel-btn flex-1 border-[#2a4547] bg-[#123026] px-3 py-2 text-[9px] text-[#bfe3d0] hover:bg-[#1a3a30]">
          No thanks
        </button>
      </div>
    </div>
  )
}
