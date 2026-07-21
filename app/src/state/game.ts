import { create } from 'zustand'
import type { GameState, Snapshot } from '@/lib/types'
import { PROJECTS, XP_TABLE, projectById, type ProjectId, type XpEventType } from '@/lib/projects'
import { CALC_VERSION, CONTRACTS_VERIFIED_AT } from '@/lib/chain'

/**
 * Per-wallet game state (PRD §12: keyed to a normalized wallet address,
 * no real-world identity). Persisted to localStorage; the user can delete
 * everything from Settings. Demo mode uses the reserved key "demo".
 */

export const DEMO_KEY = 'demo'

const initialGame = (now: number): GameState => ({
  snapshotConsent: null,
  snapshots: [],
  xp: 0,
  xpEvents: [],
  completedProjects: [],
  activeProject: null,
  tutorialDone: false,
  explainersSeen: [],
  firstVisitAt: now,
  lastVisitAt: now,
  dailyAwards: {},
  lastReportSeenFor: null,
})

interface GameStore {
  key: string
  state: GameState
  /** (Re)bind the store to a wallet key, loading or initializing its state. */
  bind: (key: string) => void
  setSnapshotConsent: (consent: boolean) => void
  recordSnapshot: (s: Omit<Snapshot, 'calcVersion' | 'contractsVerifiedAt'>) => void
  awardXp: (type: XpEventType, note?: string, forceAmount?: number) => number
  completeTutorial: () => void
  markExplainerSeen: (topic: string) => void
  startProject: (id: ProjectId) => void
  /** Returns the project id if one just completed, else null. */
  checkProjectCompletion: () => ProjectId | null
  markReportSeen: (snapshotTimestamp: number) => void
  touchVisit: () => { isReturnVisit: boolean }
  deleteAll: () => void
}

function storageKey(key: string): string {
  return `quant.game.v1.${key.toLowerCase()}`
}

function load(key: string): GameState {
  try {
    const raw = localStorage.getItem(storageKey(key))
    if (raw) return { ...initialGame(Date.now()), ...(JSON.parse(raw) as GameState) }
  } catch {
    /* corrupted local state — start fresh rather than crash */
  }
  return initialGame(Date.now())
}

function save(key: string, state: GameState) {
  try {
    localStorage.setItem(storageKey(key), JSON.stringify(state))
  } catch {
    /* storage full/unavailable — game continues unpersisted */
  }
}

function utcDay(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10)
}

export const useGame = create<GameStore>()((set, get) => ({
  key: DEMO_KEY,
  state: typeof window === 'undefined' ? initialGame(Date.now()) : load(DEMO_KEY),

  bind: (key) => {
    const normalized = key.toLowerCase()
    if (get().key === normalized) return
    set({ key: normalized, state: load(normalized) })
  },

  setSnapshotConsent: (consent) =>
    set((s) => {
      const state = { ...s.state, snapshotConsent: consent }
      save(s.key, state)
      return { state }
    }),

  recordSnapshot: (snap) =>
    set((s) => {
      if (!s.state.snapshotConsent) return s
      const full: Snapshot = {
        ...snap,
        calcVersion: CALC_VERSION,
        contractsVerifiedAt: CONTRACTS_VERIFIED_AT,
      }
      // one snapshot per UTC day is enough for the Away Report cadence;
      // keep the latest of the day
      const others = s.state.snapshots.filter((p) => utcDay(p.timestamp) !== utcDay(full.timestamp))
      const snapshots = [...others, full].sort((a, b) => a.timestamp - b.timestamp).slice(-90)
      const state = { ...s.state, snapshots }
      save(s.key, state)
      return { state }
    }),

  awardXp: (type, note, forceAmount) => {
    const amount = forceAmount ?? XP_TABLE[type]
    if (amount <= 0) return 0
    let awarded = 0
    set((s) => {
      const today = utcDay(Date.now())
      const todaysAwards = s.state.dailyAwards[today] ?? []
      // anti-abuse: return visits award once per UTC day
      if (type === 'return_visit' && todaysAwards.includes('return_visit')) return s
      const event = { type, amount, at: Date.now(), note }
      const state: GameState = {
        ...s.state,
        xp: s.state.xp + amount,
        xpEvents: [...s.state.xpEvents, event].slice(-200),
        dailyAwards: { ...s.state.dailyAwards, [today]: [...todaysAwards, type] },
      }
      awarded = amount
      save(s.key, state)
      return { state }
    })
    return awarded
  },

  completeTutorial: () =>
    set((s) => {
      const state = { ...s.state, tutorialDone: true }
      save(s.key, state)
      return { state }
    }),

  markExplainerSeen: (topic) =>
    set((s) => {
      if (s.state.explainersSeen.includes(topic)) return s
      const state = { ...s.state, explainersSeen: [...s.state.explainersSeen, topic] }
      save(s.key, state)
      return { state }
    }),

  startProject: (id) =>
    set((s) => {
      if (s.state.activeProject) return s // one build crew at a time
      if (s.state.completedProjects.includes(id)) return s
      const p = projectById(id)
      const now = Date.now()
      const state: GameState = {
        ...s.state,
        activeProject: { id, startedAt: now, completesAt: now + p.buildMs },
      }
      save(s.key, state)
      return { state }
    }),

  checkProjectCompletion: () => {
    const s = get()
    const active = s.state.activeProject
    if (!active || Date.now() < active.completesAt) return null
    const p = PROJECTS.find((p) => p.id === active.id)
    set((cur) => {
      const state: GameState = {
        ...cur.state,
        activeProject: null,
        completedProjects: [...cur.state.completedProjects, active.id],
      }
      save(cur.key, state)
      return { state }
    })
    return p?.id ?? null
  },

  markReportSeen: (snapshotTimestamp) =>
    set((s) => {
      const state = { ...s.state, lastReportSeenFor: snapshotTimestamp }
      save(s.key, state)
      return { state }
    }),

  touchVisit: () => {
    const prev = get().state.lastVisitAt
    const now = Date.now()
    const isReturnVisit = utcDay(prev) !== utcDay(now) && now - prev > 4 * 60 * 60_000
    set((s) => {
      const state = { ...s.state, lastVisitAt: now }
      save(s.key, state)
      return { state }
    })
    return { isReturnVisit }
  },

  deleteAll: () => {
    const key = get().key
    try {
      localStorage.removeItem(storageKey(key))
    } catch {
      /* noop */
    }
    set({ state: initialGame(Date.now()) })
  },
}))

/** The snapshot pair used for the Away Report: previous vs latest. */
export function reportPair(state: GameState): { prev: Snapshot | null; latest: Snapshot | null } {
  const snaps = state.snapshots
  if (snaps.length === 0) return { prev: null, latest: null }
  if (snaps.length === 1) return { prev: null, latest: snaps[snaps.length - 1] }
  return { prev: snaps[snaps.length - 2], latest: snaps[snaps.length - 1] }
}
