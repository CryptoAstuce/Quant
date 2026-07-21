import { useEffect, useState } from 'react'
import { Check, Hammer } from 'lucide-react'
import { PixelModal } from './PixelModal'
import { PROJECTS, type ProjectId } from '@/lib/projects'
import { formatDuration } from '@/lib/format'
import { useGame } from '@/state/game'
import { track } from '@/lib/analytics'
import { sfx } from '@/lib/sound'
import { useSettings } from '@/state/settings'

/**
 * Workshop (PRD FR-7 / §10.5): purely cosmetic construction. One active build
 * at a time; progress accrues in real time, including while away. No
 * financial-return language anywhere.
 */
export function WorkshopModal({ onClose }: { onClose: () => void }) {
  const completed = useGame((s) => s.state.completedProjects)
  const active = useGame((s) => s.state.activeProject)
  const startProject = useGame((s) => s.startProject)
  const sound = useSettings((s) => s.sound)
  const [, forceTick] = useState(0)

  // live progress for the active build
  useEffect(() => {
    if (!active) return
    const t = setInterval(() => forceTick((n) => n + 1), 500)
    return () => clearInterval(t)
  }, [active])

  const start = (id: ProjectId) => {
    startProject(id)
    track('project_started', { id })
    sfx.click(sound)
  }

  return (
    <PixelModal title="Workshop — cosmetic projects" onClose={onClose} wide>
      <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
        Projects decorate your settlement and award World XP. They never change — or claim to change — your on-chain
        position, yield, or kPoints.
      </p>

      <div className="space-y-2">
        {PROJECTS.map((p) => {
          const isDone = completed.includes(p.id)
          const isActive = active?.id === p.id
          const progress = isActive && active ? Math.min(1, (Date.now() - active.startedAt) / (active.completesAt - active.startedAt)) : 0
          return (
            <div key={p.id} className="flex items-center gap-3 rounded-lg border border-[#2a4547] bg-[#0d211a] p-3">
              <ProjectGlyph id={p.id} done={isDone} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-pixel text-[10px] text-[#bfe3d0]">{p.name}</h3>
                  <span className="font-pixel text-[9px] text-[#f2c14e]">+{p.xpReward} XP</span>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{p.description}</p>
                {isActive && (
                  <div className="mt-2">
                    <div className="h-2 overflow-hidden rounded bg-[#0a1a14]">
                      <div className="h-full bg-[#2fa4a8] transition-[width]" style={{ width: `${progress * 100}%` }} />
                    </div>
                    <div className="mt-0.5 text-[9px] text-muted-foreground">
                      {progress < 1 ? `finishes in ${formatDuration(Math.max(0, active!.completesAt - Date.now()))}` : 'finishing…'}
                    </div>
                  </div>
                )}
              </div>
              <div className="shrink-0">
                {isDone ? (
                  <span className="inline-flex items-center gap-1 rounded border border-[#2a5a4a] px-2 py-1 font-pixel text-[9px] text-[#5fd08a]">
                    <Check className="h-3 w-3" /> Built
                  </span>
                ) : isActive ? (
                  <span className="inline-flex items-center gap-1 rounded border border-[#8a6a1f] px-2 py-1 font-pixel text-[9px] text-[#f2c14e]">
                    <Hammer className="h-3 w-3" /> Building
                  </span>
                ) : (
                  <button
                    onClick={() => start(p.id)}
                    disabled={Boolean(active)}
                    title={active ? 'One build crew at a time' : `Build time ${formatDuration(p.buildMs)}`}
                    className="pixel-btn border-[#1d6b63] bg-[#2fa4a8] px-3 py-1.5 text-[9px] text-[#06282a] hover:bg-[#3fbcc0]"
                  >
                    Build · {formatDuration(p.buildMs)}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </PixelModal>
  )
}

/** Tiny pixel-style glyph per project (CSS boxes, no external art). */
function ProjectGlyph({ id, done }: { id: ProjectId; done: boolean }) {
  const base = 'grid h-10 w-10 shrink-0 place-items-center rounded border text-lg'
  const tone = done ? 'border-[#2a5a4a] bg-[#123026]' : 'border-[#2a4547] bg-[#0a1a14]'
  const glyph: Record<ProjectId, string> = {
    banner: '⚑',
    lanterns: '🏮',
    windmill: '✢',
    fountain: '⛲',
    orchard: '🌳',
  }
  return (
    <div className={`${base} ${tone}`} aria-hidden>
      <span className="text-[18px] leading-none">{glyph[id]}</span>
    </div>
  )
}
