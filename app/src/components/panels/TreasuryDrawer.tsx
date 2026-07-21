import { useState } from 'react'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { PixelModal } from './PixelModal'
import { formatTimestamp, formatToken } from '@/lib/format'
import { CONTRACTS, CONTRACTS_VERIFIED_AT, LINKS } from '@/lib/chain'
import { useGame } from '@/state/game'
import type { Position } from '@/lib/types'

/**
 * The Treasury truth layer (PRD FR-5): exact balances, represented values,
 * data source, timestamps — and a hard visual separation between chain facts,
 * snapshot history, and game state. The crew is labeled a representation,
 * never a conversion unit.
 */
export function TreasuryDrawer({
  position,
  isDemo,
  onClose,
  onRefresh,
  refreshing,
  onExplainer,
}: {
  position: Position | null
  isDemo: boolean
  onClose: () => void
  onRefresh?: () => void
  refreshing?: boolean
  onExplainer: (topic: string) => void
}) {
  const snapshots = useGame((s) => s.state.snapshots)
  const xp = useGame((s) => s.state.xp)
  const [openTopic, setOpenTopic] = useState<string | null>(null)

  const toggleTopic = (topic: string) => {
    setOpenTopic((cur) => (cur === topic ? null : topic))
    onExplainer(topic)
  }

  return (
    <PixelModal title="Treasury — exact values" onClose={onClose} wide>
      {isDemo && (
        <div className="mb-3 rounded-lg border border-[#8a6a1f] bg-[#2a2108] px-3 py-2 text-xs text-[#f2c14e]">
          Sample data — this is the demo Treasury, not a real position.
        </div>
      )}

      {position?.stale && (
        <div className="mb-3 rounded-lg border border-[#7c3a2a] bg-[#2a120c] px-3 py-2 text-xs text-[#e8734a]">
          RPC unavailable — showing the last known values. They may be stale; no current-value claims are made.
        </div>
      )}

      {/* on-chain facts */}
      <Section label="On-chain now" tone="chain">
        <Row label="Native HYPE balance" value={`${formatToken(position?.hype ?? NaN)} HYPE`} full={`${position?.hype ?? ''} HYPE`} />
        <Row label="kHYPE balance" value={`${formatToken(position?.khype ?? NaN)} kHYPE`} full={`${position?.khype ?? ''} kHYPE`} />
        <Row
          label="Represented HYPE value"
          hint="kHYPE balance × current kHYPE→HYPE rate"
          value={`${formatToken(position?.representedHype ?? NaN)} HYPE`}
          full={`${position?.representedHype ?? ''} HYPE`}
        />
        <Row label="kHYPE → HYPE rate" value={position ? formatToken(position.rate, 6) : '—'} full={`${position?.rate ?? ''}`} />
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
          <span>Block #{position?.blockNumber.toLocaleString() ?? '—'}</span>
          <span>Updated {position ? formatTimestamp(position.timestamp) : '—'}</span>
          {!isDemo && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1 rounded border border-[#2a4547] px-1.5 py-0.5 text-[10px] text-[#bfe3d0] hover:bg-[#123026] disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh at new block
            </button>
          )}
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
          Source: HyperEVM RPC + Kinetiq StakingAccountant ({CONTRACTS.stakingAccountant.slice(0, 8)}…), addresses last
          verified {CONTRACTS_VERIFIED_AT}. Values displayed with up to 4 decimals (full precision on hover).
        </p>
      </Section>

      {/* kPoints — honest unavailable state (PRD FR-8) */}
      <Section label="kPoints" tone="chain">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Confirmed kPoints are not available through an authorized public feed, so Quant shows none — and never
          estimates or animates them. Check the official source for confirmed distributions.
        </p>
        <a
          href={LINKS.kPoints}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-xs text-[#5fd08a] underline"
        >
          Official kPoints info <ExternalLink className="h-3 w-3" />
        </a>
      </Section>

      {/* snapshot history */}
      <Section label="Snapshot history (stored on this device)" tone="snapshot">
        {snapshots.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No snapshots yet. With your consent, Quant stores a daily snapshot to power the Away Report.
          </p>
        ) : (
          <ul className="space-y-1 text-xs">
            {snapshots.slice(-4).map((s) => (
              <li key={s.timestamp} className="flex justify-between gap-2 text-muted-foreground">
                <span>{formatTimestamp(s.timestamp)} · block #{s.blockNumber.toLocaleString()}</span>
                <span className="text-[#d8efe2]">{formatToken(s.representedHype)} HYPE</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* game state — clearly separated */}
      <Section label="Game state (not financial data)" tone="game">
        <Row label="World XP" value={`${xp} XP`} />
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          World XP is cosmetic progression earned by returning, learning, and finishing decorative projects. It is not
          kPoints, cannot be transferred, and never converts into HYPE, kHYPE, or any promised value.
        </p>
      </Section>

      {/* representation label + education */}
      <Section label="What the world shows" tone="info">
        <p className="text-xs leading-relaxed text-muted-foreground">
          The mascot crew is a <span className="text-[#d8efe2]">visual representation</span> of your position — not a
          conversion unit (never "1 mascot = 1 kHYPE"). Exact values live here, in the Treasury.
        </p>
        <div className="mt-2 space-y-1">
          <Explainer
            id="khype-mechanic"
            title="Why doesn't my kHYPE amount go up?"
            open={openTopic === 'khype-mechanic'}
            onToggle={toggleTopic}
          >
            kHYPE is reward-bearing: staking rewards accrue into the kHYPE→HYPE exchange rate rather than minting new
            kHYPE to your wallet. Your token count stays flat while each kHYPE represents more HYPE. That is why the
            Treasury shows both numbers separately.
          </Explainer>
          <Explainer
            id="represented-value"
            title="What is “represented HYPE value”?"
            open={openTopic === 'represented-value'}
            onToggle={toggleTopic}
          >
            It is your kHYPE balance converted at the current on-chain kHYPE→HYPE rate, read from Kinetiq's
            StakingAccountant contract. It is a conversion, not a price prediction, and it can move down as well as up.
          </Explainer>
          <Explainer
            id="risks"
            title="What are the risks?"
            open={openTopic === 'risks'}
            onToggle={toggleTopic}
          >
            Liquid staking involves smart-contract risk, validator performance risk, market liquidity risk when trading
            kHYPE, and withdrawal queue timing. Quant is a read-only visualizer and provides no financial advice.
          </Explainer>
        </div>
      </Section>
    </PixelModal>
  )
}

function Section({ label, tone, children }: { label: string; tone: 'chain' | 'snapshot' | 'game' | 'info'; children: React.ReactNode }) {
  const tones = {
    chain: 'border-[#2a5a4a] text-[#5fd08a]',
    snapshot: 'border-[#5a5a2a] text-[#d8d06a]',
    game: 'border-[#6a4a7a] text-[#c49ae8]',
    info: 'border-[#2a4547] text-[#7ab8d8]',
  } as const
  return (
    <section className={`mb-3 rounded-lg border-l-4 bg-[#0d211a] px-3 py-2 ${tones[tone].split(' ')[0]}`}>
      <h3 className={`mb-1 font-pixel text-[9px] uppercase tracking-wider ${tones[tone].split(' ')[1]}`}>{label}</h3>
      {children}
    </section>
  )
}

function Row({ label, value, hint, full }: { label: string; value: string; hint?: string; full?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <div className="text-xs text-muted-foreground">
        {label}
        {hint && <div className="text-[9px] text-muted-foreground/70">{hint}</div>}
      </div>
      <div className="font-pixel text-[11px] text-[#e8f2e4]" title={full}>
        {value}
      </div>
    </div>
  )
}

function Explainer({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string
  title: string
  open: boolean
  onToggle: (id: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded border border-[#2a4547]">
      <button onClick={() => onToggle(id)} className="flex w-full items-center justify-between px-2 py-1.5 text-left text-xs text-[#bfe3d0] hover:bg-[#123026]">
        {title}
        <span className="font-pixel text-[9px]">{open ? '−' : '+'}</span>
      </button>
      {open && <p className="border-t border-[#2a4547] px-2 py-2 text-[11px] leading-relaxed text-muted-foreground">{children}</p>}
    </div>
  )
}
