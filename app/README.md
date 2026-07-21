# Quant — Kinetiq Living World

> Watch your HYPE go to work.

Quant is a responsive, read-only Kinetiq position visualizer for HyperEVM. It turns a wallet's HYPE and kHYPE position into a deterministic 2D settlement, while keeping exact financial values in an accessible Treasury layer.

The application is an independent project for the Kinetiq ecosystem. It is not produced or endorsed by Kinetiq and does not provide financial advice.

## Current release

**Version:** `0.1.0`  
**Status:** Release candidate for a controlled, read-only MVP  
**Runtime:** Node.js 22+, pnpm 11.9.0  
**Source PRD:** [Quant — Kinetiq Living World PRD](../quant-kinetiq-game-prd.md)

The repository currently implements:

- A public landing page and clearly labeled demo world
- Injected-wallet connection on HyperEVM
- Read-only native HYPE and kHYPE balance reads
- kHYPE-to-HYPE conversion through `StakingAccountant`
- Block-pinned position data with visible timestamps
- Deterministic, bounded settlement tiers and mascot crews
- Treasury, Away Report, cosmetic projects, and World XP
- Consent-based device-local snapshots and game state
- Privacy-safe share cards with balances hidden by default
- Reduced-motion, sound, privacy, and deletion controls
- Device-local, address-free product analytics
- Production error recovery and RPC stale-data fallback

It does **not** initiate transactions, signatures, approvals, staking, withdrawals, or custody.

## Product truth model

Quant deliberately separates three kinds of information:

| Layer | Examples | Source |
|---|---|---|
| On-chain facts | HYPE, kHYPE, represented HYPE, block number | HyperEVM and Kinetiq contracts |
| Historical calculations | Change between two consented snapshots | Device-local snapshots |
| Game state | World XP, settlement level, cosmetic projects | Device-local application state |

Mascot count is a bounded visualization tier—not a token conversion rate. World XP is non-financial and never converts into HYPE, kHYPE, kPoints, or promised value.

## Quick start

### Requirements

- Node.js `>=22`
- pnpm `11.9.0`
- A modern browser
- An injected wallet extension for live mode; no wallet is required for demo mode

### Install and run

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`.

Routes:

- `/` — landing page
- `/demo` — sample-data settlement
- `/world` — connected-wallet settlement

No secrets are required for the current MVP. See [.env.example](.env.example) for the environment policy.

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the Vite development server |
| `pnpm lint` | Run ESLint across the repository |
| `pnpm test` | Run deterministic unit tests once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm build` | Type-check and create the production bundle |
| `pnpm preview` | Serve the built bundle locally |
| `pnpm check` | Run lint, tests, and production build in sequence |

Run `pnpm check` before every release.

## Architecture

```text
src/
├── chain/                 HyperEVM wallet and position reads
├── components/
│   ├── panels/            Treasury, reports, privacy, workshop, sharing
│   ├── world/             Canvas settlement and bounded render engine
│   └── ui/                Reusable interface primitives
├── lib/                   Contracts, formatting, tiers, snapshots, XP, sound
├── pages/                 Landing and settlement routes
└── state/                 Device-local game and settings stores
```

Primary technologies:

- React 19 and TypeScript
- Vite 7
- Wagmi and Viem
- TanStack Query
- Zustand
- Tailwind CSS and Radix UI
- Canvas 2D for the settlement renderer
- Vitest for unit tests

The chain stack is emitted as a separate production chunk to keep application code independently cacheable.

## On-chain integration

Quant targets HyperEVM chain ID `999` and currently uses the public RPC at `https://rpc.hyperliquid.xyz/evm`.

Configured Kinetiq contracts:

| Contract | Address |
|---|---|
| kHYPE token | `0xfD739d4e423301CE9385c1fb8850539D657C296D` |
| StakingManager | `0x393D0B87Ed38fc779FD9611144aE649BA6082109` |
| StakingAccountant | `0x9209648Ec9D448EF57116B73A2f081835643dc7A` |
| ValidatorManager | `0x4b797A93DfC3D18Cf98B7322a2b142FA8007508f` |

These addresses were last recorded as verified on **July 17, 2026**. They must be checked against Kinetiq's current official contracts page before every public release. If a contract or ABI cannot be verified, affected live reads must not be released.

## Persistence and privacy

All MVP persistence stays in the browser's `localStorage`:

- Current fallback position cache
- User-consented historical snapshots
- Cosmetic progress and World XP
- Settings and privacy defaults
- Minimal product events

Analytics never leave the device and do not record wallet addresses or balances. Share cards hide wallet addresses and exact balances by default. Users can delete locally stored game data from Settings.

Because wallet addresses and balances are public-chain data but sensitive in context, do not add identity association, remote analytics, or backend persistence without explicit consent and a documented retention policy.

## Reliability and failure behavior

- RPC reads retry with bounded timeouts.
- Reads are pinned to a known block.
- The last valid position can be shown during an RPC outage only when visibly marked stale.
- A missing prior snapshot produces a first-visit state, never fabricated growth.
- Wallet rejection leaves demo mode available.
- Unexpected React failures show a safe reload screen and do not initiate wallet actions.
- Crew count is capped at 12, regardless of position size.

## Testing and CI

Current unit coverage protects:

- Financial display rounding and non-finite values
- Signed historical deltas
- Privacy-safe address truncation
- Settlement-tier boundaries and maximum crew caps
- Deterministic wallet-seeded world generation

GitHub Actions runs installation with the frozen pnpm lockfile followed by `pnpm check` on pushes to `main` and pull requests.

Before a wider public launch, add browser-level tests for wallet rejection, unsupported networks, RPC failure, snapshot consent, deletion, reduced motion, and share-card privacy.

## Production deployment

The repository includes [vercel.json](vercel.json) with:

- Vite build/output configuration
- SPA rewrites for direct route visits
- Immutable caching for hashed assets
- Basic browser security headers

Deploy from this `app` directory. The expected build command is `pnpm build`, and the output directory is `dist`.

For another static host, configure all unknown routes to serve `index.html`. Do not deploy the Vite development server.

## Release checklist

Code readiness:

- [ ] `pnpm install --frozen-lockfile` succeeds on Node.js 22
- [ ] `pnpm check` passes with no errors
- [ ] The production bundle is smoke-tested at `/`, `/demo`, and `/world`
- [ ] Wallet rejection, wrong-network, and RPC-failure states are tested manually
- [ ] Default share cards contain no address or exact balance
- [ ] Reduced-motion mode preserves all information and controls

External launch gates:

- [ ] Reverify contract addresses and ABIs against official Kinetiq sources
- [ ] Obtain written authorization for mascot/brand usage or replace unapproved assets
- [ ] Confirm the product name does not create trademark confusion
- [ ] Review financial disclosures and public claims
- [ ] Choose and test a production RPC capacity/failover strategy
- [ ] Complete accessibility and cross-browser QA

Passing the code checks does not replace brand authorization, legal review, protocol verification, or an independent security review.

## Security policy

- Never request a seed phrase or private key.
- Never place secrets in `VITE_*` variables; they are bundled into public client code.
- Do not add transactions to the read-only MVP without explicit previews, wallet confirmation, protocol-limit validation, failure tests, and an independent security review.
- Report suspected contract/configuration mismatches by disabling the affected release path until verified.

## Product language

Use:

- “represented HYPE value”
- “represented value changed”
- “sample data” for demo values
- “World XP” for cosmetic progression

Do not claim:

- Guaranteed APY, earnings, kPoints, or token value
- That a wallet transfer was necessarily staking yield
- That one mascot equals one token
- Official Kinetiq endorsement without written authorization

## License and attribution

No open-source license has been declared. All rights remain with their respective owners. Kinetiq names, contracts, and mascot assets may be subject to separate terms and approvals.
