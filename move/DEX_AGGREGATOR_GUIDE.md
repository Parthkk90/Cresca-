# Cresca DEX Aggregator - User Guide

## Overview

**CrescaDEXAggregator** is a smart contract that finds the best prices for token swaps across multiple Aptos DEXs. It compares prices from Liquidswap, Panora, Thala Labs, Cetus, and Cellana Finance, then routes your swap to whichever gives the best output.

## Supported DEXs

| DEX ID | Name | Features |
|--------|------|----------|
| 1 | Liquidswap (Pontem) | Largest liquidity, best for large trades |
| 2 | Panora | Competitive pricing, low fees |
| 3 | Thala Labs | Optimized for stable swaps |
| 4 | Cetus | Concentrated liquidity pools |
| 5 | Cellana Finance | Emerging DEX |

## Key Features

✅ **Best Price Discovery**: Automatically finds best rates across 5 DEXs  
✅ **Single Transaction**: One call routes to optimal DEX  
✅ **Slippage Protection**: Set minimum output to avoid bad trades  
✅ **Low Fees**: Only 0.05% aggregator fee (5 basis points)  
✅ **Transparent Routing**: Events show which DEX was used  
✅ **Manual Override**: Choose specific DEX if you prefer

## How It Works

### Automatic Best Route

```bash
# 1. Initialize aggregator (Admin only, one-time)
aptos move run \
  --function-id 0x33ec41...::dex_aggregator::initialize \
  --profile testnet

# 2. Swap using best route (finds cheapest automatically)
aptos move run \
  --function-id 0x33ec41...::dex_aggregator::swap_exact_in_best_route \
  --type-args \
    0x1::aptos_coin::AptosCoin \
    0x1::test_usdc::USDC \
  --args \
    u64:1000000000 \
    u64:950000000 \
    address:0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b
```

**Parameters**:
- `amount_in`: 1000000000 (10 APT with 8 decimals)
- `min_amount_out`: 950000000 (minimum 9.5 USDC)
- `admin_addr`: Aggregator registry address

### Manual DEX Selection

```bash
# Swap specifically on Liquidswap (DEX ID = 1)
aptos move run \
  --function-id 0x33ec41...::dex_aggregator::swap_exact_in_specific_dex \
  --type-args \
    0x1::aptos_coin::AptosCoin \
    0x1::test_usdc::USDC \
  --args \
    u8:1 \
    u64:1000000000 \
    u64:950000000 \
    address:0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b
```

## View Functions (Price Comparison)

### Find Best Route

```bash
# Get best DEX for your swap
aptos move view \
  --function-id 0x33ec41...::dex_aggregator::find_best_route \
  --type-args \
    0x1::aptos_coin::AptosCoin \
    0x1::test_usdc::USDC \
  --args \
    address:0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b \
    u64:1000000000
```

**Returns**: `(dex_id, amount_out, price_impact_bps)`
- Example: `(3, 985000000, 30)` = Thala Labs (#3), 9.85 USDC out, 0.3% price impact

### Compare All Prices

```bash
# See prices from all DEXs side-by-side
aptos move view \
  --function-id 0x33ec41...::dex_aggregator::compare_prices \
  --type-args \
    0x1::aptos_coin::AptosCoin \
    0x1::test_usdc::USDC \
  --args \
    address:0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b \
    u64:1000000000
```

**Returns**: `(best_dex_id, best_output, worst_output, price_difference_bps)`
- Example: `(4, 988000000, 950000000, 400)` = Cetus best at 9.88 USDC, 4% better than worst

### Get All Routes

```bash
# Full breakdown of all available routes
aptos move view \
  --function-id 0x33ec41...::dex_aggregator::get_all_routes \
  --type-args \
    0x1::aptos_coin::AptosCoin \
    0x1::test_usdc::USDC \
  --args \
    address:0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b \
    u64:1000000000
```

**Returns**: Array of routes with detailed info:
```
[
  {dex_id: 1, dex_name: "Liquidswap", amount_out: 975000000, price_impact: 50, fee: 50000},
  {dex_id: 2, dex_name: "Panora", amount_out: 980000000, price_impact: 40, fee: 50000},
  {dex_id: 3, dex_name: "Thala", amount_out: 985000000, price_impact: 30, fee: 50000},
  ...
]
```

### Check DEX Stats

```bash
# See volume and swap count for specific DEX
aptos move view \
  --function-id 0x33ec41...::dex_aggregator::get_dex_stats \
  --args \
    address:0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b \
    u8:1
```

**Returns**: `(total_volume, swap_count, enabled)`
- Example: `(50000000000, 127, true)` = 500 APT volume, 127 swaps, enabled

### Get Aggregator Stats

```bash
# Overall aggregator performance
aptos move view \
  --function-id 0x33ec41...::dex_aggregator::get_aggregator_stats \
  --args \
    address:0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b
```

**Returns**: `(total_volume, total_swaps, fees_collected)`

## Admin Functions

### Toggle DEX On/Off

```bash
# Disable Cellana Finance (DEX ID = 5)
aptos move run \
  --function-id 0x33ec41...::dex_aggregator::toggle_dex \
  --args \
    u8:5 \
    bool:false \
  --profile testnet
```

### Collect Fees

```bash
# Withdraw accumulated aggregator fees
aptos move run \
  --function-id 0x33ec41...::dex_aggregator::collect_aggregator_fees \
  --type-args 0x1::aptos_coin::AptosCoin \
  --args u64:100000000 \
  --profile testnet
```

## Fees

**Aggregator Fee**: 0.05% (5 basis points)
- Example: Swap 10 APT → 0.005 APT fee (0.05%)
- DEX fees are separate (0.3%-0.5% depending on DEX)
- Total effective fee: ~0.35%-0.55%

**Fee Comparison**:
- Direct Liquidswap: 0.5% DEX fee
- Via Cresca Aggregator: 0.05% aggregator + 0.5% DEX = 0.55% total
- **Trade-off**: Pay 0.05% extra to get best price across 5 DEXs

## Slippage Protection

Set `min_amount_out` to prevent bad trades:

| Slippage Tolerance | Formula | Example (10 APT → USDC at $10/APT) |
|-------------------|---------|-------------------------------------|
| 0.5% | `expected * 0.995` | min_amount_out = 99.5 USDC |
| 1% | `expected * 0.99` | min_amount_out = 99 USDC |
| 3% | `expected * 0.97` | min_amount_out = 97 USDC |
| 5% | `expected * 0.95` | min_amount_out = 95 USDC |

If market moves and you get less than `min_amount_out`, transaction aborts.

## Price Impact

**Price Impact** = How much your trade moves the market price

- **Low Impact** (0.1%-0.5%): Small trade in large pool
- **Medium Impact** (0.5%-2%): Average trade
- **High Impact** (2%-5%): Large trade or small pool
- **Very High Impact** (>5%): Consider splitting trade

Check `price_impact_bps` in `find_best_route()` before trading.

## Kotlin Integration Example

```kotlin
// Find best route before swap
val (dexId, amountOut, priceImpact) = viewModel.findBestRoute(
    tokenIn = "0x1::aptos_coin::AptosCoin",
    tokenOut = "0x1::test_usdc::USDC",
    amountIn = 1_000_000_000u // 10 APT
)

println("Best DEX: $dexId")
println("Expected output: ${amountOut / 100_000_000.0} USDC")
println("Price impact: ${priceImpact / 100.0}%")

// Execute swap
viewModel.swapBestRoute(
    tokenIn = "0x1::aptos_coin::AptosCoin",
    tokenOut = "0x1::test_usdc::USDC",
    amountIn = 1_000_000_000u,
    minAmountOut = (amountOut * 0.99).toULong() // 1% slippage
)
```

## Current Limitations

⚠️ **IMPORTANT**: The current contract is a **framework/skeleton**. DEX integrations are **PLACEHOLDERS**:

```move
// This function currently ABORTS (not functional yet)
fun execute_swap_on_dex<X, Y>(...) {
    abort EDEX_NOT_AVAILABLE  // Real DEX calls not implemented
}
```

### To Make This Production-Ready:

1. **Add Liquidswap Integration**:
```move
use liquidswap::router;
router::swap_exact_coin_for_coin<X, Y>(coin_in, min_amount_out)
```

2. **Add Panora Integration**:
```move
use panora::swap;
swap::execute<X, Y>(coin_in, min_amount_out)
```

3. **Add Thala Integration**:
```move
use thala::stable_pool;
stable_pool::swap<X, Y>(coin_in, min_amount_out)
```

4. **Replace Mock Quotes**: 
   - Current `get_dex_quote()` returns fake data
   - Must call actual DEX view functions for real prices

5. **Test on Testnet**: Deploy to testnet with real DEX contracts

## Deployment Checklist

- [ ] Replace placeholder DEX calls with real integrations
- [ ] Test with actual Liquidswap/Panora/Thala contracts
- [ ] Add more DEXs (Aries, Amnis, etc.)
- [ ] Implement split routing (divide large trades across multiple DEXs)
- [ ] Add governance for DEX fee collection
- [ ] Security audit before mainnet

## Events

All swaps emit `AggregatedSwapEvent`:
```
{
  user: 0xabc...,
  token_in: "0x1::aptos_coin::AptosCoin",
  token_out: "0x1::test_usdc::USDC",
  amount_in: 1000000000,
  amount_out: 985000000,
  dex_used: "Thala",
  dex_id: 3,
  price_impact_bps: 30,
  aggregator_fee: 5000000,
  timestamp: 1733356800
}
```

Monitor events to track:
- Which DEX users prefer
- Average price impact
- Total volume per DEX
- Fee revenue

## Why Use DEX Aggregator vs Direct DEX?

| Factor | Direct DEX | Cresca Aggregator |
|--------|-----------|-------------------|
| Price | Fixed (one DEX) | Best across 5 DEXs |
| Fee | 0.3%-0.5% | 0.35%-0.55% (extra 0.05%) |
| Effort | Manual comparison | Automatic |
| Slippage | Higher risk | Lower (best liquidity) |
| TX Count | 1 | 1 (same) |

**Use Case**: Worth the 0.05% fee for trades >$1,000 where 0.1% price difference = $1+ savings.

## FAQ

**Q: Is this cheaper than swapping directly on Liquidswap?**  
A: You pay 0.05% extra to the aggregator, but often save more by getting better prices from other DEXs.

**Q: Which DEX is usually cheapest?**  
A: Depends on trade size and liquidity. Check `compare_prices()` before trading.

**Q: Can I force use of specific DEX?**  
A: Yes, use `swap_exact_in_specific_dex()` with desired DEX ID.

**Q: What if all DEXs have no liquidity?**  
A: Transaction aborts with `ENO_ROUTES_FOUND`.

**Q: How do I know the aggregator didn't cheat me?**  
A: Call `get_all_routes()` before swap to verify prices yourself.

---

**Contract Address**: `0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::dex_aggregator`  
**Network**: Aptos Testnet  
**Status**: ⚠️ Framework complete, DEX integrations pending
