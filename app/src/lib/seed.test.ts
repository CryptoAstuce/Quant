import { describe, expect, it } from 'vitest'
import { hashString, rngFor } from './seed'

describe('deterministic world generation', () => {
  it('produces the same layout sequence for the same wallet key', () => {
    const first = rngFor('0xabc')
    const second = rngFor('0xabc')
    expect([first(), first(), first()]).toEqual([second(), second(), second()])
  })

  it('distinguishes different wallet keys', () => {
    expect(hashString('0xabc')).not.toBe(hashString('0xdef'))
  })
})
