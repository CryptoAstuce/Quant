/**
 * Pixel-art painters for the settlement world. Everything is drawn with raw
 * rects on a low-resolution canvas (TILE=16 game px) and upscaled by CSS with
 * smoothing disabled, which keeps the chunky pixel look of the reference art.
 */

export const TILE = 16

export type Painter = (ctx: CanvasRenderingContext2D, x: number, y: number) => void

export function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c
  ctx.fillRect(x, y, w, h)
}

/* ------------------------------- palette ------------------------------- */
export const PAL = {
  grassA: '#67b34b',
  grassB: '#5da844',
  grassC: '#71bd52',
  grassDark: '#4c8f39',
  path: '#c9b98a',
  pathDark: '#b3a276',
  pathLight: '#d8c89c',
  waterA: '#3f8fd2',
  waterB: '#4a9ede',
  waterDeep: '#2f7cc0',
  soil: '#8a6844',
  soilDark: '#755635',
  cropYoung: '#7ec850',
  cropRipe: '#e8c33c',
  trunk: '#6d4a2f',
  pineA: '#2e7d46',
  pineB: '#379055',
  leafA: '#3f9e4d',
  leafB: '#4fb35c',
  stone: '#9aa3a8',
  stoneDark: '#7d868c',
  roof: '#d4562e',
  roofDark: '#b54424',
  wall: '#e8ddc4',
  wallDark: '#cbbb9c',
  wood: '#8a6844',
  woodDark: '#6d4f30',
  gold: '#f2c14e',
  lantern: '#ffd97a',
  white: '#f4f1e6',
}

/* -------------------------------- tiles -------------------------------- */

export function grass(ctx: CanvasRenderingContext2D, x: number, y: number, v: number) {
  px(ctx, x, y, TILE, TILE, v % 2 === 0 ? PAL.grassA : PAL.grassB)
  // speckles
  const s = (v * 7919) % 13
  px(ctx, x + (s % 7) + 2, y + (s % 5) + 3, 1, 1, PAL.grassDark)
  px(ctx, x + ((s * 3) % 11) + 2, y + ((s * 5) % 9) + 4, 1, 1, PAL.grassC)
}

export function pathTile(ctx: CanvasRenderingContext2D, x: number, y: number, v: number) {
  px(ctx, x, y, TILE, TILE, PAL.path)
  if (v % 3 === 0) px(ctx, x + 3, y + 4, 4, 3, PAL.pathDark)
  if (v % 4 === 0) px(ctx, x + 9, y + 10, 5, 3, PAL.pathLight)
  if (v % 5 === 0) px(ctx, x + 11, y + 3, 3, 2, PAL.pathDark)
}

export function water(ctx: CanvasRenderingContext2D, x: number, y: number, frame: 0 | 1) {
  px(ctx, x, y, TILE, TILE, frame === 0 ? PAL.waterA : PAL.waterB)
  const off = frame === 0 ? 0 : 3
  px(ctx, x + 2 + off, y + 4, 4, 1, PAL.waterDeep)
  px(ctx, x + 8 - off, y + 10, 5, 1, PAL.waterDeep)
  px(ctx, x + 5 + off, y + 13, 3, 1, '#7cc0ea')
}

export function soil(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, x, y, TILE, TILE, PAL.soil)
  px(ctx, x, y + 3, TILE, 1, PAL.soilDark)
  px(ctx, x, y + 8, TILE, 1, PAL.soilDark)
  px(ctx, x, y + 13, TILE, 1, PAL.soilDark)
}

export function crop(ctx: CanvasRenderingContext2D, x: number, y: number, stage: 0 | 1 | 2) {
  soil(ctx, x, y)
  if (stage === 0) {
    px(ctx, x + 7, y + 9, 2, 4, PAL.cropYoung)
  } else if (stage === 1) {
    px(ctx, x + 6, y + 6, 2, 7, PAL.cropYoung)
    px(ctx, x + 9, y + 7, 2, 6, PAL.cropYoung)
    px(ctx, x + 5, y + 5, 4, 1, PAL.cropYoung)
  } else {
    px(ctx, x + 6, y + 4, 2, 9, PAL.cropYoung)
    px(ctx, x + 9, y + 5, 2, 8, PAL.cropYoung)
    px(ctx, x + 5, y + 2, 6, 4, PAL.cropRipe)
    px(ctx, x + 6, y + 3, 1, 1, '#c99b2a')
    px(ctx, x + 9, y + 4, 1, 1, '#c99b2a')
  }
}

/* -------------------------------- props -------------------------------- */

export function pine(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // occupies ~1.5 tiles high; x,y = base tile origin
  px(ctx, x + 6, y + 9, 4, 7, PAL.trunk)
  px(ctx, x + 2, y + 6, 12, 4, PAL.pineA)
  px(ctx, x + 3, y + 2, 10, 4, PAL.pineB)
  px(ctx, x + 5, y - 2, 6, 4, PAL.pineA)
  px(ctx, x + 6, y - 4, 4, 2, PAL.pineB)
  px(ctx, x + 3, y + 7, 2, 1, '#256b3b')
  px(ctx, x + 10, y + 4, 2, 1, '#256b3b')
}

export function roundTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, x + 6, y + 8, 4, 8, PAL.trunk)
  px(ctx, x + 2, y - 2, 12, 10, PAL.leafA)
  px(ctx, x + 1, y + 1, 14, 6, PAL.leafA)
  px(ctx, x + 3, y - 1, 4, 3, PAL.leafB)
  px(ctx, x + 9, y + 4, 3, 2, '#2f7d3c')
}

export function rock(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, x + 3, y + 9, 10, 5, PAL.stone)
  px(ctx, x + 5, y + 7, 6, 2, PAL.stone)
  px(ctx, x + 5, y + 9, 3, 2, '#b8c0c4')
  px(ctx, x + 9, y + 12, 4, 2, PAL.stoneDark)
}

export function flowers(ctx: CanvasRenderingContext2D, x: number, y: number, v: number) {
  const cols = ['#e86a92', '#f2e14e', '#f4f1e6', '#b478e8']
  const c = cols[v % cols.length]
  px(ctx, x + 4, y + 10, 1, 3, PAL.grassDark)
  px(ctx, x + 4, y + 8, 2, 2, c)
  px(ctx, x + 10, y + 12, 1, 2, PAL.grassDark)
  px(ctx, x + 10, y + 10, 2, 2, cols[(v + 1) % cols.length])
}

export function stump(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, x + 5, y + 9, 7, 5, PAL.wood)
  px(ctx, x + 5, y + 9, 7, 2, '#a07a4f')
  px(ctx, x + 7, y + 10, 3, 1, PAL.woodDark)
}

/** Crate stack — represents idle (unstaked) HYPE capacity near the Treasury. */
export function crate(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, x + 2, y + 6, 12, 9, PAL.wood)
  px(ctx, x + 2, y + 6, 12, 2, '#a07a4f')
  px(ctx, x + 2, y + 13, 12, 2, PAL.woodDark)
  px(ctx, x + 7, y + 6, 2, 9, PAL.woodDark)
  px(ctx, x + 4, y + 8, 2, 2, PAL.gold)
}

export function lantern(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, x + 7, y + 4, 2, 11, PAL.woodDark)
  px(ctx, x + 5, y + 1, 6, 5, PAL.wood)
  px(ctx, x + 6, y + 2, 4, 3, PAL.lantern)
  px(ctx, x + 7, y + 3, 2, 1, '#fff3c4')
}

export function fountain(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 2x2 tiles
  px(ctx, x, y + 8, 32, 20, PAL.stone)
  px(ctx, x + 2, y + 10, 28, 16, PAL.stoneDark)
  px(ctx, x + 4, y + 12, 24, 12, PAL.waterA)
  px(ctx, x + 13, y + 2, 6, 10, PAL.stone)
  px(ctx, x + 11, y, 10, 4, PAL.stoneDark)
  px(ctx, x + 14, y + 4, 4, 6, '#7cc0ea')
  px(ctx, x + 8, y + 15, 4, 1, '#7cc0ea')
  px(ctx, x + 20, y + 18, 5, 1, '#7cc0ea')
}

export function banner(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // spans 3 tiles wide, drawn above path
  px(ctx, x, y - 10, 2, 26, PAL.woodDark)
  px(ctx, x + 46, y - 10, 2, 26, PAL.woodDark)
  px(ctx, x + 2, y - 8, 44, 1, '#3b3327')
  const flags = ['#e86a92', '#f2c14e', '#2fa4a8', '#f4f1e6', '#b478e8', '#e8734a']
  for (let i = 0; i < 6; i++) {
    const fx = x + 4 + i * 7
    px(ctx, fx, y - 7, 5, 5, flags[i])
    px(ctx, fx + 1, y - 2, 3, 2, flags[i])
  }
}

export function windmillBase(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 2 tiles wide, 3 tall; blades drawn separately (animated)
  px(ctx, x + 4, y + 16, 24, 32, PAL.wall)
  px(ctx, x + 4, y + 16, 24, 4, PAL.wallDark)
  px(ctx, x + 2, y + 10, 28, 8, PAL.roofDark)
  px(ctx, x + 6, y + 4, 20, 8, PAL.roof)
  px(ctx, x + 12, y + 30, 8, 18, PAL.woodDark)
  px(ctx, x + 14, y + 32, 4, 4, '#3b3327')
  px(ctx, x + 20, y + 22, 4, 4, '#5a7d9c')
}

export function windmillBlades(ctx: CanvasRenderingContext2D, cx: number, cy: number, angle: number) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2)
    px(ctx, -1, -16, 3, 14, '#e8ddc4')
    px(ctx, 1, -16, 2, 10, '#cbbb9c')
  }
  ctx.restore()
  px(ctx, cx - 2, cy - 2, 4, 4, PAL.woodDark)
}

/** The Treasury hall — 5 tiles wide, 4 tall, red-roofed like the reference. */
export function treasuryHall(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const W = 80
  px(ctx, x + 4, y + 20, W - 8, 40, PAL.wall)
  px(ctx, x + 4, y + 20, W - 8, 5, PAL.wallDark)
  // roof
  px(ctx, x, y + 12, W, 10, PAL.roof)
  px(ctx, x + 6, y + 4, W - 12, 8, PAL.roof)
  px(ctx, x + 16, y, W - 32, 4, PAL.roofDark)
  px(ctx, x, y + 20, W, 2, PAL.roofDark)
  // door
  px(ctx, x + 34, y + 38, 12, 22, PAL.woodDark)
  px(ctx, x + 37, y + 41, 6, 6, '#3b3327')
  // windows
  px(ctx, x + 12, y + 32, 8, 8, '#5a7d9c')
  px(ctx, x + 60, y + 32, 8, 8, '#5a7d9c')
  px(ctx, x + 14, y + 34, 4, 4, '#a8c8dc')
  px(ctx, x + 62, y + 34, 4, 4, '#a8c8dc')
  // kHYPE-green banner on the gable
  px(ctx, x + 36, y + 6, 8, 10, '#2fa4a8')
  px(ctx, x + 38, y + 8, 4, 4, PAL.gold)
  // steps
  px(ctx, x + 30, y + 60, 20, 4, PAL.stoneDark)
}

export function bridge(ctx: CanvasRenderingContext2D, x: number, y: number, wTiles: number) {
  const W = wTiles * TILE
  px(ctx, x, y + 2, W, 12, PAL.wood)
  for (let i = 0; i < W; i += 8) px(ctx, x + i, y + 2, 1, 12, PAL.woodDark)
  px(ctx, x, y, W, 2, '#a07a4f')
  px(ctx, x, y + 14, W, 2, PAL.woodDark)
}

export function signpost(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, x + 7, y + 6, 2, 9, PAL.woodDark)
  px(ctx, x + 2, y + 2, 12, 5, PAL.wood)
  px(ctx, x + 3, y + 3, 10, 1, '#a07a4f')
}

/** Construction site scaffold for the active cosmetic project. */
export function construction(ctx: CanvasRenderingContext2D, x: number, y: number, wTiles: number, progress: number) {
  const W = wTiles * TILE
  // dirt patch
  px(ctx, x, y + 8, W, 20, PAL.soil)
  px(ctx, x, y + 8, W, 2, PAL.soilDark)
  // scaffold poles
  px(ctx, x + 2, y, 2, 28, PAL.woodDark)
  px(ctx, x + W - 4, y, 2, 28, PAL.woodDark)
  px(ctx, x + 2, y + 2, W - 4, 2, PAL.wood)
  // progress fill: rising wall
  const wallH = Math.floor(20 * Math.min(1, Math.max(0, progress)))
  if (wallH > 0) {
    px(ctx, x + 6, y + 28 - wallH, W - 12, wallH, PAL.stone)
    px(ctx, x + 6, y + 28 - wallH, W - 12, 2, PAL.stoneDark)
  }
  // scattered tools
  px(ctx, x + 8, y + 24, 4, 2, PAL.woodDark)
  px(ctx, x + W - 14, y + 25, 5, 1, PAL.stone)
}

export function cloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.globalAlpha = 0.92
  px(ctx, 0, 4, 26, 8, '#ffffff')
  px(ctx, 5, 0, 14, 6, '#ffffff')
  px(ctx, 3, 10, 20, 3, '#dceaf2')
  ctx.restore()
  ctx.globalAlpha = 1
}
