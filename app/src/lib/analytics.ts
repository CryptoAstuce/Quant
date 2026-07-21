import type { AnalyticsEvent } from './types'

/**
 * Minimal product analytics (PRD §18 Slice 3). Device-local only — events are
 * kept in localStorage for funnel inspection and never leave the device.
 * No wallet addresses or balances are recorded.
 */
const KEY = 'quant.analytics.v1'
const MAX_EVENTS = 500

export function track(name: AnalyticsEvent['name'], meta?: AnalyticsEvent['meta']) {
  try {
    const raw = localStorage.getItem(KEY)
    const events: AnalyticsEvent[] = raw ? JSON.parse(raw) : []
    events.push({ name, at: Date.now(), meta })
    localStorage.setItem(KEY, JSON.stringify(events.slice(-MAX_EVENTS)))
  } catch {
    /* analytics must never break the product */
  }
}
