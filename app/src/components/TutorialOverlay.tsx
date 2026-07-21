import { useState } from 'react'
import { useGame } from '@/state/game'
import { sfx } from '@/lib/sound'
import { useSettings } from '@/state/settings'

const STEPS = [
  {
    title: 'Your position is a world',
    body: 'The staking field and its crew visualize your kHYPE. Crates by the Treasury are idle, unstaked HYPE capacity. The crew is a representation — never a conversion unit.',
  },
  {
    title: 'The Treasury tells the truth',
    body: 'Exact balances, the kHYPE→HYPE rate, block number, and timestamps live in the Treasury panel. If the network fails, values are marked stale — never faked.',
  },
  {
    title: 'Play without financial pressure',
    body: 'Build cosmetic projects, earn World XP, and come back for the Away Report. World XP is not kPoints and never becomes money. The world rewards returning, not trading.',
  },
]

/** First-visit tutorial (PRD §8.1 step 8; FR-7 tutorial XP). */
export function TutorialOverlay({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const completeTutorial = useGame((s) => s.completeTutorial)
  const awardXp = useGame((s) => s.awardXp)
  const sound = useSettings((s) => s.sound)

  const finish = () => {
    completeTutorial()
    awardXp('tutorial')
    sfx.complete(sound)
    onDone()
  }

  const s = STEPS[step]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Welcome tutorial">
      <div className="pixel-panel w-full max-w-sm p-5 text-center">
        <img src="/assets/mascot-portrait.png" alt="Quant, the Kinetiq mascot" className="mx-auto h-24 w-auto" />
        <div className="mt-1 font-pixel text-[9px] uppercase text-muted-foreground">
          {step + 1} / {STEPS.length}
        </div>
        <h2 className="mt-1 font-pixel text-[13px] uppercase tracking-wider text-[#bfe3d0]">{s.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
        <div className="mt-4 flex gap-2">
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="pixel-btn flex-1 border-[#1d6b63] bg-[#2fa4a8] px-4 py-2.5 text-[#06282a] hover:bg-[#3fbcc0]">
              Next
            </button>
          ) : (
            <button onClick={finish} className="pixel-btn flex-1 border-[#8a6a1f] bg-[#f2c14e] px-4 py-2.5 text-[#3a2c08] hover:bg-[#ffd97a]">
              Start my settlement · +15 XP
            </button>
          )}
          {step < STEPS.length - 1 && (
            <button onClick={finish} className="px-3 text-xs text-muted-foreground underline">
              skip
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
