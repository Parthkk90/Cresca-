# Direct CLI Testing - Bucket Protocol Functions

## No Node.js Required - Use Aptos CLI or REST API

You have **3 options** to test your contract functions directly without TypeScript:

---

## Option 1: Aptos CLI Commands (Recommended)

### Prerequisites
1. Install Aptos CLI: https://aptos.dev/tools/aptos-cli/install-cli/
2. Initialize profile: `aptos init --profile testnet`

### Test Each Function

#### 1. Initialize Protocol
```bash
aptos move run \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::init \
  --args u64:10 \
  --profile testnet \
  --assume-yes
```

#### 2. Deposit Collateral (2 APT)
```bash
aptos move run \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::deposit_collateral \
  --args u64:200000000 \
  --profile testnet \
  --assume-yes
```

#### 3. Update Oracle Prices
```bash
aptos move run \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::update_oracle \
  --args u64:5000000 u64:350000 u64:10000 \
  --profile testnet \
  --assume-yes
```

#### 4. Open Long Position
```bash
aptos move run \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::open_long \
  --args u64:0 \
  --profile testnet \
  --assume-yes
```

#### 5. Open Short Position
```bash
aptos move run \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::open_short \
  --args u64:0 \
  --profile testnet \
  --assume-yes
```

#### 6. Close Position
```bash
aptos move run \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::close_position \
  --args u64:0 \
  --profile testnet \
  --assume-yes
```

#### 7. Rebalance Bucket
```bash
aptos move run \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::rebalance_bucket \
  --args u64:0 "u64:[60,25,15]" \
  --profile testnet \
  --assume-yes
```

### View Functions (Read-Only, No Gas)

#### Get Collateral Balance
```bash
aptos move view \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::get_collateral_balance \
  --args address:0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b \
  --profile testnet
```

#### Get Bucket Count
```bash
aptos move view \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::get_bucket_count \
  --args address:0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b \
  --profile testnet
```

#### Get Position Count
```bash
aptos move view \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::get_position_count \
  --args address:0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b \
  --profile testnet
```

#### Get Position Details
```bash
aptos move view \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::get_position_details \
  --args address:0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b u64:0 \
  --profile testnet
```

#### Get Oracle Prices
```bash
aptos move view \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::get_oracle_prices \
  --args address:0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b \
  --profile testnet
```

---

## Option 2: PowerShell with REST API (No Installation)

### View Functions (Read-Only)

```powershell
# Get Collateral Balance
$CONTRACT = "0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b"
$ACCOUNT = "0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b"

$body = @{
    function = "$CONTRACT::bucket_protocol::get_collateral_balance"
    type_arguments = @()
    arguments = @($ACCOUNT)
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://fullnode.testnet.aptoslabs.com/v1/view" -Method POST -Body $body -ContentType "application/json"
```

```powershell
# Get Bucket Count
$body = @{
    function = "$CONTRACT::bucket_protocol::get_bucket_count"
    type_arguments = @()
    arguments = @($ACCOUNT)
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://fullnode.testnet.aptoslabs.com/v1/view" -Method POST -Body $body -ContentType "application/json"
```

```powershell
# Get Position Count
$body = @{
    function = "$CONTRACT::bucket_protocol::get_position_count"
    type_arguments = @()
    arguments = @($ACCOUNT)
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://fullnode.testnet.aptoslabs.com/v1/view" -Method POST -Body $body -ContentType "application/json"
```

```powershell
# Get Oracle Prices
$body = @{
    function = "$CONTRACT::bucket_protocol::get_oracle_prices"
    type_arguments = @()
    arguments = @($ACCOUNT)
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://fullnode.testnet.aptoslabs.com/v1/view" -Method POST -Body $body -ContentType "application/json"
```

---

## Option 3: Aptos Explorer (Web UI - Easiest!)

### No Command Line Required

1. **Go to Aptos Explorer:**
   ```
   https://explorer.aptoslabs.com/account/0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b/modules/code/bucket_protocol?network=testnet
   ```

2. **Click on "Run" tab**

3. **Select Function to Test:**
   - Choose from dropdown: `init`, `deposit_collateral`, `open_long`, etc.

4. **Enter Parameters:**
   - For `init`: Enter leverage (e.g., `10`)
   - For `deposit_collateral`: Enter amount (e.g., `200000000`)
   - For `open_long`: Enter bucket_id (e.g., `0`)

5. **Connect Wallet:**
   - Click "Connect Wallet"
   - Choose Petra/Martian/Pontem wallet
   - Approve transaction

6. **View Results:**
   - Transaction hash shown
   - Check transaction details
   - View events emitted

### View Functions on Explorer

1. **Go to "View" tab** (no wallet needed)
2. **Select view function:**
   - `get_collateral_balance`
   - `get_bucket_count`
   - `get_position_count`
   - `get_oracle_prices`
3. **Enter your account address**
4. **Click "Run" - FREE (no gas)**

---

## Quick Test Sequence

### Complete Flow (Copy-Paste Commands)

```bash
# 1. Initialize (10x leverage)
aptos move run --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::init --args u64:10 --profile testnet --assume-yes

# 2. Deposit 2 APT
aptos move run --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::deposit_collateral --args u64:200000000 --profile testnet --assume-yes

# 3. Check balance (should show 200000000)
aptos move view --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::get_collateral_balance --args address:0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b --profile testnet

# 4. Update oracle
aptos move run --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::update_oracle --args u64:5000000 u64:350000 u64:10000 --profile testnet --assume-yes

# 5. Open long position
aptos move run --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::open_long --args u64:0 --profile testnet --assume-yes

# 6. Check positions (should show 1)
aptos move view --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::get_position_count --args address:0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b --profile testnet

# 7. Simulate price increase
aptos move run --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::update_oracle --args u64:5500000 u64:385000 u64:11000 --profile testnet --assume-yes

# 8. Close position (realize profit)
aptos move run --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::close_position --args u64:0 --profile testnet --assume-yes

# 9. Check final balance (should be ~200000000 with profit)
aptos move view --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::get_collateral_balance --args address:0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b --profile testnet
```

---

## Troubleshooting

### "command not found: aptos"
**Solution:** Install Aptos CLI
```bash
# Windows (PowerShell)
iwr "https://aptos.dev/scripts/install_cli.py" -useb | iex

# Mac/Linux
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

### "Profile 'testnet' not found"
**Solution:** Initialize profile
```bash
aptos init --profile testnet
# Follow prompts, use testnet network, paste your private key
```

### "EALREADY_EXISTS" error
**Solution:** Protocol already initialized - this is expected, skip init step

### "EINSUFFICIENT_COLLATERAL" error
**Solution:** Deposit more collateral
```bash
aptos move run --function-id 0x33ec...::bucket_protocol::deposit_collateral --args u64:300000000 --profile testnet --assume-yes
```

---

## Expected Results

### After Init
- Transaction succeeds
- Gas used: ~1,000 units
- Event: `BucketCreatedEvent` emitted

### After Deposit
- Collateral balance increases
- View function returns: `["200000000"]`

### After Open Long
- Position count increases to 1
- Collateral balance decreases by 100000000 (1 APT margin)
- Event: `PositionOpenedEvent` emitted

### After Close (with 10% profit)
- Position becomes inactive
- Collateral increases by ~200000000 (2 APT - 100% profit on 1 APT)
- Event: `PositionClosedEvent` emitted with profit

---

## Pro Tips

1. **Use `--assume-yes` flag** to skip confirmation prompts
2. **View functions are FREE** - no gas cost, query anytime
3. **Check transaction on Explorer:**
   ```
   https://explorer.aptoslabs.com/txn/TRANSACTION_HASH?network=testnet
   ```
4. **Use shorter contract address in variables:**
   ```bash
   CONTRACT=0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b
   aptos move view --function-id $CONTRACT::bucket_protocol::get_collateral_balance ...
   ```

---

**Recommendation:** Use **Aptos Explorer Web UI** (Option 3) - it's the easiest and requires zero setup!

Just click, connect wallet, and test all functions with a nice UI: 
https://explorer.aptoslabs.com/account/0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b/modules?network=testnet
