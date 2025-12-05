# DEX Aggregator - React Native Implementation

Complete React Native implementation for the Cresca DEX Aggregator, providing cross-DEX price comparison and optimal swap routing.

## 📁 Files Created

### 1. **DEXAggregatorScreen.tsx** (`app/src/screens/`)
Full-featured DEX aggregator UI with:
- Real-time route comparison across 5 DEXs
- Best route automatic selection
- Price impact and slippage protection
- DEX-specific stats and volume tracking
- Swap execution interface (requires wallet integration)

### 2. **useDEXAggregator.ts** (`app/src/hooks/`)
Custom React hook for all DEX aggregator interactions:
- View function wrappers for all contract queries
- State management (loading, error handling)
- Amount formatting utilities
- Slippage calculation helpers

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd app
npm install @aptos-labs/ts-sdk
# or
yarn add @aptos-labs/ts-sdk
```

### 2. Add Screen to Navigation

```typescript
// In your navigator (e.g., App.tsx or navigation/index.tsx)
import DEXAggregatorScreen from './src/screens/DEXAggregatorScreen';

// Add to your Stack Navigator
<Stack.Screen 
  name="DEXAggregator" 
  component={DEXAggregatorScreen}
  options={{ title: 'DEX Aggregator' }}
/>
```

### 3. Navigate to Screen

```typescript
// From any component
navigation.navigate('DEXAggregator');
```

## 📱 Features

### Aggregator Statistics
- **Total Volume**: Cumulative swap volume across all DEXs
- **Total Swaps**: Number of swaps executed through aggregator
- **Fees Collected**: Aggregator fees (0.05% of volume)

### Route Finding
```typescript
// Find best route automatically
const { findBestRoute } = useDEXAggregator();
const bestRoute = await findBestRoute(
  '0x1::aptos_coin::AptosCoin',
  '0x1::aptos_coin::AptosCoin', // Replace with USDC
  10 // 10 APT
);
// Returns: { dex_id: 4, amount_out: "995000000", price_impact: "20" }
```

### Price Comparison
```typescript
// Compare prices across all DEXs
const { comparePrices } = useDEXAggregator();
const comparison = await comparePrices(
  tokenInType,
  tokenOutType,
  amountIn
);
// Returns: { best_dex_id, best_output, worst_output, price_diff_bps }
```

### Get All Routes
```typescript
// View all available routes with details
const { getAllRoutes } = useDEXAggregator();
const routes = await getAllRoutes(tokenInType, tokenOutType, amountIn);
// Returns array of SwapRoute objects with price impact, fees, etc.
```

## 🎨 UI Components

### Best Route Display
Shows the optimal DEX selection with:
- DEX name (Liquidswap, Panora, Thala, Cetus, Cellana)
- Expected output amount
- Price impact percentage
- One-tap swap button

### Route Comparison Cards
Interactive cards for each available route:
- Selectable (tap to choose specific DEX)
- Output amount comparison
- Price impact visualization
- Estimated aggregator fee

### DEX Status Overview
Real-time stats for all supported DEXs:
- Enabled/Disabled status
- Total volume per DEX
- Swap count per DEX
- Visual status badges

## 🔧 Customization

### Change Network
```typescript
// In useDEXAggregator.ts
const config = new AptosConfig({ 
  network: Network.MAINNET // Change to MAINNET when ready
});
```

### Token Type Configuration
```typescript
// Replace placeholder token types in DEXAggregatorScreen.tsx
const TOKEN_IN = '0x1::aptos_coin::AptosCoin';
const TOKEN_OUT = '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC';
```

### Adjust Slippage Default
```typescript
// In DEXAggregatorScreen.tsx
const [slippageTolerance, setSlippageTolerance] = useState('0.5'); // 0.5% instead of 1.0%
```

### Custom Styling
All styles are in the `StyleSheet.create()` object at the bottom of `DEXAggregatorScreen.tsx`:
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#YOUR_COLOR', // Customize background
  },
  buttonPrimary: {
    backgroundColor: '#YOUR_BRAND_COLOR', // Your primary color
  },
  // ... customize all styles
});
```

## 🔐 Wallet Integration

The current implementation shows swap previews but requires wallet integration for execution. To enable actual swaps:

### Option 1: Petra Wallet
```bash
npm install petra-plugin-wallet-adapter
```

```typescript
import { PetraWallet } from 'petra-plugin-wallet-adapter';

const wallet = new PetraWallet();
await wallet.connect();

// Execute swap with wallet
const transaction = {
  function: `${DEX_MODULE}::swap_exact_in_best_route`,
  type_arguments: [tokenInType, tokenOutType],
  arguments: [amountInOctas, minAmountOut, ADMIN_ADDRESS],
};

const response = await wallet.signAndSubmitTransaction(transaction);
```

### Option 2: Martian Wallet
```bash
npm install @martianwallet/aptos-wallet-adapter
```

```typescript
import { MartianWallet } from '@martianwallet/aptos-wallet-adapter';

const wallet = new MartianWallet();
await wallet.connect();

// Similar transaction structure as Petra
```

### Option 3: Universal Wallet Adapter
```bash
npm install @aptos-labs/wallet-adapter-react
```

```typescript
import { useWallet } from '@aptos-labs/wallet-adapter-react';

const { signAndSubmitTransaction } = useWallet();

const response = await signAndSubmitTransaction({
  data: {
    function: `${DEX_MODULE}::swap_exact_in_best_route`,
    typeArguments: [tokenInType, tokenOutType],
    functionArguments: [amountInOctas, minAmountOut, ADMIN_ADDRESS],
  },
});
```

## 📊 Contract Integration

### Contract Address
```typescript
const ADMIN_ADDRESS = '0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b';
const DEX_MODULE = `${ADMIN_ADDRESS}::dex_aggregator`;
```

### Available Contract Functions

#### View Functions (No transaction required)
- `get_supported_dexs()` - List all DEXs with stats
- `get_aggregator_stats()` - Global aggregator metrics
- `get_dex_stats(dex_id)` - Specific DEX statistics
- `find_best_route(amount_in)` - Best route calculation
- `get_all_routes(amount_in)` - All available routes
- `compare_prices(amount_in)` - Price comparison analysis

#### Entry Functions (Requires wallet signature)
- `swap_exact_in_best_route()` - Auto-route to best DEX
- `swap_exact_in_specific_dex(dex_id)` - Swap via chosen DEX

## 🧪 Testing

### Test View Functions
```typescript
import { useDEXAggregator } from './src/hooks/useDEXAggregator';

// In your test or component
const { 
  getSupportedDexs, 
  findBestRoute, 
  comparePrices 
} = useDEXAggregator();

// Test fetching DEXs
const dexs = await getSupportedDexs();
console.log('Supported DEXs:', dexs);

// Test route finding
const bestRoute = await findBestRoute(
  '0x1::aptos_coin::AptosCoin',
  '0x1::aptos_coin::AptosCoin',
  1 // 1 APT
);
console.log('Best route:', bestRoute);
```

### Mock Data for Development
If you need to test UI without blockchain calls:
```typescript
// In DEXAggregatorScreen.tsx, temporarily use mock data
const mockRoutes: SwapRoute[] = [
  {
    dex_id: 1,
    dex_name: 'Liquidswap',
    amount_in: '100000000',
    amount_out: '99500000',
    price_impact: '50',
    estimated_fee: '50000',
  },
  // ... more mock routes
];

setAllRoutes(mockRoutes);
```

## 🐛 Troubleshooting

### "Contract not found" Error
**Issue**: `AggregatorRegistry` not initialized at `ADMIN_ADDRESS`

**Solution**: Admin must call `initialize()` first:
```bash
aptos move run \
  --function-id ${ADMIN_ADDRESS}::dex_aggregator::initialize \
  --profile your-profile
```

### "Amount out of range" Error
**Issue**: Amount conversion to octas exceeds u64 limit

**Solution**: Check amount before conversion:
```typescript
const MAX_APT = 18446744073; // Max u64 / 10^8
if (amountIn > MAX_APT) {
  Alert.alert('Amount too large', `Max: ${MAX_APT} APT`);
  return;
}
```

### Slow Route Fetching
**Issue**: View functions taking 3-5 seconds

**Solution**: Use debouncing for input changes:
```typescript
import { useDebounce } from 'use-debounce';

const [debouncedAmount] = useDebounce(amountIn, 500);

useEffect(() => {
  if (debouncedAmount) {
    fetchAllRoutes();
  }
}, [debouncedAmount]);
```

## 📈 Performance Tips

1. **Cache DEX List**: DEXs don't change often, cache in AsyncStorage
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const cachedDexs = await AsyncStorage.getItem('supported_dexs');
if (cachedDexs) {
  setSupportedDexs(JSON.parse(cachedDexs));
} else {
  const dexs = await getSupportedDexs();
  await AsyncStorage.setItem('supported_dexs', JSON.stringify(dexs));
}
```

2. **Parallel Queries**: Fetch stats simultaneously
```typescript
const [dexs, stats, routes] = await Promise.all([
  getSupportedDexs(),
  getAggregatorStats(),
  getAllRoutes(tokenIn, tokenOut, amount),
]);
```

3. **Memoize Formatting**: Use `useMemo` for expensive calculations
```typescript
const formattedRoutes = useMemo(() => 
  allRoutes.map(route => ({
    ...route,
    displayAmount: formatAmount(route.amount_out),
    displayImpact: formatBps(route.price_impact),
  })),
  [allRoutes]
);
```

## 🎯 Next Steps

1. **Wallet Integration**: Add Petra/Martian wallet support for swap execution
2. **Token Selection**: Add token picker UI for different trading pairs
3. **Price Charts**: Integrate historical price data visualization
4. **Notifications**: Add push notifications for swap completion
5. **Analytics**: Track user swap patterns for UX optimization

## 📚 Resources

- **Move Contract**: `f:\W3\aptpays\move\sources\CrescaDEXAggregator.move`
- **Test Suite**: `f:\W3\aptpays\move\sources\CrescaDEXAggregator.test.move`
- **Aptos SDK Docs**: https://aptos.dev/sdks/ts-sdk/
- **React Native Docs**: https://reactnative.dev/

## 🤝 Contributing

When adding new features:
1. Update the hook (`useDEXAggregator.ts`) for contract interactions
2. Update the screen (`DEXAggregatorScreen.tsx`) for UI
3. Test with Aptos Testnet before mainnet deployment
4. Document any new configuration options in this README

## 📄 License

Part of the Cresca DeFi Platform - see main project LICENSE
