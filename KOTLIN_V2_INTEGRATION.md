# Cresca V2 Kotlin Integration Guide

## 🎯 What Changed in V2

### Contract Address
```kotlin
// OLD V1
const val CONTRACT_ADDRESS = "0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b"

// NEW V2
const val CONTRACT_ADDRESS = "0xba20b2115d382c7d8bbe01cc59fe7e33ab43c1c8853cfa9ff573ac8d383c91db"
```

### Available Functions (All Same Except close_position)

✅ **NO CHANGES NEEDED:**
- `init(leverage: u64)` - Initialize protocol
- `open_long(bucket_id: u64)` - Open long position
- `open_short(bucket_id: u64)` - Open short position
- `update_oracle(btc_price, eth_price, sol_price)` - Update prices
- `deposit_collateral(amount: u64)` - Deposit collateral
- All view functions (`get_position_count`, `get_collateral_balance`, etc.)

🆕 **CHANGED:**
- `close_position(position_id: u64)` - NOW ONLY NEEDS USER SIGNATURE!

### Key Difference

**V1 (Old):**
```kotlin
// Required API call + multi-agent transaction
close_position(user: &signer, protocol: &signer, position_id: u64)
```

**V2 (New):**
```kotlin
// Direct call, no API needed!
close_position(user: &signer, position_id: u64)
```

---

## 📱 Complete Kotlin Integration for V2

### 1. Configuration

```kotlin
object CrescaConfig {
    const val CONTRACT_ADDRESS = "0xba20b2115d382c7d8bbe01cc59fe7e33ab43c1c8853cfa9ff573ac8d383c91db"
    const val MODULE_NAME = "bucket_protocol"
    const val NETWORK = "testnet"
    const val NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1"
}
```

### 2. Open Position (Unchanged)

```kotlin
suspend fun openLongPosition(
    aptosClient: AptosClient,
    userAccount: Account,
    bucketId: Long = 0
): String {
    val payload = EntryFunctionPayload(
        module = ModuleId(
            AccountAddress.fromHex(CrescaConfig.CONTRACT_ADDRESS),
            Identifier(CrescaConfig.MODULE_NAME)
        ),
        function = Identifier("open_long"),
        typeArgs = emptyList(),
        args = listOf(
            TransactionArgument.U64(bucketId.toULong())
        )
    )
    
    val rawTxn = aptosClient.generateTransaction(
        sender = userAccount.address(),
        payload = payload
    )
    
    val signedTxn = aptosClient.signTransaction(userAccount, rawTxn)
    val txnHash = aptosClient.submitTransaction(signedTxn)
    
    return txnHash
}

suspend fun openShortPosition(
    aptosClient: AptosClient,
    userAccount: Account,
    bucketId: Long = 0
): String {
    val payload = EntryFunctionPayload(
        module = ModuleId(
            AccountAddress.fromHex(CrescaConfig.CONTRACT_ADDRESS),
            Identifier(CrescaConfig.MODULE_NAME)
        ),
        function = Identifier("open_short"),
        typeArgs = emptyList(),
        args = listOf(
            TransactionArgument.U64(bucketId.toULong())
        )
    )
    
    val rawTxn = aptosClient.generateTransaction(
        sender = userAccount.address(),
        payload = payload
    )
    
    val signedTxn = aptosClient.signTransaction(userAccount, rawTxn)
    val txnHash = aptosClient.submitTransaction(signedTxn)
    
    return txnHash
}
```

### 3. Close Position (NEW - Direct, No API!)

```kotlin
/**
 * V2: Close position directly without API
 * This is the MAIN CHANGE - no more multi-agent transactions!
 */
suspend fun closePosition(
    aptosClient: AptosClient,
    userAccount: Account,
    positionId: Long
): String {
    val payload = EntryFunctionPayload(
        module = ModuleId(
            AccountAddress.fromHex(CrescaConfig.CONTRACT_ADDRESS),
            Identifier(CrescaConfig.MODULE_NAME)
        ),
        function = Identifier("close_position"),
        typeArgs = emptyList(),
        args = listOf(
            TransactionArgument.U64(positionId.toULong())
        )
    )
    
    // Simple transaction - only user signs!
    val rawTxn = aptosClient.generateTransaction(
        sender = userAccount.address(),
        payload = payload
    )
    
    val signedTxn = aptosClient.signTransaction(userAccount, rawTxn)
    val txnHash = aptosClient.submitTransaction(signedTxn)
    
    return txnHash
}
```

### 4. View Functions (Unchanged)

```kotlin
suspend fun getPositionCount(
    aptosClient: AptosClient,
    userAddress: String = CrescaConfig.CONTRACT_ADDRESS
): Long {
    val result = aptosClient.view(
        request = ViewRequest(
            function = "${CrescaConfig.CONTRACT_ADDRESS}::${CrescaConfig.MODULE_NAME}::get_position_count",
            typeArguments = emptyList(),
            arguments = listOf(userAddress)
        )
    )
    return result[0].toString().toLong()
}

suspend fun getPositionDetails(
    aptosClient: AptosClient,
    positionId: Long
): PositionDetails {
    val result = aptosClient.view(
        request = ViewRequest(
            function = "${CrescaConfig.CONTRACT_ADDRESS}::${CrescaConfig.MODULE_NAME}::get_position_details",
            typeArguments = emptyList(),
            arguments = listOf(
                CrescaConfig.CONTRACT_ADDRESS,
                positionId.toString()
            )
        )
    )
    
    return PositionDetails(
        bucketId = result[0].toString().toLong(),
        isLong = result[1].toString().toBoolean(),
        margin = result[2].toString().toLong(),
        entryPrice = result[3].toString().toLong(),
        owner = result[4].toString(),
        active = result[5].toString().toBoolean()
    )
}

data class PositionDetails(
    val bucketId: Long,
    val isLong: Boolean,
    val margin: Long,
    val entryPrice: Long,
    val owner: String,
    val active: Boolean
)
```

---

## 🎨 Complete ViewModel Example

```kotlin
class CrescaV2ViewModel(
    private val aptosClient: AptosClient,
    private val userAccount: Account
) : ViewModel() {
    
    private val _positions = MutableStateFlow<List<PositionDetails>>(emptyList())
    val positions: StateFlow<List<PositionDetails>> = _positions.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    fun loadPositions() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val count = getPositionCount(aptosClient)
                val positionsList = mutableListOf<PositionDetails>()
                
                for (i in 0 until count) {
                    val details = getPositionDetails(aptosClient, i)
                    if (details.owner == userAccount.address().toString() && details.active) {
                        positionsList.add(details)
                    }
                }
                
                _positions.value = positionsList
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun openLongPosition() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val txHash = openLongPosition(aptosClient, userAccount)
                Log.d("Cresca", "Position opened: $txHash")
                delay(2000) // Wait for confirmation
                loadPositions()
            } catch (e: Exception) {
                _error.value = "Failed to open position: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun closePosition(positionId: Long) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                // V2: Direct call, no API needed!
                val txHash = closePosition(aptosClient, userAccount, positionId)
                Log.d("Cresca", "Position closed: $txHash")
                delay(2000) // Wait for confirmation
                loadPositions()
            } catch (e: Exception) {
                _error.value = "Failed to close position: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }
}
```

---

## 🖼️ Compose UI Example

```kotlin
@Composable
fun CrescaV2Screen(viewModel: CrescaV2ViewModel) {
    val positions by viewModel.positions.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadPositions()
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Cresca V2 - Perpetual Futures",
            style = MaterialTheme.typography.h5,
            fontWeight = FontWeight.Bold
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Open Position Buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = { viewModel.openLongPosition() },
                modifier = Modifier.weight(1f),
                enabled = !isLoading,
                colors = ButtonDefaults.buttonColors(
                    backgroundColor = Color(0xFF4CAF50)
                )
            ) {
                Text("Open LONG", color = Color.White)
            }
            
            Button(
                onClick = { viewModel.openShortPosition() },
                modifier = Modifier.weight(1f),
                enabled = !isLoading,
                colors = ButtonDefaults.buttonColors(
                    backgroundColor = Color(0xFFF44336)
                )
            ) {
                Text("Open SHORT", color = Color.White)
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Error Message
        error?.let {
            Card(
                backgroundColor = Color(0xFFFFEBEE),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = it,
                    color = Color(0xFFC62828),
                    modifier = Modifier.padding(12.dp)
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
        
        // Positions List
        Text(
            text = "Active Positions",
            style = MaterialTheme.typography.h6
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        if (isLoading) {
            CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
        } else if (positions.isEmpty()) {
            Text("No active positions", color = Color.Gray)
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(positions.size) { index ->
                    val position = positions[index]
                    PositionCard(
                        position = position,
                        positionId = index.toLong(),
                        onClose = { viewModel.closePosition(it) }
                    )
                }
            }
        }
    }
}

@Composable
fun PositionCard(
    position: PositionDetails,
    positionId: Long,
    onClose: (Long) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = 4.dp
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = if (position.isLong) "LONG" else "SHORT",
                    fontWeight = FontWeight.Bold,
                    color = if (position.isLong) Color(0xFF4CAF50) else Color(0xFFF44336)
                )
                Text("Position #$positionId")
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text("Margin: ${position.margin / 100000000.0} APT")
            Text("Entry Price: $${position.entryPrice}")
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Button(
                onClick = { onClose(positionId) },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    backgroundColor = Color(0xFFFF9800)
                )
            ) {
                Text("Close Position", color = Color.White)
            }
        }
    }
}
```

---

## 📝 Summary of Changes

### What You MUST Change:
1. ✅ **Contract address** - Update to V2 address
2. ✅ **close_position function** - Remove API call, call contract directly

### What Stays the Same:
- ✅ open_long / open_short
- ✅ All view functions
- ✅ Oracle updates
- ✅ Position data structure

### What You Can Remove:
- ❌ API client for close_position
- ❌ Multi-agent transaction code
- ❌ Protocol signature handling
- ❌ Backend dependency for closing positions

---

## 🚀 Benefits

1. **Simpler Code** - No API integration needed
2. **Faster** - Direct blockchain call, no intermediary
3. **More Reliable** - No API downtime
4. **Fully Decentralized** - User controls everything
5. **Lower Costs** - No server infrastructure needed

