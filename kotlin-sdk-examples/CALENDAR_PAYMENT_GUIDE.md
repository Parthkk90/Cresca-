# Calendar Payment - Kotlin Integration Guide

## 📦 Simplified Contract

**ONLY 3 FUNCTIONS** to implement in Kotlin - 33% simpler than before!

---

## 🎯 Quick Start

### **1. Add Dependencies**

```gradle
dependencies {
    // Aptos SDK
    implementation("xyz.mcxross.kaptos:kaptos:VERSION")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    
    // ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.6.2")
}
```

### **2. Initialize ViewModel**

```kotlin
val viewModel = CalendarPaymentViewModel(
    currentAccount = account
)
```

### **3. Create Payment (Universal Function!)**

```kotlin
// One-time payment
viewModel.createSchedule(
    recipient = "0xabc123...",
    amountAPT = 5.0,
    executeAt = System.currentTimeMillis() / 1000 + 3600, // 1 hour
    isRecurring = false,
    occurrences = 1
)

// Recurring payment
viewModel.createSchedule(
    recipient = "0xabc123...",
    amountAPT = 10.0,
    executeAt = System.currentTimeMillis() / 1000 + 86400, // Tomorrow
    isRecurring = true,
    intervalDays = 30,
    occurrences = 12
)
```

---

## 📋 Complete API Reference

### **Entry Functions (3)**

#### 1️⃣ `createSchedule()` - Universal Create

**Purpose:** Create any type of payment (one-time OR recurring)

**Parameters:**
```kotlin
suspend fun createSchedule(
    recipient: String,        // Receiver's address
    amountAPT: Double,       // APT per payment
    executeAt: Long,         // Unix timestamp (seconds)
    isRecurring: Boolean = false,
    intervalDays: Int = 30,  // Days between payments
    occurrences: Int = 1     // How many times
): Result<String>
```

**Examples:**
```kotlin
// One-time: Pay 5 APT in 1 hour
createSchedule(
    recipient = "0xabc...",
    amountAPT = 5.0,
    executeAt = getFutureTimestamp(hours = 1),
    isRecurring = false,
    occurrences = 1
)

// Recurring: Pay 10 APT monthly, 12 times
createSchedule(
    recipient = "0xabc...",
    amountAPT = 10.0,
    executeAt = getFutureTimestamp(days = 1),
    isRecurring = true,
    intervalDays = 30,
    occurrences = 12
)
```

---

#### 2️⃣ `cancelSchedule()` - Cancel Payment

**Purpose:** Cancel and refund remaining escrow

**Parameters:**
```kotlin
suspend fun cancelSchedule(
    scheduleId: Int
): Result<String>
```

**Example:**
```kotlin
cancelSchedule(scheduleId = 0)
```

---

#### 3️⃣ `executeSchedule()` - Execute Payment

**Purpose:** Execute due payment (anyone can call!)

**Parameters:**
```kotlin
suspend fun executeSchedule(
    payerAddress: String,
    scheduleId: Int
): Result<String>
```

**Example:**
```kotlin
executeSchedule(
    payerAddress = "0xpayer...",
    scheduleId = 0
)
```

---

### **View Functions (1)**

#### 4️⃣ `getSchedule()` - View Details

**Returns:** ScheduleDetails with all info

```kotlin
suspend fun getSchedule(
    payerAddress: String,
    scheduleId: Int
): Result<ScheduleDetails>
```

**Example:**
```kotlin
val schedule = viewModel.getSchedule("0xpayer...", 0).getOrNull()
println("Amount: ${schedule?.amountAPT} APT")
println("Due: ${schedule?.isDue}")
println("Active: ${schedule?.isActive}")
```

---

## 🎨 UI Integration Examples

### **Jetpack Compose Example**

```kotlin
@Composable
fun CreatePaymentScreen(viewModel: CalendarPaymentViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    
    var recipient by remember { mutableStateOf("") }
    var amount by remember { mutableStateOf("") }
    var isRecurring by remember { mutableStateOf(false) }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Recipient input
        OutlinedTextField(
            value = recipient,
            onValueChange = { recipient = it },
            label = { Text("Recipient Address") },
            modifier = Modifier.fillMaxWidth()
        )
        
        // Amount input
        OutlinedTextField(
            value = amount,
            onValueChange = { amount = it },
            label = { Text("Amount (APT)") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth()
        )
        
        // Payment type toggle
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Switch(
                checked = isRecurring,
                onCheckedChanged = { isRecurring = it }
            )
            Text(
                text = if (isRecurring) "Recurring" else "One-time",
                modifier = Modifier.padding(start = 8.dp)
            )
        }
        
        // Create button
        Button(
            onClick = {
                viewModelScope.launch {
                    val executeAt = viewModel.getFutureTimestamp(days = 1)
                    viewModel.createSchedule(
                        recipient = recipient,
                        amountAPT = amount.toDoubleOrNull() ?: 0.0,
                        executeAt = executeAt,
                        isRecurring = isRecurring,
                        intervalDays = 30,
                        occurrences = if (isRecurring) 12 else 1
                    )
                }
            },
            enabled = !uiState.isLoading,
            modifier = Modifier.fillMaxWidth()
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    color = Color.White
                )
            } else {
                Text("Create Payment")
            }
        }
        
        // Error message
        uiState.error?.let { error ->
            Text(
                text = error,
                color = MaterialTheme.colors.error,
                modifier = Modifier.padding(top = 8.dp)
            )
        }
        
        // Success message
        uiState.lastScheduleCreated?.let { info ->
            Card(
                modifier = Modifier.padding(top = 16.dp),
                backgroundColor = Color.Green.copy(alpha = 0.1f)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("✅ Payment Created!", style = MaterialTheme.typography.h6)
                    Text("Amount: ${info.amountAPT} APT")
                    Text("Total Escrow: ${info.totalEscrowAPT} APT")
                    Text("Type: ${if (info.isRecurring) "Recurring" else "One-time"}")
                }
            }
        }
    }
}
```

---

### **XML + ViewModel Example**

```kotlin
class PaymentActivity : AppCompatActivity() {
    private val viewModel: CalendarPaymentViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_payment)
        
        // Observe UI state
        lifecycleScope.launch {
            viewModel.uiState.collect { state ->
                updateUI(state)
            }
        }
        
        // Create payment button
        binding.btnCreatePayment.setOnClickListener {
            createPayment()
        }
    }
    
    private fun createPayment() {
        val recipient = binding.etRecipient.text.toString()
        val amount = binding.etAmount.text.toString().toDoubleOrNull() ?: 0.0
        val isRecurring = binding.switchRecurring.isChecked
        
        lifecycleScope.launch {
            viewModel.createSchedule(
                recipient = recipient,
                amountAPT = amount,
                executeAt = viewModel.getFutureTimestamp(days = 1),
                isRecurring = isRecurring,
                intervalDays = 30,
                occurrences = if (isRecurring) 12 else 1
            ).fold(
                onSuccess = { showSuccess(it) },
                onFailure = { showError(it.message) }
            )
        }
    }
    
    private fun updateUI(state: PaymentUiState) {
        binding.progressBar.isVisible = state.isLoading
        binding.btnCreatePayment.isEnabled = !state.isLoading
        
        state.error?.let { showError(it) }
        state.lastScheduleCreated?.let { showSuccess(it) }
    }
}
```

---

## 🔄 Helper Functions

### **Time Helpers**

```kotlin
// Get current timestamp
val now = viewModel.getCurrentTimestamp()

// Get future timestamp
val in1Hour = viewModel.getFutureTimestamp(hours = 1)
val tomorrow = viewModel.getFutureTimestamp(days = 1)
val nextWeek = viewModel.getFutureTimestamp(days = 7)

// Format timestamp
val dateString = viewModel.formatTimestamp(timestamp)

// Check if due
val isDue = viewModel.isPaymentDue(nextExecutionSecs)
```

### **Convenience Methods**

```kotlin
// Easy one-time payment
viewModel.createOneTimePayment(
    recipient = "0xabc...",
    amountAPT = 5.0,
    executeAt = getFutureTimestamp(hours = 24)
)

// Easy recurring payment
viewModel.createRecurringPayment(
    recipient = "0xabc...",
    amountAPT = 10.0,
    startAt = getFutureTimestamp(days = 1),
    intervalDays = 30,
    occurrences = 12
)
```

---

## 📊 Data Classes

### **ScheduleDetails**

```kotlin
data class ScheduleDetails(
    val scheduleId: Int,
    val recipient: String,
    val amountOctas: Long,
    val nextExecutionSecs: Long,
    val intervalSecs: Long,
    val remainingOccurrences: Int,
    val isActive: Boolean
) {
    // Computed properties
    val amountAPT: Double              // Amount in APT
    val intervalDays: Int              // Interval in days
    val isOneTime: Boolean             // Is one-time payment?
    val isRecurring: Boolean           // Is recurring payment?
    val nextExecutionDate: String      // Formatted date
    val isDue: Boolean                 // Ready to execute?
}
```

---

## 🎯 Real-World Use Cases

### **1. Monthly Salary**
```kotlin
viewModel.createRecurringPayment(
    recipient = "0xEMPLOYEE",
    amountAPT = 50.0,
    startAt = getFutureTimestamp(days = 1),
    intervalDays = 30,
    occurrences = 12  // 1 year
)
// Escrows: 50 × 12 = 600 APT
```

### **2. Rent Payment**
```kotlin
viewModel.createRecurringPayment(
    recipient = "0xLANDLORD",
    amountAPT = 20.0,
    startAt = getFutureTimestamp(days = 30),
    intervalDays = 30,
    occurrences = 6  // 6 months
)
// Escrows: 20 × 6 = 120 APT
```

### **3. Weekly Subscription**
```kotlin
viewModel.createRecurringPayment(
    recipient = "0xSERVICE",
    amountAPT = 0.5,
    startAt = getFutureTimestamp(days = 7),
    intervalDays = 7,
    occurrences = 4  // 4 weeks
)
// Escrows: 0.5 × 4 = 2 APT
```

### **4. Future Gift**
```kotlin
viewModel.createOneTimePayment(
    recipient = "0xFRIEND",
    amountAPT = 10.0,
    executeAt = getFutureTimestamp(days = 365)
)
// Escrows: 10 APT
```

---

## ⚠️ Important Notes

1. **Timestamps in Seconds** (not milliseconds!)
   ```kotlin
   val timestamp = System.currentTimeMillis() / 1000
   ```

2. **Escrow Upfront**
   - One-time: Escrows `amount`
   - Recurring: Escrows `amount × occurrences`

3. **Anyone Can Execute**
   - Use WorkManager or AlarmManager to trigger
   - Or let anyone execute (they don't get the funds)

4. **Schedule IDs**
   - Auto-generated starting from 1
   - Track via events or return value

---

## 🚀 Deployment

After deploying the contract, update:

```kotlin
const val CONTRACT_ADDRESS = "YOUR_DEPLOYED_ADDRESS"
const val MODULE_NAME = "calendar_payments"
```

---

**That's it! Only 3 functions to implement - super simple for Android devs!** 🎉
