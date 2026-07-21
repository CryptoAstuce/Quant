import { describe, expect, it } from 'vitest'
import { formatDelta, formatDuration, formatToken, roundHalfUp, truncateAddress } from './format'

describe('financial display formatting', () => {
  it('uses bounded decimal precision and half-up rounding', () => {
    expect(roundHalfUp(1.23456, 4)).toBe(1.2346)
    expect(formatToken(1234.5)).toBe('1,234.5')
  })

  it('does not display non-finite values as financial facts', () => {
    expect(formatToken(Number.NaN)).toBe('—')
    expect(formatDelta(Number.POSITIVE_INFINITY)).toBe('—')
  })

  it('formats signed deltas without changing magnitude', () => {
    expect(formatDelta(0.018)).toBe('+0.018')
    expect(formatDelta(-0.25)).toBe('-0.25')
    expect(formatDelta(0)).toBe('±0')
  })

  it('formats compact durations and privacy-safe addresses', () => {
    expect(formatDuration(72 * 60 * 60 * 1000)).toBe('3d 0h')
    expect(truncateAddress('0x1234567890abcdef')).toBe('0x1234…cdef')
  })
})
