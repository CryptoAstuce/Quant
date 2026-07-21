/**
 * Display formatting with documented rounding (PRD FR-2 / FR-5).
 *
 * Rule: values are displayed with up to 4 decimal places, trailing zeros
 * trimmed, half-up rounding. Full-precision values remain available via the
 * `title` tooltips rendered by components. No other transformation is applied.
 */
export function formatToken(value: number, maxDecimals = 4): string {
  if (!Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  if (abs > 0 && abs < 10 ** -maxDecimals) return `<0.${'0'.repeat(maxDecimals - 1)}1`
  const rounded = roundHalfUp(value, maxDecimals)
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  })
}

export function roundHalfUp(value: number, decimals: number): number {
  const f = 10 ** decimals
  return Math.round((value + Number.EPSILON) * f) / f
}

/** Signed delta, e.g. +0.0180 / -0.2500, used by the Away Report. */
export function formatDelta(value: number, maxDecimals = 4): string {
  if (!Number.isFinite(value)) return '—'
  const sign = value > 0 ? '+' : value < 0 ? '-' : '±'
  return `${sign}${formatToken(Math.abs(value), maxDecimals)}`
}

export function formatInt(value: number): string {
  return Math.floor(value).toLocaleString('en-US')
}

export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** "3d 4h" / "5h 12m" / "12m" style compact duration. */
export function formatDuration(ms: number): string {
  const mins = Math.round(ms / 60000)
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 48) return `${hours}h ${mins % 60}m`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}

export function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}
