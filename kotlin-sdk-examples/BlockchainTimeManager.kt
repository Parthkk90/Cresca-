package com.aptpays.blockchain

import com.aptos.AptosClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.concurrent.TimeUnit

/**
 * Manages blockchain time vs device time synchronization
 * 
 * CRITICAL: Always use blockchain time for scheduling payments!
 * Device time can be wrong (timezone, manual changes, NTP drift)
 */
class BlockchainTimeManager(
    private val aptosClient: AptosClient
) {
    
    // Cache blockchain time offset to reduce API calls
    private var cachedOffset: Long? = null
    private var lastSyncTime: Long = 0
    private val CACHE_VALIDITY_MS = 60_000L // 1 minute
    
    /**
     * Get current blockchain timestamp in seconds
     * This is what Move contracts use: timestamp::now_seconds()
     */
    suspend fun getBlockchainTime(): Long = withContext(Dispatchers.IO) {
        try {
            // Call the view function: 0x1::timestamp::now_seconds
            val response = aptosClient.view(
                payload = mapOf(
                    "function" to "0x1::timestamp::now_seconds",
                    "type_arguments" to emptyList<String>(),
                    "arguments" to emptyList<Any>()
                )
            )
            
            // Result is array with single value
            val timestampStr = response[0].toString()
            timestampStr.toLong()
            
        } catch (e: Exception) {
            // Fallback: use cached offset or device time (with warning)
            val deviceTime = System.currentTimeMillis() / 1000
            val offset = cachedOffset ?: 0L
            deviceTime + offset
        }
    }
    
    /**
     * Calculate time offset between device and blockchain
     * Useful for showing users "Your phone is X minutes ahead"
     */
    suspend fun syncTimeOffset(): TimeOffset = withContext(Dispatchers.IO) {
        val deviceTime = System.currentTimeMillis() / 1000
        val blockchainTime = getBlockchainTime()
        val offset = deviceTime - blockchainTime
        
        cachedOffset = offset
        lastSyncTime = System.currentTimeMillis()
        
        TimeOffset(
            deviceTimestamp = deviceTime,
            blockchainTimestamp = blockchainTime,
            offsetSeconds = offset,
            deviceAheadOfBlockchain = offset > 0
        )
    }
    
    /**
     * Schedule a payment X seconds from NOW (blockchain time)
     * 
     * @param delaySeconds How many seconds in the future (blockchain time)
     * @return Blockchain timestamp when payment should execute
     */
    suspend fun calculateExecutionTime(delaySeconds: Long): ScheduleTime {
        val blockchainNow = getBlockchainTime()
        val executeAt = blockchainNow + delaySeconds
        val deviceNow = System.currentTimeMillis() / 1000
        
        return ScheduleTime(
            executeAtBlockchainTime = executeAt,
            blockchainNow = blockchainNow,
            deviceNow = deviceNow,
            delaySeconds = delaySeconds,
            estimatedDeviceTime = deviceNow + delaySeconds,
            offset = deviceNow - blockchainNow
        )
    }
    
    /**
     * Convert user-friendly duration to blockchain execution time
     * Examples: "2 hours from now", "tomorrow at 3pm"
     */
    suspend fun scheduleAfter(
        hours: Int = 0,
        minutes: Int = 0,
        seconds: Int = 0
    ): Long {
        val totalSeconds = (hours * 3600L) + (minutes * 60L) + seconds
        val blockchainNow = getBlockchainTime()
        return blockchainNow + totalSeconds
    }
    
    /**
     * Check if cached time offset is still valid
     */
    fun isCacheValid(): Boolean {
        return (System.currentTimeMillis() - lastSyncTime) < CACHE_VALIDITY_MS
    }
    
    /**
     * Format blockchain timestamp for UI display
     */
    fun formatBlockchainTime(timestamp: Long): String {
        val instant = Instant.ofEpochSecond(timestamp)
        val formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm:ss")
            .withZone(ZoneId.systemDefault())
        return formatter.format(instant)
    }
    
    /**
     * Get human-readable time until execution
     */
    suspend fun getTimeUntilExecution(executeAt: Long): TimeUntil {
        val blockchainNow = getBlockchainTime()
        val secondsUntil = executeAt - blockchainNow
        
        return when {
            secondsUntil <= 0 -> TimeUntil(0, 0, 0, isReady = true)
            else -> {
                val hours = TimeUnit.SECONDS.toHours(secondsUntil)
                val minutes = TimeUnit.SECONDS.toMinutes(secondsUntil) % 60
                val seconds = secondsUntil % 60
                TimeUntil(hours, minutes, seconds, isReady = false)
            }
        }
    }
}

/**
 * Result of time offset synchronization
 */
data class TimeOffset(
    val deviceTimestamp: Long,
    val blockchainTimestamp: Long,
    val offsetSeconds: Long,
    val deviceAheadOfBlockchain: Boolean
) {
    val offsetMinutes: Long get() = offsetSeconds / 60
    val offsetHours: Long get() = offsetSeconds / 3600
    
    fun getWarningMessage(): String? {
        return when {
            offsetSeconds > 300 -> "⚠️ Your device time is ${offsetMinutes} minutes ahead of blockchain time"
            offsetSeconds < -300 -> "⚠️ Your device time is ${-offsetMinutes} minutes behind blockchain time"
            else -> null // Within 5 minutes is acceptable
        }
    }
}

/**
 * Detailed schedule time calculation
 */
data class ScheduleTime(
    val executeAtBlockchainTime: Long,
    val blockchainNow: Long,
    val deviceNow: Long,
    val delaySeconds: Long,
    val estimatedDeviceTime: Long,
    val offset: Long
) {
    fun getExecutionTimeDescription(): String {
        val hours = delaySeconds / 3600
        val minutes = (delaySeconds % 3600) / 60
        
        return when {
            hours > 0 && minutes > 0 -> "$hours hours and $minutes minutes from now"
            hours > 0 -> "$hours hours from now"
            minutes > 0 -> "$minutes minutes from now"
            else -> "$delaySeconds seconds from now"
        }
    }
    
    fun getOffsetWarning(): String? {
        return if (offset > 300) {
            "Note: Will execute ~${offset / 60} minutes later on your device due to time difference"
        } else null
    }
}

/**
 * Time remaining until execution
 */
data class TimeUntil(
    val hours: Long,
    val minutes: Long,
    val seconds: Long,
    val isReady: Boolean
) {
    override fun toString(): String {
        return when {
            isReady -> "Ready to execute"
            hours > 0 -> "${hours}h ${minutes}m ${seconds}s"
            minutes > 0 -> "${minutes}m ${seconds}s"
            else -> "${seconds}s"
        }
    }
}
