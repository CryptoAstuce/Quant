import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { hyperEvm } from '@/lib/chain'

/**
 * Read-only MVP wiring (PRD §14): injected wallets only, no WalletConnect
 * project, no transaction or signature flows anywhere in the app.
 */
export const wagmiConfig = createConfig({
  chains: [hyperEvm],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [hyperEvm.id]: http(hyperEvm.rpcUrls.default.http[0], {
      retryCount: 2,
      timeout: 12_000,
    }),
  },
})
