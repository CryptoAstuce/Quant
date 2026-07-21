import type { Position } from './types'

/**
 * Sample position for demo mode (PRD FR-10). Every surface that shows these
 * values must label them as sample data — demo workers are never presented
 * as real productive capital.
 */
export const DEMO_POSITION: Position = {
  hype: 128.42,
  khype: 96.2,
  representedHype: 96.2 * 1.021471,
  rate: 1.021471,
  blockNumber: 40_656_184,
  timestamp: Date.now(),
  stale: false,
}
