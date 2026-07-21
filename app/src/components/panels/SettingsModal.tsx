import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useDisconnect } from 'wagmi'
import { ExternalLink } from 'lucide-react'
import { PixelModal } from './PixelModal'
import { useSettings } from '@/state/settings'
import { useGame } from '@/state/game'
import { CONTRACTS_VERIFIED_AT, LINKS } from '@/lib/chain'

/** Settings & privacy (PRD §10.6). */
export function SettingsModal({ isDemo, onClose }: { isDemo: boolean; onClose: () => void }) {
  const { reducedMotion, setReducedMotion, sound, setSound, shareShowValues, setShareShowValues } = useSettings()
  const deleteAll = useGame((s) => s.deleteAll)
  const snapshotConsent = useGame((s) => s.state.snapshotConsent)
  const setSnapshotConsent = useGame((s) => s.setSnapshotConsent)
  const { disconnect } = useDisconnect()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <PixelModal title="Settings & privacy" onClose={onClose} wide>
      <div className="space-y-3">
        <SettingRow
          title="Reduced motion"
          desc="Renders the world as a still frame. All information and actions stay available (respects your OS setting by default)."
        >
          <Toggle checked={reducedMotion} onChange={setReducedMotion} />
        </SettingRow>

        <SettingRow title="Sound effects" desc="Synthesized UI blips only — no audio assets, never autoplay.">
          <Toggle checked={sound} onChange={setSound} />
        </SettingRow>

        <SettingRow title="Share-card values" desc="Default for position values on generated share cards.">
          <select
            value={shareShowValues}
            onChange={(e) => setShareShowValues(e.target.value as 'hidden' | 'rounded' | 'exact')}
            className="rounded border border-[#2a4547] bg-[#0a1a14] px-2 py-1 text-xs text-foreground"
          >
            <option value="hidden">Hidden</option>
            <option value="rounded">Rounded</option>
            <option value="exact">Exact</option>
          </select>
        </SettingRow>

        <SettingRow
          title="Snapshot storage"
          desc="Daily position snapshots power the Away Report. Stored only on this device, keyed to your wallet address — no identity required."
        >
          <Toggle checked={snapshotConsent === true} onChange={setSnapshotConsent} />
        </SettingRow>

        <SettingRow title="Delete my off-chain data" desc="Removes snapshots, World XP, projects, and tutorial state for this wallet from this device. Cannot be undone.">
          {confirmDelete ? (
            <button
              onClick={() => {
                deleteAll()
                setConfirmDelete(false)
              }}
              className="rounded border border-[#7c3a2a] bg-[#2a120c] px-2 py-1 text-xs text-[#e8734a]"
            >
              Confirm delete
            </button>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="rounded border border-[#2a4547] px-2 py-1 text-xs text-muted-foreground hover:text-[#e8734a]">
              Delete…
            </button>
          )}
        </SettingRow>

        {!isDemo && (
          <SettingRow title="Disconnect wallet" desc="Quant is read-only: it never requested and never stores keys, signatures, or approvals.">
            <button
              onClick={() => {
                disconnect()
                navigate('/')
              }}
              className="rounded border border-[#2a4547] px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Disconnect
            </button>
          </SettingRow>
        )}

        <section className="rounded-lg border border-[#2a4547] bg-[#0d211a] p-3 text-[10px] leading-relaxed text-muted-foreground">
          <h3 className="mb-1 font-pixel text-[9px] uppercase tracking-wider text-[#7ab8d8]">Data sources & risk disclosure</h3>
          <p>
            Balances and conversions are read from HyperEVM via Kinetiq's published contracts (addresses last verified{' '}
            {CONTRACTS_VERIFIED_AT}; re-checked against the{' '}
            <a href={LINKS.kinetiqContracts} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-[#5fd08a] underline">
              official contracts page <ExternalLink className="h-2.5 w-2.5" />
            </a>{' '}
            before each release). Snapshots and game state stay on this device.
          </p>
          <p className="mt-1">
            Staking, vaults, smart contracts, market liquidity, and withdrawals carry different risks. Quant guarantees
            no APY, earnings, kPoints, or token value, and provides no financial advice. Quant is an unofficial,
            read-only visualizer built for the Kinetiq ecosystem; it is not produced or endorsed by Kinetiq.
          </p>
        </section>
      </div>
    </PixelModal>
  )
}

function SettingRow({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-[#2a4547] bg-[#0d211a] px-3 py-2.5">
      <div>
        <div className="text-xs font-medium text-[#d8efe2]">{title}</div>
        <div className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{desc}</div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 rounded-full border transition-colors ${checked ? 'border-[#2fa4a8] bg-[#2fa4a8]' : 'border-[#2a4547] bg-[#0a1a14]'}`}
    >
      <span className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  )
}
