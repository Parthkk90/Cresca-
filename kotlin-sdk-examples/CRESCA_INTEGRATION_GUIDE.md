# Cresca Bucket Protocol - Kotlin Integration Guide

## 📦 What You Got

Complete Kotlin SDK for leveraged trading on Aptos blockchain:

**Files Created:**
- `CrescaBucketService.kt` - Main service class with all contract functions
- `CrescaExamples.kt` - 7 practical examples showing how to use it

**Deployed Contract:**
- Address: `0x5f971a43ff0c97789f67dc7f75a9fba019695943e0ecebbb81adc851eaa0a36f`
- Network: Aptos Testnet
- Current Balance: 2.5 APT collateral deposited

---

## 🚀 Quick Start

### 1. Add Dependencies to `build.gradle`

```kotlin
dependencies {
    // Aptos SDK
    implementation("com.aptos:aptos-sdk:1.0.0")
    
    // Coroutines for async operations
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    
    // Serialization
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
}
```

### 2. Initialize the Service

```kotlin
import com.aptpays.services.CrescaBucketService

class TradingActivity : AppCompatActivity() {
    private val bucketService = CrescaBucketService()
    
    // Your code here...
}
```

### 3. Run Your First Transaction

```kotlin
lifecycleScope.launch {
    // Deposit 1 APT
    val result = bucketService.depositCollateral(
        privateKey = userPrivateKey,
        amountAPT = 1.0
    )
    
    if (result.success) {
        Toast.makeText(this, result.message, Toast.LENGTH_SHORT).show()
    }
}
```

---

## 🎯 Core Functions

### 💰 Deposit & Balance

```kotlin
// Deposit trading funds
suspend fun depositCollateral(privateKey: String, amountAPT: Double): TransactionResult

// Check balance
suspend fun getCollateralBalance(address: String): Double

// Example:
val balance = bucketService.getCollateralBalance("0x5f971a43...")
println("Balance: $balance APT")
```

### 📦 Create Buckets (Portfolios)

```kotlin
suspend fun createBucket(
    privateKey: String,
    assets: List<String>,    // Token addresses
    weights: List<Long>,     // Must sum to 100
    leverage: Int            // 1-20x
): TransactionResult

// Example: Create 5x leveraged APT bucket
val result = bucketService.createBucket(
    privateKey = userKey,
    assets = listOf("0x1"),  // APT
    weights = listOf(100),   // 100% APT
    leverage = 5
)
```

### 📊 Open Positions

```kotlin
suspend fun openPosition(
    privateKey: String,
    bucketId: Long,
    isLong: Boolean,    // true = LONG, false = SHORT
    marginAPT: Double
): TransactionResult

// Example: Bet APT goes UP (LONG)
val result = bucketService.openPosition(
    privateKey = userKey,
    bucketId = 0,
    isLong = true,      // LONG position
    marginAPT = 0.5     // Risk 0.5 APT
)

// Example: Bet APT goes DOWN (SHORT)
val result = bucketService.openPosition(
    privateKey = userKey,
    bucketId = 0,
    isLong = false,     // SHORT position
    marginAPT = 0.3
)
```

### 💵 Close Positions

```kotlin
suspend fun closePosition(privateKey: String, positionId: Long): TransactionResult

// Example:
val result = bucketService.closePosition(userKey, positionId = 0)
// Profit/Loss automatically added to collateral balance
```

### 📈 View Functions (No Gas Cost!)

```kotlin
// Get bucket count
suspend fun getBucketCount(address: String): Long

// Get position count
suspend fun getPositionCount(address: String): Long

// Get position details
suspend fun getPositionDetails(address: String, positionId: Long): PositionDetails?

// PositionDetails contains:
data class PositionDetails(
    val bucketId: Long,
    val isLong: Boolean,
    val marginOctas: Long,
    val entryPrice: Long,
    val active: Boolean
) {
    val marginAPT: Double         // Auto-converted from Octas
    val direction: String         // "LONG" or "SHORT"
}
```

---

## 💡 Real-World Examples

### Example 1: Trading Dashboard

```kotlin
class TradingDashboard : ViewModel() {
    private val service = CrescaBucketService()
    
    val balance = MutableLiveData<Double>()
    val positions = MutableLiveData<List<PositionDetails>>()
    
    fun loadDashboard(userAddress: String) = viewModelScope.launch {
        // Load balance
        balance.value = service.getCollateralBalance(userAddress)
        
        // Load all positions
        val positionCount = service.getPositionCount(userAddress)
        val positionList = mutableListOf<PositionDetails>()
        
        for (i in 0 until positionCount) {
            service.getPositionDetails(userAddress, i)?.let {
                if (it.active) {
                    positionList.add(it)
                }
            }
        }
        
        positions.value = positionList
    }
}
```

### Example 2: Quick Trade Button

```kotlin
button_long.setOnClickListener {
    lifecycleScope.launch {
        val result = bucketService.openPosition(
            privateKey = userPrivateKey,
            bucketId = 0,
            isLong = true,
            marginAPT = 0.5
        )
        
        if (result.success) {
            Toast.makeText(this, "LONG position opened!", Toast.LENGTH_SHORT).show()
            // Refresh dashboard
            loadDashboard()
        } else {
            Toast.makeText(this, "Error: ${result.error}", Toast.LENGTH_LONG).show()
        }
    }
}
```

### Example 3: Position List RecyclerView

```kotlin
class PositionAdapter : RecyclerView.Adapter<PositionViewHolder>() {
    private val positions = mutableListOf<PositionDetails>()
    
    fun updatePositions(newPositions: List<PositionDetails>) {
        positions.clear()
        positions.addAll(newPositions)
        notifyDataSetChanged()
    }
    
    override fun onBindViewHolder(holder: PositionViewHolder, position: Int) {
        val pos = positions[position]
        holder.bind(pos)
    }
}

class PositionViewHolder(view: View) : RecyclerView.ViewHolder(view) {
    fun bind(position: PositionDetails) {
        itemView.apply {
            text_direction.text = position.direction
            text_direction.setTextColor(
                if (position.isLong) Color.GREEN else Color.RED
            )
            text_margin.text = "Margin: ${"%.4f".format(position.marginAPT)} APT"
            text_entry.text = "Entry: $${position.entryPrice / 100.0}"
            
            button_close.setOnClickListener {
                // Close this position
                closePosition(position.positionId)
            }
        }
    }
}
```

### Example 4: Real-Time Price Updates

```kotlin
class PriceUpdateService : Service() {
    private val service = CrescaBucketService()
    
    // Update prices every 60 seconds
    private val updateJob = CoroutineScope(Dispatchers.IO).launch {
        while (isActive) {
            try {
                // Get latest prices from Pyth Oracle or API
                val aptPrice = fetchAPTPrice()
                
                // Update contract oracle
                service.updateOracle(
                    privateKey = adminPrivateKey,
                    prices = listOf((aptPrice * 100).toLong()) // Convert to cents
                )
                
                Log.d("PriceUpdate", "Updated APT price: $$aptPrice")
            } catch (e: Exception) {
                Log.e("PriceUpdate", "Failed: ${e.message}")
            }
            
            delay(60_000) // Wait 60 seconds
        }
    }
    
    private suspend fun fetchAPTPrice(): Double {
        // Implement Pyth Oracle or CoinGecko API call
        // See BLOCKCHAIN_TIME_GUIDE.md for API examples
        return 10.50 // Placeholder
    }
}
```

---

## 🎨 UI Integration

### Compose UI Example

```kotlin
@Composable
fun TradingScreen(viewModel: TradingViewModel) {
    val balance by viewModel.balance.observeAsState(0.0)
    val positions by viewModel.positions.observeAsState(emptyList())
    
    Column(modifier = Modifier.padding(16.dp)) {
        // Balance Card
        Card {
            Text("Collateral Balance")
            Text("${"%.4f".format(balance)} APT", fontSize = 24.sp)
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Quick Trade Buttons
        Row {
            Button(onClick = { viewModel.openLong() }) {
                Text("📈 LONG")
            }
            Spacer(modifier = Modifier.width(8.dp))
            Button(onClick = { viewModel.openShort() }) {
                Text("📉 SHORT")
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Positions List
        LazyColumn {
            items(positions) { position ->
                PositionCard(position) {
                    viewModel.closePosition(position.positionId)
                }
            }
        }
    }
}
```

---

## ⚠️ Important Notes

### 1. **Private Key Security**
```kotlin
// ❌ BAD: Hardcoded private key
val privateKey = "0x123abc..."

// ✅ GOOD: Use Android Keystore
val privateKey = KeystoreManager.getPrivateKey(context)
```

### 2. **Error Handling**
```kotlin
val result = bucketService.openPosition(...)

when {
    result.success -> {
        // Show success
        Toast.makeText(context, result.message, Toast.LENGTH_SHORT).show()
    }
    result.error?.contains("insufficient") == true -> {
        // Not enough balance
        showDepositDialog()
    }
    else -> {
        // Other error
        Log.e("Trading", result.error)
    }
}
```

### 3. **Gas Fees**
- All write operations (deposit, create_bucket, open_position, etc.) cost gas
- View functions (get_balance, get_position_count, etc.) are FREE
- Typical gas: 0.0001 - 0.001 APT per transaction

### 4. **Leverage Calculation**
```kotlin
// If you open 0.5 APT position with 5x leverage:
val margin = 0.5           // Your collateral
val leverage = 5           // Multiplier
val exposure = 0.5 * 5     // = 2.5 APT exposure

// If APT price moves 10%:
val priceChange = 0.10
val yourProfit = margin * leverage * priceChange
// = 0.5 * 5 * 0.10 = 0.25 APT profit (50% ROI!)

// But also 50% loss if price goes opposite direction
```

---

## 🔄 Integration Checklist

- [ ] Add Aptos SDK dependency to build.gradle
- [ ] Copy `CrescaBucketService.kt` to your services package
- [ ] Copy `CrescaExamples.kt` for reference
- [ ] Implement private key storage (Android Keystore)
- [ ] Create UI screens (Dashboard, Trading, Positions)
- [ ] Add coroutines/lifecycle scope handling
- [ ] Implement error handling and loading states
- [ ] Test on Aptos Testnet first
- [ ] Add price oracle integration (Pyth/CoinGecko)
- [ ] Implement real-time P&L calculations

---

## 📚 Next Steps

1. **Test on Testnet**: Get testnet APT from https://aptoslabs.com/testnet-faucet
2. **Run Examples**: Execute `CrescaExamples.kt` main function
3. **Build UI**: Use provided Compose/XML examples
4. **Add Pyth Oracle**: See `BLOCKCHAIN_TIME_GUIDE.md` for API integration
5. **Production Deploy**: Contract already on testnet, ready for mainnet

---

## 🆘 Troubleshooting

**"Insufficient balance"**
- Call `depositCollateral()` first to add funds

**"Bucket not found"**
- Create a bucket with `createBucket()` before opening positions

**"Position not active"**
- Position already closed or doesn't exist

**"Invalid leverage"**
- Leverage must be 1-20

**"Weights don't sum to 100"**
- When creating bucket, ensure weights add up to exactly 100

---

## 📞 Support

- Contract Address: `0x5f971a43ff0c97789f67dc7f75a9fba019695943e0ecebbb81adc851eaa0a36f`
- Explorer: https://explorer.aptoslabs.com/account/0x5f971a43...
- Testnet Faucet: https://aptoslabs.com/testnet-faucet

**Happy Trading! 🚀**
