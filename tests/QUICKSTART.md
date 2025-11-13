# 🚀 Quick Start - Test Your Deployed Contract

## ⚡ Fastest Way to Test (5 minutes)

### Step 1: Update Contract Address
Open `test-bucket-protocol-complete.ts` and update line 16:
```typescript
CONTRACT_ADDRESS: "0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b",
```
Replace with your deployed contract address.

### Step 2: Update Private Key
Update line 19:
```typescript
PRIVATE_KEY: "0xYOUR_PRIVATE_KEY_HERE",
```
Replace with your account's private key.

### Step 3: Install Dependencies
```bash
cd tests
npm install @aptos-labs/ts-sdk
npm install --save-dev typescript ts-node @types/node
```

### Step 4: Run Tests
```bash
npx ts-node test-bucket-protocol-complete.ts
```

### Expected Output
```
╔═══════════════════════════════════════════════════════════════╗
║     BUCKET PROTOCOL - COMPLETE FUNCTION TEST SUITE            ║
╚═══════════════════════════════════════════════════════════════╝

📋 Test Configuration:
   Contract: 0x33ec...
   Account:  0x33ec...
   Network:  testnet
   Leverage: 10x

============================================================
  Test 1: Initialize Protocol
============================================================
✅ init() - Tx: 0xabc...

============================================================
  Test 2: Deposit Collateral
============================================================
✅ deposit_collateral() - Tx: 0xdef...

... (all 10 tests) ...

============================================================
  Test Summary
============================================================

📊 Results:
   Total Tests:  10
   ✅ Passed:    10
   ❌ Failed:    0
   Success Rate: 100.0%

🎉 All tests passed! Your contract is working correctly.
```

---

## 🎯 What Gets Tested

### All Entry Functions (State-Changing)
1. ✅ Initialize protocol with 10x leverage
2. ✅ Deposit 2 APT collateral
3. ✅ Update oracle prices (BTC/ETH/SOL)
4. ✅ Open long position (bet price up)
5. ✅ Open short position (bet price down)
6. ✅ Simulate 10% price increase
7. ✅ Close position with profit
8. ✅ Rebalance bucket weights
9. ✅ Test liquidation logic

### All View Functions (Read-Only)
1. ✅ Get collateral balance
2. ✅ Get bucket count
3. ✅ Get position count
4. ✅ Get position details
5. ✅ Get oracle prices
6. ✅ Get last oracle update timestamp

---

## 🐛 Common Issues

### "Module not found: @aptos-labs/ts-sdk"
```bash
npm install @aptos-labs/ts-sdk
```

### "Cannot find name 'InputViewFunctionData'"
```bash
npm install --save-dev @types/node
```

### "EALREADY_EXISTS" error
This is expected if you run tests twice. The test automatically handles this and passes.

### "EINSUFFICIENT_COLLATERAL" error
Increase the `COLLATERAL_AMOUNT` in the config:
```typescript
COLLATERAL_AMOUNT: 300_000_000, // 3 APT instead of 2
```

---

## 🔄 Alternative: PowerShell Script

If you prefer PowerShell over TypeScript:

### Step 1: Configure Aptos CLI
```powershell
aptos init --profile testnet
```

### Step 2: Update Script
Edit `test-bucket-complete.ps1`:
```powershell
$CONTRACT_ADDRESS = "0xYOUR_CONTRACT_ADDRESS"
$ACCOUNT_ADDRESS = "0xYOUR_ACCOUNT_ADDRESS"
$PROFILE = "testnet"
```

### Step 3: Run
```powershell
.\test-bucket-complete.ps1
```

---

## 📊 Verify Results on Explorer

After tests complete, check transactions on Aptos Explorer:

```
https://explorer.aptoslabs.com/account/YOUR_ADDRESS/transactions?network=testnet
```

You should see:
- ✅ `init` transaction
- ✅ `deposit_collateral` transaction
- ✅ `update_oracle` transactions (2x)
- ✅ `open_long` transaction
- ✅ `open_short` transaction
- ✅ `close_position` transaction
- ✅ `rebalance_bucket` transaction

---

## 🎓 Next Steps

1. **Review Test Output** - Check P&L calculations are correct
2. **Verify on Explorer** - Confirm all transactions succeeded
3. **Test Manually** - Try individual functions via CLI
4. **Integrate with Mobile** - Use Kotlin SDK to call functions
5. **Deploy to Mainnet** - When ready for production

---

## 💡 Pro Tips

### Test with Different Scenarios
Modify the config to test edge cases:

```typescript
// Test high leverage (risky)
LEVERAGE: 20,

// Test small collateral
COLLATERAL_AMOUNT: 100_000_000, // 1 APT

// Test extreme price changes
BTC_PRICE: 10_000_000, // $100,000 (doubled)
```

### Run Tests Multiple Times
The test suite handles re-runs gracefully:
- `init()` detects existing protocol
- Positions accumulate (position IDs increment)
- Collateral adds to existing balance

### Monitor Gas Usage
Check transaction details for gas costs:
```bash
aptos account list --account YOUR_ADDRESS --profile testnet
```

---

## 📞 Support

If tests fail:
1. Check `TEST_GUIDE.md` for detailed troubleshooting
2. Verify account has sufficient APT balance
3. Confirm contract address is correct
4. Review error messages in output

---

**Ready to test? Run the command above and see all functions working! 🚀**
