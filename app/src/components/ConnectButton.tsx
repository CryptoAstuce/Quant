import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { hyperEvm } from '@/lib/chain'
import { track } from '@/lib/analytics'

/**
 * Wallet connection with every PRD FR-1 state: disconnected, connecting,
 * connected, rejected, unsupported-network, RPC-error (surfaced downstream).
 * Rejection keeps demo mode usable and offers retry — never a false
 * connected state.
 */
export function ConnectButton({ className = '' }: { className?: string }) {
  const navigate = useNavigate()
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors, isPending, error, reset } = useConnect()
  const { switchChain, isPending: switching } = useSwitchChain()
  const { disconnect } = useDisconnect()
  const [rejected, setRejected] = useState(false)

  const wrongNetwork = isConnected && chainId !== hyperEvm.id

  useEffect(() => {
    if (error) {
      setRejected(true)
    }
  }, [error])

  useEffect(() => {
    if (isConnected && !wrongNetwork && address) {
      track('wallet_connected')
      navigate('/world')
    }
  }, [isConnected, wrongNetwork, address, navigate])

  if (isConnected && wrongNetwork) {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <p className="max-w-xs text-center text-sm text-[#f2c14e]">
          Quant reads your position on HyperEVM. Your wallet is on a different network.
        </p>
        <button
          className="pixel-btn border-[#8a6a1f] bg-[#f2c14e] px-5 py-3 text-[#3a2c08] hover:bg-[#ffd97a]"
          onClick={() => switchChain({ chainId: hyperEvm.id })}
          disabled={switching}
        >
          {switching ? 'Confirm in wallet…' : 'Switch to HyperEVM'}
        </button>
        <button className="text-xs text-muted-foreground underline" onClick={() => disconnect()}>
          disconnect
        </button>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <button
        className="pixel-btn border-[#1d6b63] bg-[#2fa4a8] px-6 py-3 text-[#06282a] hover:bg-[#3fbcc0]"
        disabled={isPending}
        onClick={() => {
          setRejected(false)
          reset()
          connect({ connector: connectors[0] })
        }}
      >
        {isPending ? 'Waiting for wallet…' : 'Connect wallet'}
      </button>
      {rejected && (
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs text-[#e8734a]">
            Connection declined — no problem, the demo below still works.
          </p>
          <button
            className="text-xs text-muted-foreground underline"
            onClick={() => {
              setRejected(false)
              reset()
              connect({ connector: connectors[0] })
            }}
          >
            try again
          </button>
        </div>
      )}
    </div>
  )
}
