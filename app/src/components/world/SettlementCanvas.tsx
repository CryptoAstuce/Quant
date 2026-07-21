import { useEffect, useMemo, useRef } from 'react'
import { generateWorld } from './engine/world'
import { Crew } from './engine/crew'
import { startRenderer } from './engine/render'
import { tierForRepresented, type Tier } from '@/lib/tiers'
import { useGame } from '@/state/game'
import { useSettings } from '@/state/settings'
import type { Position } from '@/lib/types'

/**
 * Wires the deterministic world, the crew, and the renderer to React state.
 * The world rebuilds only when its structural inputs change (wallet seed,
 * tier, projects); the crew instance is reused across rebuilds when possible.
 */
export function SettlementCanvas({
  position,
  isDemo,
  seedKey,
  interactive = true,
  onWorldReady,
  celebrateSignal = 0,
}: {
  position: Position | null
  isDemo: boolean
  seedKey: string
  interactive?: boolean
  onWorldReady?: (tier: Tier) => void
  celebrateSignal?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const crewRef = useRef<Crew | null>(null)
  const reducedMotion = useSettings((s) => s.reducedMotion)
  const completedProjects = useGame((s) => s.state.completedProjects)
  const activeProject = useGame((s) => s.state.activeProject)

  const represented = position?.representedHype ?? 0
  const tier = useMemo(() => tierForRepresented(isDemo ? 50 : represented), [isDemo, represented])

  const world = useMemo(
    () =>
      generateWorld({
        seedKey,
        tier,
        completedProjects,
        activeProject: activeProject?.id ?? null,
        idleHype: position?.hype ?? 0,
        isDemo,
      }),
    [seedKey, tier, completedProjects, activeProject?.id, position?.hype, isDemo],
  )

  const crewCount = isDemo ? Math.max(3, tier.crewCount) : tier.crewCount

  // project progress for the construction prop
  const progressRef = useRef<() => number | null>(() => null)
  progressRef.current = () => {
    const ap = useGame.getState().state.activeProject
    if (!ap) return null
    const total = ap.completesAt - ap.startedAt
    return Math.min(1, (Date.now() - ap.startedAt) / total)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const crew = new Crew(world, crewCount, seedKey)
    crewRef.current = crew
    const renderer = startRenderer(canvas, world, crew, {
      reducedMotion,
      spriteUrl: '/assets/mascot-sprite.png',
      getConstructionProgress: () => progressRef.current(),
      onReady: () => onWorldReady?.(tier),
    })
    return () => renderer.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world, crewCount, seedKey, reducedMotion])

  // celebrate signal (project completed / welcome back)
  useEffect(() => {
    if (celebrateSignal > 0) crewRef.current?.celebrate(6000)
  }, [celebrateSignal])

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-[#2a4547] bg-[#1a2f26] shadow-[0_0_0_4px_rgba(0,0,0,0.25)]">
      <canvas
        ref={canvasRef}
        id="settlement-canvas"
        className="block w-full [image-rendering:pixelated]"
        role="img"
        aria-label={`Animated 2D settlement world — ${tier.label}. Crew of ${crewCount} mascot${crewCount === 1 ? '' : 's'} representing your Kinetiq position.`}
      />
      {interactive && (
        <div className="pointer-events-none absolute left-2 top-2 rounded bg-black/55 px-2 py-1 font-pixel text-[9px] uppercase tracking-wider text-[#bfe3d0]">
          {tier.label}
          {isDemo && <span className="ml-2 text-[#f2c14e]">· sample world</span>}
        </div>
      )}
    </div>
  )
}
