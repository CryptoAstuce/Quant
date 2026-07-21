import { useNavigate } from 'react-router'
import { useAccount } from 'wagmi'
import { ArrowRight, Coins, Eye, Hammer, ScrollText, Sprout } from 'lucide-react'
import { ConnectButton } from '@/components/ConnectButton'
import { SettlementCanvas } from '@/components/world/SettlementCanvas'
import { DEMO_POSITION } from '@/lib/demo'
import { LINKS } from '@/lib/chain'

export default function Landing() {
  const navigate = useNavigate()
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-background">
      {/* top bar */}
      <header className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
        <img src="/assets/mascot-sprite.png" alt="Quant mascot" className="h-9 w-auto pixelated" />
        <div className="leading-tight">
          <div className="font-pixel text-[13px] uppercase tracking-wider text-[#bfe3d0]">Quant</div>
          <div className="text-[10px] text-muted-foreground">a living world for Kinetiq</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => navigate('/demo')}
            className="rounded-lg border border-[#2a4547] px-3 py-1.5 font-pixel text-[9px] uppercase text-[#bfe3d0] hover:bg-[#123026]"
          >
            Try demo
          </button>
          {isConnected && (
            <button
              onClick={() => navigate('/world')}
              className="rounded-lg border border-[#1d6b63] bg-[#2fa4a8] px-3 py-1.5 font-pixel text-[9px] uppercase text-[#06282a] hover:bg-[#3fbcc0]"
            >
              My world
            </button>
          )}
        </div>
      </header>

      {/* hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-8 lg:grid-cols-2">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#2a4547] bg-[#0e2018] px-3 py-1 text-[10px] text-[#5fd08a]">
            <Eye className="h-3 w-3" /> Read-only · HyperEVM · for Kinetiq
          </div>
          <h1 className="font-pixel text-3xl leading-tight text-[#e8f2e4] sm:text-4xl">
            Watch your <span className="text-[#5fd08a]">HYPE</span> go to work.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Quant turns your Kinetiq position into a living 2D settlement. Staked HYPE becomes a working mascot crew,
            real position growth becomes visible progress, and every return reveals what happened while you were away.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <ConnectButton />
            <button
              onClick={() => navigate('/demo')}
              className="pixel-btn border-[#2a4547] bg-[#123026] px-5 py-3 text-[#bfe3d0] hover:bg-[#1a3a30]"
            >
              Explore the demo <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            No signatures, no transactions, no seed phrases — ever. The MVP only reads public on-chain data.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 rounded-2xl bg-[#2fa4a8]/10 blur-xl" aria-hidden />
          <div className="relative overflow-hidden rounded-xl border border-[#2a4547]">
            <img src="/assets/mascot-hero.png" alt="Quant, the official-style Kinetiq mascot" className="h-full w-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0b1f1a] to-transparent p-4">
              <div className="font-pixel text-[10px] uppercase text-[#bfe3d0]">Quant — your crew foreman</div>
              <div className="text-[11px] text-muted-foreground">Guide, storyteller, and field enthusiast</div>
            </div>
          </div>
        </div>
      </section>

      {/* live world preview */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-pixel text-[13px] uppercase tracking-wider text-[#bfe3d0]">A settlement, alive right now</h2>
          <span className="text-[10px] text-[#f2c14e]">sample world — demo data</span>
        </div>
        <SettlementCanvas position={DEMO_POSITION} isDemo seedKey="landing-preview" interactive={false} />
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          This preview uses sample data. Connect a wallet and your real position generates its own deterministic world.
        </p>
      </section>

      {/* how the world maps to your position */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-4 font-pixel text-[13px] uppercase tracking-wider text-[#bfe3d0]">Every pixel means something</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MapCard icon={<Sprout className="h-5 w-5 text-[#5fd08a]" />} title="Staking field = kHYPE">
            Your kHYPE becomes a working field. Bigger positions unlock richer world tiers — with a hard cap on crew
            size, so whales never melt your browser.
          </MapCard>
          <MapCard icon={<Coins className="h-5 w-5 text-[#f2c14e]" />} title="Crates = idle HYPE">
            Unstaked HYPE sits as crate stacks by the Treasury: capacity that isn't working yet. Exact numbers always
            live in the Treasury panel.
          </MapCard>
          <MapCard icon={<ScrollText className="h-5 w-5 text-[#7ab8d8]" />} title="Away Report = real change">
            Daily snapshots (stored on your device, with consent) power a neutral report: "represented value changed",
            never invented yield claims.
          </MapCard>
          <MapCard icon={<Hammer className="h-5 w-5 text-[#c49ae8]" />} title="Projects = pure play">
            Cosmetic builds earn World XP — a game score that is not kPoints and never converts into money. Returning
            is rewarded, trading is not.
          </MapCard>
        </div>
      </section>

      {/* why kHYPE looks flat */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="pixel-panel grid items-center gap-6 p-6 md:grid-cols-[auto_1fr]">
          <img src="/assets/mascot-portrait.png" alt="" className="mx-auto h-28 w-auto" />
          <div>
            <h2 className="font-pixel text-[13px] uppercase tracking-wider text-[#bfe3d0]">
              “My kHYPE amount never changes — is it working?”
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Yes. kHYPE is reward-bearing: staking rewards accrue into the kHYPE→HYPE exchange rate instead of minting
              more tokens. Your kHYPE count stays flat while each kHYPE represents more HYPE. Quant shows both numbers
              side by side — token count <em>and</em> represented value — so the mechanic finally makes sense at a
              glance.{' '}
              <a href={LINKS.khypeDocs} target="_blank" rel="noreferrer" className="text-[#5fd08a] underline">
                Read the kHYPE docs
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-[#1d3a30] px-4 py-8">
        <div className="mx-auto max-w-6xl text-[11px] leading-relaxed text-muted-foreground">
          <p>
            Quant is an unofficial, read-only visualizer built for the Kinetiq ecosystem. It is not produced or endorsed
            by Kinetiq, and it provides no financial advice. Staking, vaults, smart contracts, market liquidity, and
            withdrawals carry risk. Nothing here guarantees APY, earnings, kPoints, or token value.
          </p>
          <p className="mt-2">
            <a href={LINKS.kinetiqDocs} target="_blank" rel="noreferrer" className="text-[#5fd08a] underline">
              Kinetiq docs
            </a>
            {' · '}
            <a href={LINKS.kinetiqContracts} target="_blank" rel="noreferrer" className="text-[#5fd08a] underline">
              Contracts & audits
            </a>
            {' · '}
            <a href={LINKS.kinetiqApp} target="_blank" rel="noreferrer" className="text-[#5fd08a] underline">
              Official Kinetiq app
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

function MapCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="pixel-panel p-4">
      <div className="mb-2">{icon}</div>
      <h3 className="font-pixel text-[10px] uppercase tracking-wider text-[#d8efe2]">{title}</h3>
      <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{children}</p>
    </div>
  )
}
