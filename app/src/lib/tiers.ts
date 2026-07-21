/**
 * Bounded world tiers (PRD FR-3).
 *
 * Crew count and environmental richness scale through discrete tiers, never
 * linearly with balance — a very large position renders the richest tier but
 * never an unbounded number of animated entities. The exact represented
 * amount is always shown separately in the Treasury.
 */

export type TierId = 'empty' | 'sprout' | 'stead' | 'village' | 'town' | 'citadel'

export interface Tier {
  id: TierId
  /** Inclusive upper bound of represented HYPE for this tier (Infinity for top). */
  maxRepresented: number
  label: string
  /** Hard cap on simultaneously animated mascots. */
  crewCount: number
  /** Width of the staking field in tiles (height derives from layout). */
  fieldTiles: number
  /** Extra decorative props (trees, lanterns, banners) seeded per wallet. */
  decorBudget: number
  blurb: string
}

export const TIERS: Tier[] = [
  {
    id: 'empty',
    maxRepresented: 0,
    label: 'Starter Plot',
    crewCount: 0,
    fieldTiles: 0,
    decorBudget: 4,
    blurb: 'No Kinetiq position detected — a starter settlement with a demo field.',
  },
  {
    id: 'sprout',
    maxRepresented: 10,
    label: 'Sprout Camp',
    crewCount: 1,
    fieldTiles: 4,
    decorBudget: 6,
    blurb: 'A lone worker tends a small staking field.',
  },
  {
    id: 'stead',
    maxRepresented: 100,
    label: 'Homestead',
    crewCount: 3,
    fieldTiles: 6,
    decorBudget: 9,
    blurb: 'A working homestead with a tended field and supply path.',
  },
  {
    id: 'village',
    maxRepresented: 1_000,
    label: 'Village',
    crewCount: 5,
    fieldTiles: 8,
    decorBudget: 13,
    blurb: 'A bustling village crew working the staking fields.',
  },
  {
    id: 'town',
    maxRepresented: 10_000,
    label: 'Town',
    crewCount: 8,
    fieldTiles: 10,
    decorBudget: 18,
    blurb: 'A busy town with crews rotating through field and site work.',
  },
  {
    id: 'citadel',
    maxRepresented: Infinity,
    label: 'Citadel',
    crewCount: 12,
    fieldTiles: 12,
    decorBudget: 24,
    blurb: 'The full citadel — the largest bounded crew the world supports.',
  },
]

export function tierForRepresented(representedHype: number): Tier {
  for (const tier of TIERS) {
    if (representedHype <= tier.maxRepresented) return tier
  }
  return TIERS[TIERS.length - 1]
}

/** Absolute cap on animated mascots, enforced by the renderer as a backstop. */
export const MAX_CREW = 12
