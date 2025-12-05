package com.aptpays.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aptpays.blockchain.BlockchainTimeManager
import com.aptos.AptosClient
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

/**
 * Example: Schedule Payment Screen with Blockchain Time Management
 * 
 * SOLVES THE PROBLEM:
 * - Syncs with blockchain time on screen load
 * - Shows time offset warning if device time differs
 * - Calculates execution time correctly
 * - Displays accurate countdown
 */

class SchedulePaymentViewModel(
    private val timeManager: BlockchainTimeManager,
    private val aptosClient: AptosClient,
    private val contractAddress: String
) : ViewModel() {
    
    var uiState by mutableStateOf(SchedulePaymentState())
        private set
    
    init {
        // Sync time when screen opens
        syncBlockchainTime()
    }
    
    /**
     * STEP 1: Sync blockchain time
     * Show user if their device time is off
     */
    fun syncBlockchainTime() {
        viewModelScope.launch {
            try {
                uiState = uiState.copy(isLoading = true)
                
                val offset = timeManager.syncTimeOffset()
                
                uiState = uiState.copy(
                    isLoading = false,
                    timeOffset = offset,
                    showTimeWarning = offset.getWarningMessage() != null,
                    timeWarningMessage = offset.getWarningMessage()
                )
                
            } catch (e: Exception) {
                uiState = uiState.copy(
                    isLoading = false,
                    error = "Failed to sync time: ${e.message}"
                )
            }
        }
    }
    
    /**
     * STEP 2: User selects "2 hours from now"
     * Calculate using BLOCKCHAIN time, not device time
     */
    fun selectScheduleTime(hours: Int) {
        viewModelScope.launch {
            val scheduleTime = timeManager.calculateExecutionTime(hours * 3600L)
            
            uiState = uiState.copy(
                selectedHours = hours,
                scheduleTime = scheduleTime,
                showSchedulePreview = true
            )
        }
    }
    
    /**
     * STEP 3: Create the scheduled payment
     */
    fun createScheduledPayment(
        recipient: String,
        amountApt: Double
    ) {
        viewModelScope.launch {
            try {
                uiState = uiState.copy(isCreating = true)
                
                val scheduleTime = uiState.scheduleTime ?: return@launch
                val amountOctas = (amountApt * 100_000_000).toLong()
                
                // Create the transaction
                val payload = mapOf(
                    "function" to "$contractAddress::calendar_payments::create_one_time",
                    "type_arguments" to emptyList<String>(),
                    "arguments" to listOf(
                        recipient,
                        amountOctas.toString(),
                        scheduleTime.executeAtBlockchainTime.toString()
                    )
                )
                
                val txHash = aptosClient.submitTransaction(payload)
                
                uiState = uiState.copy(
                    isCreating = false,
                    success = true,
                    transactionHash = txHash
                )
                
            } catch (e: Exception) {
                uiState = uiState.copy(
                    isCreating = false,
                    error = "Failed to create schedule: ${e.message}"
                )
            }
        }
    }
    
    /**
     * STEP 4: Monitor active schedules (optional)
     * Show countdown until execution
     */
    fun startCountdown(executeAt: Long) {
        viewModelScope.launch {
            while (true) {
                val timeUntil = timeManager.getTimeUntilExecution(executeAt)
                uiState = uiState.copy(timeUntil = timeUntil)
                
                if (timeUntil.isReady) break
                
                kotlinx.coroutines.delay(1000) // Update every second
            }
        }
    }
}

data class SchedulePaymentState(
    val isLoading: Boolean = false,
    val isCreating: Boolean = false,
    val timeOffset: com.aptpays.blockchain.TimeOffset? = null,
    val showTimeWarning: Boolean = false,
    val timeWarningMessage: String? = null,
    val selectedHours: Int = 0,
    val scheduleTime: com.aptpays.blockchain.ScheduleTime? = null,
    val showSchedulePreview: Boolean = false,
    val success: Boolean = false,
    val transactionHash: String? = null,
    val timeUntil: com.aptpays.blockchain.TimeUntil? = null,
    val error: String? = null
)

@Composable
fun SchedulePaymentScreen(
    viewModel: SchedulePaymentViewModel
) {
    val state = viewModel.uiState
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        
        // ⚠️ Time Warning Banner
        if (state.showTimeWarning && state.timeWarningMessage != null) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.errorContainer
                )
            ) {
                Text(
                    text = state.timeWarningMessage,
                    modifier = Modifier.padding(16.dp),
                    color = MaterialTheme.colorScheme.onErrorContainer
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
        
        // Time Sync Info
        state.timeOffset?.let { offset ->
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("⏰ Time Synchronization", style = MaterialTheme.typography.titleMedium)
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Row(modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Your Device", style = MaterialTheme.typography.bodySmall)
                            Text(
                                formatTimestamp(offset.deviceTimestamp),
                                style = MaterialTheme.typography.bodyLarge
                            )
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Blockchain", style = MaterialTheme.typography.bodySmall)
                            Text(
                                formatTimestamp(offset.blockchainTimestamp),
                                style = MaterialTheme.typography.bodyLarge
                            )
                        }
                    }
                    
                    if (offset.offsetSeconds != 0L) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "Difference: ${offset.offsetMinutes} minutes",
                            style = MaterialTheme.typography.bodySmall,
                            color = if (offset.offsetSeconds > 300) {
                                MaterialTheme.colorScheme.error
                            } else {
                                MaterialTheme.colorScheme.onSurface
                            }
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
        
        // Schedule Time Selection
        Text("When to execute?", style = MaterialTheme.typography.titleLarge)
        Spacer(modifier = Modifier.height(8.dp))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            TimeButton("1 hour", 1, state.selectedHours) { viewModel.selectScheduleTime(1) }
            TimeButton("2 hours", 2, state.selectedHours) { viewModel.selectScheduleTime(2) }
            TimeButton("24 hours", 24, state.selectedHours) { viewModel.selectScheduleTime(24) }
        }
        
        // Schedule Preview
        if (state.showSchedulePreview && state.scheduleTime != null) {
            Spacer(modifier = Modifier.height(16.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("📅 Schedule Preview", style = MaterialTheme.typography.titleMedium)
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Text("Will execute: ${state.scheduleTime.getExecutionTimeDescription()}")
                    Text(
                        "Blockchain time: ${formatTimestamp(state.scheduleTime.executeAtBlockchainTime)}",
                        style = MaterialTheme.typography.bodySmall
                    )
                    
                    state.scheduleTime.getOffsetWarning()?.let { warning ->
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            warning,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
                        )
                    }
                }
            }
        }
        
        // Active Schedule Countdown
        state.timeUntil?.let { timeUntil ->
            Spacer(modifier = Modifier.height(16.dp))
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.Center
                ) {
                    Text("⏳ Time Until Execution", style = MaterialTheme.typography.titleMedium)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        timeUntil.toString(),
                        style = MaterialTheme.typography.displayMedium,
                        color = if (timeUntil.isReady) {
                            MaterialTheme.colorScheme.primary
                        } else {
                            MaterialTheme.colorScheme.onSurface
                        }
                    )
                    if (timeUntil.isReady) {
                        Text("✅ Ready to execute!", color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
        }
        
        // Error Display
        state.error?.let { error ->
            Spacer(modifier = Modifier.height(16.dp))
            Text(error, color = MaterialTheme.colorScheme.error)
        }
    }
}

@Composable
fun TimeButton(
    label: String,
    hours: Int,
    selectedHours: Int,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        modifier = Modifier.weight(1f),
        colors = ButtonDefaults.buttonColors(
            containerColor = if (selectedHours == hours) {
                MaterialTheme.colorScheme.primary
            } else {
                MaterialTheme.colorScheme.secondaryContainer
            }
        )
    ) {
        Text(label)
    }
}

fun formatTimestamp(timestamp: Long): String {
    val instant = Instant.ofEpochSecond(timestamp)
    val formatter = DateTimeFormatter.ofPattern("HH:mm:ss")
        .withZone(ZoneId.systemDefault())
    return formatter.format(instant)
}
