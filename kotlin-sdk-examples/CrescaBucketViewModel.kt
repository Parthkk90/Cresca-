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
import xyz.mcxross.bcs.Serializer

/**
 * ✅ PRODUCTION-READY ViewModel for Cresca Bucket Protocol
 * 
 * Contract: 0x919f17cdb7646b0a40145866dad7dd749d1dafa28942c7758e8eac289ad92a8e
 * Network: Aptos Testnet
 * Version: v2 (leverage changed from u8 to u64)
 * 
 * Fixed Issues:
 * 1. ✅ Proper BCS encoding for vector arguments
 * 2. ✅ Null safety with currentAccount
 * 3. ✅ Price conversion (multiply by 100 for cents)
 * 4. ✅ Address validation
 * 5. ✅ Timeout handling (30s)
 * 6. ✅ Constants for magic numbers
 * 7. ✅ Proper error propagation
 * 8. ✅ Leverage changed from u8 to u64 for larger values
 */
class CrescaBucketViewModel(
    private val aptos: Aptos,
    private var currentAccount: Account?
) : ViewModel() {

    // Constants
    companion object {
        const val OCTAS_PER_APT = 100_000_000L
        const val CONTRACT_ADDRESS = "0x919f17cdb7646b0a40145866dad7dd749d1dafa28942c7758e8eac289ad92a8e"
        const val TRANSACTION_TIMEOUT_MS = 30_000L
        const val ADDRESS_LENGTH = 66 // "0x" + 64 hex chars
    }

    // State
    private val _hex = MutableStateFlow("")
    val hex: StateFlow<String> = _hex.asStateFlow()

    private val _gasFees = MutableStateFlow(0L)
    val gasFees: StateFlow<Long> = _gasFees.asStateFlow()

    private val _uiState = MutableStateFlow(BucketUiState())
    val uiState: StateFlow<BucketUiState> = _uiState.asStateFlow()

    // BCS Encoding Helpers
    private fun encodeAddressVector(addresses: List<AccountAddress>): ByteArray {
        val bcsSerializer = Serializer()
        bcsSerializer.serializeU32AsUleb128(addresses.size)
        addresses.forEach { it.serialize(bcsSerializer) }
        return bcsSerializer.toByteArray()
    }

    private fun encodeU64Vector(values: List<ULong>): ByteArray {
        val bcsSerializer = Serializer()
        bcsSerializer.serializeU32AsUleb128(values.size)
        values.forEach { bcsSerializer.serializeU64(it) }
        return bcsSerializer.toByteArray()
    }

    // Validation Helpers
    private fun validateAddress(address: String): Boolean {
        return address.startsWith("0x") && address.length == ADDRESS_LENGTH
    }

    private fun validateAddresses(addresses: List<String>): Result<List<AccountAddress>> {
        return try {
            require(addresses.all { validateAddress(it) }) {
                "Invalid address format. Must be 66 characters starting with 0x"
            }
            Result.success(addresses.map { AccountAddress.fromString(it) })
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Transaction Execution - Converts FunctionArguments to proper format
    private suspend fun executeOnChain(
        functionName: String,
        funArgs: FunctionArguments
    ): Result<String> {
        return try {
            println("Transaction start\n=============================================")

            val account = currentAccount 
                ?: return Result.failure(Exception("No wallet connected. Please connect wallet first."))

            // Build transaction using entryFunctionData builder
            val txn = withTimeout(TRANSACTION_TIMEOUT_MS) {
                aptos.buildTransaction.simple(
                    sender = account.accountAddress,
                    data = entryFunctionData {
                        function = functionName
                        functionArguments = funArgs
                    }
                )
            }

            // Sign and submit with timeout
            val committed = withTimeout(TRANSACTION_TIMEOUT_MS) {
                aptos.signAndSubmitTransaction(account, txn)
            }
            
            val txHash = committed.expect("Transaction failed").hash
            
            // Wait for confirmation with timeout
            val executed = withTimeout(TRANSACTION_TIMEOUT_MS) {
                aptos.waitForTransaction(HexInput.fromString(txHash))
            }

            val executedTxn = executed.expect("Failed to get transaction details")

            // Extract gas information
            val responseString = executedTxn.toString()
            val gasUsed = """gasUsed=(\d+)""".toRegex()
                .find(responseString)?.groupValues?.get(1)?.toLongOrNull() ?: 0L
            val gasUnitPrice = """gasUnitPrice=(\d+)""".toRegex()
                .find(responseString)?.groupValues?.get(1)?.toLongOrNull() ?: 0L
            val totalGasFee = gasUsed * gasUnitPrice

            _hex.value = txHash
            _gasFees.value = totalGasFee

            println("✅ Transaction Success")
            println("💰 Gas Used: $gasUsed units")
            println("💵 Gas Price: $gasUnitPrice octas")
            println("🔥 Total Fee: $totalGasFee octas (${totalGasFee / OCTAS_PER_APT.toDouble()} APT)")
            println("🔗 Hash: $txHash")

            Result.success("Transaction successful: $txHash")

        } catch (e: Exception) {
            println("❌ Transaction failed: ${e.message}")
            Result.failure(e)
        }
    }

    // ===== ENTRY FUNCTIONS =====

    /**
     * Deposit collateral into trading account
     * @param amountAPT Amount in APT (e.g., 1.0 = 1 APT)
     */
    fun depositCollateral(
        amountAPT: Double,
        onResult: (Result<String>) -> Unit
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)

            try {
                val amountOctas = (amountAPT * OCTAS_PER_APT).toULong()
                val module = "$CONTRACT_ADDRESS::bucket_protocol::deposit_collateral"

                val result = executeOnChain(
                    module,
                    funArgs = functionArguments {
                        +U64(amountOctas)
                    }
                )

                result.fold(
                    onSuccess = { message ->
                        _uiState.value = _uiState.value.copy(isLoading = false)
                        onResult(Result.success(message))
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false, 
                            error = error.message
                        )
                        onResult(Result.failure(error))
                    }
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false, 
                    error = "Invalid amount: ${e.message}"
                )
                onResult(Result.failure(e))
            }
        }
    }

    /**
     * Create a new trading bucket (portfolio)
     * @param assets Token addresses (e.g., ["0x1"] for APT)
     * @param weights Allocation percentages (must sum to 100)
     * @param leverage Multiplier 1-20x (now supports larger values with u64)
     */
    fun createBucket(
        assets: List<String>,
        weights: List<Int>,
        leverage: Long,
        onResult: (Result<String>) -> Unit
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)

            try {
                // Validation
                require(assets.size == weights.size) { 
                    "Assets and weights must have same length" 
                }
                require(leverage > 0 && leverage <= 20) { 
                    "Leverage must be between 1 and 20" 
                }
                require(weights.sum() == 100) { 
                    "Weights must sum to 100" 
                }

                // Validate and convert addresses
                val addressList = validateAddresses(assets).getOrElse { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message
                    )
                    onResult(Result.failure(error))
                    return@launch
                }

                val weightList = weights.map { it.toULong() }
                val module = "$CONTRACT_ADDRESS::bucket_protocol::create_bucket"

                val result = executeOnChain(
                    module,
                    funArgs = functionArguments {
                        +BCSArgument(encodeAddressVector(addressList))
                        +BCSArgument(encodeU64Vector(weightList))
                        +U64(leverage.toULong())
                    }
                )

                result.fold(
                    onSuccess = { message ->
                        _uiState.value = _uiState.value.copy(isLoading = false)
                        onResult(Result.success(message))
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = error.message
                        )
                        onResult(Result.failure(error))
                    }
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Invalid parameters: ${e.message}"
                )
                onResult(Result.failure(e))
            }
        }
    }

    /**
     * Update oracle prices (for testing)
     * @param prices Prices in USD (e.g., 10.50 for $10.50)
     */
    fun updateOracle(
        prices: List<Double>,
        onResult: (Result<String>) -> Unit
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)

            try {
                // Convert to cents (10.50 → 1050)
                val priceList = prices.map { (it * 100).toULong() }
                val module = "$CONTRACT_ADDRESS::bucket_protocol::update_oracle"

                val result = executeOnChain(
                    module,
                    funArgs = functionArguments {
                        +BCSArgument(encodeU64Vector(priceList))
                    }
                )

                result.fold(
                    onSuccess = { message ->
                        _uiState.value = _uiState.value.copy(isLoading = false)
                        onResult(Result.success(message))
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = error.message
                        )
                        onResult(Result.failure(error))
                    }
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Invalid prices: ${e.message}"
                )
                onResult(Result.failure(e))
            }
        }
    }

    /**
     * Open a leveraged position
     * @param bucketId Which bucket to trade (0, 1, 2...)
     * @param isLong true = LONG (bet price up), false = SHORT (bet price down)
     * @param marginAPT Collateral amount in APT
     */
    fun openPosition(
        bucketId: Long,
        isLong: Boolean,
        marginAPT: Double,
        onResult: (Result<String>) -> Unit
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)

            try {
                val marginOctas = (marginAPT * OCTAS_PER_APT).toULong()
                val module = "$CONTRACT_ADDRESS::bucket_protocol::open_position"

                val result = executeOnChain(
                    module,
                    funArgs = functionArguments {
                        +U64(bucketId.toULong())
                        +Bool(isLong)
                        +U64(marginOctas)
                    }
                )

                result.fold(
                    onSuccess = { message ->
                        _uiState.value = _uiState.value.copy(isLoading = false)
                        onResult(Result.success(message))
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = error.message
                        )
                        onResult(Result.failure(error))
                    }
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Invalid parameters: ${e.message}"
                )
                onResult(Result.failure(e))
            }
        }
    }

    /**
     * Close a position and realize P&L
     * @param positionId Which position to close (0, 1, 2...)
     */
    fun closePosition(
        positionId: Long,
        onResult: (Result<String>) -> Unit
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)

            try {
                val module = "$CONTRACT_ADDRESS::bucket_protocol::close_position"

                val result = executeOnChain(
                    module,
                    funArgs = functionArguments {
                        +U64(positionId.toULong())
                    }
                )

                result.fold(
                    onSuccess = { message ->
                        _uiState.value = _uiState.value.copy(isLoading = false)
                        onResult(Result.success(message))
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = error.message
                        )
                        onResult(Result.failure(error))
                    }
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Invalid position ID: ${e.message}"
                )
                onResult(Result.failure(e))
            }
        }
    }

    // ===== VIEW FUNCTIONS (READ-ONLY, NO GAS) =====

    suspend fun getCollateralBalance(address: AccountAddress): Result<ULong> {
        return try {
            val response = aptos.view(
                payload = viewFunctionData {
                    function = "$CONTRACT_ADDRESS::bucket_protocol::get_collateral_balance"
                    functionArguments = functionArguments {
                        +address
                    }
                }
            )
            val balance = when (val value = response[0]) {
                is String -> value.toULongOrNull() ?: 0u
                is Number -> value.toLong().toULong()
                else -> 0u
            }
            Result.success(balance)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getBucketCount(address: AccountAddress): Result<ULong> {
        return try {
            val response = aptos.view(
                payload = viewFunctionData {
                    function = "$CONTRACT_ADDRESS::bucket_protocol::get_bucket_count"
                    functionArguments = functionArguments {
                        +address
                    }
                }
            )
            val count = when (val value = response[0]) {
                is String -> value.toULongOrNull() ?: 0u
                is Number -> value.toLong().toULong()
                else -> 0u
            }
            Result.success(count)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getPositionCount(address: AccountAddress): Result<ULong> {
        return try {
            val response = aptos.view(
                payload = viewFunctionData {
                    function = "$CONTRACT_ADDRESS::bucket_protocol::get_position_count"
                    functionArguments = functionArguments {
                        +address
                    }
                }
            )
            val count = when (val value = response[0]) {
                is String -> value.toULongOrNull() ?: 0u
                is Number -> value.toLong().toULong()
                else -> 0u
            }
            Result.success(count)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getPositionDetails(
        address: AccountAddress, 
        positionId: ULong
    ): Result<PositionDetails> {
        return try {
            val response = aptos.view(
                payload = viewFunctionData {
                    function = "$CONTRACT_ADDRESS::bucket_protocol::get_position_details"
                    functionArguments = functionArguments {
                        +address
                        +U64(positionId)
                    }
                }
            )

            val details = PositionDetails(
                bucketId = (response[0] as? String)?.toULongOrNull() ?: 0u,
                isLong = (response[1] as? Boolean) ?: false,
                margin = (response[2] as? String)?.toULongOrNull() ?: 0u,
                entryPrice = (response[3] as? String)?.toULongOrNull() ?: 0u,
                active = (response[4] as? Boolean) ?: false
            )

            Result.success(details)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ===== DASHBOARD EXAMPLE =====

    fun viewDashboard() {
        viewModelScope.launch {
            println("\n=== Account Dashboard ===")

            val address = currentAccount?.accountAddress
            if (address == null) {
                println("❌ No account connected")
                return@launch
            }

            getCollateralBalance(address).fold(
                onSuccess = { balance ->
                    val balanceAPT = balance.toDouble() / OCTAS_PER_APT
                    println("💰 Balance: ${"%.4f".format(balanceAPT)} APT")
                },
                onFailure = { println("❌ Error: ${it.message}") }
            )

            getBucketCount(address).fold(
                onSuccess = { println("📦 Buckets: $it") },
                onFailure = { println("❌ Error: ${it.message}") }
            )

            getPositionCount(address).fold(
                onSuccess = { count ->
                    println("📊 Positions: $count")
                    for (i in 0u until count) {
                        getPositionDetails(address, i).fold(
                            onSuccess = { pos ->
                                val status = if (pos.active) "ACTIVE" else "CLOSED"
                                val dir = if (pos.isLong) "LONG" else "SHORT"
                                println("  #$i: $status $dir | ${pos.marginAPT} APT @ \$${pos.entryPriceUSD}")
                            },
                            onFailure = { }
                        )
                    }
                },
                onFailure = { println("❌ Error: ${it.message}") }
            )
        }
    }
}

// Data Classes
data class BucketUiState(
    val isLoading: Boolean = false,
    val error: String? = null
)

data class PositionDetails(
    val bucketId: ULong,
    val isLong: Boolean,
    val margin: ULong,
    val entryPrice: ULong,
    val active: Boolean
) {
    val marginAPT: Double get() = margin.toDouble() / CrescaBucketViewModel.OCTAS_PER_APT
    val entryPriceUSD: Double get() = entryPrice.toDouble() / 100.0
    val direction: String get() = if (isLong) "LONG" else "SHORT"
}
