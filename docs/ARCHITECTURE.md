# 🏗️ AptPays - Complete Architecture Documentation

## 📋 **Table of Contents**
1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Smart Contract Architecture](#smart-contract-architecture)
4. [Mobile App Architecture](#mobile-app-architecture)
5. [Data Flow Diagrams](#data-flow-diagrams)
6. [Security Architecture](#security-architecture)
7. [Integration Architecture](#integration-architecture)

---

## 🌐 **System Overview**

AptPays is a **mobile-first DeFi super app** on Aptos blockchain that combines:

```
┌─────────────────────────────────────────────────────────────┐
│                      APTPAYS PLATFORM                        │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Bucket    │  │  CalendeFi  │  │  Tap-to-Pay │        │
│  │  Protocol   │  │   Payments  │  │   Wallet    │        │
│  │             │  │             │  │             │        │
│  │  Leveraged  │  │  Scheduled  │  │   Instant   │        │
│  │  Trading    │  │  Payments   │  │  Transfers  │        │
│  │  (1-20x)    │  │  (Auto)     │  │   (P2P)     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            SWAP/DEX (Future)                        │   │
│  │            Token Exchange & Liquidity               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏛️ **High-Level Architecture**

### **Three-Layer Architecture**

```
┌────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                      │
│                     (Android Mobile App)                        │
│                                                                 │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│  ┃                    Jetpack Compose UI                      ┃ │
│  ┃  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    ┃ │
│  ┃  │Dashboard │ │ Trading  │ │ Calendar │ │  Wallet  │    ┃ │
│  ┃  │  Screen  │ │  Screen  │ │  Screen  │ │  Screen  │    ┃ │
│  ┃  └──────────┘ └──────────┘ └──────────┘ └──────────┘    ┃ │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                              ↕                                  │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│  ┃                    ViewModel Layer (MVVM)                  ┃ │
│  ┃  ┌─────────────────────────────────────────────────────┐  ┃ │
│  ┃  │ State Management (StateFlow, LiveData)             │  ┃ │
│  ┃  │ • BucketViewModel                                  │  ┃ │
│  ┃  │ • CalendarViewModel                                │  ┃ │
│  ┃  │ • WalletViewModel                                  │  ┃ │
│  ┃  └─────────────────────────────────────────────────────┘  ┃ │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS/JSON-RPC
┌────────────────────────────────────────────────────────────────┐
│                        BUSINESS LAYER                           │
│                     (Repository Pattern)                        │
│                                                                 │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│  ┃                  Repository Layer                          ┃ │
│  ┃  ┌────────────────────────────────────────────────────┐   ┃ │
│  ┃  │ Data Source Abstraction                           │   ┃ │
│  ┃  │ • BucketRepository                                │   ┃ │
│  ┃  │ • CalendarRepository                              │   ┃ │
│  ┃  │ • WalletRepository                                │   ┃ │
│  ┃  └────────────────────────────────────────────────────┘   ┃ │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                              ↕                                  │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│  ┃                 Aptos SDK (Kaptos)                         ┃ │
│  ┃  ┌────────────────────────────────────────────────────┐   ┃ │
│  ┃  │ • Transaction Builder                             │   ┃ │
│  ┃  │ • Account Management                              │   ┃ │
│  ┃  │ • Cryptographic Operations (Ed25519)              │   ┃ │
│  ┃  │ • BCS Serialization                               │   ┃ │
│  ┃  └────────────────────────────────────────────────────┘   ┃ │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└────────────────────────────────────────────────────────────────┘
                              ↕ RPC
┌────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                               │
│                  (Aptos Blockchain)                            │
│                                                                 │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│  ┃              Smart Contracts (Move Language)               ┃ │
│  ┃                                                            ┃ │
│  ┃  ┌─────────────────┐  ┌─────────────────┐               ┃ │
│  ┃  │ Bucket Protocol │  │ Calendar Pay    │               ┃ │
│  ┃  │                 │  │                 │               ┃ │
│  ┃  │ • Leveraged     │  │ • Scheduled     │               ┃ │
│  ┃  │   Trading       │  │   Payments      │               ┃ │
│  ┃  │ • Position      │  │ • Escrow        │               ┃ │
│  ┃  │   Management    │  │   Management    │               ┃ │
│  ┃  │ • Oracle        │  │ • Automation    │               ┃ │
│  ┃  │   Updates       │  │   Triggers      │               ┃ │
│  ┃  └─────────────────┘  └─────────────────┘               ┃ │
│  ┃                                                            ┃ │
│  ┃  ┌─────────────────┐  ┌─────────────────┐               ┃ │
│  ┃  │  Smart Wallet   │  │   Swap (Future) │               ┃ │
│  ┃  │                 │  │                 │               ┃ │
│  ┃  │ • Send/Receive  │  │ • AMM           │               ┃ │
│  ┃  │ • Balance       │  │ • Liquidity     │               ┃ │
│  ┃  │   Management    │  │   Pools         │               ┃ │
│  ┃  └─────────────────┘  └─────────────────┘               ┃ │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                                                 │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│  ┃                  Blockchain State                          ┃ │
│  ┃  • Account Balances                                       ┃ │
│  ┃  • Trading Positions                                      ┃ │
│  ┃  • Payment Schedules                                      ┃ │
│  ┃  • Transaction History                                    ┃ │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└────────────────────────────────────────────────────────────────┘
```

---

## 🎯 **Smart Contract Architecture**

### **1. Bucket Protocol Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│            BUCKET PROTOCOL SMART CONTRACT                    │
│       Address: 0x33ec41711fe3c92c3f1a010909342e1c2c...      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      DATA STRUCTURES                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Protocol (key)                                      │    │
│  │ ├─ leverage: u64                                   │    │
│  │ ├─ total_collateral: u64                           │    │
│  │ ├─ buckets: vector<Bucket>                         │    │
│  │ └─ positions: vector<Position>                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Bucket (store)                                      │    │
│  │ ├─ btc_allocation: u8  (50%)                       │    │
│  │ ├─ eth_allocation: u8  (30%)                       │    │
│  │ ├─ sol_allocation: u8  (20%)                       │    │
│  │ ├─ initial_btc_price: u64                          │    │
│  │ ├─ initial_eth_price: u64                          │    │
│  │ └─ initial_sol_price: u64                          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Position (store)                                    │    │
│  │ ├─ owner: address                                  │    │
│  │ ├─ bucket_id: u64                                  │    │
│  │ ├─ margin: u64  (0.05 APT minimum)                │    │
│  │ ├─ is_long: bool                                   │    │
│  │ ├─ opened_at: u64                                  │    │
│  │ └─ is_active: bool                                 │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ENTRY FUNCTIONS                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ init(signer, leverage: u64)                        │    │
│  │   • Creates Protocol resource                      │    │
│  │   • Validates leverage (1-20x)                     │    │
│  │   • Moves Protocol to signer account               │    │
│  └────────────────────────────────────────────────────┘    │
│                      ↓                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │ deposit_collateral(signer, amount: u64)            │    │
│  │   • Transfers APT from user to protocol            │    │
│  │   • Updates total_collateral                       │    │
│  └────────────────────────────────────────────────────┘    │
│                      ↓                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │ open_long(signer, bucket_id: u64)                  │    │
│  │   • Validates collateral >= margin                 │    │
│  │   • Creates new Position (long)                    │    │
│  │   • Emits PositionOpenedEvent                      │    │
│  └────────────────────────────────────────────────────┘    │
│                      ↓                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │ open_short(signer, bucket_id: u64)                 │    │
│  │   • Validates collateral >= margin                 │    │
│  │   • Creates new Position (short)                   │    │
│  │   • Emits PositionOpenedEvent                      │    │
│  └────────────────────────────────────────────────────┘    │
│                      ↓                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │ close_position(signer, position_id: u64)           │    │
│  │   • Calculates P&L                                 │    │
│  │   • Transfers profit/loss to user                  │    │
│  │   • Marks position inactive                        │    │
│  │   • Emits PositionClosedEvent                      │    │
│  └────────────────────────────────────────────────────┘    │
│                      ↓                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │ update_oracle(signer, btc, eth, sol: u64)          │    │
│  │   • Updates current prices                         │    │
│  │   • Records timestamp                              │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     VIEW FUNCTIONS                           │
│                                                              │
│  • get_collateral_balance(addr) → u64                       │
│  • get_position_details(addr, id) → Position                │
│  • get_oracle_prices(addr) → (u64, u64, u64)               │
└─────────────────────────────────────────────────────────────┘
```

### **2. Calendar Payments Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│         CALENDAR PAYMENTS SMART CONTRACT                     │
│       Address: 0x0f9713e3c42951dbc4f05cc2e7ea21...         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    DATA STRUCTURES                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Schedules (key)                                     │    │
│  │ ├─ next_schedule_id: u64                           │    │
│  │ └─ schedules: SimpleMap<u64, Schedule>             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Schedule (store)                                    │    │
│  │ ├─ payer: address                                  │    │
│  │ ├─ recipient: address                              │    │
│  │ ├─ amount: u64                                     │    │
│  │ ├─ execute_at_secs: u64                            │    │
│  │ ├─ interval_secs: u64  (0 = one-time)             │    │
│  │ ├─ occurrences: u64                                │    │
│  │ ├─ executed_count: u64                             │    │
│  │ ├─ escrowed_funds: u64                             │    │
│  │ ├─ is_active: bool                                 │    │
│  │ └─ created_at: u64                                 │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ENTRY FUNCTIONS                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ create_schedule(signer,                            │    │
│  │   recipient: address,                              │    │
│  │   amount: u64,                                     │    │
│  │   execute_at_secs: u64,                            │    │
│  │   interval_secs: u64,                              │    │
│  │   occurrences: u64)                                │    │
│  │                                                     │    │
│  │   IF interval_secs == 0 && occurrences == 1:      │    │
│  │      → ONE-TIME PAYMENT                            │    │
│  │   IF interval_secs > 0 && occurrences > 1:        │    │
│  │      → RECURRING PAYMENT                           │    │
│  │                                                     │    │
│  │   • Validates inputs                               │    │
│  │   • Escrows (amount * occurrences)                 │    │
│  │   • Creates Schedule                               │    │
│  │   • Emits Created event                            │    │
│  └────────────────────────────────────────────────────┘    │
│                      ↓                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │ execute(signer, payer_addr, schedule_id)           │    │
│  │   • Checks if time >= execute_at_secs              │    │
│  │   • Transfers amount to recipient                  │    │
│  │   • Increments executed_count                      │    │
│  │   • Updates next execution time                    │    │
│  │   • Emits Executed event                           │    │
│  │   • Anyone can call (permissionless)               │    │
│  └────────────────────────────────────────────────────┘    │
│                      ↓                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │ cancel(signer, schedule_id)                        │    │
│  │   • Only payer can cancel                          │    │
│  │   • Refunds remaining escrowed funds               │    │
│  │   • Marks schedule inactive                        │    │
│  │   • Emits Canceled event                           │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     VIEW FUNCTIONS                           │
│                                                              │
│  • get_schedule(payer_addr, schedule_id) → Schedule         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 **Mobile App Architecture (MVVM)**

### **Architecture Pattern: Model-View-ViewModel**

```
┌─────────────────────────────────────────────────────────────┐
│                         VIEW LAYER                           │
│                    (Jetpack Compose)                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              BucketTradingScreen.kt                 │    │
│  │                                                     │    │
│  │  @Composable                                       │    │
│  │  fun BucketTradingScreen(                          │    │
│  │      viewModel: BucketViewModel = hiltViewModel()  │    │
│  │  ) {                                               │    │
│  │      val uiState by viewModel.uiState              │    │
│  │                     .collectAsState()              │    │
│  │                                                     │    │
│  │      when (uiState) {                              │    │
│  │          is Loading → LoadingUI()                  │    │
│  │          is Success → TradingUI(data)              │    │
│  │          is Error → ErrorUI(message)               │    │
│  │      }                                              │    │
│  │                                                     │    │
│  │      Button(onClick = {                            │    │
│  │          viewModel.openLongPosition(bucketId)      │    │
│  │      })                                            │    │
│  │  }                                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕                                   │
│                    StateFlow/Events                          │
│                          ↕                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      VIEWMODEL LAYER                         │
│                   (Business Logic)                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           CrescaBucketViewModel.kt                  │    │
│  │                                                     │    │
│  │  class BucketViewModel @Inject constructor(        │    │
│  │      private val repository: BucketRepository      │    │
│  │  ) : ViewModel() {                                 │    │
│  │                                                     │    │
│  │      private val _uiState = MutableStateFlow<      │    │
│  │          BucketUiState>(Loading)                   │    │
│  │      val uiState: StateFlow<BucketUiState> =       │    │
│  │          _uiState.asStateFlow()                    │    │
│  │                                                     │    │
│  │      fun openLongPosition(bucketId: Long) {        │    │
│  │          viewModelScope.launch {                   │    │
│  │              _uiState.value = Loading              │    │
│  │              try {                                  │    │
│  │                  val tx = repository.openLong(     │    │
│  │                      bucketId                      │    │
│  │                  )                                  │    │
│  │                  _uiState.value = Success(tx)      │    │
│  │              } catch (e: Exception) {              │    │
│  │                  _uiState.value = Error(e)         │    │
│  │              }                                      │    │
│  │          }                                          │    │
│  │      }                                              │    │
│  │  }                                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕                                   │
│                   Repository Pattern                         │
│                          ↕                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    REPOSITORY LAYER                          │
│                  (Data Abstraction)                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              BucketRepository.kt                    │    │
│  │                                                     │    │
│  │  class BucketRepository(                           │    │
│  │      private val aptosClient: AptosClient,         │    │
│  │      private val account: AptosAccount             │    │
│  │  ) {                                                │    │
│  │      suspend fun openLong(                         │    │
│  │          bucketId: Long                            │    │
│  │      ): String {                                    │    │
│  │          val payload = EntryFunction(              │    │
│  │              module = "$CONTRACT_ADDRESS::         │    │
│  │                        bucket_protocol",           │    │
│  │              function = "open_long",               │    │
│  │              ty_args = emptyList(),                │    │
│  │              args = listOf(                        │    │
│  │                  TransactionArgument(              │    │
│  │                      bucketId,                     │    │
│  │                      TypeTag("u64")                │    │
│  │                  )                                  │    │
│  │              )                                      │    │
│  │          )                                          │    │
│  │                                                     │    │
│  │          val signedTx = aptosClient.buildSignSubmit│    │
│  │              Transaction(account, payload)         │    │
│  │                                                     │    │
│  │          return signedTx.hash                      │    │
│  │      }                                              │    │
│  │  }                                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕                                   │
│                      Aptos SDK                              │
│                          ↕                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│                    (Kaptos SDK)                             │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              xyz.mcxross.kaptos                     │    │
│  │                                                     │    │
│  │  • AptosClient                                     │    │
│  │      - submitTransaction()                         │    │
│  │      - view()                                      │    │
│  │      - getAccountResources()                       │    │
│  │                                                     │    │
│  │  • AptosAccount                                    │    │
│  │      - privateKey (Ed25519)                        │    │
│  │      - publicKey                                   │    │
│  │      - address                                     │    │
│  │                                                     │    │
│  │  • TransactionBuilder                              │    │
│  │      - buildTransaction()                          │    │
│  │      - signTransaction()                           │    │
│  │                                                     │    │
│  │  • BCS Serialization                               │    │
│  │      - serializeVector()                           │    │
│  │      - deserialize()                               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 **Data Flow Diagrams**

### **1. Bucket Trading Flow**

```
┌─────────────┐
│    USER     │
│  (Mobile)   │
└──────┬──────┘
       │ 1. Tap "Open Long Position"
       ↓
┌──────────────────────┐
│   BucketScreen.kt    │
│  (Compose UI)        │
└──────┬───────────────┘
       │ 2. viewModel.openLong(bucketId)
       ↓
┌──────────────────────────┐
│ CrescaBucketViewModel    │
│ • _uiState.value=Loading │
└──────┬───────────────────┘
       │ 3. repository.openLong(bucketId)
       ↓
┌──────────────────────────┐
│  BucketRepository        │
│ • Build EntryFunction    │
│ • Prepare arguments      │
└──────┬───────────────────┘
       │ 4. aptosClient.buildSignSubmitTransaction()
       ↓
┌──────────────────────────┐
│     Kaptos SDK           │
│ • Sign with Ed25519      │
│ • Serialize to BCS       │
│ • Submit to RPC          │
└──────┬───────────────────┘
       │ 5. HTTPS POST
       ↓
┌─────────────────────────────────┐
│      Aptos Blockchain           │
│  ┌───────────────────────────┐  │
│  │ Validator Nodes           │  │
│  │ • Verify signature        │  │
│  │ • Execute Move code       │  │
│  │ • Update state            │  │
│  └───────┬───────────────────┘  │
│          │                       │
│  ┌───────▼───────────────────┐  │
│  │ bucket_protocol::open_long│  │
│  │ • Validate collateral     │  │
│  │ • Create Position         │  │
│  │ • Emit event              │  │
│  └───────┬───────────────────┘  │
│          │                       │
│  ┌───────▼───────────────────┐  │
│  │ State Storage             │  │
│  │ • position_id = 1         │  │
│  │ • owner = user_addr       │  │
│  │ • is_long = true          │  │
│  │ • is_active = true        │  │
│  └───────┬───────────────────┘  │
└──────────┼───────────────────────┘
           │ 6. Transaction Response
           ↓
┌──────────────────────────┐
│     Kaptos SDK           │
│ • txHash                 │
│ • success = true         │
└──────┬───────────────────┘
       │ 7. Return txHash
       ↓
┌──────────────────────────┐
│  BucketRepository        │
│ • return txHash          │
└──────┬───────────────────┘
       │ 8. Success(txHash)
       ↓
┌──────────────────────────────┐
│ CrescaBucketViewModel        │
│ • _uiState.value=Success(tx) │
└──────┬───────────────────────┘
       │ 9. StateFlow emission
       ↓
┌──────────────────────┐
│   BucketScreen.kt    │
│ • Show success UI    │
│ • Display txHash     │
└──────┬───────────────┘
       │ 10. Visual feedback
       ↓
┌─────────────┐
│    USER     │
│ ✅ Position │
│    Opened   │
└─────────────┘
```

### **2. Calendar Payment Flow**

```
┌─────────────┐
│    USER     │
│  (Payer)    │
└──────┬──────┘
       │ 1. Create Schedule
       ↓
┌──────────────────────────────┐
│  CalendarPaymentScreen.kt    │
│ • recipient                  │
│ • amount = 1 APT             │
│ • execute_at = "2025-12-01"  │
│ • interval = 0 (one-time)    │
│ • occurrences = 1            │
└──────┬───────────────────────┘
       │ 2. viewModel.createSchedule(...)
       ↓
┌──────────────────────────────────┐
│  CalendarPaymentViewModel        │
│ • Convert date to timestamp      │
│ • Validate inputs                │
└──────┬───────────────────────────┘
       │ 3. repository.createSchedule(...)
       ↓
┌──────────────────────────────────┐
│   CalendarRepository             │
│ • Build EntryFunction            │
│ • args = [recipient, amount, ... │
└──────┬───────────────────────────┘
       │ 4. Submit transaction
       ↓
┌─────────────────────────────────────────────┐
│         Aptos Blockchain                     │
│  ┌───────────────────────────────────────┐  │
│  │ calendar_payments::create_schedule    │  │
│  │ • Escrow (1 APT * 1) = 1 APT         │  │
│  │ • Create Schedule                     │  │
│  │   - schedule_id = 42                  │  │
│  │   - payer = user_addr                 │  │
│  │   - recipient = recipient_addr        │  │
│  │   - execute_at = timestamp            │  │
│  │   - is_active = true                  │  │
│  │ • Emit Created event                  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
       │ 5. Success
       ↓
┌─────────────┐
│    USER     │
│ ✅ Schedule │
│   Created   │
└─────────────┘

       ⏰ TIME PASSES (Execute Date Reached)

┌─────────────┐
│  EXECUTOR   │ ← Anyone can call!
│ (Any User)  │
└──────┬──────┘
       │ 1. execute(payer_addr, schedule_id=42)
       ↓
┌─────────────────────────────────────────────┐
│         Aptos Blockchain                     │
│  ┌───────────────────────────────────────┐  │
│  │ calendar_payments::execute            │  │
│  │ • Check timestamp >= execute_at       │  │
│  │ • Transfer 1 APT to recipient         │  │
│  │ • executed_count = 1                  │  │
│  │ • is_active = false (completed)       │  │
│  │ • Emit Executed event                 │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
       │ 2. Payment sent
       ↓
┌─────────────┐
│ RECIPIENT   │
│ ✅ Received │
│   1 APT     │
└─────────────┘
```

### **3. Tap-to-Pay Flow**

```
┌─────────────┐
│   SENDER    │
└──────┬──────┘
       │ 1. Tap "Send APT"
       ↓
┌──────────────────────┐
│   WalletScreen.kt    │
│ • Enter recipient    │
│ • Enter amount       │
│ • Tap "Send"         │
└──────┬───────────────┘
       │ 2. viewModel.sendCoins(recipient, amount)
       ↓
┌──────────────────────────┐
│   WalletViewModel        │
│ • Validate balance       │
│ • Validate address       │
└──────┬───────────────────┘
       │ 3. repository.transfer(recipient, amount)
       ↓
┌──────────────────────────┐
│   WalletRepository       │
│ • Build transfer payload │
└──────┬───────────────────┘
       │ 4. Submit transaction
       ↓
┌─────────────────────────────────────┐
│      Aptos Blockchain               │
│  ┌───────────────────────────────┐  │
│  │ 0x1::coin::transfer<APT>      │  │
│  │ • Debit sender                │  │
│  │ • Credit recipient            │  │
│  │ • Update balances             │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
       │ 5. Success
       ├─────────────────┐
       ↓                 ↓
┌─────────────┐   ┌─────────────┐
│   SENDER    │   │  RECIPIENT  │
│ ✅ Sent     │   │ ✅ Received │
└─────────────┘   └─────────────┘
```

---

## 🔐 **Security Architecture**

### **Multi-Layer Security**

```
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER SECURITY                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Biometric Authentication                           │    │
│  │ • Fingerprint                                      │    │
│  │ • Face Recognition                                 │    │
│  │ • PIN Fallback                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Private Key Storage                                │    │
│  │ • EncryptedSharedPreferences                       │    │
│  │ • Android Keystore System                          │    │
│  │ • Hardware-backed keys (TEE)                       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Input Validation                                   │    │
│  │ • Address format validation                        │    │
│  │ • Amount range checks                              │    │
│  │ • XSS/Injection prevention                         │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 TRANSPORT LAYER SECURITY                     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ HTTPS/TLS 1.3                                      │    │
│  │ • End-to-end encryption                            │    │
│  │ • Certificate pinning                              │    │
│  │ • No plaintext transmission                        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Transaction Signing                                │    │
│  │ • Local signing (Ed25519)                          │    │
│  │ • Never expose private key                         │    │
│  │ • Signature verification                           │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                SMART CONTRACT SECURITY                       │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Access Control                                     │    │
│  │ • Owner-only functions                             │    │
│  │ • Permission checks                                │    │
│  │                                                     │    │
│  │ assert!(position.owner == signer::address_of(acct),│    │
│  │         EPERMISSION_DENIED);                       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Input Validation                                   │    │
│  │ • Range checks                                     │    │
│  │ • Type safety (Move)                               │    │
│  │                                                     │    │
│  │ assert!(leverage >= 1 && leverage <= 20,          │    │
│  │         EINVALID_LEVERAGE);                        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Reentrancy Protection                              │    │
│  │ • Move language prevents by design                 │    │
│  │ • No callbacks during execution                    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Overflow Protection                                │    │
│  │ • Automatic abort on overflow                      │    │
│  │ • Checked arithmetic                               │    │
│  │                                                     │    │
│  │ let total = amount * occurrences;                  │    │
│  │ // Aborts if overflow                              │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  BLOCKCHAIN SECURITY                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Aptos BFT Consensus                                │    │
│  │ • Byzantine Fault Tolerant                         │    │
│  │ • 67% validator agreement                          │    │
│  │ • Instant finality                                 │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Cryptography                                       │    │
│  │ • Ed25519 signatures                               │    │
│  │ • SHA3-256 hashing                                 │    │
│  │ • BCS serialization                                │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 **Integration Architecture**

### **External Service Integration**

```
┌─────────────────────────────────────────────────────────────┐
│                     APTPAYS PLATFORM                         │
└───────────┬─────────────────────────────────────────────────┘
            │
            ├──────────────────┐
            │                  │
            ↓                  ↓
┌────────────────────┐  ┌────────────────────┐
│  Aptos Blockchain  │  │  Pyth Network      │
│                    │  │  (Future)          │
│ • Transaction      │  │                    │
│   Processing       │  │ • Real-time        │
│ • State Storage    │  │   Price Feeds      │
│ • Event Emission   │  │ • BTC/ETH/SOL      │
│                    │  │   Prices           │
│ RPC:               │  │                    │
│ fullnode.testnet   │  │ API:               │
│ .aptoslabs.com     │  │ hermes.pyth        │
│                    │  │ .network           │
└────────────────────┘  └────────────────────┘
            │                  
            ├──────────────────┐
            │                  │
            ↓                  ↓
┌────────────────────┐  ┌────────────────────┐
│  LayerZero         │  │  Wormhole          │
│  (Future)          │  │  (Future)          │
│                    │  │                    │
│ • Cross-chain      │  │ • Token Bridge     │
│   Messaging        │  │ • Cross-chain      │
│ • Bridge to        │  │   Assets           │
│   Ethereum         │  │                    │
│                    │  │                    │
└────────────────────┘  └────────────────────┘
```

---

## 📊 **Database Schema (Future Backend)**

### **PostgreSQL Schema**

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aptos_address VARCHAR(66) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP,
    preferences JSONB
);

-- Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    type VARCHAR(50),  -- 'trade', 'payment', 'transfer'
    status VARCHAR(20), -- 'pending', 'success', 'failed'
    amount BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP
);

-- Trading Positions Table
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    position_id BIGINT NOT NULL,
    bucket_id BIGINT,
    is_long BOOLEAN,
    margin BIGINT,
    leverage SMALLINT,
    opened_at TIMESTAMP,
    closed_at TIMESTAMP,
    pnl BIGINT,
    status VARCHAR(20) -- 'open', 'closed'
);

-- Payment Schedules Table
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    schedule_id BIGINT NOT NULL,
    recipient VARCHAR(66) NOT NULL,
    amount BIGINT,
    interval_secs BIGINT,
    occurrences INT,
    executed_count INT DEFAULT 0,
    next_execution TIMESTAMP,
    status VARCHAR(20), -- 'active', 'completed', 'canceled'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics Events Table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(50),
    event_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 **Deployment Architecture**

### **Production Deployment**

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION ENVIRONMENT                    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Mobile App (APK/AAB)                   │    │
│  │  • Google Play Store                               │    │
│  │  • Signed with release keystore                    │    │
│  │  • ProGuard enabled                                │    │
│  │  • Minified                                        │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Aptos Mainnet Fullnode                     │    │
│  │  • https://fullnode.mainnet.aptoslabs.com          │    │
│  │  • High availability                               │    │
│  │  • Load balanced                                   │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Smart Contracts (Mainnet)                  │    │
│  │  • Bucket Protocol                                 │    │
│  │  • Calendar Payments                               │    │
│  │  • Smart Wallet                                    │    │
│  │  • Audited & Verified                              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Backend Services (Optional)                │    │
│  │  • AWS/GCP Infrastructure                          │    │
│  │  • Node.js + PostgreSQL                            │    │
│  │  • Redis Cache                                     │    │
│  │  • Analytics & Monitoring                          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Monitoring & Logging                       │    │
│  │  • Sentry (Error tracking)                         │    │
│  │  • Firebase Analytics                              │    │
│  │  • Grafana (Metrics)                               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 **Scalability Architecture**

### **Horizontal Scaling Strategy**

```
                    ┌──────────────┐
                    │  Load        │
                    │  Balancer    │
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
      ┌────▼────┐     ┌────▼────┐    ┌────▼────┐
      │ Aptos   │     │ Aptos   │    │ Aptos   │
      │ Node 1  │     │ Node 2  │    │ Node 3  │
      └────┬────┘     └────┬────┘    └────┬────┘
           │               │               │
           └───────────────┴───────────────┘
                           │
                    ┌──────▼───────┐
                    │  Blockchain  │
                    │    State     │
                    └──────────────┘
```

---

**Last Updated:** November 3, 2025  
**Version:** 1.0  
**Maintained By:** Cresca Team
