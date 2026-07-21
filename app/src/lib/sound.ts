/**
 * Tiny WebAudio blip engine — no audio assets, just synthesized UI feedback.
 * Gated by the user's sound setting; never autoplays before interaction.
 */
let ctx: AudioContext | null = null

function ensureCtx(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function blip(freq: number, duration: number, type: OscillatorType, gain = 0.04, when = 0) {
  const ac = ensureCtx()
  if (!ac) return
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t = ac.currentTime + when
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(gain, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.connect(g).connect(ac.destination)
  osc.start(t)
  osc.stop(t + duration + 0.05)
}

export const sfx = {
  click(enabled: boolean) {
    if (enabled) blip(660, 0.08, 'square', 0.03)
  },
  open(enabled: boolean) {
    if (enabled) blip(440, 0.1, 'triangle', 0.04)
  },
  complete(enabled: boolean) {
    if (!enabled) return
    blip(523, 0.12, 'triangle', 0.05)
    blip(659, 0.12, 'triangle', 0.05, 0.1)
    blip(784, 0.2, 'triangle', 0.05, 0.2)
  },
  award(enabled: boolean) {
    if (!enabled) return
    blip(880, 0.08, 'sine', 0.04)
    blip(1174, 0.12, 'sine', 0.04, 0.07)
  },
}
