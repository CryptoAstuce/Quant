import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { reportPair, useGame } from './game'
import type { Snapshot } from '@/lib/types'

class MemoryStorage {
  private values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  clear() {
    this.values.clear()
  }

  get size() {
    return this.values.size
  }
}

const storage = new MemoryStorage()
let testKey = 0

function snapshot(timestamp: number, blockNumber = timestamp): Omit<Snapshot, 'calcVersion' | 'contractsVerifiedAt'> {
  return {
    blockNumber,
    timestamp,
    hype: 1,
    khype: 2,
    representedHype: 2.2,
    rate: 1.1,
  }
}

describe('device-local snapshot lifecycle', () => {
  beforeEach(() => {
    storage.clear()
    vi.stubGlobal('localStorage', storage)
    useGame.getState().bind(`privacy-test-${testKey++}`)
    useGame.getState().deleteAll()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('never records a position before explicit consent', () => {
    useGame.getState().setSnapshotConsent(false)
    useGame.getState().recordSnapshot(snapshot(Date.UTC(2026, 0, 1)))

    expect(useGame.getState().state.snapshots).toHaveLength(0)
  })

  it('keeps the latest snapshot per UTC day and caps history at 90 days', () => {
    useGame.getState().setSnapshotConsent(true)
    const firstDay = Date.UTC(2026, 0, 1, 8)
    useGame.getState().recordSnapshot(snapshot(firstDay, 100))
    useGame.getState().recordSnapshot(snapshot(firstDay + 60 * 60_000, 101))

    expect(useGame.getState().state.snapshots).toHaveLength(1)
    expect(useGame.getState().state.snapshots[0].blockNumber).toBe(101)

    for (let day = 1; day <= 95; day += 1) {
      useGame.getState().recordSnapshot(snapshot(firstDay + day * 86_400_000, 101 + day))
    }

    const snapshots = useGame.getState().state.snapshots
    expect(snapshots).toHaveLength(90)
    expect(snapshots[0].blockNumber).toBe(107)
    expect(snapshots.at(-1)?.blockNumber).toBe(196)
  })

  it('deletes persisted wallet data and resets the in-memory state', () => {
    useGame.getState().setSnapshotConsent(true)
    useGame.getState().recordSnapshot(snapshot(Date.UTC(2026, 0, 1)))
    expect(storage.size).toBeGreaterThan(0)

    useGame.getState().deleteAll()

    expect(storage.size).toBe(0)
    expect(useGame.getState().state.snapshotConsent).toBeNull()
    expect(useGame.getState().state.snapshots).toHaveLength(0)
  })
})

describe('reportPair', () => {
  it('returns only the latest snapshot on a first visit', () => {
    const latest = { ...snapshot(Date.UTC(2026, 0, 2)), calcVersion: 1, contractsVerifiedAt: '2026-07-17' }
    expect(reportPair({ snapshots: [latest] } as never)).toEqual({ prev: null, latest })
  })
})
