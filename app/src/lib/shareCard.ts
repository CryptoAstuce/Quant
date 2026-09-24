import { formatToken } from './format'
import type { Tier } from './tiers'

/**
 * Privacy-safe share card (PRD FR-9). Rendered on a dedicated 1200×630 canvas —
 * never a screenshot of the live screen. Wallet address and exact balances are
 * hidden by default; values appear only after explicit user opt-in. The card
 * always carries the "visualized from on-chain data" label and the unofficial
 * project disclosure.
 */

export type ShareValueMode = 'hidden' | 'rounded' | 'exact'

export interface ShareCardInput {
  tier: Tier
  level: number
  activeDays: number
  crewCount: number
  mode: ShareValueMode
  representedHype: number
  isDemo: boolean
}

/** Keep value disclosure in one pure function so privacy modes are regression-tested. */
export function formatShareValue(
  mode: ShareValueMode,
  representedHype: number,
): { label: string; value: string } {
  if (mode === 'hidden') return { label: 'Position value', value: 'hidden' }
  if (mode === 'rounded') {
    return { label: 'Represented value', value: `${formatToken(representedHype, 0)} HYPE (rounded)` }
  }
  return { label: 'Represented value', value: `${formatToken(representedHype, 4)} HYPE` }
}

export async function renderShareCard(input: ShareCardInput): Promise<HTMLCanvasElement> {
  const W = 1200
  const H = 630
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // night-meadow backdrop
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#0b1f1a')
  bg.addColorStop(1, '#123026')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // snapshot of the live world canvas (already privacy-safe: no values in-world)
  const worldCanvas = document.getElementById('settlement-canvas') as HTMLCanvasElement | null
  if (worldCanvas) {
    const frame = { x: 60, y: 120, w: 660, h: 440 }
    ctx.save()
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = '#1a2f26'
    roundRect(ctx, frame.x - 8, frame.y - 8, frame.w + 16, frame.h + 16, 14)
    ctx.fill()
    ctx.drawImage(worldCanvas, frame.x, frame.y, frame.w, frame.h)
    ctx.strokeStyle = '#2a4547'
    ctx.lineWidth = 3
    roundRect(ctx, frame.x - 8, frame.y - 8, frame.w + 16, frame.h + 16, 14)
    ctx.stroke()
    ctx.restore()
  }

  // mascot
  const mascot = await loadImage('/assets/mascot-portrait.png')
  if (mascot) ctx.drawImage(mascot, 770, 120, 300, 173)

  // wordmark
  ctx.fillStyle = '#bfe3d0'
  ctx.font = '700 54px Silkscreen, monospace'
  ctx.fillText('QUANT', 60, 72)
  ctx.fillStyle = '#5fd08a'
  ctx.font = '400 22px Space Grotesk, sans-serif'
  ctx.fillText('Watch your HYPE go to work', 330, 70)

  // stats block
  const sx = 780
  let sy = 340
  ctx.font = '700 26px Silkscreen, monospace'
  ctx.fillStyle = '#e8f2e4'
  ctx.fillText(input.tier.label, sx, sy)
  sy += 44
  stat(ctx, 'Settlement level', `Lv ${input.level}`, sx, sy)
  sy += 36
  stat(ctx, 'Crew', `${input.crewCount} mascot${input.crewCount === 1 ? '' : 's'} at work`, sx, sy)
  sy += 36
  stat(ctx, 'Active days', `${input.activeDays}`, sx, sy)
  sy += 36

  // values: opt-in only
  const shareValue = formatShareValue(input.mode, input.representedHype)
  stat(ctx, shareValue.label, shareValue.value, sx, sy)

  if (input.isDemo) {
    ctx.fillStyle = '#f2c14e'
    ctx.font = '700 20px Silkscreen, monospace'
    ctx.fillText('SAMPLE WORLD — DEMO', 780, sy + 44)
  }

  // footer labels — mandatory provenance + disclosure
  ctx.fillStyle = '#7ab8d8'
  ctx.font = '400 17px Space Grotesk, sans-serif'
  ctx.fillText('Visualized from on-chain data on HyperEVM', 60, 586)
  ctx.fillStyle = '#5a7a70'
  ctx.font = '400 15px Space Grotesk, sans-serif'
  ctx.fillText('Quant is an unofficial, read-only visualizer for Kinetiq · not financial advice', 480, 586)

  return canvas
}

function stat(ctx: CanvasRenderingContext2D, label: string, value: string, x: number, y: number) {
  ctx.fillStyle = '#5a8a78'
  ctx.font = '400 15px Space Grotesk, sans-serif'
  ctx.fillText(label.toUpperCase(), x, y - 14)
  ctx.fillStyle = '#d8efe2'
  ctx.font = '700 22px Space Grotesk, sans-serif'
  ctx.fillText(value, x, y + 8)
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}
