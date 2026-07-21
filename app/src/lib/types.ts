import type { ProjectId, XpEventType } from './projects'

/** A consented daily snapshot of the position (PRD FR-6 / §12). */
export interface Snapshot {
  blockNumber: number
  timestamp: number
  hype: number
  khype: number
  /** HYPE-equivalent value of the kHYPE balance at this block. */
  representedHype: number
  /** kHYPE→HYPE rate used for the conversion. */
  rate: number
  calcVersion: number
  /** Contract configuration fingerprint the values were read against. */
  contractsVerifiedAt: string
}

export interface ActiveProject {
  id: ProjectId
  startedAt: number
  completesAt: number
}

export interface XpEvent {
  type: XpEventType
  amount: number
  at: number
  note?: string
}

export interface GameState {
  /** Consent to store snapshots locally (PRD FR-6). Null = not yet asked. */
  snapshotConsent: boolean | null
  snapshots: Snapshot[]
  xp: number
  xpEvents: XpEvent[]
  /** Project ids whose builds have completed. */
  completedProjects: ProjectId[]
  activeProject: ActiveProject | null
  tutorialDone: boolean
  explainersSeen: string[]
  firstVisitAt: number
  lastVisitAt: number
  /** UTC day keys (YYYY-MM-DD) for once-per-day XP awards. */
  dailyAwards: Record<string, XpEventType[]>
  /** Away Report id (previous snapshot timestamp) already shown to the user. */
  lastReportSeenFor: number | null
}

/** A position as read from chain (live) or sample data (demo). */
export interface Position {
  hype: number
  khype: number
  representedHype: number
  rate: number
  blockNumber: number
  timestamp: number
  stale: boolean
}

/** Minimal local analytics event — device-local only, no PII (PRD §18). */
export interface AnalyticsEvent {
  name:
    | 'wallet_connected'
    | 'settlement_generated'
    | 'demo_opened'
    | 'report_viewed'
    | 'project_started'
    | 'project_completed'
    | 'share_generated'
    | 'snapshot_consent'
  at: number
  meta?: Record<string, string | number | boolean>
}
