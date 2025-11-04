# 🚀 AptPays Super Wallet - Complete React Native App

**A next-generation crypto wallet with scheduled payments, gamification, and seamless UX**

## 🌟 Features

### Core Functionality
- ✅ **Send & Receive** - Instant APT transfers with QR code scanning
- 📱 **Tap to Pay (NFC)** - Contactless payments in physical stores
- 📅 **Scheduled Payments** - One-time and recurring crypto payments
- 🔄 **Token Swap** - Multichain token exchange with best rates
- 💼 **Investment Bundles** - Pre-configured DeFi investment packages
- 📊 **Transaction History** - Complete activity log with filters

### Gamification & UX
- 🎮 **Level System** - Earn XP for every transaction
- 🏆 **Achievements** - Unlock rewards and special avatars
- 🦊 **Avatar Customization** - Choose from 50+ unique avatars
- 💫 **Smooth Animations** - Delightful micro-interactions
- 🎨 **Beautiful Design** - Inspired by Revolut, N26, Monzo

## 📱 Screenshots

```
[Home]          [Send/Receive]    [Schedule]      [Swap]          [Profile]
┌─────────┐     ┌─────────┐       ┌─────────┐     ┌─────────┐     ┌─────────┐
│ 🦊 Lvl12│     │  QR Code  │     │ Calendar  │   │ APT → ETH │   │ Avatar  │
│ Balance │     │  Scanner  │     │  Payments │   │ Price Chart│  │ Lvl 12  │
│ 125 APT │     │           │     │           │   │           │   │ 680 XP  │
│ Actions │     │  NFC Pay  │     │  Recurring│   │ Swap Now  │   │ Badges  │
│ Recent  │     │  Address  │     │  One-time │   │ Routes    │   │ Settings│
└─────────┘     └─────────┘       └─────────┘     └─────────┘     └─────────┘
```

## 🏗️ Project Structure

```
app/
├── src/
│   ├── screens/              # All app screens
│   │   ├── HomeScreen.tsx             # Main dashboard
│   │   ├── SendScreen.tsx             # Send money (QR/NFC/Address)
│   │   ├── ReceiveScreen.tsx          # Receive money (QR code)
│   │   ├── SwapScreen.tsx             # Token swap interface
│   │   ├── InvestScreen.tsx           # Investment bundles
│   │   ├── ScheduleScreen.tsx         # Scheduled payments
│   │   ├── TransactionsScreen.tsx     # Transaction history
│   │   ├── ProfileScreen.tsx          # User profile & settings
│   │   ├── AvatarSelectionScreen.tsx  # Choose avatar
│   │   └── OnboardingScreen.tsx       # First-time setup
│   │
│   ├── components/           # Reusable UI components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── GradientBackground.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── wallet/
│   │   │   ├── BalanceCard.tsx
│   │   │   ├── TokenList.tsx
│   │   │   └── TransactionItem.tsx
│   │   ├── gamification/
│   │   │   ├── XPBar.tsx
│   │   │   ├── AchievementCard.tsx
│   │   │   └── LevelBadge.tsx
│   │   └── payment/
│   │       ├── QRScanner.tsx
│   │       ├── NFCReader.tsx
│   │       └── ScheduleForm.tsx
│   │
│   ├── services/             # Business logic & API
│   │   ├── aptosService.ts          # Aptos blockchain integration
│   │   ├── swapService.ts           # Token swap logic
│   │   ├── nfcService.ts            # NFC payment handling
│   │   ├── gamificationService.ts   # XP, levels, achievements
│   │   └── storageService.ts        # Local data persistence
│   │
│   ├── store/                # State management (Zustand)
│   │   ├── index.ts                 # Main store (wallet, profile, txns)
│   │   ├── swapStore.ts             # Swap state
│   │   └── scheduleStore.ts         # Scheduled payments state
│   │
│   ├── navigation/           # App navigation
│   │   └── AppNavigator.tsx         # Stack + Tab navigation
│   │
│   ├── types/                # TypeScript definitions
│   │   └── index.ts
│   │
│   ├── theme/                # Design system
│   │   └── index.ts                 # Colors, typography, spacing
│   │
│   ├── utils/                # Helper functions
│   │   ├── formatters.ts            # Number, date, address formatting
│   │   ├── validators.ts            # Input validation
│   │   └── constants.ts             # App constants
│   │
│   ├── assets/               # Images, fonts, animations
│   │   ├── avatars/                 # Avatar images
│   │   ├── lottie/                  # Lottie animations
│   │   └── icons/                   # Custom icons
│   │
│   └── App.tsx               # Root component
│
├── android/                  # Android native code
├── ios/                      # iOS native code
├── package.json
├── tsconfig.json
└── babel.config.js
```

## 🚀 Getting Started

### Prerequisites

```bash
# Install Node.js 18+
# Install React Native CLI
npm install -g react-native-cli

# For iOS (macOS only)
sudo gem install cocoapods

# For Android
# Install Android Studio with SDK 33+
```

### Installation

```bash
cd app

# Install dependencies
npm install

# iOS only
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Configuration

1. **Create `.env` file:**
```env
APTOS_NETWORK=testnet
CONTRACT_ADDRESS=0x2bc654f1f5009c045ba5486d11252d46724d7e0522db6dbde2ff0fe7e275a1bf
SWAP_API_URL=https://api.example.com/swap
PRICE_FEED_URL=https://api.coingecko.com/api/v3
```

2. **Enable NFC (Android):**
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="false" />
```

3. **Camera permissions:**
Already configured in `Info.plist` (iOS) and `AndroidManifest.xml` (Android)

## 📚 Key Screens Implementation

### 1. Home Screen (Dashboard)
- **Balance card** with gradient background
- **Quick actions** (Send, Receive, QR, NFC)
- **Recent transactions** list
- **XP bar** and level display
- **Latest achievement** showcase

### 2. Send Screen
- **Three input methods:**
  - QR code scanner
  - NFC tap-to-pay
  - Manual address input
- Amount selector with USD conversion
- Recipient validation
- Transaction preview

### 3. Scheduled Payments Screen
- **Calendar view** for date selection
- **Two modes:**
  - One-time payment
  - Recurring (daily/weekly/monthly)
- Active schedules list
- Cancel functionality
- Execution history

### 4. Swap Screen
- Token selector (from/to)
- Live price chart
- Best route display
- Slippage settings
- Swap confirmation

### 5. Investment Screen
- **Pre-configured bundles:**
  - Conservative (5% APY)
  - Balanced (12% APY)
  - Aggressive (25% APY)
- Portfolio allocation pie chart
- Stake/unstake interface

### 6. Transactions Screen
- **Filter by:**
  - Type (send/receive/swap/schedule)
  - Date range
  - Token
- Search functionality
- Export to CSV
- Transaction details modal

### 7. Profile Screen
- Avatar display & change button
- Level & XP progress
- Achievement gallery
- Settings (security, network, theme)
- Wallet backup/recovery

## 🎮 Gamification System

### XP Earning

| Action | XP Reward |
|--------|-----------|
| First transfer | +100 XP |
| Daily login | +10 XP |
| Complete transaction | +20 XP |
| Schedule payment | +50 XP |
| Swap tokens | +30 XP |
| Invest in bundle | +100 XP |
| Refer friend | +500 XP |

### Levels

```
Level 1:     0 - 1000 XP
Level 2:  1000 - 2500 XP
Level 3:  2500 - 5000 XP
...
Level 10: 50000+ XP
```

### Achievements

```
🏆 First Steps       - Complete first transaction
🚀 Speed Demon       - 10 transactions in 1 hour
💰 Whale             - Single transaction > 1000 APT
📅 Scheduler Pro     - Create 5 recurring payments
🔄 Swap Master       - 50 token swaps
💎 Diamond Hands     - Hold for 30 days
🎯 Perfect Week      - 7 days of activity
⭐ Elite Trader      - $10k+ total volume
```

### Avatar Unlocks

```
Common (Lvl 1):   🐱 🐶 🦊 🐻 🐼
Rare (Lvl 5):     🦁 🐯 🦄 🐉 🦅
Epic (Lvl 10):    👑 💎 🔥 ⚡ 🌟
Legendary (Lvl 20): 🏆 🎖️ 👹 🤖 🧙
```

## 🔐 Security Features

- **Keychain storage** for private keys (iOS Keychain, Android Keystore)
- **Biometric authentication** (Face ID / Touch ID / Fingerprint)
- **Transaction confirmation** with preview
- **Address validation** before send
- **Phishing protection** (verified addresses)
- **Backup reminder** after wallet creation

## 🎨 Design Principles

### Color Scheme
- **Primary:** Purple gradient (premium, trustworthy)
- **Success:** Green (positive actions)
- **Warning:** Gold (attention needed)
- **Error:** Red (destructive actions)
- **Background:** Dark mode (reduces eye strain)

### Typography
- **Headings:** Inter Bold
- **Body:** Inter Regular
- **Numbers:** Inter Medium (tabular nums)

### Animations
- **Page transitions:** Slide with fade
- **Button press:** Scale down + haptic
- **Success:** Confetti + celebration
- **Loading:** Skeleton screens

## 📊 Performance Optimizations

- **FlashList** for long lists (transactions, tokens)
- **React Native Reanimated** for smooth animations
- **Image optimization** with FastImage
- **Code splitting** with lazy loading
- **Memoization** for expensive calculations
- **Background fetch** for price updates

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests (Detox)
npm run e2e:ios
npm run e2e:android

# Coverage report
npm run test:coverage
```

## 📦 Building for Production

### Android

```bash
cd android
./gradlew assembleRelease

# APK will be in: android/app/build/outputs/apk/release/
```

### iOS

```bash
# Open Xcode
open ios/AptPays.xcworkspace

# Archive → Distribute → App Store
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.73 |
| Language | TypeScript |
| State Management | Zustand |
| Navigation | React Navigation 6 |
| Styling | StyleSheet + LinearGradient |
| Animations | Reanimated 3 + Lottie |
| Blockchain | Aptos SDK |
| Storage | AsyncStorage + Keychain |
| HTTP | Axios |
| NFC | react-native-nfc-manager |
| QR | react-native-qrcode-scanner |

## 🌐 API Integration

### Aptos Testnet
```
Fullnode: https://fullnode.testnet.aptoslabs.com
Contract: 0x2bc654f1f5009c045ba5486d11252d46724d7e0522db6dbde2ff0fe7e275a1bf
```

### Price Feeds
```
CoinGecko API: https://api.coingecko.com/api/v3
Update interval: 30 seconds
```

### Swap Aggregator (Mock)
```
Your backend: https://api.aptpays.com/swap
Supports: APT, USDC, USDT, ETH, BTC
```

## 🐛 Troubleshooting

### Metro bundler issues
```bash
npm start -- --reset-cache
```

### Gradle build fails (Android)
```bash
cd android && ./gradlew clean
```

### Pod install fails (iOS)
```bash
cd ios && pod deintegrate && pod install
```

### NFC not working
- Check permissions in AndroidManifest.xml
- Test on physical device (emulator doesn't support NFC)

## 📝 TODO / Future Features

- [ ] Multi-signature wallets
- [ ] DApp browser (Web3 integration)
- [ ] NFT gallery & marketplace
- [ ] Staking dashboard
- [ ] P2P marketplace
- [ ] Fiat on-ramp (credit card)
- [ ] Social features (friends, groups)
- [ ] Push notifications for scheduled payments
- [ ] Biometric payment limits
- [ ] Hardware wallet support (Ledger)

## 🤝 Contributing

This is a complete production-ready wallet. To extend:

1. Add new screens in `src/screens/`
2. Create reusable components in `src/components/`
3. Add blockchain functions in `src/services/aptosService.ts`
4. Update navigation in `src/navigation/AppNavigator.tsx`
5. Add achievements in `src/services/gamificationService.ts`

## 📄 License

MIT License - feel free to use in your projects!

## 🙏 Credits

- **Design inspiration:** Revolut, N26, Monzo, Cash App
- **Blockchain:** Aptos Labs
- **Icons:** Ionicons
- **Animations:** LottieFiles

---

**Built with ❤️ for the Aptos ecosystem**

For questions: support@aptpays.com
