# AptPays / Cresca DeFi Platform - AI Coding Agent Instructions

## Project Overview
**Cresca** is a smart, cross-chain super wallet available on iOS, Android, and as a browser extension, bringing together trading, payments, privacy, and automation in one seamless application. The platform enables users to create custom basket perpetual trades with up to 150x leverage via Merkle Trade integration, with auto-rebalancing to reduce risk. It also supports stealth/alias transactions for private payments, scheduled payments for recurring on-chain actions, MPC-based key management for secure recovery, and multi-chain abstraction that lets users spend from one balance across Aptos, Solana, Base, and EVM chains with seamless sending/receiving, automated strategies, gas abstraction, and real-time market execution.

The stack is **iOS/Android Native (Swift/Kotlin + Jetpack Compose)** for mobile, **Move smart contracts** on Aptos, **Solana programs**, and **Node.js backend** for optional relayer/analytics services.

## Business Model & Revenue Strategy

### Revenue Model
Cresca operates on a **freemium wallet model** where wallet features serve as user acquisition hooks, while revenue is generated entirely from trading features:

- **Wallet Features (Free)**: MPC key management, multi-chain abstraction, scheduled payments, stealth transactions, gas abstraction, real-time market data
- **Trading Revenue (Primary)**: 0.3% fee on transaction volume for basket perpetual trades exceeding $100
- **Target Market**: Serious investors seeking convenient risk mitigation through customizable leveraged basket trades

### Unique Value Proposition
Cresca fills a critical market gap by being the **only platform** offering:
- User-customizable perpetual future baskets with leverage up to 150x
- Complete self-custody with no centralized exchange risk
- Mobile-first trading experience with no backend dependencies
- Direct blockchain execution from mobile wallet with full transparency

### Competitive Advantage
1. **First-Mover Advantage**: No existing platform offers customizable basket perpetual trades with 150x leverage
2. **Premium Pricing Justified**: 0.3% fee is sustainable due to unique feature set that competitors cannot match
3. **User Flexibility**: Traders value the liberty to design their own basket compositions and risk profiles
4. **Convenience Factor**: All-in-one wallet eliminates need for multiple platforms (CEX for trading, wallet for storage, separate privacy tools)

## Funding Justification Points

### 1. Market Gap & First-Mover Advantage
**Cresca is the only mobile-first platform offering user-customizable perpetual future baskets with leverage up to 150x.** No competitor—centralized or decentralized—provides this level of customization combined with self-custody. This first-mover position allows us to establish brand dominance and capture market share before competitors can replicate the infrastructure. The 0.3% trading fee is justified because traders currently have no alternative for this functionality.

### 2. Revenue Stream Clarity
**100% of revenue comes from trading fees, not wallet features.** Wallet capabilities (MPC recovery, multi-chain abstraction, scheduled payments, privacy features) are user acquisition tools offered for free. This creates a clear funnel: attract users with best-in-class wallet features, monetize through high-leverage basket trading. The separation ensures sustainable revenue without compromising user trust or wallet accessibility.

### 3. Premium Fee Sustainability
**The 0.3% trading fee on volumes >$100 is justified by unique value delivery.** Traders currently use multiple platforms to approximate basket exposure (e.g., opening 5 positions on different exchanges), incurring higher cumulative fees, worse execution, and custodial risk. Cresca consolidates this into a single transaction with auto-rebalancing, making the 0.3% fee a cost-saving for power users. Market research shows traders will pay premium fees for exclusive capabilities.

### 4. Self-Custody & Decentralization as Competitive Moat
**Full self-custody eliminates counterparty risk that plagues centralized exchanges.** Post-FTX collapse, traders demand transparent, non-custodial solutions. Cresca's architecture—Move smart contracts + direct blockchain execution—ensures users maintain complete control of funds while accessing institutional-grade leverage. This trust advantage converts into user retention and justifies premium pricing over CEX alternatives.

### 5. Cross-Chain Abstraction for Market Expansion
**Multi-chain support (Aptos, Solana, Base, EVM) maximizes addressable market.** By enabling users to trade from a unified balance across chains, Cresca captures liquidity from multiple ecosystems. This reduces fragmentation costs for users (no bridging fees, no multiple wallets) and positions Cresca as the universal DeFi interface. Each additional chain integration multiplies potential trading volume without proportional cost increases.

### 6. Automated Risk Management Reduces Barrier to Entry
**Auto-rebalancing and risk mitigation features make 150x leverage accessible to non-professional traders.** Traditional high-leverage products are limited to sophisticated users due to liquidation risks. Cresca's basket auto-rebalancing spreads risk across multiple assets, reducing volatility and making extreme leverage viable for a broader audience. This expands the total addressable market beyond hedge funds to include retail "serious investors."

### 7. Privacy Features Drive User Acquisition
**Stealth/alias transactions attract privacy-conscious users who also trade.** By offering Monero-style privacy on transparent blockchains, Cresca appeals to users who value anonymity for everyday transactions but also engage in speculative trading. This dual value proposition (privacy + trading) creates a sticky user base less likely to churn to single-purpose competitors.

### 8. MPC Key Management Solves DeFi's Usability Crisis
**MPC-based recovery eliminates seed phrase anxiety, the #1 barrier to DeFi adoption.** Traditional wallets require users to secure 12-24 word phrases, causing widespread asset loss. Cresca's MPC approach (social recovery, biometric authentication) makes self-custody as convenient as centralized apps while maintaining security. This unlocks mainstream adoption, converting non-crypto users into potential traders.

### 9. Scheduled Payments & Automation Enable Recurring Revenue
**On-chain automation features (scheduled payments, automated strategies) build user stickiness.** Users who set up recurring payments, DCA strategies, or auto-rebalancing rules become platform-dependent, reducing churn. While these features are free, they increase engagement and daily active users, which correlates with higher trading frequency and fee generation.

### 10. No Backend Dependency Reduces Operational Risk & Costs
**Smart contract-based architecture eliminates server hosting costs and regulatory liability.** Unlike CEXs that require 24/7 server infrastructure, KYC databases, and compliance teams, Cresca's decentralized execution model shifts operational burden to blockchain validators. This results in 90%+ lower overhead costs, higher profit margins, and reduced regulatory attack surface. Savings can be reinvested into user acquisition and feature development.

## Funding Justification & Benefits

### Why This Funding is Justified

**Requested Amount**: To be determined based on development scope and market entry strategy

**Fund Allocation**:
- **Smart Contract Development & Audits (35%)**: Move contracts for basket perpetual trades, multi-chain abstraction layer, MPC key management, automated rebalancing logic. Third-party security audits (CertiK/Halborn) required before mainnet deployment.
- **Mobile Development (30%)**: Native iOS (Swift) and Android (Kotlin) applications with institutional-grade UX. Browser extension for desktop trading. Cross-platform testing infrastructure.
- **Oracle & Infrastructure Integration (15%)**: Pyth Network price feeds, LayerZero/Wormhole bridge integrations, Merkle Trade API connectivity, multi-chain RPC infrastructure.
- **Marketing & User Acquisition (12%)**: Targeted campaigns for serious crypto investors, trading communities, DeFi power users. Educational content on risk-managed leveraged trading.
- **Legal & Compliance (8%)**: Multi-jurisdiction regulatory review, terms of service, privacy policy, intellectual property protection for unique basket trading mechanism.

### Measurable Value for Aptos Ecosystem

#### 1. Transaction Volume Growth
**Target**: Generate $500M+ in annualized trading volume on Aptos within 12 months post-launch.
- Each basket trade creates 3-5 on-chain transactions (position open, rebalancing, oracle updates, position close)
- Conservative estimate: 1,000 active traders × $50,000 average monthly volume = $50M monthly GMV
- **Network Impact**: 15,000-25,000 transactions daily, generating meaningful gas fee revenue for validators

#### 2. TVL (Total Value Locked) Increase
**Target**: $25M TVL locked in Cresca smart contracts on Aptos by Month 18.
- Basket trading requires margin collateral locked in perpetual contracts
- Average position size: $5,000 with 50x leverage = $250,000 notional exposure
- Cross-chain abstraction requires liquidity pools on Aptos for instant settlements
- **Network Impact**: Top 10 DeFi protocol by TVL on Aptos, demonstrating capital confidence

#### 3. New User Acquisition for Aptos
**Target**: Onboard 50,000+ new wallet addresses to Aptos network within 24 months.
- Cresca's killer features (150x basket trades, privacy payments, MPC recovery) attract users from Solana, Ethereum, Base
- Multi-chain abstraction makes Aptos the settlement layer even for non-Aptos native users
- Free wallet features lower barrier to entry, trading features drive retention
- **Network Impact**: 15-20% user growth for Aptos DeFi ecosystem, strengthening network effects

#### 4. Developer Ecosystem Expansion
**Target**: Open-source 60% of Cresca's Move contracts and mobile SDKs by Month 12.
- Advanced Move patterns for multi-asset basket management become reference implementations
- MPC wallet integration SDKs enable other builders to offer seedless recovery
- Cross-chain abstraction libraries reduce friction for future multi-chain dApps
- **Network Impact**: 10+ derivative projects building on Cresca's infrastructure, accelerating Aptos DeFi innovation

#### 5. Liquidity & Trading Infrastructure
**Target**: Establish Aptos as credible venue for high-leverage derivatives trading.
- Currently no Aptos-native platform offers competitive leverage vs. Solana (Jupiter Perps) or Arbitrum (GMX)
- Cresca's success proves Aptos Move VM can handle complex financial primitives at scale
- Attracts institutional market makers and liquidity providers to Aptos
- **Network Impact**: Positions Aptos as viable alternative to Ethereum L2s for DeFi trading

#### 6. Cross-Chain Bridge Activity
**Target**: $100M+ in cross-chain volume flowing through Aptos via Cresca's abstraction layer.
- Users on Solana/Base/EVM can trade on Aptos without manual bridging
- Cresca smart contracts handle automated cross-chain settlements via LayerZero/Wormhole
- Every cross-chain trade generates fees for Aptos validators and bridge operators
- **Network Impact**: 30-40% increase in Aptos bridge utilization, strengthening interoperability narrative

#### 7. Brand & Mindshare
**Target**: Establish Cresca as top 3 mobile DeFi wallet globally within 18 months.
- Positive association: "If you want 150x leverage on custom baskets, you need Aptos via Cresca"
- Media coverage in crypto press (CoinDesk, The Block) highlights Aptos technical capabilities
- Conference presence (Token2049, EthDenver) showcases Move smart contract advantages
- **Network Impact**: Shifts perception from "Aptos is for payments" to "Aptos powers sophisticated DeFi"

#### 8. Regulatory Precedent
**Target**: Demonstrate compliant, non-custodial leveraged trading model on Aptos.
- Full self-custody architecture reduces regulatory attack surface vs. CEXs
- No KYC required for wallet usage, only optional for fiat on/off-ramps
- Transparent smart contracts enable regulators to monitor systemic risk without data requests
- **Network Impact**: Positions Aptos as preferred chain for compliant DeFi innovation in future regulatory landscape

### Return on Investment for Aptos Foundation

**If Cresca achieves 10% of targets**:
- $50M annual trading volume → 5,000 daily transactions → meaningful validator revenue
- $2.5M TVL → demonstrates Aptos can attract and retain DeFi capital
- 5,000 new users → expands developer TAM for future Aptos dApps

**If Cresca achieves 100% of targets**:
- $500M annual trading volume → 25,000 daily transactions → establishes Aptos as top 5 DeFi chain by activity
- $25M TVL → Cresca becomes Aptos flagship DeFi protocol, comparable to Raydium on Solana
- 50,000 new users → critical mass for network effects, attracting institutional capital and top-tier developers

**Funding Risk Mitigation**:
- Milestone-based disbursement tied to verifiable metrics (testnet transactions, mainnet TVL, user growth)
- Open-source commitment ensures Aptos ecosystem retains value even if Cresca pivots
- Team has proven Move smart contract expertise (references: deployed contracts on testnet, prior Aptos hackathon wins)

**Competitive Context**:
- Solana Foundation funded Jupiter Aggregator → now $2B+ TVL, anchors Solana DeFi ecosystem
- Arbitrum Foundation funded GMX → now $500M+ TVL, legitimized Arbitrum for derivatives trading
- Aptos needs similar flagship DeFi protocol to compete — Cresca fills this gap for leveraged basket trading

### Success Definition

**Minimum Viable Success (12 months)**:
- 10,000 active wallet users
- $50M cumulative trading volume
- $5M TVL in Cresca contracts
- 3+ third-party projects integrating Cresca's open-source components

**Ambitious Success (24 months)**:
- 50,000 active wallet users
- $500M cumulative trading volume
- $25M TVL in Cresca contracts
- Top 5 mobile DeFi wallet by downloads (App Store + Google Play)
- Profitable unit economics (0.3% trading fees exceed infrastructure costs)

**Transformational Success (36 months)**:
- 200,000+ active wallet users
- $2B+ cumulative trading volume
- $100M+ TVL in Cresca contracts
- Aptos recognized as leading chain for mobile-first, high-leverage DeFi trading globally

## Deliverables: High-Level Overview

### What We're Building

Cresca is a **comprehensive cross-chain DeFi super wallet** that combines institutional-grade trading capabilities with consumer-friendly wallet features. The platform delivers three core product layers:

#### 1. Smart Wallet Infrastructure (Foundation Layer)
**Mobile Applications**:
- **iOS Native App** (Swift/SwiftUI): Native iPhone/iPad application with biometric authentication, Face ID/Touch ID integration, iCloud keychain backup
- **Android Native App** (Kotlin/Jetpack Compose): Native Android application with Material Design 3, fingerprint/face unlock, encrypted local storage
- **Browser Extension** (TypeScript/React): Chrome, Firefox, Brave extension for desktop trading and dApp connectivity

**Key Features**:
- MPC-based key management with social recovery (no seed phrases)
- Multi-chain abstraction layer supporting Aptos, Solana, Base, and EVM chains
- Unified balance view across all chains with automatic routing
- Gas abstraction (users pay fees in any token)
- Real-time portfolio tracking and analytics

#### 2. Advanced Trading Platform (Revenue Layer)
**Basket Perpetual Trading System**:
- User-customizable crypto baskets (BTC, ETH, SOL, or any combination)
- Leverage options from 1x to 150x via Merkle Trade integration
- Auto-rebalancing algorithms to maintain risk profiles
- Real-time P&L tracking and position management
- One-touch trade execution directly from wallet

**Trading Infrastructure**:
- Oracle price feeds integration (Pyth Network)
- Order routing and execution engine
- Liquidation protection mechanisms
- Risk scoring and portfolio optimization
- Historical performance analytics

#### 3. Privacy & Automation Features (Differentiation Layer)
**Privacy Tools**:
- Stealth transactions (Monero-style privacy on transparent chains)
- Alias addresses for anonymous receiving
- Transaction mixing and obfuscation
- Zero-knowledge proof integrations

**Automation Suite**:
- Scheduled payments (recurring bills, subscriptions)
- Dollar-cost averaging (DCA) strategies
- Automated portfolio rebalancing
- Conditional orders (stop-loss, take-profit)
- Smart contract automation for complex strategies

### Technical Deliverables

#### Smart Contract Suite (Move Language on Aptos)
1. **Basket Perpetual Trading Contract**
   - Multi-asset position management
   - Leverage calculation and margin handling
   - Auto-rebalancing logic
   - Liquidation engine
   - Fee collection and distribution

2. **Multi-Chain Abstraction Contract**
   - Cross-chain message passing
   - Liquidity pooling for instant settlements
   - Bridge integration layer (LayerZero/Wormhole)
   - Token wrapping/unwrapping

3. **MPC Key Management Contract**
   - Multi-party computation key shards
   - Social recovery mechanisms
   - Guardian management
   - Emergency access controls

4. **Calendar Payments Contract** (Already deployed)
   - Scheduled payment execution
   - Recurring payment automation
   - Payment streaming functionality

5. **Privacy Transaction Contract**
   - Stealth address generation
   - Transaction mixing pools
   - Privacy-preserving transfers

#### Mobile SDK & Libraries
- **Kaptos Integration Layer**: Production-ready Kotlin/Swift wrappers
- **Transaction Builder**: Simplified API for complex multi-sig transactions
- **Wallet Connection SDK**: Standard for dApp integrations
- **Biometric Authentication Module**: Secure key storage with device hardware
- **Push Notification Service**: Real-time alerts for trades, payments, price movements

#### Backend Services (Optional/Analytics)
- **Event Indexer**: Real-time blockchain event monitoring
- **Price Oracle Aggregator**: Multi-source price data consolidation
- **Analytics Dashboard**: Admin panel for monitoring system health
- **API Gateway**: RESTful API for mobile app connectivity

#### Developer Tools & Documentation
- **Open-Source Components** (60% of codebase):
  - Move contract templates for basket trading
  - MPC wallet integration SDKs
  - Cross-chain abstraction libraries
  - Reference implementations

- **Comprehensive Documentation**:
  - Smart contract API reference
  - Mobile integration guides
  - Trading algorithm explanations
  - Security best practices
  - Deployment and testing guides

### Deployment Timeline & Milestones

**Phase 1: Foundation (Months 1-4)**
- Smart contract development and internal testing
- Mobile app MVP with basic wallet features
- Third-party security audits (CertiK/Halborn)
- Testnet deployment and stress testing

**Phase 2: Trading Integration (Months 5-8)**
- Merkle Trade API integration
- Basket trading UI/UX implementation
- Oracle price feed integration (Pyth Network)
- Closed beta with 100 selected users

**Phase 3: Cross-Chain & Privacy (Months 9-12)**
- LayerZero/Wormhole bridge integrations
- Multi-chain balance aggregation
- Stealth transaction implementation
- MPC key management rollout

**Phase 4: Mainnet Launch (Month 13+)**
- Public launch on Aptos mainnet
- iOS App Store and Google Play Store publication
- Marketing campaign and user acquisition
- Open-source component releases

### Quality Assurance & Security

**Security Measures**:
- Minimum 2 independent smart contract audits before mainnet
- Bug bounty program ($50K pool for critical vulnerabilities)
- Penetration testing for mobile applications
- Regular security reviews and upgrades

**Testing Coverage**:
- 90%+ unit test coverage for smart contracts
- Comprehensive integration tests for mobile apps
- End-to-end transaction flow testing
- Load testing for 10,000+ concurrent users
- Cross-platform compatibility testing (iOS/Android/Web)

**Monitoring & Maintenance**:
- 24/7 blockchain monitoring and alerting
- Automated error reporting and crash analytics
- Real-time performance metrics dashboard
- Regular dependency updates and security patches

### Expected Outputs

**For Users**:
- Production-ready mobile apps on iOS and Android
- Browser extension for desktop access
- Self-custody wallet with seedless recovery
- 150x leveraged basket trading capability
- Privacy-preserving transaction options
- Automated payment and trading strategies

**For Aptos Ecosystem**:
- Flagship DeFi protocol demonstrating Move smart contract capabilities
- Reference implementations for advanced Move patterns
- Open-source libraries for other builders
- Increased transaction volume and TVL on Aptos
- Expanded user base from other chains
- Enhanced reputation as serious DeFi platform

**For Developers**:
- Comprehensive SDK for basket trading integrations
- MPC wallet libraries for seedless wallet implementations
- Cross-chain abstraction tools
- Code examples and tutorials
- Active community support and documentation

## User Stories & UX Design

### Core User Personas

#### Persona 1: "Alex" - Crypto Trader
**Background**: 28-year-old day trader, manages $50K portfolio, uses multiple CEXs  
**Goals**: Maximize returns with high-leverage trades while maintaining self-custody  
**Pain Points**: Managing positions across multiple exchanges, custodial risk, high fees  
**Motivation**: Wants to create custom basket trades to hedge risk without giving up control

#### Persona 2: "Maya" - Privacy-Conscious Professional
**Background**: 35-year-old freelancer, receives crypto payments, values financial privacy  
**Goals**: Accept payments anonymously, schedule recurring bills, maintain privacy  
**Pain Points**: Transparent blockchain exposes financial activity, complex wallet management  
**Motivation**: Needs Monero-level privacy on mainstream chains with user-friendly interface

#### Persona 3: "Jordan" - DeFi Newcomer
**Background**: 22-year-old student, new to crypto, intimidated by seed phrases  
**Goals**: Start using DeFi without risk of losing funds due to lost seed phrase  
**Pain Points**: Fear of permanent asset loss, complex wallet recovery processes  
**Motivation**: Wants Web2-level convenience (biometric login, social recovery) with Web3 benefits

### User Stories by Feature Area

#### Epic 1: Wallet Onboarding & Key Management

**User Story 1.1: Seedless Wallet Creation**
```
As a new user,
I want to create a wallet using just my email and biometrics,
So that I don't have to worry about writing down or storing seed phrases.

Acceptance Criteria:
- User can sign up with email/phone number
- Biometric authentication (Face ID/fingerprint) enabled by default
- MPC key shards distributed across device, cloud, and guardians
- No seed phrase ever shown to user
- Wallet created in <60 seconds
```

**User Story 1.2: Social Recovery**
```
As a user who lost my device,
I want to recover my wallet by contacting trusted friends/family,
So that I can regain access without seed phrases.

Acceptance Criteria:
- User sets up 3-5 trusted guardians during onboarding
- Recovery requires 2-of-3 or 3-of-5 guardian approvals
- Guardians receive recovery request via email/SMS
- New device authenticated within 24 hours of guardian approval
- Old device access automatically revoked
```

**User Story 1.3: Multi-Chain Balance View**
```
As a user with assets on multiple chains,
I want to see all my balances in one unified view,
So that I don't need to switch between different wallets.

Acceptance Criteria:
- Dashboard shows balances from Aptos, Solana, Base, Ethereum
- Real-time USD value aggregation
- Single-tap chain switching
- Auto-routing for payments (spend from any chain balance)
- Historical portfolio performance chart
```

#### Epic 2: Basket Perpetual Trading

**User Story 2.1: Create Custom Basket**
```
As a trader,
I want to create a custom crypto basket with BTC, ETH, and SOL,
So that I can diversify my leveraged position in one transaction.

Acceptance Criteria:
- Select 2-10 assets from supported list
- Adjust percentage allocation per asset (10%-90% per asset)
- Preview basket composition before opening
- See total margin required and max leverage available
- Save basket presets for future use
```

**User Story 2.2: Open Leveraged Position**
```
As a trader,
I want to open a 50x leveraged long position on my custom basket,
So that I can amplify my returns on market movements.

Acceptance Criteria:
- Choose leverage from 1x to 150x via slider
- See liquidation price clearly displayed
- One-tap "Open Long" or "Open Short" buttons
- Transaction completes in <10 seconds
- Immediate confirmation with position ID
- Push notification on successful position open
```

**User Story 2.3: Real-Time Position Management**
```
As a trader with active positions,
I want to see live P&L updates and manage my positions,
So that I can react quickly to market changes.

Acceptance Criteria:
- Live P&L displayed in USD and percentage
- Color-coded profit (green) and loss (red)
- Auto-refresh every 5 seconds
- One-tap position close
- Add margin or adjust leverage without closing
- Set stop-loss and take-profit levels
```

**User Story 2.4: Auto-Rebalancing**
```
As a trader with a basket position,
I want my basket to auto-rebalance when allocations drift,
So that I maintain my intended risk profile without manual intervention.

Acceptance Criteria:
- Set rebalancing threshold (e.g., 5% drift)
- Automatic rebalancing triggered on-chain
- User receives notification of rebalancing event
- Transaction costs deducted from position margin
- Rebalancing history visible in position details
```

#### Epic 3: Privacy Transactions

**User Story 3.1: Stealth Payment Receiving**
```
As a privacy-conscious user,
I want to receive payments to anonymous addresses,
So that my transaction history isn't publicly linked to my identity.

Acceptance Criteria:
- Generate unlimited stealth addresses
- Each address used only once
- Funds automatically consolidated to main wallet
- Sender cannot see my other transactions
- No address reuse warnings
```

**User Story 3.2: Anonymous Sending**
```
As a user making sensitive payments,
I want to send crypto without revealing my wallet balance or history,
So that the recipient doesn't know my financial status.

Acceptance Criteria:
- Transaction mixing with 10+ other users' transactions
- Variable time delay (1-24 hours) for privacy
- Recipient sees payment from anonymous address
- My main wallet address never exposed
- Optional note/memo still supported
```

#### Epic 4: Scheduled Payments & Automation

**User Story 4.1: Recurring Payment Setup**
```
As a freelancer,
I want to schedule monthly rent payments in USDC,
So that I don't have to manually send payments each month.

Acceptance Criteria:
- Set recipient address, amount, token type
- Choose frequency (daily, weekly, monthly)
- Set start date and number of occurrences
- Preview total cost and end date
- Edit or cancel scheduled payment anytime
- Receive confirmation notification before each payment
```

**User Story 4.2: Dollar-Cost Averaging (DCA)**
```
As an investor,
I want to automatically buy $100 of APT every week,
So that I can build my position gradually without timing the market.

Acceptance Criteria:
- Set target asset, amount, and frequency
- Choose source wallet (USDC, stablecoins)
- See projected accumulation over time
- Automated DEX swap at best available price
- Weekly summary reports via push notification
- Pause/resume strategy anytime
```

#### Epic 5: Gas Abstraction

**User Story 5.1: Pay Gas in Any Token**
```
As a user with only USDC,
I want to make transactions without first buying APT for gas,
So that I can use my assets immediately without swaps.

Acceptance Criteria:
- Transaction prompts show gas cost in user's preferred token
- Automatic background swap of gas token
- No manual gas token purchase required
- Gas cost deducted from transaction amount
- Works across all supported chains
```

### UX Design Specifications

#### Design Principle 1: Progressive Disclosure
**Implementation**:
- Beginner mode: Simple send/receive/buy interface (80% of users)
- Advanced mode: Full trading features unlocked via settings toggle
- Expert mode: Direct smart contract interaction, custom gas settings

#### Design Principle 2: Zero-State Guidance
**Empty Wallet Screen**:
```
[Illustration: Rocket icon]
"Ready to start your DeFi journey?"

[Button: Buy Crypto]
[Button: Receive from Another Wallet]
[Link: Watch Tutorial (2 min)]
```

#### Design Principle 3: Confirmation Hierarchy
**Low-Risk Actions** (no confirmation):
- View balances
- Generate receive address
- Browse trading pairs

**Medium-Risk Actions** (single confirmation):
- Send <$100
- Schedule payment
- Close profitable position

**High-Risk Actions** (double confirmation + biometric):
- Send >$100
- Open 100x+ leverage position
- Delete guardians
- Export private keys

#### Key Screens & User Flows

**Screen 1: Home Dashboard**
```
┌─────────────────────────────────┐
│ ☰  Cresca            [Profile] │
├─────────────────────────────────┤
│                                 │
│  Total Balance                  │
│  $12,458.32                     │
│  +$234.12 (1.91%) today ↑       │
│                                 │
│  [━━━━━━━━━] Portfolio Chart    │
│                                 │
├─────────────────────────────────┤
│ Quick Actions:                  │
│ [Send] [Receive] [Trade] [Pay]  │
├─────────────────────────────────┤
│ Assets                          │
│ ○ APT    125.50    $1,004.00   │
│ ○ USDC   5,230     $5,230.00   │
│ ○ BTC    0.15      $6,224.32   │
│                                 │
│ Active Positions (2)            │
│ ◆ BTC/ETH Basket  +12.5% 📈    │
│ ◆ SOL Long 50x    -3.2% 📉     │
└─────────────────────────────────┘
```

**Screen 2: Basket Trading Flow**
```
Step 1: Choose Assets
┌─────────────────────────────────┐
│ ← Create Basket                 │
├─────────────────────────────────┤
│ Select assets (2-10):           │
│                                 │
│ [✓] BTC  [50%] ────────O        │
│ [✓] ETH  [30%] ─────O           │
│ [✓] SOL  [20%] ───O             │
│ [ ] APT                         │
│ [ ] USDC                        │
│                                 │
│ [+ Add Asset]                   │
│                                 │
│ [Continue]                      │
└─────────────────────────────────┘

Step 2: Set Leverage & Direction
┌─────────────────────────────────┐
│ ← Basket: BTC/ETH/SOL           │
├─────────────────────────────────┤
│ Position Size                   │
│ $1,000 USDC                     │
│                                 │
│ Leverage: 50x                   │
│ [━━━━━━O────────────] 150x max  │
│                                 │
│ Notional Exposure: $50,000      │
│ Liquidation Price: -2.0%        │
│                                 │
│ [Open Long Position]            │
│ [Open Short Position]           │
│                                 │
│ ⓘ Auto-rebalance: ON            │
│ ⓘ Stop-loss: 10%                │
└─────────────────────────────────┘

Step 3: Confirmation
┌─────────────────────────────────┐
│ Confirm Trade                   │
├─────────────────────────────────┤
│ Basket: BTC 50%, ETH 30%, SOL20%│
│ Direction: LONG                 │
│ Margin: $1,000 USDC             │
│ Leverage: 50x                   │
│ Fee: $3.00 (0.3%)               │
│                                 │
│ ⚠ Liquidation at -2.0% move    │
│                                 │
│ [Face ID to Confirm] 👤         │
│                                 │
│ [Cancel]                        │
└─────────────────────────────────┘
```

**Screen 3: Privacy Payment**
```
┌─────────────────────────────────┐
│ ← Private Send                  │
├─────────────────────────────────┤
│ To (Recipient Address)          │
│ [0x742d...8f3a]     [Paste]    │
│                                 │
│ Amount                          │
│ [100] USDC                      │
│                                 │
│ Privacy Level:                  │
│ ○ Standard (0 fee, instant)    │
│ ● Enhanced (0.1%, 1hr delay)   │
│ ○ Maximum (0.5%, 24hr delay)   │
│                                 │
│ ✓ Hide sender address           │
│ ✓ Mix with 10+ transactions    │
│ ✓ Unlink from wallet history   │
│                                 │
│ Network Fee: ~$0.02             │
│ Privacy Fee: $0.10              │
│                                 │
│ [Send Privately]                │
└─────────────────────────────────┘
```

### Accessibility & Localization

**Accessibility Features**:
- VoiceOver/TalkBack full support
- Minimum touch target size: 44x44pt
- Color-blind friendly palette (red/green alternatives)
- Haptic feedback for critical actions
- Font scaling up to 200%

**Localization**:
- Launch languages: English, Spanish, Chinese, Hindi, Portuguese
- Currency display in local fiat (USD, EUR, INR, BRL, etc.)
- Regional number formatting
- RTL support for Arabic, Hebrew

### Performance & Technical UX Requirements

**Load Times**:
- App launch: <2 seconds (cold start)
- Screen transitions: <300ms
- Balance updates: <1 second
- Trade execution: <10 seconds

**Offline Support**:
- View cached balances and transaction history
- Queue transactions for when connection restored
- Offline mode indicator
- Sync automatically on reconnection

**Error Handling**:
- User-friendly error messages (no technical jargon)
- Suggested actions for resolution
- "Contact Support" button on all error screens
- Error tracking for developer debugging

## Architecture Constraints

### Regulatory Constraints

#### 1. Self-Custody Compliance
**Constraint**: Must maintain full self-custody architecture to avoid securities regulation.
**Design Impact**:
- No custodial wallet features - users always control private keys
- MPC key shards distributed (device + cloud + guardians), never centralized
- Smart contracts are non-upgradable or use decentralized governance
- No admin "kill switch" that can freeze user funds
- All transactions signed by user, never by protocol

**Rationale**: Post-FTX regulatory environment treats custodial crypto services as money transmitters requiring MSB licenses. Self-custody eliminates this classification.

#### 2. No KYC/AML Requirements (DeFi Exception)
**Constraint**: Platform operates as pure DeFi protocol without fiat on/off-ramps in MVP.
**Design Impact**:
- No user registration or identity verification
- No IP geofencing or jurisdiction blocking
- No transaction monitoring or reporting obligations
- Users access via wallet address only
- Fiat on-ramps delegated to third parties (Transak, Moonpay)

**Rationale**: Pure crypto-to-crypto trading on decentralized protocols is currently exempt from KYC/AML in most jurisdictions. Regulatory risk increases only if we add fiat gateways.

#### 3. Derivatives Trading Restrictions
**Constraint**: Cannot market as "exchange" or "broker-dealer"; must position as "smart contract interface."
**Design Impact**:
- Terms of service clarify: "Cresca is a wallet interface, not a trading platform"
- Smart contracts are autonomous and permissionless
- No order books, no matching engine - all trades settle via DEX/oracle prices
- No leverage provided by Cresca - leverage is native to Merkle Trade protocol
- User acknowledges trading directly with smart contracts, not Cresca entity

**Rationale**: CFTC has asserted jurisdiction over crypto derivatives. By positioning as interface (similar to Uniswap frontend), we avoid registration as Swap Execution Facility (SEF).

#### 4. Data Privacy (GDPR/CCPA Compliance)
**Constraint**: Minimal data collection, user right to deletion.
**Design Impact**:
- No account creation or email storage in core wallet
- Analytics data anonymized and aggregated
- Users can request data deletion (off-chain records only)
- Privacy policy explicitly states on-chain data is immutable
- No tracking cookies without consent

**Rationale**: EU GDPR and California CCPA impose strict data handling requirements. Minimize liability by minimizing data collection.

#### 5. Sanctions Screening
**Constraint**: Must prevent usage by OFAC-sanctioned addresses.
**Design Impact**:
- Frontend checks wallet addresses against OFAC SDN list
- Blocked addresses see "Service unavailable in your region" message
- Check performed client-side, not stored on-chain
- Smart contracts remain permissionless (cannot block addresses)
- Legal disclaimer: "Users certify they are not sanctioned persons"

**Rationale**: U.S. Treasury OFAC violations carry severe penalties. Frontend blocking provides "good faith" compliance defense.

#### 6. Tax Reporting (Form 1099 Considerations)
**Constraint**: U.S. users may require tax reporting for trading gains.
**Design Impact**:
- Export transaction history feature for all trades
- CSV format compatible with tax software (CoinTracker, TaxBit)
- Timestamp, entry price, exit price, P&L clearly labeled
- No automatic 1099 filing (would trigger broker-dealer classification)
- Educational content: "Consult tax professional for reporting obligations"

**Rationale**: IRS classifies crypto as property. Users responsible for self-reporting, but we provide tools to facilitate compliance.

### Hardware Constraints

#### 1. Mobile Device Requirements
**Minimum Specifications**:
- **iOS**: iPhone 8 or newer (iOS 15.0+), 2GB RAM, A11 Bionic chip
- **Android**: Android 8.0 (API 26+), 3GB RAM, 64-bit ARM processor
- **Storage**: 200MB app size, 500MB cache for transaction history
- **Biometric Hardware**: Touch ID, Face ID, or fingerprint sensor required for MPC wallet

**Design Impact**:
- Kotlin/Swift native code for performance (no React Native for trading features)
- Image compression for NFT/token logos
- Lazy loading for transaction history (paginated queries)
- Background sync limitations (iOS 15 minutes, Android unlimited)

**Rationale**: Trading apps require low latency. Native code reduces UI lag by 40-60% vs. cross-platform frameworks.

#### 2. Network Connectivity
**Requirements**:
- **Minimum Speed**: 3G connection (100 kbps)
- **Latency Tolerance**: <5 seconds for transaction submission
- **RPC Reliability**: Fallback to 3+ Aptos RPC endpoints if primary fails

**Design Impact**:
- Offline mode for viewing balances (cached data)
- Transaction queue for intermittent connectivity
- Retry logic with exponential backoff
- Local transaction simulation before network submission
- Alert users if network latency >3 seconds

**Rationale**: Target users in emerging markets (India, Southeast Asia) with unreliable mobile networks.

#### 3. Secure Enclave / Trusted Execution Environment (TEE)
**Requirements**:
- **iOS**: Secure Enclave for key storage (available on iPhone 5S+)
- **Android**: StrongBox Keymaster or Trusted Execution Environment (TEE)
- **Fallback**: Software-based encryption if hardware unavailable

**Design Impact**:
- MPC key shards stored in hardware-backed keystore
- Biometric authentication triggers key release from secure enclave
- Keys never exposed to application memory
- Rooted/jailbroken devices blocked (SafetyNet/DeviceCheck)

**Rationale**: $10M+ annual trading volume requires institutional-grade security. Hardware isolation prevents malware key extraction.

### Software Constraints

#### 1. Blockchain Platform Limitations
**Aptos Constraints**:
- **Gas Costs**: ~0.0001 APT per transaction ($0.001 at $10/APT)
- **Transaction Speed**: 2-4 second finality
- **Block Size Limit**: ~65KB per transaction
- **Move VM Restrictions**: No dynamic dispatch, no recursion >100 depth

**Design Impact**:
- Batch operations to reduce gas (e.g., multi-asset basket updates in single tx)
- Gas abstraction layer (users pay in USDC, contract swaps for APT)
- Transaction size optimization (avoid large vector arguments)
- Iterative algorithms for rebalancing (avoid recursion)

**Rationale**: Aptos is 10x faster than Ethereum but still has computational limits. Design must respect Move VM constraints.

#### 2. Oracle Dependency (Pyth Network)
**Constraints**:
- **Update Frequency**: Pyth prices update every 400ms
- **Price Staleness**: Reject prices >10 seconds old
- **Oracle Downtime**: 99.9% uptime SLA (8.7 hours/year downtime)

**Design Impact**:
- Smart contracts check `price.timestamp` before accepting oracle data
- Fallback to secondary oracle (Switchboard) if Pyth unavailable
- Trading halts if both oracles fail (prevent manipulation)
- User notification: "Price feeds temporarily unavailable"

**Rationale**: Flash crashes on CEXs can cause oracle price manipulation. Stale price rejection prevents exploitation.

#### 3. Cross-Chain Bridge Limitations
**LayerZero/Wormhole Constraints**:
- **Bridge Speed**: 5-30 minutes for cross-chain messages
- **Bridge Fees**: $0.50-$5.00 depending on destination chain
- **Security Model**: Relayer-based (trusted validators)

**Design Impact**:
- User warning: "Cross-chain transfers take 10-30 minutes"
- Bridge fee displayed upfront in transaction preview
- Liquidity pools on Aptos for instant settlements (bridge asynchronously)
- Fallback: If bridge fails, refund to source chain

**Rationale**: Users expect instant payments. Liquidity pools provide UX of instant cross-chain while bridge settles in background.

#### 4. Mobile App Store Restrictions
**Apple App Store Rules**:
- **Guideline 3.1.1**: No in-app purchases for crypto (must use external providers)
- **Guideline 5.2.2**: No crypto mining or staking in background
- **Guideline 2.5.11**: NFTs cannot unlock app features

**Google Play Store Rules**:
- **Gambling Policy**: Leveraged trading must include risk disclaimers
- **Financial Services**: Cannot facilitate money transmission without licenses

**Design Impact**:
- Buy crypto via WebView (Transak/Moonpay), not in-app purchase
- No background processes for transaction execution
- Risk disclaimers on every trade screen: "You may lose your entire investment"
- Legal terms: "Not available in prohibited jurisdictions"

**Rationale**: App store rejection delays launch by weeks. Design must comply with all policies upfront.

#### 5. Third-Party SDK Constraints
**Kaptos SDK (Kotlin/Swift)**:
- **Version**: 1.0.0 (early release, limited documentation)
- **Breaking Changes**: Frequent API updates during beta
- **TypeScript Incompatibility**: Different transaction serialization vs. official Aptos TS SDK

**Design Impact**:
- Extensive wrapper layer around Kaptos for version isolation
- Pin to specific SDK version, test before upgrades
- Custom transaction builders for multi-sig (Kaptos doesn't support)
- Fallback to REST API for unsupported features

**Rationale**: Kaptos is only production-ready mobile SDK for Aptos. Must build abstraction layer to mitigate SDK immaturity.

#### 6. Browser Extension Constraints (Manifest V3)
**Chrome Extension Requirements**:
- **Manifest V3**: Background scripts replaced with service workers
- **Storage Limits**: 10MB for local storage
- **Permissions**: Must justify each permission to avoid user distrust

**Design Impact**:
- Service worker for transaction signing (no persistent background script)
- Indexed DB for transaction history (exceeds 10MB limit)
- Minimal permissions: `storage`, `activeTab`, no `<all_urls>`
- Conflict resolution with MetaMask/Phantom (detect and disable if present)

**Rationale**: Manifest V2 deprecated in 2024. V3 requires architectural changes but improves security and performance.

### Performance Constraints

#### 1. Real-Time Requirements
**Targets**:
- **Price Updates**: <500ms latency from oracle to UI
- **Transaction Confirmation**: <10 seconds from sign to on-chain
- **P&L Calculation**: <100ms for portfolio updates

**Design Impact**:
- WebSocket connections for price feeds (no polling)
- Optimistic UI updates (show pending state immediately)
- Client-side P&L calculation (no server round-trip)
- Indexed blockchain data (no full node queries)

**Rationale**: Traders expect instant feedback. Even 1-second lag feels unresponsive for 150x leverage positions.

#### 2. Scalability Targets
**Capacity Planning**:
- **Concurrent Users**: 10,000 simultaneous traders by Month 12
- **Transactions per Second**: 100 TPS peak load
- **Data Storage**: 1TB transaction history over 3 years

**Design Impact**:
- Horizontal scaling for event indexer (Kafka/Redis streams)
- CDN for static assets (Cloudflare)
- Database sharding by user_address hash
- Archive old data to cold storage (S3 Glacier)

**Rationale**: Aptos can handle 100K+ TPS, but our infrastructure is bottleneck. Design for 10x current needs.

#### 3. Battery & Data Usage Constraints
**Mobile Efficiency**:
- **Battery Drain**: <2% per hour of active use
- **Data Usage**: <50MB per day for typical user
- **Background Activity**: <5MB per day when app closed

**Design Impact**:
- Throttle price updates when app in background (1 min intervals vs. 1 sec)
- Compress API responses (gzip)
- Cache static data (token logos, chain configs)
- Disable animations on low-power mode

**Rationale**: Mobile users in emerging markets have limited data plans. Excessive usage causes app deletion.

### Security Constraints

#### 1. Cryptographic Requirements
**Standards Compliance**:
- **Key Derivation**: BIP39, BIP44, BIP32 for HD wallets
- **Signature Scheme**: Ed25519 (Aptos standard)
- **Encryption**: AES-256-GCM for local storage
- **Hashing**: SHA-256, Keccak-256 for data integrity

**Design Impact**:
- Use audited cryptography libraries (libsodium, OpenSSL)
- No custom crypto implementations
- Key rotation every 90 days (recommended to users)
- Secure random number generation (hardware RNG or OS-provided)

**Rationale**: Crypto vulnerabilities are catastrophic. Only use battle-tested implementations.

#### 2. Penetration Testing & Audits
**Requirements**:
- **Smart Contracts**: 2 independent audits (CertiK, Halborn)
- **Mobile Apps**: Annual penetration test (OWASP Mobile Top 10)
- **Backend Services**: Quarterly vulnerability scans
- **Bug Bounty**: $50K pool ($10K max payout for critical)

**Design Impact**:
- 4-week security audit buffer before mainnet launch
- Automated security scanning in CI/CD (Snyk, Dependabot)
- Incident response plan (24-hour disclosure for critical bugs)
- Post-mortem published for all security incidents

**Rationale**: One exploit destroys user trust permanently. Proactive security is non-negotiable.

## Competitive Market Analysis

### Wallet Market Overview
**Total Market Cap**: $3.46 Billion (Wallet category)  
**24h Trading Volume**: $173.4 Million  
**Total Wallets Analyzed**: 93+ major players

### Top Competitor Revenue Models

#### 1. **Trust Wallet (TWT)** - Market Cap: $436.8M
**Revenue Streams**:
- **Swap Fees**: 0.5-1% on in-app DEX swaps (primary revenue)
- **Buy Crypto Commissions**: 1-3% partnership fees with Simplex/MoonPay
- **Staking Rewards**: 10-20% commission on staking rewards
- **NFT Marketplace**: 2.5% fee on NFT sales
- **Estimated Annual Revenue**: $15-25M (based on 10M+ users, $500M monthly swap volume)

**Business Model**: Freemium wallet with monetization through financial services, not trading leverage.

#### 2. **SafePal (SFP)** - Market Cap: $155.8M
**Revenue Streams**:
- **Hardware Wallet Sales**: $49.99 per device (40% margin)
- **DEX Swap Fees**: 0.3-0.5% on trades
- **Launchpad Fees**: Token listing fees ($50K-$100K per project)
- **Staking Commission**: 15% on validator rewards
- **Estimated Annual Revenue**: $8-12M (hardware + software combined)

**Business Model**: Hardware-first with software monetization layer.

#### 3. **Coin98 (C98)** - Market Cap: $27.2M
**Revenue Streams**:
- **Multi-chain Bridge Fees**: 0.1-0.3% per cross-chain transaction
- **Swap Aggregator**: 0.2% routing fees
- **Launchpad**: Token sale platform fees (5-10% of raised capital)
- **NFT Marketplace**: 2% trading fees
- **Estimated Annual Revenue**: $3-5M

**Business Model**: Multi-chain aggregation with DeFi service monetization.

#### 4. **TokenPocket (TPT)** - Market Cap: $35.8M
**Revenue Streams**:
- **DApp Browser Ads**: CPC/CPA advertising from DApps
- **Flash Swap Fees**: 0.5% on instant cross-DEX swaps
- **Token Listings**: Promotion fees for new tokens ($10K-$30K)
- **Institutional Services**: White-label wallet solutions
- **Estimated Annual Revenue**: $2-4M

**Business Model**: Freemium with advertising and B2B services.

#### 5. **Sui Wallet** (Native) - No Token, Foundation-Backed
**Revenue Model**:
- **No Direct Revenue**: Foundation-funded infrastructure
- **Ecosystem Growth Focus**: Drives adoption for Sui blockchain
- **Transaction Fees**: Benefit accrues to validators, not wallet
- **Strategic Value**: User acquisition tool for Sui ecosystem

**Business Model**: Loss leader funded by Sui Foundation to bootstrap network adoption.

#### 6. **MetaMask (ConsenSys)** - Market Leader (No Native Token)
**Revenue Streams**:
- **Swap Fees**: 0.875% on MetaMask Swaps (largest revenue driver)
- **Bridge Fees**: 0.3-0.5% on cross-chain transfers
- **Buy Crypto**: 1-3% commissions from payment partners
- **Institutional Services**: MetaMask Institutional licensing fees
- **Estimated Annual Revenue**: $200M+ (2023 peak), $50-80M (2024-2025 bear market)

**Business Model**: Freemium with transaction-based monetization at massive scale.

#### 7. **Phantom Wallet** (Solana) - Private, No Token
**Revenue Streams**:
- **Swap Fees**: 0.85% on built-in Jupiter integration
- **NFT Marketplace Integration**: Revenue share with Magic Eden (estimated 0.5%)
- **Buy Crypto**: 1-2% commissions from MoonPay/Ramp
- **Estimated Annual Revenue**: $15-30M (based on 3M+ active users)

**Business Model**: Solana-native with high-volume, low-fee transactions.

#### 8. **Rabby Wallet** - Open Source, No Token
**Revenue Model**:
- **No Direct Monetization**: Community-funded, grants
- **Future Potential**: May introduce optional premium features
- **Strategic Value**: User acquisition for DeFi protocols

### Revenue Comparison: Cresca vs. Competitors

| Wallet | Primary Revenue | Fee Structure | Est. Annual Revenue | Leverage Trading |
|--------|----------------|---------------|---------------------|------------------|
| **Cresca** | Basket Trading Fees | 0.3% on volume >$100 | **$5-50M (projected)** | ✅ Up to 150x |
| MetaMask | Swap Fees | 0.875% | $50-80M | ❌ No leverage |
| Trust Wallet | Swap + Services | 0.5-1% + commissions | $15-25M | ❌ No leverage |
| Phantom | Swap Fees | 0.85% | $15-30M | ❌ No leverage |
| SafePal | Hardware + Swaps | $49.99 device + 0.3% | $8-12M | ❌ No leverage |
| Coin98 | Bridge + Swaps | 0.1-0.5% | $3-5M | ❌ No leverage |
| TokenPocket | Ads + Swaps | 0.5% + CPC | $2-4M | ❌ No leverage |
| Sui Wallet | None (Foundation) | $0 | $0 | ❌ No leverage |

### Cresca's Competitive Advantages

#### 1. **Unique Revenue Model**
- **Only wallet monetizing leveraged trading** (0.3% on high-volume trades)
- Competitors rely on low-margin swaps (0.5-0.875%)
- **Higher ARPU potential**: $500 per trader vs. $15-50 for typical wallet users

**Calculation**:
- Average Cresca trader: $50K monthly volume × 0.3% fee = $150/month × 12 = **$1,800 annual revenue per user**
- Average MetaMask user: $5K monthly swaps × 0.875% = $43.75/month × 12 = **$525 annual revenue per user**
- **Cresca ARPU is 3.4x higher** despite lower fee percentage (due to leverage multiplier)

#### 2. **First-Mover in Basket Perpetuals**
- **No competitor offers customizable basket perpetual trading**
- GMX/dYdX offer single-asset perpetuals only
- Merkle Trade partnership provides infrastructure without building from scratch
- **Market gap**: Traders currently use 5+ platforms to approximate basket exposure

#### 3. **Premium Fee Justified**
- 0.3% fee is 3-10x lower than centralized exchanges for leveraged trading:
  - Binance Futures: 0.02% maker / 0.04% taker (but 10-20x per trade due to liquidations/funding)
  - Effective cost for basket on CEX: ~0.5-1% due to multiple positions
- **Cresca consolidates into single 0.3% fee** = cost savings for power users

#### 4. **Wallet Features as Free User Acquisition**
- Competitors charge for everything (swaps, bridges, staking)
- **Cresca strategy**: Free wallet features drive 10x user acquisition
- Convert 5-10% of free users to paid traders = sustainable funnel

**User Economics**:
- If 100K wallet users, 5% become traders = 5,000 traders
- 5,000 traders × $1,800 annual revenue = **$9M annual revenue**
- vs. 100K swap users × $525 = $52.5M (requires 20x more users for same revenue)

### Competitor Weaknesses Cresca Exploits

#### Trust Wallet / SafePal
**Weakness**: No trading features, only swaps and staking  
**Cresca Advantage**: Full trading platform eliminates need for CEX

#### MetaMask / Phantom
**Weakness**: High swap fees (0.85-0.875%) with no leverage  
**Cresca Advantage**: Lower effective cost per trade with 150x leverage options

#### Sui Wallet (Foundation)
**Weakness**: No monetization, unsustainable without perpetual grants  
**Cresca Advantage**: Self-sustaining revenue model from day 1

#### Coin98 / TokenPocket
**Weakness**: Low revenue per user ($2-5M total with millions of users)  
**Cresca Advantage**: High-ARPU model with serious investors (1,000 traders > 100K casual users)

### Market Positioning

**Cresca vs. Competitors Matrix**:

```
                    Self-Custody | Trading Leverage | Multi-Chain | Privacy Features | Revenue Model
Cresca                   ✅       |       ✅ (150x) |     ✅     |       ✅        | Trading fees (0.3%)
MetaMask                 ✅       |       ❌        |     ✅     |       ❌        | Swap fees (0.875%)
Trust Wallet             ✅       |       ❌        |     ✅     |       ❌        | Swap/Staking (0.5-1%)
Phantom                  ✅       |       ❌        |     ❌     |       ❌        | Swap fees (0.85%)
Binance (CEX)            ❌       |       ✅ (125x) |     ✅     |       ❌        | Trading (0.02-0.04%)
GMX (Perps)              ✅       |       ✅ (50x)  |     ❌     |       ❌        | Trading (0.1%)
Sui Wallet               ✅       |       ❌        |     ❌     |       ❌        | None ($0)
```

**Unique Position**: Cresca is the **ONLY** platform offering all 5: Self-custody + 150x leverage + Multi-chain + Privacy + Sustainable revenue.

### Revenue Projection Benchmarking

**Conservative Case (10% of MetaMask's trading users)**:
- MetaMask: 30M users, ~1M active traders
- Cresca Target: 100K users, 5K active traders (0.5% of MetaMask)
- Revenue: 5K traders × $1,800 ARPU = **$9M annual**

**Moderate Case (1% of Binance Futures users)**:
- Binance Futures: ~8M active traders
- Cresca Target: 80K traders
- Revenue: 80K traders × $1,800 ARPU = **$144M annual**

**Ambitious Case (Become #1 DeFi Perps Platform)**:
- GMX: ~$400M annual trading fees on $50B volume
- Cresca Target: $20B volume (40% of GMX)
- Revenue: $20B × 0.3% = **$60M annual**

### Why Investors Should Fund Cresca Over Competitors

1. **Higher Revenue Potential**: 3.4x ARPU vs. swap-only wallets
2. **Defensible Moat**: Only platform with 150x basket perpetuals
3. **Capital Efficient**: Don't need 100M users to be profitable (1M serious traders > 100M casual users)
4. **Sustainable Model**: Not dependent on foundation grants (unlike Sui Wallet)
5. **Market Timing**: Post-FTX, traders demand non-custodial leverage solutions
6. **Technology Edge**: Move smart contracts on Aptos enable features impossible on EVM chains

**Conclusion**: Cresca targets the **most valuable 1% of crypto users** (serious traders) rather than competing for 99% of low-value swap users. This "whale hunting" strategy yields higher margins, faster profitability, and more defensible competitive positioning.

## Critical Dependencies

### Phase 1: Foundation Launch (January 2026) - Prerequisites

**BEFORE mainnet launch can occur:**

1. **Smart Contract Audits (BLOCKING)**
   - ✅ Minimum 2 independent security audits completed (CertiK and Halborn)
   - ✅ All critical/high vulnerabilities resolved
   - ✅ Audit reports published publicly
   - **Timeline**: Must complete by December 20, 2025 (4 weeks before launch)
   - **Risk**: Mainnet launch CANNOT proceed without audits

2. **App Store Approvals (BLOCKING)**
   - ✅ Apple App Store review passed (typically 2-7 days, but can take 2 weeks)
   - ✅ Google Play Store review passed (typically 1-3 days)
   - ✅ Browser extension reviews (Chrome: 1-3 days, Firefox: 1-2 weeks)
   - **Timeline**: Submit by January 1, 2026 to hit January 15 launch
   - **Risk**: Rejection requires resubmission (adds 1-2 weeks delay)

3. **Infrastructure Setup (BLOCKING)**
   - ✅ RPC nodes configured with 3+ redundant Aptos endpoints
   - ✅ Event indexer deployed and tested (handles 1,000+ TPS)
   - ✅ CDN configured for static assets (Cloudflare)
   - ✅ Database backups automated (daily snapshots)
   - **Timeline**: Must be live by January 10, 2026
   - **Risk**: Infrastructure failure causes poor UX or downtime

4. **Legal Compliance (BLOCKING)**
   - ✅ Terms of Service finalized and reviewed by legal counsel
   - ✅ Privacy Policy GDPR/CCPA compliant
   - ✅ OFAC sanctions screening integrated in frontend
   - ✅ Regulatory assessment complete (confirm DeFi classification)
   - **Timeline**: Must complete by December 31, 2025
   - **Risk**: Legal exposure or app store rejection

5. **Testnet Validation (BLOCKING)**
   - ✅ 100+ users successfully test all wallet features on testnet
   - ✅ Zero critical bugs in 2-week public testnet period
   - ✅ Transaction success rate >98%
   - ✅ Load testing: 1,000 concurrent users handled smoothly
   - **Timeline**: December 15-31, 2025
   - **Risk**: Bugs discovered on mainnet damage reputation

---

### Phase 2: Trading Activation (February 2026) - Prerequisites

**BEFORE basket perpetuals can launch:**

1. **Merkle Trade Integration (BLOCKING)**
   - ✅ API access granted by Merkle Trade
   - ✅ Smart contract integration tested on testnet
   - ✅ 150x leverage functionality verified
   - ✅ Partnership agreement signed
   - **Timeline**: Must complete by January 25, 2026
   - **Risk**: Without Merkle Trade, no leveraged trading possible

2. **Oracle Price Feeds (BLOCKING)**
   - ✅ Pyth Network integration live on mainnet
   - ✅ Secondary oracle (Switchboard) configured as fallback
   - ✅ Price update frequency <1 second confirmed
   - ✅ Staleness checks implemented (reject prices >10s old)
   - **Timeline**: Must be live by January 28, 2026
   - **Risk**: Inaccurate prices = user losses and lawsuits

3. **Basket Trading Contract Audits (BLOCKING)**
   - ✅ Additional audit specifically for perpetuals contract
   - ✅ Liquidation logic verified by third party
   - ✅ P&L calculation accuracy confirmed (100 test cases)
   - ✅ Auto-rebalancing algorithm stress-tested
   - **Timeline**: Must complete by January 20, 2026
   - **Risk**: Exploit drains user margin collateral

4. **Liquidity Bootstrapping (NON-BLOCKING but CRITICAL)**
   - ⚠️ $1M+ in initial liquidity for basket trading
   - ⚠️ Market makers onboarded for tight spreads
   - ⚠️ Treasury funded with 10,000 APT for operations
   - **Timeline**: Should complete by January 31, 2026
   - **Risk**: Low liquidity = high slippage, poor UX

5. **Trading UI/UX Testing (BLOCKING)**
   - ✅ 50+ beta users test trading flows on testnet
   - ✅ Leverage slider, basket creation, position management validated
   - ✅ Mobile and desktop UX optimized (load time <2s)
   - ✅ Error handling for edge cases (insufficient margin, network issues)
   - **Timeline**: January 20-31, 2026
   - **Risk**: Confusing UX = users lose funds due to misunderstanding

---

### Phase 3: Automation Suite (February 2026) - Prerequisites

**BEFORE scheduled payments can launch:**

1. **Calendar Payments Contract Upgrade (BLOCKING)**
   - ✅ Contract already deployed at `0x0f9713...` but needs mainnet verification
   - ✅ Cron executor service operational (AWS Lambda or similar)
   - ✅ Gas refill automation configured (auto-top up executor wallet)
   - ✅ Payment queue handling 1,000+ scheduled payments/day
   - **Timeline**: Must complete by February 10, 2026
   - **Risk**: Missed payments = user complaints and churn

2. **Automation Backend (NON-BLOCKING but RECOMMENDED)**
   - ⚠️ Off-chain monitoring for payment execution
   - ⚠️ Email/SMS notifications for upcoming payments
   - ⚠️ Payment history indexing for user dashboard
   - **Timeline**: February 1-15, 2026
   - **Risk**: Works without backend, but UX suffers

3. **DCA Strategy Testing (BLOCKING)**
   - ✅ DEX integration for auto-swaps (Liquidswap or Panora)
   - ✅ Price limit orders functional (prevent bad execution)
   - ✅ 20+ test users validate DCA flows on testnet
   - **Timeline**: February 5-14, 2026
   - **Risk**: Users set up DCA but swaps fail = lost trust

---

### Phase 4: Payments Expansion (March-April 2026) - Prerequisites

**BEFORE crypto cards can launch:**

1. **Card Provider Partnership (BLOCKING)**
   - ✅ Contract signed with Visa/Mastercard card issuer (e.g., Apto, Marqeta)
   - ✅ Compliance requirements met (KYC/AML for card users only)
   - ✅ Card production initiated (6-8 week lead time)
   - ✅ Spending limits, fees, and terms finalized
   - **Timeline**: Must sign by January 15, 2026 for April delivery
   - **Risk**: No card partner = phase 4 delayed by 3+ months

2. **Fiat On-Ramp Integration (BLOCKING)**
   - ✅ Transak or MoonPay API integrated
   - ✅ Bank account verification flow tested
   - ✅ ACH/SEPA withdrawal limits configured
   - ✅ Compliance with payment processor terms
   - **Timeline**: Must complete by February 28, 2026
   - **Risk**: Users can't convert crypto to fiat = limited utility

3. **Merchant Payment Gateway (NON-BLOCKING)**
   - ⚠️ API for e-commerce integrations (Shopify, WooCommerce)
   - ⚠️ Invoice generation system
   - ⚠️ Webhook notifications for payment confirmations
   - **Timeline**: March 1-31, 2026
   - **Risk**: Optional feature, doesn't block card launch

4. **KYC/AML System (BLOCKING for cards)**
   - ✅ Sumsub or Jumio integration for identity verification
   - ✅ Document upload and selfie verification flow
   - ✅ OFAC/sanctions screening automated
   - ✅ Age verification (18+ only)
   - **Timeline**: Must complete by March 1, 2026
   - **Risk**: Card provider requires KYC, can't ship cards without it

---

### Cross-Phase Dependencies (Apply to ALL Phases)

**Continuous requirements throughout launch:**

1. **Funding & Treasury Management (CRITICAL)**
   - 💰 Sufficient APT balance for gas sponsorship (min 5,000 APT = $50K)
   - 💰 Operations budget for infrastructure ($5K/month)
   - 💰 Marketing budget for user acquisition ($20K/month post-launch)
   - **Risk**: Running out of funds halts operations

2. **Team Availability (BLOCKING)**
   - 👥 Lead developer available full-time through April 2026
   - 👥 At least 1 smart contract auditor on retainer for hotfixes
   - 👥 Customer support team trained (can start with 1-2 people)
   - **Risk**: Key person unavailable = delayed bug fixes

3. **Regulatory Monitoring (ONGOING)**
   - ⚖️ Monthly review of SEC/CFTC guidance on DeFi
   - ⚖️ Legal counsel on retainer for urgent questions
   - ⚖️ Jurisdiction-specific restrictions monitored (e.g., US SEC changes)
   - **Risk**: Sudden regulatory action could require platform changes

4. **Security Monitoring (ONGOING)**
   - 🔒 Bug bounty program active ($50K pool)
   - 🔒 Real-time alerts for unusual contract activity
   - 🔒 Incident response plan documented and tested
   - 🔒 Weekly security reviews of new code
   - **Risk**: Exploit discovered post-launch = reputation damage

---

### Dependency Flowchart

```
START → Smart Contract Audits (Dec 20) → Legal Review (Dec 31) → Testnet Validation (Dec 31)
                                                                          ↓
                                                                  App Store Submissions (Jan 1)
                                                                          ↓
                                                            Infrastructure Setup (Jan 10)
                                                                          ↓
                                                            PHASE 1 LAUNCH (Jan 15) ✅
                                                                          ↓
                                                            Merkle Trade Integration (Jan 25)
                                                                          ↓
                                                            Oracle Integration (Jan 28)
                                                                          ↓
                                                            Trading Contract Audit (Jan 20)
                                                                          ↓
                                                            Trading Beta Testing (Jan 31)
                                                                          ↓
                                                            PHASE 2 LAUNCH (Feb 1) ✅
                                                                          ↓
                                                            Calendar Contract Verification (Feb 10)
                                                                          ↓
                                                            DCA Testing (Feb 14)
                                                                          ↓
                                                            PHASE 3 LAUNCH (Feb 15) ✅
                                                                          ↓
                                                            Card Partner Contract (Jan 15!)
                                                                          ↓
                                                            KYC System (Mar 1)
                                                                          ↓
                                                            Fiat On-Ramps (Feb 28)
                                                                          ↓
                                                            Card Production (6-8 weeks)
                                                                          ↓
                                                            PHASE 4 LAUNCH (Apr 1) ✅
```

**Key Insight**: Card partner contract MUST be signed in January (before Phase 1 launch) due to 6-8 week production lead time, even though cards ship in April.

## Joint Product Partnerships & Strategic Alliances

### Partnership Strategy Overview

Cresca's go-to-market success depends on **strategic partnerships across 4 categories**: Web3 Infrastructure (blockchain protocols, oracle providers, bridges), DeFi Integration Partners (DEXs, perpetual trading platforms, liquidity providers), Distribution & Growth Partners (wallet aggregators, exchanges, content creators), and Real-World Integration Partners (card issuers, payment processors, fiat on-ramps). Each partnership must provide **mutual value** where both parties benefit from integration.

### Partnership Categories & Targets

#### Category 1: Web3 Infrastructure Partners

| Partner | Status | Benefits for Cresca | Benefits for Partner | Integration Timeline |
|---------|--------|---------------------|----------------------|---------------------|
| **Aptos Foundation** | 🟢 Active | Funding, technical support, ecosystem visibility, validator infrastructure access | Flagship DeFi protocol, $500M+ transaction volume, 50K+ new users to Aptos | Ongoing (Foundation launch partner) |
| **Merkle Trade** | 🟡 Negotiating | 150x leverage infrastructure, perpetual trading engine, liquidation system | First mobile-first integration, access to retail traders, revenue share on volume | Phase 2 (Jan 2026) |
| **Pyth Network** | 🟡 Planned | Real-time price oracles (<400ms updates), institutional-grade data feeds, multi-asset support | High-frequency consumer (15K-25K daily price queries), showcase for mobile DeFi | Phase 2 (Jan 2026) |
| **LayerZero** | 🟡 Planned | Cross-chain messaging, Aptos↔Solana/EVM bridge, unified liquidity | Mobile-first cross-chain use case, transaction volume on LayerZero protocol | Phase 3 (Feb 2026) |
| **Wormhole** | 🟡 Planned | Backup bridge infrastructure, additional cross-chain routes, redundancy for LayerZero | Additional bridge volume, mobile wallet integration reference | Phase 3 (Feb 2026) |
| **Xyra (KanaLabs)** | 🟡 Exploring | AI-powered trading insights, portfolio optimization, market sentiment analysis | Integration with high-leverage basket trading, data on trader behavior | Phase 2-3 (Feb 2026) |

**Key Priorities**: 
- Merkle Trade partnership is **BLOCKING** for Phase 2 launch (no leverage trading without it)
- Pyth Network integration is **BLOCKING** for accurate price feeds
- Cross-chain bridges (LayerZero/Wormhole) required for multi-chain abstraction value proposition

#### Category 2: DeFi Integration Partners

| Partner | Status | Benefits for Cresca | Benefits for Partner | Integration Timeline |
|---------|--------|---------------------|----------------------|---------------------|
| **Liquidswap (Pontem)** | 🟡 Planned | DEX liquidity for DCA/auto-swaps, APT↔stablecoin routing, gas abstraction swaps | Mobile wallet integration, daily automated swap volume, new user acquisition | Phase 3 (Feb 2026) |
| **Panora (Aptos DEX)** | 🟡 Planned | Alternative DEX routing, price comparison for best execution, additional liquidity | Wallet integration, order flow, brand visibility | Phase 3 (Feb 2026) |
| **Thala Labs** | 🟡 Exploring | Stablecoin (MOD) integration, liquid staking (thAPT), yield opportunities | Wallet distribution for MOD adoption, auto-staking integration | Phase 3-4 (Mar 2026) |
| **Aries Markets** | 🟡 Exploring | Lending/borrowing for margin top-ups, leveraged position management, yield on idle capital | New lending volume, mobile-first lending UI, trader customer segment | Phase 4+ (Future) |

**Key Priorities**:
- At least 1 DEX integration (Liquidswap or Panora) required for DCA/automation features
- Stablecoin partnerships (Thala MOD, USDC, USDT) critical for trading margin and settlements

#### Category 3: Distribution & Growth Partners

| Partner | Status | Benefits for Cresca | Benefits for Partner | Integration Timeline |
|---------|--------|---------------------|----------------------|---------------------|
| **CoinGecko** | 🟡 Planned | Wallet listing, App Store visibility, trust badge, market data integration | Track Cresca trading volume, wallet user metrics, data for wallet rankings | Phase 1 (Jan 2026) |
| **DappRadar** | 🟡 Planned | DApp store listing, ranking by TVL/users, discovery channel | Mobile DeFi app data, trading volume metrics | Phase 1 (Jan 2026) |
| **Crypto Twitter KOLs** | 🟡 Planned | User acquisition, brand awareness, beta tester recruitment, trading community access | Early access, revenue share on referrals, custom features for influencers | Pre-launch (Dec 2025) |
| **Aptos Ecosystem Projects** | 🟡 Exploring | Cross-promotion, shared user base, ecosystem credibility | Wallet infrastructure for their users, payment rails | Phase 1+ (Ongoing) |

**Key Priorities**:
- Listing on CoinGecko/DappRadar within 30 days of mainnet launch for discoverability
- KOL partnerships for initial user acquisition (target 10K users in first 30 days)

#### Category 4: Real-World Integration Partners

| Partner | Status | Benefits for Cresca | Benefits for Partner | Integration Timeline |
|---------|--------|---------------------|----------------------|---------------------|
| **Apto Payments** | 🔴 Not Started | Visa/Mastercard crypto cards, card production, card issuer license, compliance infrastructure | Mobile wallet integration, card program volume, crypto-native customer base | Phase 4 (Sign Jan 2026, Ship Apr 2026) |
| **Marqeta** | 🔴 Not Started | Alternative card issuer, US market focus, faster approval process | Crypto card program, mobile-first integration | Phase 4 (Backup option) |
| **Transak** | 🟡 Planned | Fiat on-ramp (ACH, SEPA, card purchases), 100+ countries, KYC infrastructure | Mobile wallet integration, transaction volume, revenue share | Phase 4 (Mar 2026) |
| **MoonPay** | 🟡 Planned | Alternative fiat on-ramp, higher limits, celebrity partnerships | Wallet integration, high-net-worth trader segment | Phase 4 (Mar 2026) |
| **Sumsub / Jumio** | 🟡 Planned | KYC/AML verification for card users, identity verification, document scanning | Mobile KYC volume, crypto use case | Phase 4 (Mar 2026) |

**Key Priorities**:
- Card issuer partnership (Apto or Marqeta) **MUST be signed by January 15, 2026** due to 6-8 week production lead time
- Fiat on-ramp (Transak or MoonPay) required for card top-ups and crypto purchases

---

### Partnership Development Timeline

**Q4 2025 (Pre-Launch)**:
- Finalize Aptos Foundation grant/partnership agreement
- Execute LOI (Letter of Intent) with Merkle Trade
- Begin technical integration discussions with Pyth Network
- Recruit 5-10 crypto Twitter KOLs for beta testing program
- Start card issuer RFP process (Apto, Marqeta)

**Q1 2026 (Launch Phase)**:
- **January**: Sign Merkle Trade partnership, Pyth Network integration contract, card issuer agreement
- **February**: Activate DEX integrations (Liquidswap/Panora), finalize LayerZero/Wormhole partnerships
- **March**: Launch fiat on-ramp integrations (Transak/MoonPay), activate KYC provider (Sumsub/Jumio)
- **April**: Card production complete, begin card shipping to users

**Q2 2026 (Growth Phase)**:
- Expand to additional DeFi protocols (Thala, Aries)
- Integrate AI trading features (Xyra/KanaLabs)
- Onboard institutional liquidity providers for basket trading
- Launch affiliate/referral program with KOL partners

---

### Partnership Value Proposition Template

**For Infrastructure Partners (Aptos, Merkle Trade, Pyth, LayerZero)**:

*What Cresca Offers*:
- High-frequency transaction volume (15K-25K daily transactions)
- Mobile-first use case demonstrating protocol capabilities
- Reference implementation for other mobile developers
- Brand visibility (Cresca users see "Powered by [Partner]" in UI)
- Technical feedback and co-marketing opportunities

*What Cresca Needs*:
- Technical support and documentation
- Preferential pricing or fee sharing
- Co-marketing (blog posts, Twitter announcements, conference panels)
- Priority access to new features (e.g., Pyth's Benchmarks, LayerZero V2)

**For DeFi Partners (DEXs, Lending Protocols)**:

*What Cresca Offers*:
- Daily order flow from automated strategies (DCA, auto-rebalancing)
- New user segment (mobile-first traders vs. desktop DeFi users)
- Wallet integration reduces friction (no external wallet connection needed)
- Revenue share on transaction fees (negotiable 10-20% split)

*What Cresca Needs*:
- API access and SDK integration support
- Liquidity guarantees (minimum depth for large trades)
- Gas-optimized smart contracts (reduce user transaction costs)
- Joint liquidity mining programs (incentivize Cresca users to provide liquidity)

**For Distribution Partners (CoinGecko, DappRadar, KOLs)**:

*What Cresca Offers*:
- Exclusive early access to features
- Affiliate revenue (1-5% of trading fees from referred users)
- Co-branded content (tutorials, guides, case studies)
- Analytics dashboard (track referral performance)

*What Cresca Needs*:
- Prominent listing/placement on platforms
- Social media promotion (Twitter threads, YouTube reviews)
- User testimonials and case studies
- Feedback on UX and feature priorities

**For Real-World Partners (Card Issuers, Fiat On-Ramps, KYC Providers)**:

*What Cresca Offers*:
- High-value customer base (serious traders with $5K+ balances)
- Monthly transaction volume (target $50M+ by Month 6)
- Long-term partnership (multi-year contract)
- Co-marketing to crypto-native audience

*What Cresca Needs*:
- Competitive pricing (card fees, fiat on-ramp rates, KYC per-verification costs)
- White-label integration (Cresca branding, not partner's)
- Fast approval times (card applications <48 hours, KYC <1 hour)
- Regulatory compliance support (legal review, terms of service)

---

### Partnership Metrics & Success Criteria

**How We Measure Partnership Success**:

1. **Infrastructure Partners**: 
   - Uptime SLA met (>99.5% for oracles, bridges, DEXs)
   - Transaction success rate (>98%)
   - User satisfaction (NPS >50 for trading experience)

2. **DeFi Partners**:
   - Monthly volume via partner protocol ($1M+ by Month 3)
   - Integration uptime (>99% availability)
   - User adoption rate (>30% of Cresca users use integrated DeFi features)

3. **Distribution Partners**:
   - User acquisition cost (CAC <$50 via referrals vs. $100+ paid ads)
   - Referral conversion rate (>10% of referred users become traders)
   - Content reach (1M+ impressions via partner channels)

4. **Real-World Partners**:
   - Card activation rate (>60% of users order cards within 90 days)
   - Fiat on-ramp usage (>40% of users buy crypto via Cresca)
   - KYC completion rate (>80% of initiated verifications complete)

**Partnership Review Cadence**:
- Monthly check-ins with all active partners
- Quarterly business reviews (QBRs) with strategic partners
- Annual contract renewals with performance-based fee adjustments

---

### Open Partnership Opportunities

**Seeking Partners In**:
- **Oracle Providers**: Additional price feed redundancy (Switchboard, DIA)
- **Wallet Aggregators**: Integration with Rainbow, Zerion for multi-wallet users
- **Institutional Liquidity**: Market makers for tight spreads on basket trades
- **Regional Fiat Partners**: Local payment methods (PIX in Brazil, UPI in India, Alipay in China)
- **Custody Solutions**: Fireblocks for institutional custody, Copper for prime brokerage
- **Insurance Providers**: Smart contract insurance (Nexus Mutual, InsurAce)
- **Analytics Platforms**: Nansen, Dune Analytics for on-chain data dashboards

**How to Partner with Cresca**:
- Email: partnerships@cresca.io (not yet active - placeholder)
- Partnership deck available upon request
- Typical partnership timeline: 2-4 weeks from first contact to signed agreement

## Architecture Patterns

### MVVM with Repository Pattern (Mobile)
All mobile code follows strict MVVM:
```
UI (Compose) → ViewModel (StateFlow) → Repository → Kaptos SDK → Aptos Blockchain
```

**Key Convention**: ViewModels NEVER directly call blockchain - always go through Repository layer. See `kotlin-sdk-examples/CrescaViewModel_CORRECT.kt` for reference implementation.

### Smart Contract Dual-Version System
The project maintains **TWO deployed contract versions**:

1. **V1 (Multi-Agent)** - `0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b`
   - Requires 2 signatures (user + protocol) for close_position
   - Needs backend API (`backend/close-position-service.js`)
   - Currently deployed on testnet

2. **V2 (Single-Signer)** - `0xba20b2115d382c7d8bbe01cc59fe7e33ab43c1c8853cfa9ff573ac8d383c91db`
   - Direct user close (no backend needed)
   - Uses treasury-based fund storage
   - Preferred for mobile implementations

**Critical**: When modifying close_position flows, confirm which version you're working with. See `CONTRACT_VERSIONS.md`.

### Bucket Protocol Trading Flow
**NEVER** close positions immediately after opening - this is a common mistake:
```kotlin
// ❌ WRONG - User can't trade!
openLong { closePosition(0) }

// ✅ CORRECT - Let user actually trade
openLong { navController.navigate("positions") }
```

**Oracle prices MUST be updated before trading** - contract uses them for entry price calculation:
```kotlin
viewModel.updateOraclePrices(btcPrice, ethPrice, solPrice) {
    // NOW safe to open positions
}
```

**Fixed margin**: All positions use exactly 1 APT margin (hardcoded `DEFAULT_MARGIN = 100000000`). Don't try to customize this without contract changes.

## Critical Developer Workflows

### Smart Contract Deployment
```powershell
# From project root
cd move  # or bucket/perps-smart-wallet-/cresca_move_project for Bucket
aptos move compile
aptos move publish --profile testnet
```

**Post-deployment verification**: Always run `tests/verify-contract.ps1` to confirm all entry/view functions are accessible.

### Mobile App Build & Test
```bash
# Run from workspace root or app directory
./gradlew assembleDebug           # Build APK
./gradlew testDebugUnitTest       # Unit tests
./gradlew connectedDebugAndroidTest  # Integration tests
```

**Kotlin SDK**: We use `xyz.mcxross:kaptos:1.0.0` (NOT official Aptos TS SDK). Transaction building patterns are different - always reference `kotlin-sdk-examples/` for correct usage.

### Backend Relayer Service (Optional)
```bash
cd backend
npm install
npm start  # Runs on localhost:3000
```

Only needed for V1 contract co-signing. For V2, backend is optional (analytics only).

### Database Setup (If using backend)
```bash
npm run setup  # Installs deps, starts Docker, runs migrations
npm run db:studio  # Open Prisma Studio GUI
```

## Project-Specific Conventions

### Transaction Argument Construction (Kaptos SDK)
**Critical Pattern**: Function arguments MUST match Move contract exactly. Common mistakes:

```kotlin
// ❌ WRONG - Extra argument causes EPERMISSION_DENIED
funArgs = functionArguments {
    +U64(positionId.toULong())
    +U64(1u)  // Extra arg!
}

// ✅ CORRECT - Match contract signature
funArgs = functionArguments {
    +U64(positionId.toULong())  // Only position_id
}
```

**Debugging tip**: Check `docs/ARCHITECTURE.md` for complete function signatures. The contract expects exactly what's defined in the Move module.

### StateFlow UI Updates
All ViewModels use StateFlow for reactive UI. Pattern:
```kotlin
private val _uiState = MutableStateFlow<UiState>(Loading)
val uiState: StateFlow<UiState> = _uiState.asStateFlow()

// In ViewModel methods:
viewModelScope.launch {
    _uiState.value = Loading
    try {
        val result = repository.doSomething()
        _uiState.value = Success(result)
    } catch (e: Exception) {
        _uiState.value = Error(e.message)
    }
}
```

**Never** emit states from outside viewModelScope - causes lifecycle issues.

### Calendar Payments: Unified API Pattern
The `calendar_payments` contract uses a single `create_schedule` function for both one-time and recurring payments:
- One-time: `interval_secs = 0, occurrences = 1`
- Recurring: `interval_secs > 0, occurrences > 1`

**Don't** create separate functions for one-time vs recurring in your ViewModels - handle it with conditional parameters.

### Error Code Mapping
Move contracts return numeric error codes. Key mappings:
- `0x5` (EPERMISSION_DENIED) → User doesn't own the position
- `0x2` (EINVALID_ARGUMENT) → Bad parameters or position already closed
- `0x3` (EINSUFFICIENT_BALANCE) → Not enough APT in account

**Always** show user-friendly messages, never raw error codes. See `kotlin-sdk-examples/IMPLEMENTATION_SUMMARY.md` for complete error handling guide.

## Integration Points

### Aptos RPC Endpoints
- **Testnet**: `https://fullnode.testnet.aptoslabs.com`
- **Mainnet**: `https://fullnode.mainnet.aptoslabs.com` (not yet deployed)

All SDK calls route through these. If building new features, use testnet first, then upgrade addresses for mainnet.

### Key Contract Addresses (Testnet)
```kotlin
const val BUCKET_V2 = "0xba20b2115d382c7d8bbe01cc59fe7e33ab43c1c8853cfa9ff573ac8d383c91db"
const val CALENDAR_PAY = "0x0f9713e3c42951dbc4f05cc2e7ea211c1851b00a9d077e7e71f5d2a73041d606"
const val SMART_WALLET = "0x2bc654f1f5009c045ba5486d11252d46724d7e0522db6dbde2ff0fe7e275a1bf"
```

**Convention**: Store these in a central `Constants.kt` file, never hardcode in UI/ViewModel layers.

### External Dependencies (Planned, not yet integrated)
- **Pyth Network**: For production oracle price feeds (currently manual updates)
- **LayerZero/Wormhole**: Cross-chain bridges (Phase 3)
- **Fireblocks**: Custody solution for merchant settlements (backend only)

## Testing Strategies

### Smart Contract Testing
Move tests are in `tests/` directory. Pattern:
```bash
cd tests
aptos move compile
aptos move test
```

**Key test files**:
- `test-api.js` - End-to-end transaction flow
- `check-positions.js` - Query all positions for debugging
- `verify-contract.ps1` - Post-deployment verification

### Mobile UI Testing
Compose UI tests in `app/src/androidTest/`. Pattern:
```kotlin
@Test
fun bucketTradingScreen_opensPosition() {
    composeTestRule.setContent {
        BucketTradingScreen(viewModel = mockViewModel)
    }
    composeTestRule.onNodeWithText("Open Long").performClick()
    // Assert state changes
}
```

**Prefer UI tests over unit tests for blockchain interactions** - easier to catch integration issues.

## Common Pitfalls & Solutions

1. **"Transaction simulation failed"** → Oracle prices not set. Call `updateOraclePrices()` before trading.
2. **"Insufficient gas"** → User needs minimum 1.01 APT (1 for margin + 0.01 for gas). Show balance warnings.
3. **"Position not found"** → Using wrong position ID. Call `getMyActivePositions()` to get user's actual IDs.
4. **Multi-agent tx serialization errors** → You're probably using V1 contract. Switch to V2 for simpler flow.
5. **ViewModel not updating UI** → Forgot to collect StateFlow in Composable. Use `collectAsState()`.

## File Organization
```
aptpays/
├── app/                      # Main Android app (React Native legacy)
├── aptpays-native/           # Kotlin native app (current)
│   └── src/                  # MVVM implementation
├── backend/                  # Node.js relayer service
│   ├── close-position-service.js  # V1 co-signer
│   └── kotlin-integration/   # Kotlin-specific endpoints
├── bucket/perps-smart-wallet-/  # Bucket Protocol Move contracts
├── calendar/                 # Calendar Payments Move contracts
├── kotlin-sdk-examples/      # Reference implementations (START HERE)
│   ├── CrescaViewModel_CORRECT.kt  # Complete ViewModel example
│   └── IMPLEMENTATION_SUMMARY.md   # Critical fixes guide
├── docs/                     # Architecture documentation
│   ├── ARCHITECTURE.md       # Complete system architecture
│   └── TECH_STACK.md         # Technology decisions
└── tests/                    # Contract verification scripts
```

## Quick Reference Commands
```bash
# Move contract deployment
npm run deploy:move

# Local development setup
npm run setup

# Run backend relayer
cd backend && npm start

# Verify deployed contract
cd tests && pwsh verify-contract.ps1

# Check all positions (debugging)
cd bucket/perps-smart-wallet-/cresca_move_project && node check-positions.js
```

## Additional Context
- **Minimum SDK version**: Android API 26 (Android 8.0)
- **Kotlin version**: 1.9+
- **Compose version**: 1.5+
- **Node.js version**: 18+
- **Move compiler version**: Compatible with Aptos CLI 3.0+

When in doubt about implementation patterns, **always check `kotlin-sdk-examples/` first** - it contains battle-tested, blockchain-verified code. The `IMPLEMENTATION_SUMMARY.md` file 