package com.aptpays.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout
import xyz.mcxross.kaptos.Aptos
import xyz.mcxross.kaptos.model.*
import xyz.mcxross.kaptos.account.Account
import java.util.Date

/**
 * Calendar Payment ViewModel - Simplified Integration
 * 
 * CONTRACT: aptpays::calendar_payments
 * MODULE ADDRESS: (To be deployed)
 * NETWORK: Aptos Testnet
 * 
 * FEATURES:
 * - Unified create function (one-time + recurring)
 * - Cancel scheduled payments
 * - Execute due payments (anyone can call)
 * - View payment details
 * 
 * SIMPLIFIED API - Only 3 entry functions:
 * 1. create_schedule() - Create any type of payment
 * 2. cancel() - Cancel and refund
 * 3. execute() - Execute payment
 */
class CalendarPaymentViewModel(
    private val aptos: Aptos = Aptos(AptosConfig(AptosSettings(network = Network.TESTNET))),
    private var currentAccount: Account?
) : ViewModel() {

    companion object {
        // Update after deployment
        const val CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE"
        const val MODULE_NAME = "calendar_payments"
        
        const val OCTAS_PER_APT = 100_000_000L
        const val TRANSACTION_TIMEOUT_MS = 30_000L
        
        // Time constants
        const val SECONDS_PER_MINUTE = 60L
        const val SECONDS_PER_HOUR = 3600L
        const val SECONDS_PER_DAY = 86400L
        const val SECONDS_PER_WEEK = 604800L
        const val SECONDS_PER_MONTH = 2592000L // 30 days
        const val SECONDS_PER_YEAR = 31536000L // 365 days
    }

    // State management
    private val _uiState = MutableStateFlow(PaymentUiState())
    val uiState: StateFlow<PaymentUiState> = _uiState.asStateFlow()

    /**
     * Create a payment schedule (handles both one-time and recurring)
     * 
     * @param recipient Receiver's address
     * @param amountAPT Amount per payment in APT
     * @param executeAt When to execute (timestamp in seconds)
     * @param isRecurring false = one-time, true = recurring
     * @param intervalDays Days between payments (only for recurring)
     * @param occurrences How many times to pay (1 for one-time)
     */
    suspend fun createSchedule(
        recipient: String,
        amountAPT: Double,
        executeAt: Long,
        isRecurring: Boolean = false,
        intervalDays: Int = 30,
        occurrences: Int = 1
    ): Result<String> {
        require(amountAPT > 0) { "Amount must be positive" }
        require(occurrences > 0) { "Occurrences must be positive" }
        require(executeAt > System.currentTimeMillis() / 1000) { "Execute time must be in future" }
        
        if (isRecurring) {
            require(intervalDays > 0) { "Interval must be positive for recurring" }
            require(occurrences > 1) { "Recurring payments need occurrences > 1" }
        }
        
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        
        return try {
            withTimeout(TRANSACTION_TIMEOUT_MS) {
                val account = currentAccount ?: return@withTimeout Result.failure(
                    IllegalStateException("No account connected")
                )

                val amountOctas = (amountAPT * OCTAS_PER_APT).toULong()
                val intervalSecs = if (isRecurring) (intervalDays * SECONDS_PER_DAY).toULong() else 0u
                val count = occurrences.toULong()
                
                // Total escrow = amount * occurrences
                val totalEscrow = amountAPT * occurrences

                val result = executeOnChain(
                    "$CONTRACT_ADDRESS::$MODULE_NAME::create_schedule",
                    typeArgs = null,
                    funArgs = functionArguments {
                        +MoveString(recipient)
                        +U64(amountOctas)
                        +U64(executeAt.toULong())
                        +U64(intervalSecs)
                        +U64(count)
                    }
                )

                _uiState.value = _uiState.value.copy(isLoading = false)
                
                result.onSuccess {
                    _uiState.value = _uiState.value.copy(
                        lastScheduleCreated = ScheduleInfo(
                            recipient = recipient,
                            amountAPT = amountAPT,
                            totalEscrowAPT = totalEscrow,
                            executeAt = executeAt,
                            isRecurring = isRecurring,
                            intervalDays = intervalDays,
                            occurrences = occurrences
                        )
                    )
                }
                
                result
            }
        } catch (e: Exception) {
            _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            Result.failure(e)
        }
    }

    /**
     * Helper: Create one-time payment
     */
    suspend fun createOneTimePayment(
        recipient: String,
        amountAPT: Double,
        executeAt: Long
    ): Result<String> {
        return createSchedule(
            recipient = recipient,
            amountAPT = amountAPT,
            executeAt = executeAt,
            isRecurring = false,
            occurrences = 1
        )
    }

    /**
     * Helper: Create recurring payment (monthly by default)
     */
    suspend fun createRecurringPayment(
        recipient: String,
        amountAPT: Double,
        startAt: Long,
        intervalDays: Int = 30,
        occurrences: Int
    ): Result<String> {
        return createSchedule(
            recipient = recipient,
            amountAPT = amountAPT,
            executeAt = startAt,
            isRecurring = true,
            intervalDays = intervalDays,
            occurrences = occurrences
        )
    }

    /**
     * Cancel a scheduled payment and refund remaining escrow
     */
    suspend fun cancelSchedule(scheduleId: Int): Result<String> {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        
        return try {
            withTimeout(TRANSACTION_TIMEOUT_MS) {
                val account = currentAccount ?: return@withTimeout Result.failure(
                    IllegalStateException("No account connected")
                )

                val result = executeOnChain(
                    "$CONTRACT_ADDRESS::$MODULE_NAME::cancel",
                    typeArgs = null,
                    funArgs = functionArguments {
                        +U64(scheduleId.toULong())
                    }
                )

                _uiState.value = _uiState.value.copy(isLoading = false)
                result
            }
        } catch (e: Exception) {
            _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            Result.failure(e)
        }
    }

    /**
     * Execute a due payment (anyone can call)
     */
    suspend fun executeSchedule(
        payerAddress: String,
        scheduleId: Int
    ): Result<String> {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        
        return try {
            withTimeout(TRANSACTION_TIMEOUT_MS) {
                val account = currentAccount ?: return@withTimeout Result.failure(
                    IllegalStateException("No account connected")
                )

                val result = executeOnChain(
                    "$CONTRACT_ADDRESS::$MODULE_NAME::execute",
                    typeArgs = null,
                    funArgs = functionArguments {
                        +MoveString(payerAddress)
                        +U64(scheduleId.toULong())
                    }
                )

                _uiState.value = _uiState.value.copy(isLoading = false)
                result
            }
        } catch (e: Exception) {
            _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            Result.failure(e)
        }
    }

    // ============== VIEW FUNCTIONS ==============

    /**
     * Get schedule details
     */
    suspend fun getSchedule(
        payerAddress: String,
        scheduleId: Int
    ): Result<ScheduleDetails> {
        return try {
            val response = aptos.view(
                payload = ViewRequest(
                    function = "$CONTRACT_ADDRESS::$MODULE_NAME::get_schedule",
                    typeArguments = emptyList(),
                    functionArguments = listOf(
                        payerAddress,
                        scheduleId.toString()
                    )
                )
            )

            val recipient = response[0] as? String ?: ""
            val amount = (response[1] as? Number)?.toLong() ?: 0L
            val nextExec = (response[2] as? Number)?.toLong() ?: 0L
            val interval = (response[3] as? Number)?.toLong() ?: 0L
            val remaining = (response[4] as? Number)?.toInt() ?: 0
            val active = (response[5] as? Boolean) ?: false

            Result.success(
                ScheduleDetails(
                    scheduleId = scheduleId,
                    recipient = recipient,
                    amountOctas = amount,
                    nextExecutionSecs = nextExec,
                    intervalSecs = interval,
                    remainingOccurrences = remaining,
                    isActive = active
                )
            )
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ============== HELPER FUNCTIONS ==============

    private suspend fun executeOnChain(
        function: String,
        typeArgs: TypeArguments?,
        funArgs: FunctionArguments
    ): Result<String> {
        return try {
            val account = currentAccount ?: return Result.failure(
                IllegalStateException("No account connected")
            )

            val transaction = aptos.buildTransaction.simple(
                sender = account.accountAddress,
                data = entryFunctionData {
                    this.function = function
                    typeArgs?.let { typeArguments = it }
                    functionArguments = funArgs
                }
            )

            val signedTx = aptos.signTransaction(account, transaction)
            val pendingTx = aptos.submitTransaction.simple(signedTx)
            val executedTx = aptos.waitForTransaction(pendingTx.hash)

            Result.success("Transaction: ${pendingTx.hash}")
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Get current timestamp in seconds
     */
    fun getCurrentTimestamp(): Long {
        return System.currentTimeMillis() / 1000
    }

    /**
     * Calculate timestamp for future date
     */
    fun getFutureTimestamp(
        days: Int = 0,
        hours: Int = 0,
        minutes: Int = 0
    ): Long {
        val seconds = (days * SECONDS_PER_DAY) + 
                     (hours * SECONDS_PER_HOUR) + 
                     (minutes * SECONDS_PER_MINUTE)
        return getCurrentTimestamp() + seconds
    }

    /**
     * Format timestamp to readable date
     */
    fun formatTimestamp(timestampSecs: Long): String {
        return Date(timestampSecs * 1000).toString()
    }

    /**
     * Check if payment is due
     */
    fun isPaymentDue(nextExecutionSecs: Long): Boolean {
        return getCurrentTimestamp() >= nextExecutionSecs
    }
}

// ============== DATA CLASSES ==============

data class PaymentUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val lastScheduleCreated: ScheduleInfo? = null
)

data class ScheduleInfo(
    val recipient: String,
    val amountAPT: Double,
    val totalEscrowAPT: Double,
    val executeAt: Long,
    val isRecurring: Boolean,
    val intervalDays: Int,
    val occurrences: Int
)

data class ScheduleDetails(
    val scheduleId: Int,
    val recipient: String,
    val amountOctas: Long,
    val nextExecutionSecs: Long,
    val intervalSecs: Long,
    val remainingOccurrences: Int,
    val isActive: Boolean
) {
    val amountAPT: Double get() = amountOctas / 100_000_000.0
    val intervalDays: Int get() = (intervalSecs / 86400).toInt()
    val isOneTime: Boolean get() = intervalSecs == 0L
    val isRecurring: Boolean get() = intervalSecs > 0L
    val nextExecutionDate: String get() = Date(nextExecutionSecs * 1000).toString()
    val isDue: Boolean get() = System.currentTimeMillis() / 1000 >= nextExecutionSecs
}
