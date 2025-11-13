# 🛠️ Tech Stack - AptPays Platform

## 📱 **Platform Overview**

AptPays is a comprehensive DeFi mobile platform on Aptos blockchain offering:
- 💰 **Wallet Dashboard** - View balance, send/receive APT, manage assets
- 🔄 **Swap/DEX** - Real-time token exchange (BTC ↔ ETH, APT ↔ USDC)
- 💸 **Tap-to-Pay** - Instant P2P transfers with QR code
- 📊 **Bucket Protocol** - Leveraged crypto basket trading (1-20x)
- 📅 **CalendeFi** - Scheduled & recurring crypto payments

---

## 🏗️ **Technology Stack**

### **1. Blockchain Layer**

#### **Aptos Blockchain**
- **Network:** Testnet (Production: Mainnet)
- **Language:** Move
- **Consensus:** AptosBFT (Byzantine Fault Tolerant)
- **TPS:** 160,000+ transactions per second
- **Finality:** Sub-second

#### **Smart Contracts Deployed:**

| Contract | Address | Module | Status |
|----------|---------|--------|--------|
| **Bucket Protocol** | `0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b` | `bucket_protocol` | ✅ Live |
| **Calendar Payments** | `0x0f9713e3c42951dbc4f05cc2e7ea211c1851b00a9d077e7e71f5d2a73041d606` | `calendar_payments` | ⚠️ Ready |
| **Smart Wallet** | `0x2bc654f1f5009c045ba5486d11252d46724d7e0522db6dbde2ff0fe7e275a1bf` | `smart_wallet_v2` | ✅ Live |

---

### **2. Mobile Frontend**

#### **Android Native**
```kotlin
// Tech Stack
Language: Kotlin
Framework: Jetpack Compose
Architecture: MVVM (Model-View-ViewModel)
DI: Hilt/Dagger
State Management: StateFlow, LiveData
Navigation: Jetpack Navigation Component
```

#### **Key Libraries:**
```gradle
dependencies {
    // Aptos SDK
    implementation("xyz.mcxross:kaptos:1.0.0")
    
    // Compose UI
    implementation("androidx.compose.ui:ui:1.5.0")
    implementation("androidx.compose.material3:material3:1.1.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.0")
    
    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.0")
    
    // DI
    implementation("com.google.dagger:hilt-android:2.48")
    
    // Networking
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.11.0")
    
    // Crypto
    implementation("org.bitcoinj:bitcoinj-core:0.16.2")
}
```

---

### **3. Backend/Relayer (Optional)**

#### **Node.js Backend**
```javascript
// Tech Stack
Runtime: Node.js 18+
Framework: Express.js
Language: TypeScript
Database: PostgreSQL (Prisma ORM)
Caching: Redis
```

#### **Purpose:**
- Transaction relaying (gas sponsorship)
- Price oracle updates
- Scheduled payment execution
- Analytics and monitoring

---

### **4. Smart Contract Layer**

#### **Move Language Features:**
```move
// Core Modules
module cresca::bucket_protocol {
    // Leveraged trading with baskets
    public entry fun init(leverage: u64)
    public entry fun open_long(bucket_id: u64)
    public entry fun open_short(bucket_id: u64)
    public entry fun close_position(position_id: u64)
}

module aptpays::calendar_payments {
    // Scheduled payments
    public entry fun create_schedule(...)
    public entry fun execute(...)
    public entry fun cancel(...)
}

module aptpays::smart_wallet_v2 {
    // Basic wallet operations
    public entry fun send_coins(...)
    public entry fun receive_coins(...)
}
```

---

### **5. Development Tools**

#### **IDEs & Editors:**
- **Android Studio** - Mobile development
- **VS Code** - Smart contract development
- **IntelliJ IDEA** - Backend development

#### **Version Control:**
- **Git** - Source control
- **GitHub** - Repository hosting
- **Branch:** `main` (production)

#### **Testing:**
- **JUnit** - Unit tests (Android)
- **Espresso** - UI tests (Android)
- **Move Prover** - Smart contract verification

#### **CI/CD:**
- **GitHub Actions** - Automated builds
- **Fastlane** - Mobile deployment

---

### **6. Infrastructure**

#### **Aptos Nodes:**
- **Testnet RPC:** `https://fullnode.testnet.aptoslabs.com`
- **Mainnet RPC:** `https://fullnode.mainnet.aptoslabs.com`
- **Faucet:** `https://faucet.testnet.aptoslabs.com`

#### **APIs:**
- **Aptos REST API** - Blockchain queries
- **Aptos Indexer API** - Historical data
- **Pyth Network** - Price feeds (future)

#### **Storage:**
- **On-Chain:** Smart contract state
- **Off-Chain:** User preferences (local storage)
- **IPFS:** Asset metadata (future)

---

## 📊 **Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                     MOBILE APP (Android)                     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Bucket     │  │  CalendeFi   │  │   Wallet     │     │
│  │   Trading    │  │   Payments   │  │   Features   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                          │                                   │
│                   ┌──────▼──────┐                           │
│                   │  ViewModel  │                           │
│                   │  (MVVM)     │                           │
│                   └──────┬──────┘                           │
│                          │                                   │
│                   ┌──────▼──────┐                           │
│                   │ Kaptos SDK  │                           │
│                   │  (Aptos)    │                           │
│                   └──────┬──────┘                           │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           │ HTTPS/JSON-RPC
                           │
┌──────────────────────────▼──────────────────────────────────┐
│               APTOS BLOCKCHAIN (Testnet)                     │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │          SMART CONTRACTS (Move)                   │      │
│  │                                                    │      │
│  │  ┌─────────────────┐  ┌─────────────────┐       │      │
│  │  │ Bucket Protocol │  │ Calendar Pay    │       │      │
│  │  │ 0x33ec41...122d6b│  │ 0x0f9713...41d606│      │      │
│  │  │                  │  │                  │       │      │
│  │  │ • init()        │  │ • create_schedule│      │      │
│  │  │ • open_long()   │  │ • execute()      │      │      │
│  │  │ • open_short()  │  │ • cancel()       │      │      │
│  │  │ • close_pos()   │  │ • get_schedule() │      │      │
│  │  └─────────────────┘  └─────────────────┘       │      │
│  │                                                    │      │
│  │  ┌─────────────────┐  ┌─────────────────┐       │      │
│  │  │  Smart Wallet   │  │   Swap/DEX      │       │      │
│  │  │ 0x2bc654...5a1bf│  │   (Future)       │       │      │
│  │  │                  │  │                  │       │      │
│  │  │ • send_coins()  │  │ • swap_tokens()  │       │      │
│  │  │ • receive()     │  │ • get_quote()    │       │      │
│  │  └─────────────────┘  └─────────────────┘       │      │
│  └──────────────────────────────────────────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │              BLOCKCHAIN STATE                     │      │
│  │  • User Balances                                  │      │
│  │  • Trading Positions                              │      │
│  │  • Payment Schedules                              │      │
│  │  • Transaction History                            │      │
│  └──────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 **Data Flow Architecture**

### **1. Bucket Trading Flow**
```
User Action (UI)
    ↓
ViewModel (Business Logic)
    ↓
Kaptos SDK (Sign Transaction)
    ↓
Aptos Node (Submit Transaction)
    ↓
Smart Contract (Execute on-chain)
    ↓
Event Emission
    ↓
UI Update (StateFlow)
```

### **2. Calendar Payment Flow**
```
User Creates Schedule
    ↓
Escrow Funds (Locked in Contract)
    ↓
Time-Based Trigger (Cron/Manual)
    ↓
Execute Payment (Anyone can call)
    ↓
Funds Released to Recipient
    ↓
Event Logged
```

### **3. Tap-to-Pay Flow**
```
User Taps "Send"
    ↓
Enter Amount & Recipient
    ↓
Sign Transaction
    ↓
Smart Wallet Contract
    ↓
Transfer APT
    ↓
Confirmation on UI
```

---

## 🎨 **Mobile App Architecture (MVVM)**

```
┌─────────────────────────────────────────────────────┐
│                      UI LAYER                        │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │   Screens    │  │  Components  │  │  Theme   │ │
│  │              │  │              │  │          │ │
│  │ • Dashboard  │  │ • Buttons    │  │ • Colors │ │
│  │ • Trading    │  │ • Cards      │  │ • Fonts  │ │
│  │ • Calendar   │  │ • Charts     │  │ • Icons  │ │
│  │ • Wallet     │  │ • Forms      │  │          │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────┘ │
└─────────┼──────────────────┼───────────────────────┘
          │                  │
          │ StateFlow/Events │
          │                  │
┌─────────▼──────────────────▼───────────────────────┐
│                  VIEWMODEL LAYER                    │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │  • CrescaBucketViewModel                    │  │
│  │  • CalendarPaymentViewModel                 │  │
│  │  • WalletViewModel                          │  │
│  │  • SwapViewModel                            │  │
│  └─────────────┬───────────────────────────────┘  │
│                │                                    │
│  ┌─────────────▼───────────────────────────────┐  │
│  │  State Management (StateFlow)               │  │
│  │  • UiState                                  │  │
│  │  • Loading/Error/Success                    │  │
│  └─────────────┬───────────────────────────────┘  │
└────────────────┼────────────────────────────────────┘
                 │
                 │ Repository Pattern
                 │
┌────────────────▼────────────────────────────────────┐
│                REPOSITORY LAYER                      │
│                                                      │
│  ┌────────────────────────────────────────────────┐│
│  │  • BucketRepository                            ││
│  │  • CalendarRepository                          ││
│  │  • WalletRepository                            ││
│  └────────────────┬───────────────────────────────┘│
└───────────────────┼──────────────────────────────────┘
                    │
                    │ Aptos SDK
                    │
┌───────────────────▼──────────────────────────────────┐
│               DATA SOURCE LAYER                       │
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │  Kaptos SDK (Aptos Integration)               │ │
│  │  • Transaction Builder                        │ │
│  │  • Account Management                         │ │
│  │  • View Functions                             │ │
│  │  • Event Listeners                            │ │
│  └────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

---

## 🔐 **Security Architecture**

### **1. Smart Contract Security**
```move
// Access Control
const EPERMISSION_DENIED: u64 = 5;
assert!(position.owner == addr, EPERMISSION_DENIED);

// Input Validation
assert!(leverage >= 1 && leverage <= 20, EINVALID_ARGUMENT);

// Reentrancy Protection
// Move language prevents reentrancy by design

// Overflow Protection
let total = amount * occurrences; // Aborts on overflow
```

### **2. Mobile App Security**
```kotlin
// Private Key Storage
EncryptedSharedPreferences

// Biometric Authentication
BiometricPrompt

// Secure Communication
HTTPS/TLS only

// Transaction Signing
Local signing with Ed25519
```

---

## 📦 **Module Architecture**

### **Bucket Protocol Module**
```
bucket_protocol/
├── Structs
│   ├── Protocol (key)
│   ├── Bucket (store)
│   └── Position (store)
├── Entry Functions
│   ├── init(leverage)
│   ├── deposit_collateral(amount)
│   ├── open_long(bucket_id)
│   ├── open_short(bucket_id)
│   ├── close_position(position_id)
│   └── update_oracle(btc, eth, sol)
├── View Functions
│   ├── get_collateral_balance()
│   ├── get_position_details()
│   └── get_oracle_prices()
└── Events
    ├── BucketCreatedEvent
    ├── PositionOpenedEvent
    └── PositionClosedEvent
```

### **Calendar Payments Module**
```
calendar_payments/
├── Structs
│   ├── Schedules (key)
│   ├── Schedule (store)
│   └── ScheduleEntry (store)
├── Entry Functions
│   ├── create_schedule()
│   ├── execute()
│   └── cancel()
├── View Functions
│   └── get_schedule()
└── Events
    ├── Created
    ├── Executed
    └── Canceled
```

---

## 🚀 **Deployment Pipeline**

### **Smart Contracts**
```bash
# 1. Compile
aptos move compile --named-addresses cresca=0x33ec...

# 2. Test
aptos move test

# 3. Deploy
aptos move publish --profile testnet

# 4. Verify
aptos account list --account 0x33ec...
```

### **Mobile App**
```bash
# 1. Build
./gradlew assembleRelease

# 2. Test
./gradlew testReleaseUnitTest

# 3. Sign
jarsigner -keystore release.jks app-release.apk

# 4. Deploy
fastlane deploy
```

---

## 📈 **Performance Specifications**

| Metric | Value |
|--------|-------|
| **Blockchain TPS** | 160,000+ |
| **Transaction Finality** | <1 second |
| **Gas Cost per Trade** | ~0.001 APT |
| **App Startup Time** | <2 seconds |
| **Transaction Confirmation** | 1-3 seconds |
| **View Function Latency** | <100ms |

---

## 🔗 **Integration Points**

### **External Services**
- **Pyth Network** - Real-time price feeds (future)
- **LayerZero** - Cross-chain bridges (future)
- **Wormhole** - Token bridges (future)
- **Aptos Names** - ENS-like naming (future)

### **APIs Used**
```
Aptos REST API: https://fullnode.testnet.aptoslabs.com/v1
Aptos Indexer: https://indexer.testnet.aptoslabs.com/v1/graphql
Pyth Price API: https://hermes.pyth.network/
```

---

## 🎯 **Feature Implementation Status**

| Feature | Contract | Mobile | Status |
|---------|----------|--------|--------|
| **Bucket Trading** | ✅ Deployed | ✅ Ready | 🟢 Live |
| **Calendar Payments** | ✅ Ready | 🔄 In Progress | 🟡 Testing |
| **Tap-to-Pay** | ✅ Deployed | ✅ Ready | 🟢 Live |
| **Swap/DEX** | ⚠️ Future | ⚠️ Future | 🔴 Planned |
| **Price Oracle** | ✅ Manual | ⚠️ Future | 🟡 Manual |
| **Analytics** | ⚠️ Future | ⚠️ Future | 🔴 Planned |

---

## 📝 **Development Standards**

### **Code Quality**
- **Kotlin:** Follow Android best practices
- **Move:** Follow Aptos Move style guide
- **Testing:** 80%+ code coverage
- **Documentation:** Inline comments + README

### **Git Workflow**
```
main (production)
  ↓
develop (staging)
  ↓
feature/* (development)
```

### **Commit Convention**
```
feat: Add bucket trading UI
fix: Resolve transaction timeout
docs: Update API documentation
refactor: Optimize ViewModel state
```

---

**Last Updated:** November 3, 2025
**Tech Stack Version:** 1.0
**Maintained By:** Cresca Team
