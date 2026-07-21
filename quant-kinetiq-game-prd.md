# Quant — Kinetiq Living World Product Requirements Document

> **One-line pitch:** Quant transforms a user’s Kinetiq position into a living 2D mascot world where staked HYPE becomes a working crew, real position growth becomes visible progress, and every return reveals what happened while the user was away.
>
> **Working title:** Quant (final product name unresolved)  
> **Status / Version:** Draft v0.1  
> **Owner:** Product team  
> **Last updated:** July 13, 2026  
> **Platform:** Responsive web application on HyperEVM  
> **Brand:** Kinetiq, always spelled with a capital “K” and lowercase “q”

## 1. Executive Summary

Quant is a Kinetiq-native 2D game and position visualizer built around the official Kinetiq mascot. A user connects a wallet and sees their HYPE and Kinetiq positions represented as a living settlement. Unstaked HYPE appears as idle capacity; staked HYPE and kHYPE appear as working mascot crews; Kinetiq Earn positions can later appear as advanced production areas; queued withdrawals appear as crews travelling through a withdrawal gate.

The product’s defining promise is: **watch your HYPE go to work**.

Quant must remain financially truthful. On-chain balances, exchange-rate conversions, withdrawal states, and confirmed kPoints are presented as factual protocol data. Game progression is tracked separately as **World XP** (working name). Cosmetic activity must never imply that a game action changes protocol yield.

The MVP will validate whether users enjoy returning to a living representation of their Kinetiq position. It will begin as a read-only wallet experience with daily snapshots, an away report, lightweight cosmetic progression, mascot dialogue, and a shareable settlement card. Native staking is a later phase after security review and validation of the core loop.

## 2. Problem

Liquid staking positions are useful but emotionally flat and difficult for many users to understand.

- A wallet balance does not make productive capital feel active.
- kHYPE rewards accrue through the changing kHYPE-to-HYPE relationship rather than through an obviously increasing kHYPE token count.
- Users may not understand why their kHYPE balance appears unchanged while its represented HYPE value changes.
- Withdrawal queues, vault positions, validator activity, and weekly kPoints distributions are difficult to explain through tables alone.
- Conventional DeFi dashboards provide information but give users little reason to return or share their position.

Quant turns these abstract states into a world users can understand at a glance, without replacing exact financial information with decorative animation.

## 3. Product Vision and Principles

### Vision

Make every Kinetiq position feel like a small, persistent world that remains active while its owner is away.

### Product principles

1. **Truth before theatre.** Animation may explain real state but must never contradict or fabricate it.
2. **Mascot first.** The official Kinetiq mascot is the emotional center, worker, guide, and storyteller.
3. **Useful at a glance.** Users must always be able to see exact balances and what each visual represents.
4. **Progress without financial pressure.** Game progression is cosmetic and educational, not a promise of higher yield.
5. **Reward returning, not compulsive checking.** Away reports and completed projects create satisfying return moments.
6. **Every wallet gets a world.** Small positions receive a meaningful visual experience; larger positions expand the environment without spawning unbounded entities.
7. **Kinetiq-native.** Protocol states determine the world instead of Kinetiq being applied as a superficial theme.

## 4. Target Users and Jobs to Be Done

| User | Context and job to be done | Priority |
|---|---|---|
| Existing Kinetiq staker | Understand and enjoy the current value and activity of a kHYPE position | Primary |
| HYPE holder new to liquid staking | Learn what staking through Kinetiq does before taking a financial action | Primary |
| Kinetiq community member | Express ecosystem participation through a personalized, shareable world | Primary |
| Kinetiq Earn user | Understand how a vault position differs from ordinary kHYPE staking | Secondary / post-MVP |
| Advanced DeFi user | Inspect exact balances and protocol states without losing access to conventional data | Secondary |

### Core jobs

- “Show me what my Kinetiq position is doing.”
- “Help me understand why my represented HYPE value changed.”
- “Give me a satisfying reason to return without encouraging me to trade.”
- “Let me share my Kinetiq participation without exposing sensitive wallet values by default.”

## 5. Goals, Success Metrics, and Guardrails

Targets are provisional until baseline usage exists.

| Goal | Metric | Provisional target |
|---|---|---|
| Deliver the core magic quickly | Connected users who reach a generated settlement | ≥70% of successful wallet connections |
| Make the position understandable | Users who correctly distinguish kHYPE value growth from kHYPE token-count growth in a short usability test | ≥80% |
| Create a return loop | Activated users returning within 7 days | ≥25% |
| Create organic distribution | Activated users generating a share card | ≥10% |
| Keep financial data accurate | Difference between displayed on-chain values and values calculated from the same block | Zero beyond documented rounding |
| Keep game and protocol rewards distinct | Sessions in which World XP is mislabeled as kPoints | 0 |
| Maintain safe wallet behavior | Transactions initiated without explicit user confirmation | 0 |

### Primary validation signal

Users connect a wallet, understand the living representation, return to read an away report, and choose to personalize or share the world.

## 6. Non-Goals

The MVP will not include:

- A multiplayer world or shared land map
- Tradable game resources, NFTs, or a cosmetic marketplace
- A player-versus-player economy
- Yield optimization controlled by worker assignments
- Predicted, estimated, or continuously simulated kPoints
- Guaranteed yield, price, or reward claims
- An AI agent that can transact on the user’s behalf
- KNTQ governance, validator scoring, or Kinetiq Earn as required MVP features
- A custom protocol contract that custody-holds user funds
- Native staking before the read-only experience is validated and reviewed

## 7. Product Model and Terminology

| Product concept | Meaning | Data classification |
|---|---|---|
| Quant | Working name for the mascot guide and potentially the product | Brand / narrative |
| Settlement | The user’s persistent 2D world | Game state |
| Crew | A bounded visual representation of productive capital | Visualization, not a token unit |
| Staking Field | Area representing wallet-held kHYPE | On-chain-derived visualization |
| Treasury | Exact HYPE, kHYPE, and represented HYPE values | On-chain fact |
| Away Report | Change between two stored snapshots plus completed game events | Derived historical data |
| World XP | Non-financial game progression earned through product activity | Game state |
| Confirmed kPoints | Official points already made available by Kinetiq | Official external data |
| Earn Greenhouse | Area representing vkHYPE / Kinetiq Earn | Post-MVP on-chain-derived visualization |
| Withdrawal Gate | Area representing queued and claimable withdrawals | Post-MVP on-chain state |

Crew count must not use a literal “one mascot equals one kHYPE” rule. The rendering system should use adaptive tiers and always display the exact represented amount separately.

## 8. Core Experience

### 8.1 First visit

1. The landing page introduces Quant and explains that the world visualizes a Kinetiq position.
2. The user may preview a demo settlement without connecting a wallet.
3. The user selects **Connect wallet**.
4. The app requests read-only access to the public wallet address and verifies HyperEVM network support.
5. The app reads HYPE and kHYPE balances and calculates the current HYPE-equivalent value of kHYPE.
6. Quant welcomes the user and the settlement is generated.
7. The Treasury presents exact values and labels the crew as a visual representation.
8. The user selects the first cosmetic construction project.

### 8.2 Returning visit

1. The app loads the previous snapshot and fetches current on-chain state.
2. The app calculates the factual change in represented value between snapshots.
3. A short animation shows the mascot crew finishing work.
4. The Away Report distinguishes financial changes from game changes.
5. The user claims completed World XP and chooses the next cosmetic project.

Example:

> While you were away, your crew kept working. Your position’s represented value changed by +0.018 HYPE. The west field reached Level 3, earning 40 World XP.

### 8.3 Empty-wallet experience

Users with no detected Kinetiq position still receive a starter settlement and educational demo. The product may link to the official Kinetiq staking interface, but it must not falsely present demo workers as real productive capital.

### 8.4 Share flow

1. The user selects **Share settlement**.
2. The app previews a privacy-safe card.
3. Exact balances are hidden by default.
4. The user may opt in to show exact or rounded values.
5. The generated card contains the product name, Kinetiq attribution, settlement level, crew tier, active days, and a clear “visualized from on-chain data” label.

## 9. Functional Requirements

### FR-1: Wallet connection and network state

- Support compatible HyperEVM wallets through an established wallet connection library.
- Never request seed phrases or private keys.
- Display disconnected, connecting, connected, rejected, unsupported-network, and RPC-error states.
- **Acceptance:** Given a user rejects the wallet prompt, the app remains usable in demo mode and offers a retry without showing a false connected state.

### FR-2: Position reading

- Read native HYPE and kHYPE balances for the connected address.
- Use Kinetiq’s published contracts to calculate the current kHYPE-to-HYPE conversion.
- Pin all displayed values to a known block or clearly communicate refresh timing.
- Show a last-updated timestamp and refresh control.
- **Acceptance:** Given a wallet with kHYPE, when data loads successfully, the Treasury displays the kHYPE balance and corresponding HYPE value with documented rounding.

### FR-3: Settlement generation

- Generate a deterministic base settlement from the wallet’s current Kinetiq state and persisted cosmetic selections.
- Guarantee at least one mascot in every real-position settlement.
- Scale environmental richness through bounded tiers rather than directly proportional entity counts.
- Preserve smooth performance for large positions.
- **Acceptance:** Given two wallets in different position tiers, both receive a meaningful settlement while neither can create an unbounded number of animated entities.

### FR-4: Mascot crew behavior

- Mascots may farm, carry materials, build, rest, celebrate, and deliver status dialogue.
- Financially themed animations must map to actual or explicitly cosmetic states.
- Dialogue must not state invented balances, guaranteed yield, or live kPoints accrual.
- Include reduced-motion behavior.
- **Acceptance:** Given reduced motion is enabled, the same information remains available without continuous character animation.

### FR-5: Treasury and truth layer

- Provide an always-accessible panel containing exact balances, represented values, data source, timestamp, and explanatory labels.
- Clearly label visual crews as a representation rather than a conversion unit.
- Separate current facts, historical calculations, and game state visually.
- **Acceptance:** Given a user opens the Treasury, they can identify which values came from the chain, which came from stored snapshots, and which belong only to the game.

### FR-6: Daily snapshots and Away Report

- Store a position snapshot after the user consents and successfully loads the settlement.
- Calculate changes only between valid snapshots with identifiable timestamps and chain context.
- Do not describe wallet transfers as staking yield when the cause cannot be determined.
- Use neutral language such as “represented value changed” unless the source is provably attributable.
- **Acceptance:** Given no prior snapshot exists, the app presents a first-visit welcome state rather than fabricating historical growth.

### FR-7: Cosmetic projects and World XP

- Allow the user to select one of several purely cosmetic construction projects.
- Award World XP for defined non-financial actions such as returning, completing a tutorial, viewing an explanation, or finishing a timed cosmetic project.
- Never convert World XP into kPoints, HYPE, kHYPE, or promised financial value.
- **Acceptance:** Given a user completes a project, the resulting building and World XP appear without changing or claiming to change the user’s on-chain position.

### FR-8: Confirmed kPoints

- If an authorized and reliable source is available, display only confirmed official kPoints.
- Show kPoints as periodically distributed, not as a real-time counter.
- If confirmed data is unavailable, show an unavailable state or official destination rather than an estimate.
- **Acceptance:** No animation or counter increments official kPoints between confirmed updates.

### FR-9: Share card

- Generate a social-ready settlement image.
- Hide wallet address and exact balances by default.
- Require explicit user action to reveal financial values.
- Prevent the card from implying guaranteed earnings or official endorsement unless authorized.
- **Acceptance:** The default card contains no wallet address or exact token balance.

### FR-10: Demo mode

- Provide a clearly labeled simulated settlement without wallet connection.
- Demo values must be visually marked as sample data.
- **Acceptance:** A user can understand the core experience without granting wallet access, and cannot mistake the sample Treasury for a real position.

## 10. Information Architecture and Screens

### 10.1 Landing / demo

- Hero: “Watch your HYPE go to work.”
- Animated mascot-world preview
- Connect wallet CTA
- Try demo CTA
- Concise explanation of kHYPE visualization

### 10.2 Settlement

- Main 2D world canvas
- Mascot crew and ambient activity
- Treasury summary
- Current cosmetic project
- World XP and settlement level
- Away Report entry point
- Share action

### 10.3 Treasury drawer

- Native HYPE balance
- kHYPE balance
- Current HYPE-equivalent value
- Confirmed kPoints, if available
- Data timestamps and sources
- Educational explanation

### 10.4 Away Report

- Snapshot period
- Represented-value change
- Balance changes that cannot safely be attributed
- Completed cosmetic work
- World XP earned
- Next recommended exploration action

### 10.5 Workshop / customization

- Available cosmetic projects
- Project duration
- Visual preview
- No financial-return language

### 10.6 Settings and privacy

- Disconnect wallet
- Delete off-chain game data
- Share-card privacy defaults
- Reduced motion
- Sound controls
- Data-source and risk disclosures

## 11. Future Product Areas

These areas support the long-term ecosystem vision but are not part of the first validation build.

### Earn Greenhouse

Represents Kinetiq Earn and vkHYPE. It must explain that the vault deploys assets across DeFi strategies and introduces risks beyond basic liquid staking. Greenhouse output must reflect current vault value, not a fictional production rate.

### Withdrawal Gate

Queued withdrawals appear as departing crews. The interface shows withdrawal ID, amount, requested time, estimated readiness based on contract state, and claimability. Exact transaction state remains primary.

### Validator Watchtower

Visualizes public validator distribution or performance information where a stable, reliable data source exists. It must not imply that the user personally selected a validator when Kinetiq manages distribution.

### KNTQ Town Hall

Represents governance participation, proposals, and KNTQ-related achievements when reliable governance data and product priorities justify it.

### Quant, the foreman

A later conversational guide may explain deterministic wallet and protocol data in plain language. It may answer questions but cannot predict returns, invent data, recommend unsupported transactions, or transact for the user.

## 12. Recommended Technical Approach

This architecture is a recommendation, not a settled implementation choice.

### Client

- TypeScript web application
- React/Next.js or equivalent production web framework
- Viem and Wagmi for HyperEVM reads and future wallet transactions
- PixiJS, Phaser, or a canvas/WebGL renderer for the bounded 2D world
- Responsive layout with a DOM-based Treasury for accessibility

### On-chain integration

Use official, version-controlled Kinetiq ABIs and published HyperEVM mainnet addresses. As documented on April 28, 2026:

| Contract | Address |
|---|---|
| kHYPE token | `0xfD739d4e423301CE9385c1fb8850539D657C296D` |
| StakingManager | `0x393D0B87Ed38fc779FD9611144aE649BA6082109` |
| StakingAccountant | `0x9209648Ec9D448EF57116B73A2f081835643dc7A` |
| ValidatorManager | `0x4b797A93DfC3D18Cf98B7322a2b142FA8007508f` |

Addresses must be checked against the current official contracts page before every production release. Do not treat this PRD as a permanent address registry.

### Backend and persistence

- Store user-approved daily snapshots and cosmetic state.
- Key game state to a normalized wallet address without requiring real-world identity.
- Store snapshot block number, timestamp, raw values, conversion result, contract version/configuration, and calculation version.
- Provide deletion and export mechanisms for off-chain state.
- Consider a signed session or wallet-signature login only when cross-device persistence is needed; wallet connection alone should not automatically request a signature.

### Data classification

| Data | Source | Persistence |
|---|---|---|
| Current HYPE balance | HyperEVM RPC | Short-lived cache |
| Current kHYPE balance | kHYPE contract | Short-lived cache |
| HYPE-equivalent value | StakingAccountant calculation | Snapshot plus cache |
| Historical change | App snapshots | User-controlled persisted data |
| World XP and cosmetics | App database | User-controlled persisted data |
| Confirmed kPoints | Authorized official source, if available | Cache only as permitted |

## 13. Error, Empty, and Recovery States

| State | Required handling |
|---|---|
| Wallet rejected | Keep demo available; provide a non-blocking retry |
| Unsupported network | Explain HyperEVM requirement and offer network switch only through an explicit wallet request |
| RPC unavailable | Preserve the last known world, visibly mark financial data stale, and disable claims of current value |
| No HYPE or kHYPE | Show a starter/demo settlement and link to education or the official Kinetiq experience |
| Very large balance | Use the highest bounded world tier; never render linearly proportional workers |
| Missing prior snapshot | Show first-visit state and begin history only after consent |
| Snapshot gap | Show exact dates and avoid annualized extrapolation |
| kPoints unavailable | Show “confirmed kPoints unavailable” and never substitute World XP |
| Contract address mismatch | Fail closed for affected reads and show a maintenance state |
| Share rendering failure | Preserve privacy settings and offer retry; do not fall back to exposing the live screen |
| Asset load failure | Use an approved fallback state without replacing the official mascot with unapproved artwork |

## 14. Security, Privacy, Brand, and Financial Safety

### Wallet and transaction safety

- MVP is read-only.
- Never request secret recovery phrases or private keys.
- Every future transaction requires a clear preview and explicit wallet confirmation.
- Do not introduce custody or delegate transaction authority to an AI agent.
- Validate chain ID, addresses, expected outputs, protocol limits, and error states before enabling native staking.

### Financial truthfulness

- Never guarantee APY, earnings, kPoints, or token value.
- Use “represented HYPE value” rather than “profit” where attribution is uncertain.
- Explain that staking, vaults, smart contracts, market liquidity, and withdrawals carry different risks.
- Keep promotional animation subordinate to exact numeric information.

### Privacy

- Treat wallet addresses and balances as public-chain data that can still be sensitive in context.
- Do not publicly associate a wallet with a user identity without consent.
- Hide exact balances and wallet addresses in social artifacts by default.
- Allow users to delete stored snapshots and game state.

### Brand and mascot

- Use only approved official Kinetiq mascot and brand assets.
- Maintain the spelling **Kinetiq**.
- Obtain written authorization covering mascot modification, animation, derivative poses, product naming, commercial use, and any claim that the product is official.
- If official status is not authorized, use language such as “for Kinetiq” and clearly disclose the project relationship.
- Maintain an approved character bible for poses, expressions, colors, voice, and prohibited uses.

## 15. MVP Scope and Phased Roadmap

### Phase 0: Design and technical proof

- Secure mascot and brand usage approval.
- Finalize product/character naming relationship.
- Build one approved mascot animation set.
- Prove HyperEVM balance and conversion reads.
- Validate deterministic settlement tiering and performance.

### Phase 1: Read-only MVP — must have

- Landing page and clearly labeled demo
- Wallet connection and HyperEVM detection
- HYPE and kHYPE balance reads
- Current kHYPE HYPE-equivalent calculation
- Generated 2D mascot settlement
- Bounded worker and world tier system
- Treasury truth layer
- Daily snapshots with consent
- Away Report
- Three to five cosmetic projects
- World XP separated from kPoints
- Privacy-safe share card
- Reduced motion and basic accessibility
- Analytics for activation, reports, return usage, and sharing

### Nice to have in MVP

- Ambient weather and day/night cycle
- Mascot personality dialogue
- Sound effects and music controls
- Several settlement biomes
- Confirmed kPoints display, only if an authorized integration exists

### Phase 2: Transactional Kinetiq integration

- Native HYPE staking through the official StakingManager
- Expected kHYPE calculation and protections
- Full transaction preview and recovery states
- Independent smart-contract and frontend security review

### Phase 3: Ecosystem world

- Withdrawal Gate
- Earn Greenhouse / vkHYPE
- Validator Watchtower
- KNTQ Town Hall
- Grounded conversational Quant foreman
- Seasonal community events

## 16. Acceptance Criteria for MVP Release

The MVP is ready for a controlled release when:

- [ ] A new user can understand the premise in demo mode without connecting a wallet.
- [ ] A supported wallet can connect and render a settlement from current HyperEVM data.
- [ ] HYPE, kHYPE, and represented HYPE values match calculations from the same block within documented rounding.
- [ ] A user with no prior snapshot never receives a fabricated Away Report.
- [ ] A returning user receives a report whose period and data sources are visible.
- [ ] Wallet transfers are not automatically described as staking rewards.
- [ ] Official kPoints never increment through simulation and are visually distinct from World XP.
- [ ] Small and very large positions both render meaningfully without unbounded mascot counts.
- [ ] Reduced-motion users can access all information and actions.
- [ ] The default share card exposes neither wallet address nor exact balance.
- [ ] RPC failure clearly marks financial data as stale.
- [ ] No transaction, signature, or approval request is initiated by the read-only MVP.
- [ ] Mascot animations and brand usage have documented approval.
- [ ] Core analytics events have been tested without collecting unnecessary personal information.

## 17. Risks and Mitigations

| Risk or dependency | Impact | Mitigation |
|---|---|---|
| Product feels like a dashboard rather than a game | Weak retention | Add cosmetic project choices, World XP, collection goals, and satisfying return moments without financializing them |
| Users confuse animation with actual yield mechanics | Misleading financial experience | Persistent Treasury, representation labels, content review, and usability tests |
| “Real-time points” conflicts with private weekly kPoints mechanics | False expectations | Show only confirmed kPoints; use World XP for live game progression |
| Official mascot usage is not fully authorized | Launch or reputational risk | Obtain written approval before public distribution |
| “Quant” conflicts with existing financial or crypto brands | Naming and discoverability risk | Conduct trademark/domain/social-handle review; consider Quant as character name and a distinct game title |
| Historical value changes are misattributed | Incorrect reward claims | Store snapshots, use neutral change language, and avoid causal claims without sufficient data |
| Contract or protocol configuration changes | Incorrect reads or failed transactions | Version configuration, monitor official docs, verify before releases, and fail closed |
| RPC instability | Broken or stale world state | Multiple vetted providers, caching, stale-state labels, and graceful demo fallback |
| Large wallets harm renderer performance | Poor experience | Bounded tiers, pooled sprites, culling, and performance budgets |
| Sharing reveals sensitive financial data | Privacy harm | Hide exact balances and addresses by default; explicit preview and opt-in |
| Gamification encourages risky financial actions | User harm | Reward education and return behavior, not deposit size or transaction frequency |

## 18. Build Plan

### Slice 1: The truthful world

- [ ] Confirm brand authorization and obtain production-ready mascot files.
- [ ] Create the landing/demo settlement.
- [ ] Connect a wallet and read HYPE/kHYPE on HyperEVM.
- [ ] Calculate represented HYPE value from official contracts.
- [ ] Render one bounded settlement tier and Treasury.

### Slice 2: Persistence and return

- [ ] Add consented snapshots with block metadata.
- [ ] Build the Away Report and neutral change attribution.
- [ ] Add cosmetic projects and World XP.
- [ ] Add empty, stale, RPC-error, and reduced-motion states.

### Slice 3: Distribution and validation

- [ ] Build the privacy-safe share card.
- [ ] Instrument the activation and return funnel.
- [ ] Run comprehension tests covering kHYPE, represented value, kPoints, and World XP.
- [ ] Run wallet/privacy review and renderer performance testing.
- [ ] Release to a controlled cohort and evaluate the primary validation signal.

### Slice 4: Transaction readiness, only after MVP validation

- [ ] Design transaction previews and confirmation language.
- [ ] Implement official staking integration behind a feature flag.
- [ ] Test protocol limits, failures, wallet rejection, and output calculations.
- [ ] Complete independent security review before enabling production staking.

## 19. Assumptions

- The official Kinetiq mascot will be the central character and usable assets can be obtained.
- The team intends to build a web experience for HyperEVM-compatible wallets.
- “Quant” is a working name, not a settled trademark or product title.
- The first release can validate the concept without performing staking transactions inside the game.
- The product may store user-approved off-chain snapshots and cosmetic progress.
- Confirmed kPoints may not have a suitable public integration; their display is therefore optional in the MVP.
- World XP is non-transferable, non-financial, and has no promised conversion into protocol rewards.
- Kinetiq’s published contracts and documentation are the source of truth and may change after this PRD date.

## 20. Open Questions

1. **Is Quant the product name, mascot name, or both?** Recommended default: use Quant as the mascot/foreman and choose a more distinctive product title such as **Quant Works** after naming review.
2. **Is the project officially produced or endorsed by Kinetiq?** This determines naming, attribution, disclaimers, and mascot permissions.
3. **What exact art style is approved for the official mascot?** Decide pixel art, vector 2D, hand-drawn animation, or another system before producing the full asset set.
4. **Where should game state live?** Recommended default: lightweight accountless local persistence for prototypes, followed by an optional wallet-signed backend account for cross-device history.
5. **Can confirmed kPoints be retrieved through an authorized API or index?** If not, link to the official source and omit the value from the MVP.
6. **Should public share cards show rounded position tiers at all?** Recommended default: show no financial values unless the user explicitly opts in.
7. **What event earns World XP?** Finalize an anti-abuse table that rewards learning, returning, and cosmetic completion rather than capital size or transaction frequency.
8. **What is the initial launch goal?** A hackathon demo, community beta, or production Kinetiq feature will materially change timeline, security review, and polish requirements.

## 21. Reference Sources

- [Kinetiq documentation](https://kinetiq.xyz/docs)
- [Kinetiq integration guide](https://kinetiq.xyz/docs/integration)
- [Contracts and audits](https://kinetiq.xyz/docs/contracts-and-audits)
- [kHYPE documentation](https://kinetiq.xyz/docs/khype)
- [Kinetiq Earn documentation](https://kinetiq.xyz/docs/earn)
- [kPoints documentation](https://kinetiq.xyz/docs/kpoints)
- [Kinetiq brand guidelines](https://kinetiq.xyz/brand)
- [Official Kinetiq GitHub](https://github.com/kinetiq-research)

