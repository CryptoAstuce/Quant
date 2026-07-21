import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Global settings — device-level, not tied to a wallet (PRD §10.6).
 */
interface SettingsState {
  reducedMotion: boolean
  sound: boolean
  /** Share-card defaults: exact values off unless the user opts in (FR-9). */
  shareShowValues: 'hidden' | 'rounded' | 'exact'
  setReducedMotion: (v: boolean) => void
  setSound: (v: boolean) => void
  setShareShowValues: (v: 'hidden' | 'rounded' | 'exact') => void
}

function systemPrefersReduced(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      reducedMotion: systemPrefersReduced(),
      sound: true,
      shareShowValues: 'hidden',
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setSound: (sound) => set({ sound }),
      setShareShowValues: (shareShowValues) => set({ shareShowValues }),
    }),
    { name: 'quant.settings.v1' },
  ),
)
