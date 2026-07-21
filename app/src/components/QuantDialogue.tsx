import { useEffect, useState } from 'react'
import { DIALOGUE, type DialogueMood } from '@/lib/dialogue'

/**
 * Quant's speech bubble. Lines rotate within the current mood; every line is
 * pre-vetted against the financial-safety rules (no invented balances, no
 * guaranteed yield, no live kPoints).
 */
export function QuantDialogue({ mood, reducedMotion }: { mood: DialogueMood; reducedMotion: boolean }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    setIdx(0)
  }, [mood])

  useEffect(() => {
    if (reducedMotion) return // no auto-rotation under reduced motion
    const t = setInterval(() => setIdx((i) => i + 1), 9000)
    return () => clearInterval(t)
  }, [reducedMotion])

  const lines = DIALOGUE[mood]
  const line = lines[idx % lines.length]

  return (
    <div className="pointer-events-none flex items-end gap-3">
      <img
        src="/assets/mascot-portrait.png"
        alt="Quant, the Kinetiq mascot"
        className="h-16 w-auto drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] sm:h-20"
        draggable={false}
      />
      <div className="pointer-events-auto relative mb-2 max-w-xs rounded-lg border border-[#2a4547] bg-[#10261f]/95 px-3 py-2 shadow-[0_3px_0_rgba(0,0,0,0.4)]">
        <div className="absolute -left-[7px] bottom-3 h-3 w-3 rotate-45 border-b border-l border-[#2a4547] bg-[#10261f]" />
        <p className="text-[13px] leading-snug text-[#d8efe2]">
          <span className="mr-1 font-pixel text-[9px] uppercase text-[#5fd08a]">Quant</span>
          {line}
        </p>
        {lines.length > 1 && !reducedMotion && (
          <button
            className="mt-1 font-pixel text-[8px] uppercase text-muted-foreground underline"
            onClick={() => setIdx((i) => i + 1)}
          >
            next line
          </button>
        )}
      </div>
    </div>
  )
}
