import { describe, expect, it } from 'vitest'
import { formatShareValue } from './shareCard'

describe('formatShareValue', () => {
  it('keeps position values hidden by default', () => {
    expect(formatShareValue('hidden', 12.3456)).toEqual({ label: 'Position value', value: 'hidden' })
  })

  it('labels rounded values so the card cannot be mistaken for exact accounting', () => {
    expect(formatShareValue('rounded', 12.3456)).toEqual({
      label: 'Represented value',
      value: '12 HYPE (rounded)',
    })
  })

  it('keeps exact values opt-in and formatted consistently', () => {
    expect(formatShareValue('exact', 12.3456)).toEqual({
      label: 'Represented value',
      value: '12.3456 HYPE',
    })
  })
})
