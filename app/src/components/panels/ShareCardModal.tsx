import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, RefreshCw } from 'lucide-react'
import { PixelModal } from './PixelModal'
import { renderShareCard, type ShareValueMode } from '@/lib/shareCard'
import { useSettings } from '@/state/settings'
import { useGame } from '@/state/game'
import { track } from '@/lib/analytics'
import { sfx } from '@/lib/sound'
import type { Tier } from '@/lib/tiers'
import { levelForXp } from '@/lib/projects'

/**
 * Share flow (PRD §8.4 / FR-9): preview first, balances hidden by default,
 * explicit opt-in to reveal rounded or exact values. Rendering happens on a
 * dedicated card canvas — on failure nothing is exposed and the user can
 * retry; we never fall back to capturing the live screen.
 */
export function ShareCardModal({
  tier,
  representedHype,
  isDemo,
  onClose,
}: {
  tier: Tier
  representedHype: number
  isDemo: boolean
  onClose: () => void
}) {
  const shareShowValues = useSettings((s) => s.shareShowValues)
  const setShareShowValues = useSettings((s) => s.setShareShowValues)
  const sound = useSettings((s) => s.sound)
  const xp = useGame((s) => s.state.xp)
  const firstVisitAt = useGame((s) => s.state.firstVisitAt)
  const canvasHostRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)
  const [renderKey, setRenderKey] = useState(0)

  const activeDays = Math.max(1, Math.ceil((Date.now() - firstVisitAt) / 86_400_000))

  const draw = useCallback(async () => {
    setError(false)
    try {
      const card = await renderShareCard({
        tier,
        level: levelForXp(xp),
        activeDays,
        crewCount: tier.crewCount,
        mode: shareShowValues as ShareValueMode,
        representedHype,
        isDemo,
      })
      const host = canvasHostRef.current
      if (!host) return
      host.innerHTML = ''
      card.style.width = '100%'
      card.style.height = 'auto'
      card.style.borderRadius = '8px'
      host.appendChild(card)
      ;(host as HTMLDivElement & { __card?: HTMLCanvasElement }).__card = card
    } catch {
      setError(true)
    }
  }, [tier, xp, activeDays, shareShowValues, representedHype, isDemo])

  useEffect(() => {
    void draw()
  }, [draw, renderKey])

  const download = () => {
    const host = canvasHostRef.current as (HTMLDivElement & { __card?: HTMLCanvasElement }) | null
    const card = host?.__card
    if (!card) return
    const a = document.createElement('a')
    a.download = 'quant-settlement.png'
    a.href = card.toDataURL('image/png')
    a.click()
    track('share_generated', { mode: shareShowValues })
    sfx.award(sound)
  }

  return (
    <PixelModal title="Share settlement" onClose={onClose} wide>
      <div ref={canvasHostRef} className="mb-3 min-h-[180px] rounded-lg border border-[#2a4547] bg-[#0a1a14]" />
      {error && (
        <div className="mb-3 rounded-lg border border-[#7c3a2a] bg-[#2a120c] px-3 py-2 text-xs text-[#e8734a]">
          Card rendering failed — your privacy settings were preserved and nothing was exposed.
          <button onClick={() => setRenderKey((k) => k + 1)} className="ml-2 inline-flex items-center gap-1 underline">
            <RefreshCw className="h-3 w-3" /> retry
          </button>
        </div>
      )}

      <div className="mb-3 rounded-lg border border-[#2a4547] bg-[#0d211a] p-3">
        <div className="mb-1 font-pixel text-[9px] uppercase tracking-wider text-[#bfe3d0]">Position values on the card</div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['hidden', 'Hidden (default)'],
              ['rounded', 'Rounded tier value'],
              ['exact', 'Exact value'],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setShareShowValues(mode)}
              className={`rounded-lg border px-3 py-1.5 font-pixel text-[9px] uppercase transition-colors ${
                shareShowValues === mode
                  ? 'border-[#2fa4a8] bg-[#123a36] text-[#5fd08a]'
                  : 'border-[#2a4547] text-muted-foreground hover:bg-[#123026]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
          Your wallet address is never included. Exact balances appear only when you explicitly choose them here. The
          card carries a "visualized from on-chain data" label and makes no earnings claims.
        </p>
      </div>

      <button onClick={download} className="pixel-btn w-full border-[#8a6a1f] bg-[#f2c14e] px-4 py-2.5 text-[#3a2c08] hover:bg-[#ffd97a]">
        <Download className="h-4 w-4" /> Download card (PNG)
      </button>
    </PixelModal>
  )
}
