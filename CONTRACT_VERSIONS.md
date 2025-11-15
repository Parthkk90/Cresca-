# Cresca Bucket Protocol - Contract Versions

## V1 (Multi-Agent Signature) ✅ CURRENTLY DEPLOYED

**Contract Address:** `0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b`

**Key Features:**
- Requires **two signers** for `close_position`: user + protocol
- Funds locked at `PROTOCOL_ADDRESS` account
- Uses `coin::withdraw` with `protocol_signer` to return funds
- Requires backend API server to co-sign transactions

**Function Signature:**
```move
public entry fun close_position(
    user: &signer,
    protocol_signer: &signer,
    position_id: u64
)
```

**How It Works:**
1. User opens position → funds transferred to PROTOCOL_ADDRESS account
2. User wants to close → builds multi-agent transaction
3. Calls API → API signs with protocol private key
4. User signs transaction
5. Submit with both signatures
6. Contract validates both signers, withdraws from PROTOCOL_ADDRESS, returns to user

**Pros:**
- Protocol has control/validation layer
- Can enforce business rules before signing
- More secure (requires approval)

**Cons:**
- Requires backend server
- Complex multi-agent transaction flow
- SDK serialization issues
- Extra API call latency

---

## V2 (Direct User Closing) 🆕 SOURCE CODE READY

**Contract Address:** *Not yet deployed*

**Key Features:**
- **Single signer** for `close_position`: only user needed
- Funds stored in Protocol resource treasury (`Coin<AptosCoin>`)
- Uses `coin::extract` from treasury resource (no signer needed)
- **No backend API required** - direct from mobile app

**Function Signature:**
```move
public entry fun close_position(
    user: &signer,
    position_id: u64
)
```

**Storage Changes:**
```move
struct Protocol has key {
    // ... existing fields ...
    treasury: Coin<AptosCoin>,  // NEW: Holds all locked funds
}
```

**How It Works:**
1. User opens position → funds merged into Protocol.treasury
2. User wants to close → builds simple transaction
3. Signs with their own key
4. Submit directly to blockchain
5. Contract validates ownership, extracts from treasury, returns to user

**Pros:**
- No backend server needed
- Simpler transaction flow
- Direct from mobile app
- Lower latency
- No API dependency

**Cons:**
- Less protocol control
- Cannot enforce custom business rules
- All validation must be in contract

---

## Migration Path

To deploy V2:

1. **Update Contract:**
   ```bash
   cd bucket/perps-smart-wallet-/cresca_move_project
   aptos move compile
   aptos move publish --profile testnet
   ```

2. **Update Mobile App:**
   ```kotlin
   // Old V1 way (with API)
   val response = api.closePosition(positionId, userAddress, rawTransaction)
   val protocolSig = response.protocolSignature
   // ... multi-agent submission
   
   // New V2 way (direct)
   val txn = aptos.buildTransaction(
       sender = userAddress,
       payload = EntryFunction(
           module = "$contractAddress::bucket_protocol",
           function = "close_position",
           args = listOf(positionId)
       )
   )
   val sig = wallet.sign(txn)
   aptos.submitTransaction(txn, sig)
   ```

3. **Remove API Dependency:**
   - API still useful for analytics/monitoring
   - But not required for core functionality

---

## Version Selection

**Use V1 if:**
- You need protocol-level control
- Compliance/regulatory requirements
- Want to validate before closing
- Building centralized exchange-like experience

**Use V2 if:**
- Want fully decentralized experience
- Mobile app is primary interface
- Don't need approval workflow
- Prioritize simplicity and speed

---

## Current Status

- **V1:** Deployed and working (except close_position has SDK issues in current API)
- **V2:** Source code ready, not yet deployed
- **Recommendation:** Deploy V2 for mobile app, simpler and more reliable

