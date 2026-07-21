import type { World } from './world'
import type { DialogueMood } from '@/lib/dialogue'
import { rngFor, pick, intRange } from '@/lib/seed'
import { MAX_CREW } from '@/lib/tiers'

/**
 * Mascot crew agents (PRD FR-4). Behaviors are cosmetic representations:
 * financially themed animation maps to actual position state (kHYPE -> field
 * work) or explicitly cosmetic state (construction -> active project). No
 * behavior ever encodes yield, kPoints, or balances.
 */

export type CrewAction = 'farm' | 'carry' | 'build' | 'rest' | 'celebrate' | 'wander'

export interface Agent {
  id: number
  x: number
  y: number
  tx: number
  ty: number
  speed: number
  dir: 1 | -1
  action: CrewAction
  /** Walking toward a task vs performing it. */
  phase: 'travel' | 'act'
  actUntil: number
  bobPhase: number
  carryRouteIndex: number
  /** Route legs for carry: 0 = to site, 1 = back to treasury. */
  carryLeg: 0 | 1
}

export class Crew {
  agents: Agent[] = []
  private world: World
  private rng: () => number
  /** Global celebration window (project complete / welcome back). */
  celebrateUntil = 0

  constructor(world: World, count: number, seedKey: string) {
    this.world = world
    this.rng = rngFor(`crew:${seedKey}`)
    const n = Math.min(count, MAX_CREW) // hard backstop cap
    for (let i = 0; i < n; i++) {
      const spawn = world.plaza
      this.agents.push({
        id: i,
        x: spawn.x + intRange(this.rng, -24, 24),
        y: spawn.y + intRange(this.rng, -12, 12),
        tx: spawn.x,
        ty: spawn.y,
        speed: 14 + this.rng() * 8,
        dir: 1,
        action: 'wander',
        phase: 'act',
        actUntil: 0,
        bobPhase: this.rng() * Math.PI * 2,
        carryRouteIndex: 0,
        carryLeg: 0,
      })
      this.assignTask(this.agents[i])
    }
  }

  celebrate(durationMs: number) {
    this.celebrateUntil = performance.now() + durationMs
    for (const a of this.agents) {
      a.action = 'celebrate'
      a.phase = 'travel'
      a.tx = this.world.plaza.x + (this.rng() - 0.5) * 60
      a.ty = this.world.plaza.y + (this.rng() - 0.5) * 30
    }
  }

  /** Dominant mood for Quant's dialogue line. */
  dominantMood(now: number): DialogueMood {
    if (now < this.celebrateUntil) return 'celebrating'
    if (this.agents.length === 0) return 'empty'
    const counts: Partial<Record<CrewAction, number>> = {}
    for (const a of this.agents) counts[a.action] = (counts[a.action] ?? 0) + 1
    const top = (Object.entries(counts).sort((a, b) => b[1]! - a[1]!)[0]?.[0] ?? 'wander') as CrewAction
    switch (top) {
      case 'farm':
        return 'farming'
      case 'carry':
        return 'carrying'
      case 'build':
        return 'building'
      case 'rest':
        return 'resting'
      default:
        return 'idle'
    }
  }

  update(now: number, dt: number) {
    for (const a of this.agents) {
      if (a.phase === 'travel') {
        const dx = a.tx - a.x
        const dy = a.ty - a.y
        const dist = Math.hypot(dx, dy)
        const step = a.speed * dt
        if (dist <= Math.max(2, step)) {
          a.x = a.tx
          a.y = a.ty
          a.phase = 'act'
          a.actUntil = now + this.actDuration(a.action)
        } else {
          a.x += (dx / dist) * step
          a.y += (dy / dist) * step
          a.dir = dx < 0 ? -1 : 1
        }
      } else if (now >= a.actUntil) {
        if (a.action === 'carry') {
          // continue the route rather than re-picking
          this.advanceCarry(a)
        } else if (a.action === 'celebrate' && now < this.celebrateUntil) {
          a.actUntil = now + 600
        } else {
          this.assignTask(a)
        }
      }
    }
  }

  private actDuration(action: CrewAction): number {
    switch (action) {
      case 'farm':
        return 2600 + this.rng() * 2200
      case 'build':
        return 2000 + this.rng() * 1800
      case 'rest':
        return 4000 + this.rng() * 3000
      case 'celebrate':
        return 600
      default:
        return 1200 + this.rng() * 1200
    }
  }

  private assignTask(a: Agent) {
    const w = this.world
    const celebrating = performance.now() < this.celebrateUntil
    if (celebrating) return

    const hasField = w.fieldTiles.length > 0
    const hasSite = Boolean(w.constructionSite)
    const roll = this.rng()

    if (hasField && roll < 0.42) {
      const t = pick(this.rng, w.fieldTiles)
      this.send(a, 'farm', t.x + 4 + this.rng() * 6, t.y + 10)
    } else if (hasSite && roll < 0.6) {
      const s = w.constructionSite!
      this.send(a, 'build', s.x + 6 + this.rng() * (s.wTiles * 16 - 12), s.y + 22)
    } else if (roll < 0.78) {
      a.carryLeg = this.rng() < 0.5 ? 0 : 1
      a.carryRouteIndex = a.carryLeg === 0 ? 0 : w.carryRoute.length - 1
      this.advanceCarry(a)
    } else if (roll < 0.9 && w.restSpots.length > 0) {
      const s = pick(this.rng, w.restSpots)
      this.send(a, 'rest', s.x, s.y)
    } else {
      this.send(a, 'wander', w.plaza.x + (this.rng() - 0.5) * 110, w.plaza.y + (this.rng() - 0.5) * 60)
    }
  }

  private advanceCarry(a: Agent) {
    const route = this.world.carryRoute
    a.action = 'carry'
    if (a.carryLeg === 0) {
      a.carryRouteIndex++
      if (a.carryRouteIndex >= route.length) {
        a.carryLeg = 1
        a.carryRouteIndex = route.length - 1
        a.phase = 'act'
        a.actUntil = performance.now() + 700 // drop-off pause
        return
      }
    } else {
      a.carryRouteIndex--
      if (a.carryRouteIndex < 0) {
        a.carryLeg = 0
        a.carryRouteIndex = 0
        a.phase = 'act'
        a.actUntil = performance.now() + 700 // pick-up pause
        return
      }
    }
    const wp = route[a.carryRouteIndex]
    this.send(a, 'carry', wp.x, wp.y)
  }

  private send(a: Agent, action: CrewAction, x: number, y: number) {
    a.action = action
    a.phase = 'travel'
    a.tx = x
    a.ty = y
  }
}
