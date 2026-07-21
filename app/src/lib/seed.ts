/**
 * Deterministic seeded RNG (mulberry32) — settlement layout is generated
 * deterministically from the wallet address (PRD FR-3), so the same wallet
 * always returns to the same world shape.
 */
export function hashString(input: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function rngFor(seedKey: string): () => number {
  return mulberry32(hashString(seedKey))
}

export function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]
}

export function range(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min)
}

export function intRange(rng: () => number, min: number, max: number): number {
  return Math.floor(range(rng, min, max + 1))
}
