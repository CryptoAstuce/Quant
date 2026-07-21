import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAccount } from 'wagmi'
import { SettlementCanvas } from '@/components/world/SettlementCanvas'
import { Hud, type PanelId } from '@/components/Hud'
import { QuantDialogue } from '@/components/QuantDialogue'
import { TreasuryDrawer } from '@/components/panels/TreasuryDrawer'
import { AwayReportModal } from '@/components/panels/AwayReportModal'
import { WorkshopModal } from '@/components/panels/WorkshopModal'
import { ShareCardModal } from '@/components/panels/ShareCardModal'
import { SettingsModal } from '@/components/panels/SettingsModal'
import { ConsentCard } from '@/components/panels/ConsentCard'
import { TutorialOverlay } from '@/components/TutorialOverlay'
import { usePosition } from '@/chain/usePosition'
import { DEMO_KEY, reportPair, useGame } from '@/state/game'
import { useSettings } from '@/state/settings'
import { DEMO_POSITION } from '@/lib/demo'
import { tierForRepresented } from '@/lib/tiers'
import { projectById } from '@/lib/projects'
import { LINKS } from '@/lib/chain'
import { track } from '@/lib/analytics'
import { sfx } from '@/lib/sound'
import type { DialogueMood } from '@/lib/dialogue'

export default function Settlement({ mode }: { mode: 'demo' | 'live' }) {
  const isDemo = mode === 'demo'
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()

  const live = usePosition(isDemo ? undefined : address)
  const position = isDemo ? DEMO_POSITION : live.position

  const game = useGame((s) => s.state)
  const bind = useGame((s) => s.bind)
  const reducedMotion = useSettings((s) => s.reducedMotion)
  const sound = useSettings((s) => s.sound)

  const [panel, setPanel] = useState<PanelId | null>(null)
  const [worldReady, setWorldReady] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [consentAsked, setConsentAsked] = useState(false)
  const [celebrateSignal, setCelebrateSignal] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const snapshotRecorded = useRef(false)
  const visitTouched = useRef(false)

  const seedKey = isDemo ? DEMO_KEY : (address ?? DEMO_KEY)
  const represented = position?.representedHype ?? 0
  const tier = useMemo(() => tierForRepresented(isDemo ? 50 : represented), [isDemo, represented])
  const hasRealPosition = !isDemo && tier.id !== 'empty'

  /* --------------------------- guards + binding -------------------------- */
  useEffect(() => {
    if (!isDemo && !isConnected) navigate('/')
  }, [isDemo, isConnected, navigate])

  useEffect(() => {
    bind(isDemo ? DEMO_KEY : address ?? DEMO_KEY)
  }, [bind, isDemo, address])

  useEffect(() => {
    if (isDemo) track('demo_opened')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* -------------------- visit tracking + return XP ----------------------- */
  useEffect(() => {
    if (visitTouched.current || useGame.getState().key !== seedKey) return
    visitTouched.current = true
    const { isReturnVisit } = useGame.getState().touchVisit()
    if (isReturnVisit) {
      const got = useGame.getState().awardXp('return_visit')
      if (got > 0) setToast(`Welcome back · +${got} World XP`)
    }
  }, [seedKey])

  /* --------------------------- daily snapshot ---------------------------- */
  useEffect(() => {
    if (!position || position.stale || snapshotRecorded.current) return
    if (game.snapshotConsent !== true) return
    snapshotRecorded.current = true
    useGame.getState().recordSnapshot({
      blockNumber: position.blockNumber,
      timestamp: position.timestamp,
      hype: position.hype,
      khype: position.khype,
      representedHype: position.representedHype,
      rate: position.rate,
    })
  }, [position, game.snapshotConsent])

  /* ------------------------ project completion watch --------------------- */
  useEffect(() => {
    const t = setInterval(() => {
      const done = useGame.getState().checkProjectCompletion()
      if (done) {
        const p = projectById(done)
        useGame.getState().awardXp('project_complete', p.name, p.xpReward)
        track('project_completed', { id: done })
        setCelebrateSignal((n) => n + 1)
        setToast(`${p.name} complete · +${p.xpReward} World XP`)
        sfx.complete(sound)
      }
    }, 1000)
    return () => clearInterval(t)
  }, [sound])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(t)
  }, [toast])

  /* --------------------- tutorial + consent sequencing ------------------- */
  useEffect(() => {
    if (worldReady && !game.tutorialDone) {
      const t = setTimeout(() => setShowTutorial(true), 700)
      return () => clearTimeout(t)
    }
  }, [worldReady, game.tutorialDone])

  /* ------------------------- away report on arrival ---------------------- */
  const { prev, latest } = reportPair(game)
  const reportAvailable = Boolean(prev && latest && game.lastReportSeenFor !== latest.timestamp)

  useEffect(() => {
    if (worldReady && game.tutorialDone && reportAvailable && latest) {
      const t = setTimeout(() => {
        setPanel('report')
        track('report_viewed')
        setCelebrateSignal((n) => n + 1)
      }, 1200)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worldReady, game.tutorialDone, reportAvailable])

  /* ------------------------------ dialogue ------------------------------- */
  const mood: DialogueMood = position?.stale
    ? 'stale'
    : !isDemo && !hasRealPosition
      ? 'empty'
      : game.activeProject
        ? 'building'
        : isDemo
          ? 'farming'
          : 'farming'

  const openPanel = (p: PanelId) => {
    setPanel(p)
    if (p === 'report') track('report_viewed')
    sfx.open(sound)
  }

  const closeReport = () => {
    if (latest) useGame.getState().markReportSeen(latest.timestamp)
    setPanel(null)
  }

  const onWorldReady = useCallback(() => {
    setWorldReady(true)
    track('settlement_generated')
  }, [])

  const showConsent = worldReady && game.tutorialDone && game.snapshotConsent === null && !consentAsked

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="sticky top-0 z-30 p-2 sm:p-3">
        <Hud
          position={position}
          isDemo={isDemo}
          xp={game.xp}
          tierLabel={tier.label}
          onOpen={openPanel}
          address={isDemo ? undefined : address}
          reportAvailable={reportAvailable}
        />
      </div>

      {isDemo && (
        <div className="mx-2 mb-2 rounded-lg border border-[#8a6a1f] bg-[#2a2108] px-3 py-1.5 text-center text-[11px] text-[#f2c14e] sm:mx-3">
          Demo mode — sample settlement and sample Treasury. Nothing here is a real position.{' '}
          <button onClick={() => navigate('/')} className="underline">
            Connect a wallet
          </button>{' '}
          to see your own world.
        </div>
      )}

      {!isDemo && !hasRealPosition && position && !position.stale && (
        <div className="mx-2 mb-2 rounded-lg border border-[#2a4547] bg-[#0d211a] px-3 py-1.5 text-center text-[11px] text-muted-foreground sm:mx-3">
          No HYPE or kHYPE position detected for this wallet — enjoy the starter settlement (the field is sample data,
          marked with a dashed border). Stake through the{' '}
          <a href={LINKS.kinetiqApp} target="_blank" rel="noreferrer" className="text-[#5fd08a] underline">
            official Kinetiq app
          </a>{' '}
          and a real crew moves in.
        </div>
      )}

      {!isDemo && live.status === 'error' && !position && (
        <div className="mx-2 mb-2 rounded-lg border border-[#7c3a2a] bg-[#2a120c] px-3 py-1.5 text-center text-[11px] text-[#e8734a] sm:mx-3">
          HyperEVM RPC is unavailable and no cached position exists on this device. The world below is a placeholder —
          no financial values are shown or claimed.
        </div>
      )}

      <main className="relative flex flex-1 flex-col px-2 pb-24 sm:px-3">
        <SettlementCanvas
          position={position}
          isDemo={isDemo || (!isDemo && !hasRealPosition)}
          seedKey={seedKey}
          onWorldReady={onWorldReady}
          celebrateSignal={celebrateSignal}
        />

        {position && !isDemo && (
          <div className="mt-2 text-center text-[10px] text-muted-foreground">
            On-chain values pinned to block #{position.blockNumber.toLocaleString()}
            {position.stale && <span className="text-[#e8734a]"> — stale (RPC unavailable)</span>}
          </div>
        )}

        {/* Quant dialogue */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-20 max-w-[85%]">
          <QuantDialogue mood={mood} reducedMotion={reducedMotion} />
        </div>

        {/* consent + toast stack */}
        <div className="pointer-events-none absolute bottom-3 right-3 z-20 flex flex-col items-end gap-2">
          {showConsent && <ConsentCard onDone={() => setConsentAsked(true)} />}
          {toast && (
            <div className="pointer-events-auto rounded-lg border border-[#8a6a1f] bg-[#2a2108]/95 px-3 py-2 font-pixel text-[10px] text-[#f2c14e] shadow-[0_3px_0_rgba(0,0,0,0.4)]">
              {toast}
            </div>
          )}
        </div>
      </main>

      {/* panels */}
      {panel === 'treasury' && (
        <TreasuryDrawer
          position={position}
          isDemo={isDemo}
          onClose={() => setPanel(null)}
          onRefresh={live.refresh}
          refreshing={live.refreshing}
          onExplainer={(topic) => {
            const s = useGame.getState()
            if (!s.state.explainersSeen.includes(topic)) {
              s.markExplainerSeen(topic)
              s.awardXp('explainer', topic)
            }
          }}
        />
      )}
      {panel === 'workshop' && <WorkshopModal onClose={() => setPanel(null)} />}
      {panel === 'report' && (
        <AwayReportModal
          prev={prev}
          latest={latest}
          game={game}
          isDemo={isDemo}
          onClose={closeReport}
          onOpenWorkshop={() => {
            closeReport()
            setPanel('workshop')
          }}
        />
      )}
      {panel === 'share' && (
        <ShareCardModal tier={tier} representedHype={represented} isDemo={isDemo} onClose={() => setPanel(null)} />
      )}
      {panel === 'settings' && <SettingsModal isDemo={isDemo} onClose={() => setPanel(null)} />}

      {showTutorial && <TutorialOverlay onDone={() => setShowTutorial(false)} />}
    </div>
  )
}
