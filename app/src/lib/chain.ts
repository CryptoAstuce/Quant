import { defineChain } from 'viem'

/**
 * HyperEVM chain + official Kinetiq protocol contracts.
 *
 * Contract addresses were re-verified against live on-chain reads on 2026-07-17
 * (kHYPE symbol/decimals and StakingAccountant.kHYPEToHYPE were called directly).
 * Per the PRD, addresses MUST be checked against the official Kinetiq contracts
 * page before every production release — this file is not a permanent registry.
 */
export const hyperEvm = defineChain({
  id: 999,
  name: 'HyperEVM',
  nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.hyperliquid.xyz/evm'] },
  },
  blockExplorers: {
    default: { name: 'Hyperevmscan', url: 'https://hyperevmscan.io' },
  },
})

export const CONTRACTS = {
  khypeToken: '0xfD739d4e423301CE9385c1fb8850539D657C296D',
  stakingManager: '0x393D0B87Ed38fc779FD9611144aE649BA6082109',
  stakingAccountant: '0x9209648Ec9D448EF57116B73A2f081835643dc7A',
  validatorManager: '0x4b797A93DfC3D18Cf98B7322a2b142FA8007508f',
} as const

/** Date the addresses above were last verified against live chain reads. */
export const CONTRACTS_VERIFIED_AT = '2026-07-17'

/** Bump whenever the represented-value calculation changes; stored in snapshots. */
export const CALC_VERSION = 1

export const ERC20_MIN_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const

/**
 * StakingAccountant conversion surface, verified live on 2026-07-17:
 * kHYPEToHYPE(1e18) returned a nonzero value (~1.02 HYPE) and HYPEToKHYPE
 * returned its inverse. StakingManager does not expose these (calls revert).
 */
export const STAKING_ACCOUNTANT_ABI = [
  {
    type: 'function',
    name: 'kHYPEToHYPE',
    stateMutability: 'view',
    inputs: [{ name: '_kHYPEAmount', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'HYPEToKHYPE',
    stateMutability: 'view',
    inputs: [{ name: '_HYPEAmount', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

/** Canonical external links (see PRD §21). */
export const LINKS = {
  kinetiqDocs: 'https://kinetiq.xyz/docs',
  kinetiqContracts: 'https://kinetiq.xyz/docs/contracts-and-audits',
  kinetiqApp: 'https://kinetiq.xyz',
  kPoints: 'https://kinetiq.xyz/docs/kpoints',
  khypeDocs: 'https://kinetiq.xyz/docs/khype',
} as const
