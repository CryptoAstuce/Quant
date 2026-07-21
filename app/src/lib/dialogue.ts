/**
 * Quant's dialogue lines (PRD FR-4).
 *
 * Safety rules enforced by content: no invented balances, no guaranteed yield,
 * no live kPoints accrual, no trade encouragement. Educational lines explain
 * the kHYPE mechanic in plain language.
 */

export type DialogueMood =
  | 'welcome'
  | 'farming'
  | 'carrying'
  | 'building'
  | 'resting'
  | 'celebrating'
  | 'idle'
  | 'stale'
  | 'empty'

export const DIALOGUE: Record<DialogueMood, readonly string[]> = {
  welcome: [
    'Welcome to your settlement. Every field you see maps to your real Kinetiq position.',
    'This world is read-only — I watch your position, I never touch it.',
    'Your crew is a picture of your position, not a counter. Exact numbers live in the Treasury.',
  ],
  farming: [
    'Your kHYPE balance stays the same — its represented HYPE value is what moves.',
    'The field shows your kHYPE at work. The Treasury shows the exact numbers.',
    'Staking rewards show up in the kHYPE-to-HYPE rate, not in your token count.',
  ],
  carrying: [
    'Carrying supplies. Cosmetic work only — it never changes your position.',
    'World XP is a game score. It is not kPoints and never becomes HYPE.',
  ],
  building: [
    'This project is pure decoration. Nice to look at, zero effect on yield.',
    'Buildings level up the world, not your returns.',
  ],
  resting: [
    'Even resting crews represent a position that keeps working on-chain.',
    'The world keeps going while you are away. Come back for the Away Report.',
  ],
  celebrating: [
    'Project complete! Cosmetic, but genuinely yours.',
    'Welcome back. Check the Away Report for what changed while you were gone.',
  ],
  idle: [
    'Watch your HYPE go to work.',
    'Every wallet gets a world. This one is yours.',
    'I am Quant — foreman, guide, and full-time field enthusiast.',
  ],
  stale: [
    'The network is unreachable, so these numbers are from an earlier block. Treat them as stale.',
    'I stopped the crew counters — no fresh chain data, no claims of current value.',
  ],
  empty: [
    'No Kinetiq position detected yet. Enjoy the demo field — it is sample data, not real capital.',
    'This is a starter plot. Stake through the official Kinetiq app and your real crew moves in.',
  ],
}

export function lineFor(mood: DialogueMood, index: number): string {
  const lines = DIALOGUE[mood]
  return lines[index % lines.length]
}
