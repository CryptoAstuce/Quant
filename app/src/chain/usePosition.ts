import { useEffect, useMemo, useRef } from 'react'
import type { Address } from 'viem'
import { formatUnits } from 'viem'
import { useBalance, useBlockNumber, useReadContracts } from 'wagmi'
import { CONTRACTS, ERC20_MIN_ABI, STAKING_ACCOUNTANT_ABI, hyperEvm } from '@/lib/chain'
import type { Position } from '@/lib/types'

export type PositionStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface PositionResult {
  position: Position | null
  status: PositionStatus
  /** Refresh re-pins all reads to a new latest block (FR-2). */
  refresh: () => void
  refreshing: boolean
}

/**
 * Reads the wallet's Kinetiq position from HyperEVM:
 *   1. pin a block number
 *   2. native HYPE balance + kHYPE balanceOf at that block
 *   3. StakingAccountant.kHYPEToHYPE(khypeBalance) at that block
 *
 * On RPC failure the last good position is preserved and marked stale
 * (PRD §13: preserve the last known world, mark financial data stale).
 */
export function usePosition(address: Address | undefined): PositionResult {
  const lastGood = useRef<Position | null>(null)

  const block = useBlockNumber({
    chainId: hyperEvm.id,
    watch: false,
    query: { enabled: Boolean(address), staleTime: 15_000, retry: 1 },
  })
  const blockNumber = block.data

  const hypeBalance = useBalance({
    address,
    chainId: hyperEvm.id,
    blockNumber,
    query: { enabled: Boolean(address && blockNumber), retry: 1 },
  })

  const khypeRead = useReadContracts({
    blockNumber,
    contracts: [
      {
        address: CONTRACTS.khypeToken,
        abi: ERC20_MIN_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        chainId: hyperEvm.id,
      },
      {
        address: CONTRACTS.khypeToken,
        abi: ERC20_MIN_ABI,
        functionName: 'decimals',
        chainId: hyperEvm.id,
      },
    ],
    query: { enabled: Boolean(address && blockNumber), retry: 1 },
  })

  const khypeRaw = khypeRead.data?.[0]?.status === 'success' ? (khypeRead.data[0].result as bigint) : undefined
  const khypeDecimals = khypeRead.data?.[1]?.status === 'success' ? Number(khypeRead.data[1].result) : 18

  const conversion = useReadContracts({
    blockNumber,
    contracts: [
      {
        address: CONTRACTS.stakingAccountant,
        abi: STAKING_ACCOUNTANT_ABI,
        functionName: 'kHYPEToHYPE',
        args: khypeRaw !== undefined ? [khypeRaw] : undefined,
        chainId: hyperEvm.id,
      },
      {
        address: CONTRACTS.stakingAccountant,
        abi: STAKING_ACCOUNTANT_ABI,
        functionName: 'kHYPEToHYPE',
        args: [10n ** 18n],
        chainId: hyperEvm.id,
      },
    ],
    query: { enabled: Boolean(address && blockNumber && khypeRaw !== undefined), retry: 1 },
  })

  const status: PositionStatus = useMemo(() => {
    if (!address) return 'idle'
    if (block.isError || hypeBalance.isError || khypeRead.isError || conversion.isError) return 'error'
    if (!blockNumber || hypeBalance.data === undefined || khypeRaw === undefined) return 'loading'
    if (conversion.data === undefined) return 'loading'
    return 'ready'
  }, [address, block.isError, hypeBalance.isError, hypeBalance.data, khypeRead.isError, khypeRaw, conversion.isError, conversion.data, blockNumber])

  const position: Position | null = useMemo(() => {
    if (status !== 'ready' || !blockNumber || khypeRaw === undefined || !hypeBalance.data || !conversion.data) {
      return null
    }
    const hype = Number(formatUnits(hypeBalance.data.value, 18))
    const khype = Number(formatUnits(khypeRaw, khypeDecimals))
    const representedRaw = conversion.data[0]?.status === 'success' ? (conversion.data[0].result as bigint) : 0n
    const unitRaw = conversion.data[1]?.status === 'success' ? (conversion.data[1].result as bigint) : 0n
    return {
      hype,
      khype,
      representedHype: Number(formatUnits(representedRaw, 18)),
      rate: Number(formatUnits(unitRaw, 18)),
      blockNumber: Number(blockNumber),
      timestamp: Date.now(),
      stale: false,
    }
  }, [status, blockNumber, khypeRaw, khypeDecimals, hypeBalance.data, conversion.data])

  useEffect(() => {
    if (position && address) {
      lastGood.current = position
      // short-lived cache per data classification (PRD §12) — lets the world
      // survive an RPC outage across reloads, always marked stale
      try {
        localStorage.setItem(`quant.lastpos.v1.${address.toLowerCase()}`, JSON.stringify(position))
      } catch {
        /* cache is best-effort */
      }
    }
  }, [position, address])

  const effective: Position | null = useMemo(() => {
    if (position) return position
    if (status === 'error') {
      if (lastGood.current) return { ...lastGood.current, stale: true }
      if (address) {
        try {
          const raw = localStorage.getItem(`quant.lastpos.v1.${address.toLowerCase()}`)
          if (raw) {
            const cached = JSON.parse(raw) as Position
            return { ...cached, stale: true }
          }
        } catch {
          /* fall through to null */
        }
      }
    }
    return null
  }, [position, status, address])

  return {
    position: effective,
    status: status === 'error' && lastGood.current ? 'ready' : status,
    refresh: () => {
      void block.refetch()
      void hypeBalance.refetch()
      void khypeRead.refetch()
      void conversion.refetch()
    },
    refreshing: block.isFetching || hypeBalance.isFetching || khypeRead.isFetching || conversion.isFetching,
  }
}
