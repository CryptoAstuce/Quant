import { describe, expect, it } from 'vitest'
import { MAX_CREW, tierForRepresented } from './tiers'

describe('bounded settlement tiers', () => {
  it('keeps empty positions in the starter plot', () => {
    expect(tierForRepresented(0).id).toBe('empty')
  })

  it('maps position boundaries deterministically', () => {
    expect(tierForRepresented(10).id).toBe('sprout')
    expect(tierForRepresented(10.0001).id).toBe('stead')
    expect(tierForRepresented(10_000).id).toBe('town')
  })

  it('caps arbitrarily large positions at the maximum crew size', () => {
    expect(tierForRepresented(Number.MAX_SAFE_INTEGER).crewCount).toBe(MAX_CREW)
  })
})
