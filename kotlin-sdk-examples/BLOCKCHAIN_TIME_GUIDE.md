# Blockchain Time Management Guide

## 🚨 The Problem

**Device time ≠ Blockchain time**

```
Scenario: User wants to schedule payment "2 hours from now"

❌ WRONG APPROACH:
val deviceTime = System.currentTimeMillis() / 1000
val executeAt = deviceTime + 7200  // 2 hours

Result on Oct 29, 2025:
- User's phone:    14:30:00 (1761763800)
- Blockchain:      09:00:00 (1761743800) ← 5.5 hours behind!
- Execute time:    16:30:00 by phone clock
- Actual execute:  21:30:00 by phone clock ❌ 5.5 hours late!
```

## ✅ The Solution

**Always use blockchain time for scheduling**

```kotlin
// 1. Get blockchain time from Aptos
val blockchainTime = aptosClient.view("0x1::timestamp::now_seconds")

// 2. Calculate based on blockchain
val executeAt = blockchainTime + 7200

// 3. Payment executes exactly 2 hours from blockchain time ✅
```

---

## 📱 Implementation Steps

### Step 1: Initialize Time Manager

```kotlin
// In your Application or DI setup
val aptosClient = AptosClient(
    baseUrl = "https://api.testnet.aptoslabs.com/v1"
)

val timeManager = BlockchainTimeManager(aptosClient)
```

### Step 2: Sync Time on App Launch

```kotlin
// In MainActivity or splash screen
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        lifecycleScope.launch {
            // Sync blockchain time
            val offset = timeManager.syncTimeOffset()
            
            // Warn user if time difference > 5 minutes
            offset.getWarningMessage()?.let { warning ->
                showTimeWarningDialog(warning)
            }
        }
    }
}
```

### Step 3: Use in Schedule Screen

```kotlin
// When user clicks "Schedule for 2 hours"
suspend fun schedulePayment(recipient: String, amount: Double, hoursFromNow: Int) {
    
    // ✅ Get blockchain-accurate execution time
    val executeAt = timeManager.scheduleAfter(hours = hoursFromNow)
    
    // Create transaction
    val amountOctas = (amount * 100_000_000).toLong()
    
    val txHash = aptosClient.submitTransaction(
        function = "$CONTRACT::calendar_payments::create_one_time",
        arguments = listOf(recipient, amountOctas, executeAt)
    )
    
    // Show confirmation
    println("Scheduled! Will execute at blockchain time: $executeAt")
}
```

### Step 4: Display Countdown

```kotlin
// Show accurate countdown to user
suspend fun showCountdown(executeAt: Long) {
    while (true) {
        val timeUntil = timeManager.getTimeUntilExecution(executeAt)
        
        updateUI("Time remaining: $timeUntil")
        
        if (timeUntil.isReady) {
            updateUI("Payment is ready to execute!")
            break
        }
        
        delay(1000) // Update every second
    }
}
```

---

## 🎯 Real-World Scenarios

### Scenario 1: Daily Rent Payment (9 AM every day)

```kotlin
suspend fun scheduleMonthlyRent() {
    // ❌ WRONG: Uses device timezone
    val tomorrow9AM = LocalDateTime.now()
        .plusDays(1)
        .withHour(9)
        .toEpochSecond()
    
    // ✅ CORRECT: Calculate from blockchain time
    val blockchainNow = timeManager.getBlockchainTime()
    val currentHour = (blockchainNow % 86400) / 3600
    val hoursUntil9AM = (9 - currentHour + 24) % 24
    val firstExecution = blockchainNow + (hoursUntil9AM * 3600)
    
    // Create recurring payment
    createRecurringPayment(
        amount = 1000_00000000, // 1000 APT
        firstExecution = firstExecution,
        intervalSeconds = 86400, // 24 hours
        occurrences = 30 // 30 days
    )
}
```

### Scenario 2: Send Money in 5 Minutes

```kotlin
suspend fun quickSchedule(recipient: String, amount: Double) {
    // ✅ Simple and correct
    val executeAt = timeManager.scheduleAfter(minutes = 5)
    
    createOneTimePayment(recipient, amount, executeAt)
}
```

### Scenario 3: Schedule at Specific Blockchain Time

```kotlin
suspend fun scheduleAtTime(targetTimestamp: Long) {
    val blockchainNow = timeManager.getBlockchainTime()
    
    if (targetTimestamp <= blockchainNow) {
        throw IllegalArgumentException("Target time is in the past!")
    }
    
    createOneTimePayment(recipient, amount, targetTimestamp)
}
```

---

## ⚠️ Common Pitfalls

### Pitfall 1: Caching Time Too Long

```kotlin
// ❌ BAD: Time drifts over hours
val blockchainTime = getBlockchainTime() // Cached for 24 hours
Thread.sleep(86400000) // 24 hours later
val executeAt = blockchainTime + 3600 // WRONG! Old time

// ✅ GOOD: Refresh before calculations
fun schedulePayment() {
    val freshTime = getBlockchainTime() // Fetch fresh
    val executeAt = freshTime + 3600
}
```

### Pitfall 2: Mixing Timezones

```kotlin
// ❌ BAD: User in Tokyo, blockchain in UTC
val userTime = LocalDateTime.now() // Tokyo time
val executeAt = userTime.toEpochSecond() // Wrong timezone!

// ✅ GOOD: Always use blockchain time (no timezone issues)
val executeAt = blockchainTime + delaySeconds
```

### Pitfall 3: Not Handling Network Errors

```kotlin
// ❌ BAD: Crashes if network fails
val blockchainTime = getBlockchainTime() // Throws exception

// ✅ GOOD: Fallback to cached or retry
try {
    val blockchainTime = getBlockchainTime()
} catch (e: Exception) {
    val cachedOffset = getCachedOffset() // From last sync
    val deviceTime = System.currentTimeMillis() / 1000
    val estimatedBlockchainTime = deviceTime + cachedOffset
}
```

---

## 🧪 Testing

### Test with Multiple Time Offsets

```kotlin
@Test
fun `test scheduling works with device ahead of blockchain`() = runBlocking {
    // Mock: Device is 5 hours ahead
    val mockBlockchainTime = 1761743800L
    val mockDeviceTime = 1761763800L // +5 hours
    
    val executeAt = mockBlockchainTime + 7200 // 2 hours from blockchain
    
    // Should execute at blockchain time: 1761750000
    // NOT at device time: 1761770000
    
    assert(executeAt == 1761750000L)
}

@Test
fun `test countdown shows correct time`() = runBlocking {
    val executeAt = 1761750000L
    val blockchainNow = 1761743800L // 6200 seconds until execution
    
    val timeUntil = calculateTimeUntil(executeAt, blockchainNow)
    
    assert(timeUntil.hours == 1L) // 1 hour
    assert(timeUntil.minutes == 43L) // 43 minutes
    assert(timeUntil.seconds == 20L) // 20 seconds
}
```

---

## 📊 Performance Optimization

### Cache Strategy

```kotlin
class BlockchainTimeManager {
    private var cachedTime: Long? = null
    private var lastFetchTime: Long = 0
    
    suspend fun getBlockchainTime(): Long {
        val now = System.currentTimeMillis()
        
        // Cache valid for 1 minute
        if (cachedTime != null && (now - lastFetchTime) < 60_000) {
            // Add elapsed time to cached value
            val elapsedSeconds = (now - lastFetchTime) / 1000
            return cachedTime!! + elapsedSeconds
        }
        
        // Fetch fresh time
        val freshTime = fetchFromBlockchain()
        cachedTime = freshTime
        lastFetchTime = now
        return freshTime
    }
}
```

### Batch Operations

```kotlin
// ✅ GOOD: Fetch time once for multiple schedules
suspend fun createMultipleSchedules(schedules: List<ScheduleRequest>) {
    val blockchainTime = timeManager.getBlockchainTime()
    
    schedules.forEach { schedule ->
        val executeAt = blockchainTime + schedule.delaySeconds
        createPayment(schedule.recipient, schedule.amount, executeAt)
    }
}
```

---

## 🎨 UI/UX Best Practices

### Show Time Sync Status

```kotlin
@Composable
fun TimeSyncIndicator(offset: TimeOffset) {
    when {
        offset.offsetSeconds > 300 -> {
            // Device ahead > 5 min
            Warning("Your clock is ${offset.offsetMinutes} min fast")
        }
        offset.offsetSeconds < -300 -> {
            // Device behind > 5 min
            Warning("Your clock is ${-offset.offsetMinutes} min slow")
        }
        else -> {
            Success("Time synced ✓")
        }
    }
}
```

### Display Both Times

```kotlin
@Composable
fun ScheduleConfirmation(scheduleTime: ScheduleTime) {
    Column {
        Text("Payment will execute:")
        Text("${scheduleTime.getExecutionTimeDescription()}")
        
        // Show offset if significant
        scheduleTime.getOffsetWarning()?.let { warning ->
            Text(warning, color = Color.Orange)
        }
        
        // Show blockchain time for advanced users
        if (showAdvanced) {
            Text("Blockchain time: ${scheduleTime.executeAtBlockchainTime}")
        }
    }
}
```

---

## 📖 Summary

| Action | ❌ Wrong | ✅ Correct |
|--------|---------|-----------|
| Get current time | `System.currentTimeMillis()` | `timeManager.getBlockchainTime()` |
| Schedule +2 hours | `deviceTime + 7200` | `blockchainTime + 7200` |
| Show countdown | Use device time | Use blockchain time |
| Cache time | Cache indefinitely | Cache max 1 minute |
| Handle errors | Crash | Fallback to cached offset |

**Golden Rule: Blockchain is the source of truth for time.**
