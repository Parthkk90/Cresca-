# Cresca Bucket Protocol - Deployment Credentials

## 📦 Contract Details

### **Contract Address**
```
0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b
```

### **Module Name**
```
bucket_protocol
```

### **Network**
```
Aptos Testnet
```

### **Deployment Transaction**
```
0x62379e103564c9aa2b476c73337416a9d07248f41bd23b2ad4d1f2d69e7befcb
```

### **Explorer Link**
```
https://explorer.aptoslabs.com/txn/0x62379e103564c9aa2b476c73337416a9d07248f41bd23b2ad4d1f2d69e7befcb?network=testnet
```

### **Gas Used**
```
4,141 units
```

### **Version**
```
6933848426
```

---

## 🔑 Account Credentials

### **Account Address**
```
0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b
```

### **Private Key**
```
0x40daf4e4316a895eec706d88006d6a3ba75f22b01f0b4390556d679101d6e309
```

### **Public Key**
```
0xaa47aa21a8b45db67e42aeda6ddb7635cbd4ca2cacb6e9f9edd8408bb92b51dd
```

---

## 🎯 Contract Features

### **Hardcoded Constants**
- **Margin per Position**: 0.05 APT (5,000,000 octas)
- **BTC Weight**: 50%
- **ETH Weight**: 30%
- **SOL Weight**: 20%
- **Leverage Range**: 1-20x

### **Token Addresses** (Mainnet - Update for Testnet)
```kotlin
BTC: 0xae478ff7d83ed072dbc5e264250e67ef58f57c99d89b447efd8a0a2e8b2be76e
ETH: 0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea
SOL: 0xdd89c0e695df0692205912fb69fc290418bed0dbe6e4573d744a6d5e6bab6c13
```

---

## 📋 Available Functions

### **Entry Functions** (Write, costs gas)

#### 1. `init(leverage: u64)`
- Initialize protocol with leverage (1-20)
- Auto-creates bucket with BTC/ETH/SOL (50/30/20)
- Must be called once before any other function

```bash
aptos move run \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::init \
  --args u64:10
```

#### 2. `deposit_collateral(amount: u64)`
- Deposit APT for trading
- Amount in octas (1 APT = 100,000,000 octas)

```bash
aptos move run \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::deposit_collateral \
  --args u64:500000000
```

#### 3. `open_long(bucket_id: u64)`
- Open LONG position (bet price goes UP)
- Uses 0.05 APT margin automatically

```bash
aptos move run \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::open_long \
  --args u64:0
```

#### 4. `open_short(bucket_id: u64)`
- Open SHORT position (bet price goes DOWN)
- Uses 0.05 APT margin automatically

```bash
aptos move run \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::open_short \
  --args u64:0
```

#### 5. `close_position(position_id: u64)`
- Close an open position
- Returns margin + P&L to collateral

```bash
aptos move run \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::close_position \
  --args u64:0
```

#### 6. `update_oracle(btc_price: u64, eth_price: u64, sol_price: u64)`
- Update oracle prices
- Prices in cents: $50,000 = 5000000

```bash
aptos move run \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::update_oracle \
  --args u64:5000000 u64:350000 u64:10000
```

---

### **View Functions** (Read, free, no gas)

#### 1. `get_collateral_balance(address)`
Returns: `u64` (collateral in octas)

#### 2. `get_bucket_count(address)`
Returns: `u64` (number of buckets)

#### 3. `get_position_count(address)`
Returns: `u64` (number of positions)

#### 4. `get_position_details(address, position_id)`
Returns: `(bucket_id, is_long, margin, entry_price, active)`

#### 5. `get_oracle_prices(address)`
Returns: `vector<u64>` [BTC, ETH, SOL] in cents

#### 6. `get_last_oracle_update(address)`
Returns: `u64` (timestamp)

#### 7. `get_default_margin()`
Returns: `u64` (5000000 = 0.05 APT)

#### 8. `get_bucket_details(address, bucket_id)`
Returns: `(assets, weights, leverage)`

---

## 🔧 Kotlin Integration

### **Constants**
```kotlin
const val CONTRACT_ADDRESS = "0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b"
const val MODULE_NAME = "bucket_protocol"
const val OCTAS_PER_APT = 100_000_000L
const val DEFAULT_MARGIN_OCTAS = 5_000_000L // 0.05 APT
```

### **Usage Example**
```kotlin
// 1. Initialize with 10x leverage
viewModel.init(leverage = 10)

// 2. Deposit 5 APT
viewModel.depositCollateral(amountAPT = 5.0)

// 3. Update prices ($50k BTC, $3.5k ETH, $100 SOL)
viewModel.updateOracle(
    btcPrice = 50000.0,
    ethPrice = 3500.0,
    solPrice = 100.0
)

// 4. Open LONG position (uses 0.05 APT automatically)
viewModel.openLong(bucketId = 0)

// 5. View dashboard
viewModel.viewDashboard().onSuccess { data ->
    println("Balance: ${data.collateralAPT} APT")
    println("Positions: ${data.positionCount}")
    println("BTC: $${data.btcPrice}")
}

// 6. Close position
viewModel.closePosition(positionId = 0)
```

---

## 🧪 Test Sequence

### **Complete Trading Flow**
```bash
# 1. Init (creates BTC/ETH/SOL bucket)
aptos move run \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::init \
  --args u64:10

# 2. Deposit 5 APT
aptos move run \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::deposit_collateral \
  --args u64:500000000

# 3. Set prices (BTC=$50k, ETH=$3.5k, SOL=$100)
aptos move run \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::update_oracle \
  --args u64:5000000 u64:350000 u64:10000

# 4. Open LONG
aptos move run \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::open_long \
  --args u64:0

# 5. Update prices (simulate 10% increase)
aptos move run \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::update_oracle \
  --args u64:5500000 u64:385000 u64:11000

# 6. Close position (collect profit)
aptos move run \
  --function-id 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b::bucket_protocol::close_position \
  --args u64:0
```

---

## 🔒 Security Notes

⚠️ **IMPORTANT**: Keep private key secure!

- Never commit private keys to git
- Use environment variables in production
- Rotate keys regularly
- This is testnet - not real money

---

## 📊 Events Emitted

1. **BucketCreatedEvent** - When bucket is created
2. **PositionOpenedEvent** - When position opens
3. **PositionClosedEvent** - When position closes
4. **OracleUpdateEvent** - When prices update
5. **BucketRebalancedEvent** - When weights change
6. **LiquidationEvent** - When position liquidates

---

## 🎯 Next Steps

1. ✅ Test `init()` - Initialize protocol
2. ✅ Test `deposit_collateral()` - Add funds
3. ✅ Test `update_oracle()` - Set prices
4. ✅ Test `open_long()` - Open position
5. ✅ Test `close_position()` - Close position
6. 🔄 Integrate real price feeds (Pyth Oracle)
7. 🔄 Build UI with ViewModel
8. 🔄 Add analytics dashboard

---

**Contract deployed and ready for testing!** 🚀
