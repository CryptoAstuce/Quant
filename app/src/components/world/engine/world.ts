import { TILE } from './tiles'
import type { Tier } from '@/lib/tiers'
import { rngFor, intRange, pick } from '@/lib/seed'
import type { ProjectId } from '@/lib/projects'

/**
 * Deterministic settlement layout (PRD FR-3): the same wallet always gets the
 * same world shape; the tier scales field size and decoration budget; entity
 * counts stay bounded regardless of position size.
 */

export const WORLD_W = 48
export const WORLD_H = 32
export const WORLD_PX_W = WORLD_W * TILE
export const WORLD_PX_H = WORLD_H * TILE

export type Ground = 'grass' | 'path' | 'water' | 'soil'

export interface PropInstance {
  kind:
    | 'pine'
    | 'roundTree'
    | 'rock'
    | 'flowers'
    | 'stump'
    | 'crate'
    | 'lantern'
    | 'signpost'
    | 'treasury'
    | 'bridge'
    | 'banner'
    | 'fountain'
    | 'windmill'
    | 'orchard'
    | 'construction'
  x: number // game px
  y: number
  variant: number
  /** For bridge/construction: width in tiles. */
  wTiles?: number
  /** Project id backing this prop, when applicable. */
  projectId?: ProjectId
}

export interface World {
  seedKey: string
  tier: Tier
  ground: Ground[][]
  groundVariant: number[][]
  props: PropInstance[]
  /** Field tile rects where mascots can farm. */
  fieldTiles: { x: number; y: number }[]
  /** Crop growth stage per field tile (0-2), seeded. */
  cropStages: number[]
  /** Waypoints for carry route: treasury <-> construction site. */
  carryRoute: { x: number; y: number }[]
  /** Center of the plaza for celebrations / idle wandering. */
  plaza: { x: number; y: number }
  restSpots: { x: number; y: number }[]
  constructionSite: { x: number; y: number; wTiles: number } | null
  /** True when this field is demo/sample data (no real position). */
  isDemoField: boolean
}

export function generateWorld(opts: {
  seedKey: string
  tier: Tier
  completedProjects: ProjectId[]
  activeProject: ProjectId | null
  idleHype: number
  isDemo: boolean
}): World {
  const { seedKey, tier, completedProjects, activeProject, idleHype, isDemo } = opts
  const rng = rngFor(`world:${seedKey}`)

  const ground: Ground[][] = Array.from({ length: WORLD_H }, () => Array(WORLD_W).fill('grass'))
  const groundVariant: number[][] = Array.from({ length: WORLD_H }, (_, y) =>
    Array.from({ length: WORLD_W }, (_, x) => intRange(rngFor(`gv:${seedKey}:${x},${y}`), 0, 12)),
  )

  /* ------------------------------- river ------------------------------- */
  const riverX = 38 + intRange(rng, 0, 2) // 3-wide vertical river on the east
  const bridgeY = 17
  for (let y = 0; y < WORLD_H; y++) {
    const wiggle = Math.floor(Math.sin(y / 3.2 + rng() * 0.6) * 1)
    for (let dx = 0; dx < 3; dx++) {
      const x = riverX + wiggle + dx
      if (x >= 0 && x < WORLD_W) ground[y][x] = 'water'
    }
  }

  /* --------------------------- treasury + plaza ------------------------ */
  const treasuryTile = { x: 20, y: 4 } // 5x4 footprint
  const plaza = { x: 24, y: 15 }

  // plaza paved area
  for (let y = plaza.y - 2; y <= plaza.y + 2; y++) {
    for (let x = plaza.x - 4; x <= plaza.x + 4; x++) {
      if (inBounds(x, y)) ground[y][x] = 'path'
    }
  }

  // main path: treasury -> plaza -> west field; plaza -> east bridge
  paveV(ground, treasuryTile.x + 2, treasuryTile.y + 4, plaza.y - 2)
  paveH(ground, 3, plaza.x - 4, plaza.y, plaza.y)
  paveH(ground, plaza.x + 4, riverX - 1, plaza.y + 2, plaza.y + 2)
  paveH(ground, riverX - 1, WORLD_W - 3, bridgeY, bridgeY)
  paveV(ground, riverX - 2, plaza.y + 1, bridgeY)

  /* ---------------------------- staking field -------------------------- */
  const fieldTiles: { x: number; y: number }[] = []
  const cropStages: number[] = []
  const fieldW = Math.max(4, tier.fieldTiles)
  const fieldH = 4
  const fieldOrigin = { x: 4, y: 11 }
  const hasField = tier.fieldTiles > 0 || isDemo
  if (hasField) {
    for (let y = 0; y < fieldH; y++) {
      for (let x = 0; x < fieldW; x++) {
        const gx = fieldOrigin.x + x
        const gy = fieldOrigin.y + y
        if (!inBounds(gx, gy)) continue
        ground[gy][gx] = 'soil'
        fieldTiles.push({ x: gx * TILE, y: gy * TILE })
        cropStages.push(isDemo ? intRange(rng, 0, 2) : tier.id === 'sprout' ? intRange(rng, 0, 1) : intRange(rng, 1, 2))
      }
    }
  }

  /* ------------------------------- props ------------------------------- */
  const props: PropInstance[] = []

  props.push({ kind: 'treasury', x: treasuryTile.x * TILE, y: treasuryTile.y * TILE, variant: 0 })
  props.push({ kind: 'bridge', x: (riverX - 1) * TILE, y: bridgeY * TILE - 2, wTiles: 5, variant: 0 })
  props.push({ kind: 'signpost', x: (plaza.x - 5) * TILE, y: (plaza.y - 3) * TILE, variant: 0 })

  // idle HYPE capacity: bounded crate stacks by the treasury
  const crateCount = Math.min(6, idleHype > 0 ? Math.max(1, Math.floor(Math.log10(idleHype + 1) * 2)) : 0)
  for (let i = 0; i < crateCount; i++) {
    props.push({
      kind: 'crate',
      x: (treasuryTile.x + 6 + (i % 3)) * TILE,
      y: (treasuryTile.y + 3 + Math.floor(i / 3)) * TILE,
      variant: i,
    })
  }

  // completed cosmetic projects get their permanent props
  if (completedProjects.includes('banner')) {
    props.push({ kind: 'banner', x: (plaza.x - 3) * TILE, y: (plaza.y - 2) * TILE, projectId: 'banner', variant: 0 })
  }
  if (completedProjects.includes('lanterns')) {
    const spots = [
      { x: plaza.x - 4, y: plaza.y - 3 },
      { x: plaza.x + 4, y: plaza.y - 3 },
      { x: plaza.x - 4, y: plaza.y + 3 },
      { x: plaza.x + 4, y: plaza.y + 3 },
    ]
    spots.forEach((s, i) => props.push({ kind: 'lantern', x: s.x * TILE, y: s.y * TILE, projectId: 'lanterns', variant: i }))
  }
  if (completedProjects.includes('windmill')) {
    props.push({ kind: 'windmill', x: 30 * TILE, y: 3 * TILE, projectId: 'windmill', variant: 0 })
  }
  if (completedProjects.includes('fountain')) {
    props.push({ kind: 'fountain', x: (plaza.x - 1) * TILE, y: (plaza.y - 1) * TILE, projectId: 'fountain', variant: 0 })
  }
  if (completedProjects.includes('orchard')) {
    for (let i = 0; i < 4; i++) {
      props.push({ kind: 'orchard', x: (30 + i * 2) * TILE, y: 24 * TILE, projectId: 'orchard', variant: i })
    }
  }

  // active construction project occupies the site east of the plaza
  let constructionSite: World['constructionSite'] = null
  if (activeProject) {
    const site = { x: (plaza.x + 6) * TILE, y: (plaza.y - 1) * TILE, wTiles: 4 }
    constructionSite = site
    props.push({ kind: 'construction', x: site.x, y: site.y, wTiles: site.wTiles, projectId: activeProject, variant: 0 })
  }

  /* -------------------- seeded nature + tier decor --------------------- */
  const occupied = (x: number, y: number) =>
    ground[y]?.[x] !== 'grass' ||
    (x >= treasuryTile.x - 1 && x <= treasuryTile.x + 5 && y >= treasuryTile.y - 1 && y <= treasuryTile.y + 5) ||
    (x >= 29 && x <= 33 && y >= 2 && y <= 7) // windmill hill

  const natureBudget = 26 + tier.decorBudget
  let placed = 0
  let guard = 0
  while (placed < natureBudget && guard++ < 800) {
    const x = intRange(rng, 1, WORLD_W - 2)
    const y = intRange(rng, 1, WORLD_H - 2)
    if (occupied(x, y)) continue
    const edge = x < 6 || x > WORLD_W - 8 || y < 3 || y > WORLD_H - 4
    const kind = pick(rng, edge ? (['pine', 'pine', 'roundTree', 'rock'] as const) : (['roundTree', 'flowers', 'rock', 'stump', 'pine'] as const))
    props.push({ kind, x: x * TILE, y: y * TILE, variant: intRange(rng, 0, 7) })
    placed++
  }

  const restSpots = props
    .filter((p) => p.kind === 'roundTree' || p.kind === 'stump')
    .slice(0, 4)
    .map((p) => ({ x: p.x + 4, y: p.y + 18 }))

  return {
    seedKey,
    tier,
    ground,
    groundVariant,
    props,
    fieldTiles,
    cropStages,
    carryRoute: [
      { x: (treasuryTile.x + 2) * TILE + 8, y: (treasuryTile.y + 5) * TILE },
      { x: plaza.x * TILE + 8, y: plaza.y * TILE + 8 },
      { x: (plaza.x + 7) * TILE, y: (plaza.y + 1) * TILE },
    ],
    plaza: { x: plaza.x * TILE + 8, y: plaza.y * TILE + 8 },
    restSpots,
    constructionSite,
    isDemoField: isDemo || tier.fieldTiles === 0,
  }
}

function inBounds(x: number, y: number) {
  return x >= 0 && y >= 0 && x < WORLD_W && y < WORLD_H
}

function paveH(ground: Ground[][], x0: number, x1: number, y0: number, y1: number) {
  for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) {
    for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) {
      if (inBounds(x, y) && ground[y][x] === 'grass') ground[y][x] = 'path'
    }
  }
}

function paveV(ground: Ground[][], x: number, y0: number, y1: number) {
  for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) {
    for (let dx = 0; dx < 2; dx++) {
      if (inBounds(x + dx, y) && ground[y][x + dx] === 'grass') ground[y][x + dx] = 'path'
    }
  }
}
