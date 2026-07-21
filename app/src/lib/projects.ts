/**
 * Cosmetic construction projects and World XP rules (PRD FR-7).
 *
 * Projects are purely cosmetic: they never change, or claim to change, the
 * on-chain position. World XP rewards learning, returning, and cosmetic
 * completion — never deposit size or transaction frequency.
 */

export type ProjectId = 'banner' | 'lanterns' | 'windmill' | 'fountain' | 'orchard'

export interface CosmeticProject {
  id: ProjectId
  name: string
  description: string
  /** Real-time build duration; progress also accrues while the user is away. */
  buildMs: number
  xpReward: number
  /** Prop key drawn by the world renderer once complete. */
  prop: 'banner' | 'lanterns' | 'windmill' | 'fountain' | 'orchard'
}

export const PROJECTS: readonly CosmeticProject[] = [
  {
    id: 'banner',
    name: 'Welcome Banner',
    description: 'A strung banner across the plaza path. The traditional first build.',
    buildMs: 45_000,
    xpReward: 20,
    prop: 'banner',
  },
  {
    id: 'lanterns',
    name: 'Lantern Path',
    description: 'Warm lanterns along the main path so the crew can work late.',
    buildMs: 10 * 60_000,
    xpReward: 40,
    prop: 'lanterns',
  },
  {
    id: 'windmill',
    name: 'Old Windmill',
    description: 'A creaky windmill on the hill. Spins when it feels like it.',
    buildMs: 30 * 60_000,
    xpReward: 90,
    prop: 'windmill',
  },
  {
    id: 'fountain',
    name: 'Fountain Plaza',
    description: 'A stone fountain for the plaza. Mascots approve of fountains.',
    buildMs: 60 * 60_000,
    xpReward: 150,
    prop: 'fountain',
  },
  {
    id: 'orchard',
    name: 'South Orchard',
    description: 'A row of fruit trees by the river. Purely decorative, mildly delicious.',
    buildMs: 90 * 60_000,
    xpReward: 220,
    prop: 'orchard',
  },
]

export function projectById(id: ProjectId): CosmeticProject {
  const p = PROJECTS.find((p) => p.id === id)
  if (!p) throw new Error(`unknown project ${id}`)
  return p
}

/* ------------------------------------------------------------------ */
/* World XP                                                            */
/* ------------------------------------------------------------------ */

export type XpEventType =
  | 'return_visit' // once per UTC day, rewards returning — not checking
  | 'tutorial' // first walkthrough completed, once
  | 'explainer' // viewed an educational explanation, once per topic
  | 'project_complete' // finished a cosmetic project
  | 'first_snapshot' // consented to snapshot history, once

export const XP_TABLE: Record<XpEventType, number> = {
  return_visit: 10,
  tutorial: 15,
  explainer: 5,
  project_complete: 0, // per-project value used instead
  first_snapshot: 10,
}

/** Settlement level from lifetime XP — gentle sqrt curve, hard to rush. */
export function levelForXp(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 40)) + 1)
}

export function xpForNextLevel(level: number): number {
  return 40 * level * level
}
