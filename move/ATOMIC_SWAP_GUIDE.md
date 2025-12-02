# Cresca Atomic Swap Contract - Usage Guide

## Overview

The Cresca Atomic Swap contract enables **trustless peer-to-peer token exchanges** between two parties without intermediaries or liquidity pools.

**Contract Address**: `0x0f9713e3c42951dbc4f05cc2e7ea211c1851b00a9d077e7e71f5d2a73041d606::swap`

## How It Works

1. **Initiator** locks Token X and specifies how much Token Y they want
2. **Participant** completes the swap by depositing Token Y
3. Both parties automatically receive their tokens
4. If timeout expires, initiator can cancel and get refund

## Key Features

✅ **Bidirectional** - Swap any token pair (X ↔ Y)  
✅ **Atomic** - Either both succeed or both fail (no partial swaps)  
✅ **Trustless** - No intermediary needed  
✅ **Time-locked** - Automatic refund after timeout  
✅ **Zero Fees** - No protocol fees (only gas)

## Functions

### 1. Initialize (One-time setup)

```move
public entry fun initialize(user: &signer)
```

**Purpose**: Set up event tracking for a user (optional but recommended)

**Example**:
```bash
aptos move run \
  --function-id 0x0f9713...::swap::initialize \
  --profile testnet
```

### 2. Initiate Swap

```move
public entry fun initiate_swap<X, Y>(
    initiator: &signer,
    participant: address,
    amount_x: u64,
    amount_y_expected: u64,
    timeout_seconds: u64,
)
```

**Purpose**: Lock your tokens (X) and create swap offer

**Parameters**:
- `participant` - Address of the person you're swapping with
- `amount_x` - Amount of Token X you're offering
- `amount_y_expected` - Amount of Token Y you want
- `timeout_seconds` - How long before swap expires (0 = default 1 hour)

**Example (APT → USDC swap)**:
```bash
aptos move run \
  --function-id 0x0f9713...::swap::initiate_swap \
  --type-args \
    0x1::aptos_coin::AptosCoin \
    0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::USDC \
  --args \
    address:0x742d35Cc6634C0532925a3b844Bc454e4438f44e \
    u64:100000000 \
    u64:10000000 \
    u64:3600 \
  --profile testnet
```

**Returns**: Creates `swap_id = 0` (increments for each new swap)

### 3. Complete Swap

```move
public entry fun complete_swap<X, Y>(
    participant: &signer,
    initiator_addr: address,
    swap_id: u64,
)
```

**Purpose**: Participant deposits Token Y to complete the exchange

**Parameters**:
- `initiator_addr` - Address of the person who initiated the swap
- `swap_id` - The swap ID (usually 0 for first swap)

**Example**:
```bash
aptos move run \
  --function-id 0x0f9713...::swap::complete_swap \
  --type-args \
    0x1::aptos_coin::AptosCoin \
    0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::USDC \
  --args \
    address:0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b \
    u64:0 \
  --profile testnet
```

**Result**: 
- Initiator receives Token Y
- Participant receives Token X
- Swap marked as `completed = true`

### 4. Cancel Swap (After Timeout)

```move
public entry fun cancel_swap<X, Y>(
    initiator: &signer,
    swap_id: u64,
)
```

**Purpose**: Refund initiator if participant never completes

**Requirements**: Must wait until timeout expires

**Example**:
```bash
aptos move run \
  --function-id 0x0f9713...::swap::cancel_swap \
  --type-args \
    0x1::aptos_coin::AptosCoin \
    0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::USDC \
  --args \
    u64:0 \
  --profile testnet
```

## View Functions (Query Swap Status)

### Get Swap Details

```move
#[view]
public fun get_swap_details<X, Y>(
    initiator: address,
    swap_id: u64,
): (address, address, u64, u64, u64, bool, bool)
```

**Returns**: `(initiator, participant, amount_x, amount_y, timeout, completed, cancelled)`

**Example**:
```bash
aptos move view \
  --function-id 0x0f9713...::swap::get_swap_details \
  --type-args \
    0x1::aptos_coin::AptosCoin \
    0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::USDC \
  --args \
    address:0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b \
    u64:0
```

### Check If Expired

```move
#[view]
public fun is_swap_expired<X, Y>(
    initiator: address,
    swap_id: u64,
): bool
```

### Get Next Swap ID

```move
#[view]
public fun get_next_swap_id<X, Y>(user: address): u64
```

## Complete Workflow Example

### Scenario: Alice wants to swap 1 APT for 10 USDC with Bob

**Step 1: Alice initiates swap**
```bash
# Alice locks 1 APT (100000000 octas)
aptos move run \
  --function-id 0x0f9713...::swap::initiate_swap \
  --type-args 0x1::aptos_coin::AptosCoin 0x5e156...::coin::USDC \
  --args \
    address:BOB_ADDRESS \
    u64:100000000 \
    u64:10000000 \
    u64:3600 \
  --profile alice
```

**Step 2: Bob checks swap details**
```bash
aptos move view \
  --function-id 0x0f9713...::swap::get_swap_details \
  --type-args 0x1::aptos_coin::AptosCoin 0x5e156...::coin::USDC \
  --args address:ALICE_ADDRESS u64:0
```

**Step 3: Bob completes swap**
```bash
# Bob deposits 10 USDC (10000000 micro-USDC)
aptos move run \
  --function-id 0x0f9713...::swap::complete_swap \
  --type-args 0x1::aptos_coin::AptosCoin 0x5e156...::coin::USDC \
  --args \
    address:ALICE_ADDRESS \
    u64:0 \
  --profile bob
```

**Result**:
- ✅ Alice receives 10 USDC
- ✅ Bob receives 1 APT
- ✅ Swap completed instantly

## Kotlin Integration Example

```kotlin
// In your ViewModel/Repository
suspend fun initiateSwap(
    participant: String,
    amountX: Long,
    amountYExpected: Long,
    timeoutSeconds: Long = 3600
) {
    val payload = buildTransactionPayload {
        function = "$CONTRACT_ADDRESS::swap::initiate_swap"
        typeArguments = listOf("0x1::aptos_coin::AptosCoin", USDC_TYPE)
        functionArguments {
            +AccountAddress(participant)
            +U64(amountX.toULong())
            +U64(amountYExpected.toULong())
            +U64(timeoutSeconds.toULong())
        }
    }
    
    val txn = aptos.transaction.build.simple(
        sender = account.accountAddress,
        data = payload
    )
    
    val pendingTxn = aptos.transaction.signAndSubmit(account, txn)
    aptos.transaction.waitForTransaction(pendingTxn.hash)
}

suspend fun completeSwap(initiatorAddress: String, swapId: Long) {
    val payload = buildTransactionPayload {
        function = "$CONTRACT_ADDRESS::swap::complete_swap"
        typeArguments = listOf("0x1::aptos_coin::AptosCoin", USDC_TYPE)
        functionArguments {
            +AccountAddress(initiatorAddress)
            +U64(swapId.toULong())
        }
    }
    
    // Submit transaction...
}

suspend fun getSwapDetails(initiatorAddress: String, swapId: Long): SwapInfo {
    val result = aptos.view(
        payload = buildViewRequestPayload {
            function = "$CONTRACT_ADDRESS::swap::get_swap_details"
            typeArguments = listOf("0x1::aptos_coin::AptosCoin", USDC_TYPE)
            functionArguments {
                +AccountAddress(initiatorAddress)
                +U64(swapId.toULong())
            }
        }
    )
    
    return parseSwapInfo(result)
}
```

## Security Features

1. **Atomic Execution**: Contract ensures both parties receive tokens or neither does
2. **Timeout Protection**: Initiator can recover funds if participant doesn't complete
3. **Type Safety**: Move's type system prevents token mismatches
4. **No Reentrancy**: Move prevents reentrancy attacks by design
5. **Address Validation**: Only designated participant can complete swap

## Common Token Types on Aptos

```
APT:  0x1::aptos_coin::AptosCoin
USDC: 0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::USDC
USDT: 0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT
```

## Deployment

Already deployed at:
```
0x0f9713e3c42951dbc4f05cc2e7ea211c1851b00a9d077e7e71f5d2a73041d606
```

To redeploy or upgrade:
```bash
cd f:/W3/aptpays/move
aptos move publish --profile testnet
```

## Troubleshooting

### Error: `ESWAP_NOT_FOUND`
- Swap ID doesn't exist or wrong initiator address

### Error: `ENOT_PARTICIPANT`
- Only the designated participant can complete the swap

### Error: `ESWAP_EXPIRED`
- Timeout expired, participant can no longer complete (initiator must cancel)

### Error: `ESWAP_NOT_EXPIRED`
- Cannot cancel until timeout expires

### Error: `ESWAP_ALREADY_COMPLETED`
- Swap already finished or cancelled

## Next Steps

1. **Deploy**: Contract already compiled and ready
2. **Test**: Try swap on testnet with test tokens
3. **Integrate**: Add to your Kotlin mobile app
4. **UI**: Build swap interface in Cresca wallet

For questions or issues, check the contract code at:
`f:/W3/aptpays/move/sources/CrescaSwap.move`
