import {
  TILE,
  PAL,
  px,
  grass,
  pathTile,
  water,
  crop,
  pine,
  roundTree,
  rock,
  flowers,
  stump,
  crate,
  lantern,
  fountain,
  banner,
  windmillBase,
  windmillBlades,
  treasuryHall,
  bridge,
  signpost,
  construction,
  cloud,
} from './tiles'
import { WORLD_PX_H, WORLD_PX_W, type PropInstance, type World } from './world'
import type { Crew, Agent } from './crew'

/**
 * Canvas renderer. Static ground/props are pre-rendered once to an offscreen
 * layer; each frame only re-draws water, animated props, crew sprites,
 * particles, clouds, and the ambient tint. Entity counts are bounded by the
 * tier system, so frame cost stays flat even for the largest positions.
 */

export interface RendererOptions {
  reducedMotion: boolean
  /** 0..1 progress of the active construction project, if any. */
  getConstructionProgress: () => number | null
  /** Mascot sprite URL. */
  spriteUrl: string
  onReady?: () => void
}

export interface Renderer {
  stop: () => void
  redrawStatic: () => void
}

interface Particle {
  x: number
  y: number
  vy: number
  life: number
  maxLife: number
  char: string
}

export function startRenderer(canvas: HTMLCanvasElement, world: World, crew: Crew, opts: RendererOptions): Renderer {
  canvas.width = WORLD_PX_W
  canvas.height = WORLD_PX_H
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false

  const staticLayer = document.createElement('canvas')
  staticLayer.width = WORLD_PX_W
  staticLayer.height = WORLD_PX_H
  const sctx = staticLayer.getContext('2d')!
  sctx.imageSmoothingEnabled = false

  const sprite = new Image()
  sprite.src = opts.spriteUrl

  let particles: Particle[] = []
  let raf = 0
  let last = performance.now()
  let running = true
  let windmillAngle = 0
  let readyFired = false

  const clouds = [
    { x: 40, y: 26, s: 1.6, v: 3.1 },
    { x: 420, y: 60, s: 2.2, v: 2.2 },
    { x: 640, y: 18, s: 1.3, v: 3.8 },
  ]

  function drawStatic() {
    // ground
    for (let y = 0; y < world.ground.length; y++) {
      for (let x = 0; x < world.ground[y].length; x++) {
        const g = world.ground[y][x]
        const v = world.groundVariant[y][x]
        if (g === 'grass') grass(sctx, x * TILE, y * TILE, v)
        else if (g === 'path') pathTile(sctx, x * TILE, y * TILE, v)
        else if (g === 'soil') {
          // field tiles get crops; growth stage seeded per tile
          const idx = world.fieldTiles.findIndex((t) => t.x === x * TILE && t.y === y * TILE)
          const stage = idx >= 0 ? (world.cropStages[idx] as 0 | 1 | 2) : 0
          crop(sctx, x * TILE, y * TILE, stage)
        } else if (g === 'water') water(sctx, x * TILE, y * TILE, 0)
      }
    }

    // demo field gets a dashed sample-data border (PRD FR-10 visual marking)
    if (world.isDemoField && world.fieldTiles.length > 0) {
      const xs = world.fieldTiles.map((t) => t.x)
      const ys = world.fieldTiles.map((t) => t.y)
      const x0 = Math.min(...xs) - 2
      const y0 = Math.min(...ys) - 2
      const x1 = Math.max(...xs) + TILE + 2
      const y1 = Math.max(...ys) + TILE + 2
      sctx.save()
      sctx.strokeStyle = '#f2c14e'
      sctx.setLineDash([4, 3])
      sctx.lineWidth = 1.5
      sctx.strokeRect(x0, y0, x1 - x0, y1 - y0)
      sctx.restore()
    }

    // static props (construction + windmill blades are dynamic)
    const sorted = [...world.props].sort((a, b) => a.y - b.y)
    for (const p of sorted) drawProp(sctx, p, true)
  }

  function drawProp(c: CanvasRenderingContext2D, p: PropInstance, staticPass: boolean) {
    switch (p.kind) {
      case 'pine':
        pine(c, p.x, p.y)
        break
      case 'roundTree':
      case 'orchard':
        roundTree(c, p.x, p.y)
        if (p.kind === 'orchard') {
          px(c, p.x + 4, p.y + 2, 2, 2, '#e85a4a')
          px(c, p.x + 10, p.y + 4, 2, 2, '#e85a4a')
        }
        break
      case 'rock':
        rock(c, p.x, p.y)
        break
      case 'flowers':
        flowers(c, p.x, p.y, p.variant)
        break
      case 'stump':
        stump(c, p.x, p.y)
        break
      case 'crate':
        crate(c, p.x, p.y)
        break
      case 'lantern':
        lantern(c, p.x, p.y)
        break
      case 'fountain':
        fountain(c, p.x, p.y)
        break
      case 'banner':
        banner(c, p.x, p.y)
        break
      case 'windmill':
        windmillBase(c, p.x, p.y)
        break
      case 'treasury':
        treasuryHall(c, p.x, p.y)
        break
      case 'bridge':
        bridge(c, p.x, p.y, p.wTiles ?? 5)
        break
      case 'signpost':
        signpost(c, p.x, p.y)
        break
      case 'construction':
        if (!staticPass) {
          const progress = opts.getConstructionProgress() ?? 0
          construction(c, p.x, p.y, p.wTiles ?? 4, progress)
        }
        break
    }
  }

  function drawAgent(c: CanvasRenderingContext2D, a: Agent, now: number) {
    const walking = a.phase === 'travel'
    const bobSpeed = walking ? 10 : 2.5
    const bob = Math.sin(now / 1000 * bobSpeed + a.bobPhase)
    const bobY = walking ? Math.abs(bob) * -1.6 : 0

    let squashY = 1
    let jumpY = 0
    if (!walking && a.phase === 'act') {
      if (a.action === 'farm') squashY = 1 - (0.5 + 0.5 * Math.sin(now / 260 + a.bobPhase)) * 0.12
      if (a.action === 'rest') squashY = 0.9
      if (a.action === 'build') squashY = 1 - (0.5 + 0.5 * Math.sin(now / 180 + a.bobPhase)) * 0.08
      if (a.action === 'celebrate') jumpY = -Math.abs(Math.sin(now / 220 + a.bobPhase)) * 7
    }

    const W = 30
    const H = sprite.height > 0 ? (sprite.height / sprite.width) * W : 17
    const drawX = Math.round(a.x - W / 2)
    const drawY = Math.round(a.y - H + bobY + jumpY)

    // soft shadow
    c.globalAlpha = 0.22
    px(c, Math.round(a.x - 7), Math.round(a.y - 2), 14, 3, '#1d3a1d')
    c.globalAlpha = 1

    if (sprite.complete && sprite.naturalWidth > 0) {
      c.save()
      c.translate(drawX + W / 2, drawY + H)
      c.scale(a.dir * 1, squashY)
      c.drawImage(sprite, -W / 2, -H, W, H)
      c.restore()
    } else {
      // fallback blob while sprite loads (same silhouette, never a substitute character)
      px(c, drawX + 4, drawY + 4, W - 8, H - 4, '#2fa4a8')
      px(c, drawX + 8, drawY + 7, 4, 2, '#f4f1e6')
      px(c, drawX + 17, drawY + 7, 4, 2, '#f4f1e6')
      px(c, drawX + 9, drawY + 11, 12, 3, '#d4453a')
    }

    // action overlays
    if (!walking && a.phase === 'act') {
      if (a.action === 'build') {
        const swing = Math.sin(now / 160 + a.bobPhase) * 2
        px(c, Math.round(a.x + a.dir * (7 + swing)), Math.round(a.y - 12), 5, 2, PAL.woodDark)
        px(c, Math.round(a.x + a.dir * (11 + swing)), Math.round(a.y - 14), 3, 3, PAL.stone)
      }
      if (a.action === 'rest' && Math.floor(now / 900) % 2 === 0) {
        c.fillStyle = '#e8f2f8'
        c.font = '6px monospace'
        c.fillText('z', Math.round(a.x + 8), Math.round(a.y - 14 - (now % 1800) / 300))
      }
    }
    // carried crate
    if (a.action === 'carry' && walking) {
      px(c, Math.round(a.x - 4), Math.round(drawY - 6), 8, 6, PAL.wood)
      px(c, Math.round(a.x - 4), Math.round(drawY - 6), 8, 1, '#a07a4f')
      px(c, Math.round(a.x - 1), Math.round(drawY - 6), 1, 6, PAL.woodDark)
    }
  }

  function spawnSparkle(x: number, y: number) {
    particles.push({ x, y, vy: -6 - Math.random() * 6, life: 0, maxLife: 900, char: '✦' })
    if (particles.length > 60) particles = particles.slice(-60)
  }

  let lastFarmSparkle = 0

  function frame(now: number) {
    if (!running) return
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now

    crew.update(now, dt)
    windmillAngle += dt * 0.6

    ctx.clearRect(0, 0, WORLD_PX_W, WORLD_PX_H)
    ctx.drawImage(staticLayer, 0, 0)

    // animated water overlay (two frames, ~1.4s cycle)
    const wf = (Math.floor(now / 700) % 2) as 0 | 1
    for (let y = 0; y < world.ground.length; y++) {
      for (let x = 0; x < world.ground[y].length; x++) {
        if (world.ground[y][x] === 'water') water(ctx, x * TILE, y * TILE, wf)
      }
    }

    // dynamic props
    for (const p of world.props) {
      if (p.kind === 'construction') drawProp(ctx, p, false)
      if (p.kind === 'windmill') windmillBlades(ctx, p.x + 16, p.y + 12, windmillAngle)
      if (p.kind === 'lantern') {
        ctx.globalAlpha = 0.25 + 0.1 * Math.sin(now / 900 + p.variant)
        px(ctx, p.x + 4, p.y, 8, 8, PAL.lantern)
        ctx.globalAlpha = 1
      }
      if (p.kind === 'fountain' && wf === 1) {
        px(ctx, p.x + 14, p.y + 3, 3, 4, '#a8d8f0')
      }
    }

    // crew, sorted by y for depth
    const sortedAgents = [...crew.agents].sort((a, b) => a.y - b.y)
    for (const a of sortedAgents) {
      drawAgent(ctx, a, now)
      // occasional field sparkle while farming (purely cosmetic)
      if (a.action === 'farm' && a.phase === 'act' && now - lastFarmSparkle > 1400 && Math.random() < 0.3) {
        lastFarmSparkle = now
        spawnSparkle(a.x + (Math.random() - 0.5) * 10, a.y - 10)
      }
    }

    // particles
    particles = particles.filter((pt) => now - (pt.life || now) < pt.maxLife || pt.life === 0)
    for (const pt of particles) {
      if (pt.life === 0) pt.life = now
      const t = (now - pt.life) / pt.maxLife
      ctx.globalAlpha = 1 - t
      ctx.fillStyle = PAL.gold
      ctx.font = '7px monospace'
      ctx.fillText(pt.char, pt.x, pt.y + pt.vy * t * 4)
    }
    ctx.globalAlpha = 1

    // drifting clouds + shadows
    for (const cl of clouds) {
      cl.x += cl.v * dt
      if (cl.x > WORLD_PX_W + 60) cl.x = -80
      ctx.globalAlpha = 0.1
      px(ctx, Math.round(cl.x + 6), cl.y + 60, Math.round(26 * cl.s), 6, '#12301a')
      ctx.globalAlpha = 1
      cloud(ctx, Math.round(cl.x), cl.y, cl.s)
    }

    // gentle day cycle tint (subtle, full cycle ~4 minutes)
    const dayT = (Math.sin((now / 1000 / 240) * Math.PI * 2 - Math.PI / 2) + 1) / 2
    const nightAlpha = 0.16 * (1 - dayT)
    if (nightAlpha > 0.01) {
      ctx.globalAlpha = nightAlpha
      px(ctx, 0, 0, WORLD_PX_W, WORLD_PX_H, '#1b2a52')
      ctx.globalAlpha = 1
      // warm window glow at night
      ctx.globalAlpha = nightAlpha * 3
      px(ctx, 20 * TILE + 12 + 2, 4 * TILE + 32 + 2, 4, 4, PAL.lantern)
      px(ctx, 20 * TILE + 60 + 2, 4 * TILE + 32 + 2, 4, 4, PAL.lantern)
      ctx.globalAlpha = 1
    }

    if (!readyFired) {
      readyFired = true
      opts.onReady?.()
    }
    raf = requestAnimationFrame(frame)
  }

  function drawStill() {
    const now = performance.now()
    crew.update(now, 0)
    ctx.clearRect(0, 0, WORLD_PX_W, WORLD_PX_H)
    ctx.drawImage(staticLayer, 0, 0)
    for (let y = 0; y < world.ground.length; y++) {
      for (let x = 0; x < world.ground[y].length; x++) {
        if (world.ground[y][x] === 'water') water(ctx, x * TILE, y * TILE, 0)
      }
    }
    for (const p of world.props) {
      if (p.kind === 'construction') drawProp(ctx, p, false)
      if (p.kind === 'windmill') windmillBlades(ctx, p.x + 16, p.y + 12, 0.6)
    }
    const sortedAgents = [...crew.agents].sort((a, b) => a.y - b.y)
    for (const a of sortedAgents) drawAgent(ctx, a, now)
    cloud(ctx, 80, 26, 1.6)
    cloud(ctx, 460, 56, 2.2)
    if (!readyFired) {
      readyFired = true
      opts.onReady?.()
    }
  }

  drawStatic()
  if (opts.reducedMotion) {
    // FR-4: reduced motion renders the same world as a still frame; all
    // information remains available via DOM panels.
    drawStill()
  } else {
    raf = requestAnimationFrame(frame)
  }

  return {
    stop: () => {
      running = false
      cancelAnimationFrame(raf)
    },
    redrawStatic: () => {
      drawStatic()
      if (opts.reducedMotion) drawStill()
    },
  }
}
