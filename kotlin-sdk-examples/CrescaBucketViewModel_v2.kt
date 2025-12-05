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
 * Cresca Bucket Protocol - ViewModel Integration
 * 
 * NEW CONTRACT DEPLOYMENT:
 * - Contract Address: 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b
 * - Module: bucket_protocol
 * - Network: Aptos Testnet
 * - Transaction: 0x62379e103564c9aa2b476c73337416a9d07248f41bd23b2ad4d1f2d69e7befcb
 * 
 * HARDCODED FEATURES:
 * - Margin: 0.05 APT per position
 * - Assets: BTC (50%), ETH (30%), SOL (20%)
 * - Auto-creates bucket on init()
 * 
 * FUNCTIONS:
 * - init(leverage: u64) - Initialize protocol with leverage (1-20)
 * - deposit_collateral(amount: u64) - Deposit APT for trading
 * - open_long(bucket_id: u64) - Open LONG position (0.05 APT)
 * - open_short(bucket_id: u64) - Open SHORT position (0.05 APT)
 * - close_position(position_id: u64) - Close position
 * - update_oracle(btc: u64, eth: u64, sol: u64) - Update prices in cents
 */
class CrescaBucketViewModel(
    private val aptos: Aptos = Aptos(AptosConfig(AptosSettings(network = Network.TESTNET))),
    private var currentAccount: Account?
) : ViewModel() {

    companion object {
        // Deployment credentials
        const val CONTRACT_ADDRESS = "0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b"
        const val MODULE_NAME = "bucket_protocol"
        const val DEPLOYMENT_TX = "0x62379e103564c9aa2b476c73337416a9d07248f41bd23b2ad4d1f2d69e7befcb"
        
        // Constants
        const val OCTAS_PER_APT = 100_000_000L
        const val DEFAULT_MARGIN_OCTAS = 5_000_000L // 0.05 APT
        const val TRANSACTION_TIMEOUT_MS = 30_000L
        
        // Hardcoded token addresses (Mainnet - UPDATE FOR TESTNET)
        const val BTC_ADDRESS = "0xae478ff7d83ed072dbc5e264250e67ef58f57c99d89b447efd8a0a2e8b2be76e"
        const val ETH_ADDRESS = "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea"
        const val SOL_ADDRESS = "0xdd89c0e695df0692205912fb69fc290418bed0dbe6e4573d744a6d5e6bab6c13"
    }

    // State management
    private val _uiState = MutableStateFlow(BucketUiState())
    val uiState: StateFlow<BucketUiState> = _uiState.asStateFlow()

    /**
     * Initialize protocol with auto-bucket creation
     * Creates default bucket with BTC (50%), ETH (30%), SOL (20%)
     */
    suspend fun init(leverage: Int): Result<String> {
        require(leverage in 1..20) { "Leverage must be between 1 and 20" }
        
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        
        return try {
            withTimeout(TRANSACTION_TIMEOUT_MS) {
                val account = currentAccount ?: return@withTimeout Result.failure(
                    IllegalStateException("No account connected")
                )

                val result = executeOnChain(
                    "$CONTRACT_ADDRESS::$MODULE_NAME::init",
                    typeArgs = null,
                    funArgs = functionArguments {
                        +U64(leverage.toULong())
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
     * Deposit collateral for trading
     */
    suspend fun depositCollateral(amountAPT: Double): Result<String> {
        require(amountAPT > 0) { "Amount must be positive" }
        
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        
        return try {
            withTimeout(TRANSACTION_TIMEOUT_MS) {
                val account = currentAccount ?: return@withTimeout Result.failure(
                    IllegalStateException("No account connected")
                )

                val amountOctas = (amountAPT * OCTAS_PER_APT).toULong()

                val result = executeOnChain(
                    "$CONTRACT_ADDRESS::$MODULE_NAME::deposit_collateral",
                    typeArgs = null,
                    funArgs = functionArguments {
                        +U64(amountOctas)
                    }
                )

                _uiState.value = _uiState.value.copy(isLoading = false)
                refreshBalance()
                result
            }
        } catch (e: Exception) {
            _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            Result.failure(e)
        }
    }

    /**
     * Open LONG position (bet price goes UP)
     * Uses hardcoded 0.05 APT margin
     */
    suspend fun openLong(bucketId: Int = 0): Result<String> {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        
        return try {
            withTimeout(TRANSACTION_TIMEOUT_MS) {
                val account = currentAccount ?: return@withTimeout Result.failure(
                    IllegalStateException("No account connected")
                )

                val result = executeOnChain(
                    "$CONTRACT_ADDRESS::$MODULE_NAME::open_long",
                    typeArgs = null,
                    funArgs = functionArguments {
                        +U64(bucketId.toULong())
                    }
                )

                _uiState.value = _uiState.value.copy(isLoading = false)
                refreshBalance()
                result
            }
        } catch (e: Exception) {
            _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            Result.failure(e)
        }
    }

    /**
     * Open SHORT position (bet price goes DOWN)
     * Uses hardcoded 0.05 APT margin
     */
    suspend fun openShort(bucketId: Int = 0): Result<String> {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        
        return try {
            withTimeout(TRANSACTION_TIMEOUT_MS) {
                val account = currentAccount ?: return@withTimeout Result.failure(
                    IllegalStateException("No account connected")
                )

                val result = executeOnChain(
                    "$CONTRACT_ADDRESS::$MODULE_NAME::open_short",
                    typeArgs = null,
                    funArgs = functionArguments {
                        +U64(bucketId.toULong())
                    }
                )

                _uiState.value = _uiState.value.copy(isLoading = false)
                refreshBalance()
                result
            }
        } catch (e: Exception) {
            _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            Result.failure(e)
        }
    }

    /**
     * Close a position
     */
    suspend fun closePosition(positionId: Int): Result<String> {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        
        return try {
            withTimeout(TRANSACTION_TIMEOUT_MS) {
                val account = currentAccount ?: return@withTimeout Result.failure(
                    IllegalStateException("No account connected")
                )

                val result = executeOnChain(
                    "$CONTRACT_ADDRESS::$MODULE_NAME::close_position",
                    typeArgs = null,
                    funArgs = functionArguments {
                        +U64(positionId.toULong())
                    }
                )

                _uiState.value = _uiState.value.copy(isLoading = false)
                refreshBalance()
                result
            }
        } catch (e: Exception) {
            _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            Result.failure(e)
        }
    }

    /**
     * Update oracle prices
     * @param btcPrice BTC price in cents (e.g., $50,000 = 5000000)
     * @param ethPrice ETH price in cents (e.g., $3,500 = 350000)
     * @param solPrice SOL price in cents (e.g., $100 = 10000)
     */
    suspend fun updateOracle(
        btcPrice: Double,
        ethPrice: Double,
        solPrice: Double
    ): Result<String> {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        
        return try {
            withTimeout(TRANSACTION_TIMEOUT_MS) {
                val account = currentAccount ?: return@withTimeout Result.failure(
                    IllegalStateException("No account connected")
                )

                // Convert to cents
                val btcCents = (btcPrice * 100).toULong()
                val ethCents = (ethPrice * 100).toULong()
                val solCents = (solPrice * 100).toULong()

                val result = executeOnChain(
                    "$CONTRACT_ADDRESS::$MODULE_NAME::update_oracle",
                    typeArgs = null,
                    funArgs = functionArguments {
                        +U64(btcCents)
                        +U64(ethCents)
                        +U64(solCents)
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

    // ============== VIEW FUNCTIONS (Free, no gas) ==============

    /**
     * Get collateral balance
     */
    suspend fun getCollateralBalance(): Result<Double> {
        return try {
            val account = currentAccount ?: return Result.failure(
                IllegalStateException("No account connected")
            )

            val response = aptos.view(
                payload = ViewRequest(
                    function = "$CONTRACT_ADDRESS::$MODULE_NAME::get_collateral_balance",
                    typeArguments = emptyList(),
                    functionArguments = listOf(account.accountAddress.toString())
                )
            )

            val octas = when (val value = response[0]) {
                is String -> value.toULongOrNull() ?: 0UL
                is Number -> value.toLong().toULong()
                else -> 0UL
            }

            Result.success(octas.toDouble() / OCTAS_PER_APT)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Get bucket count
     */
    suspend fun getBucketCount(): Result<Int> {
        return try {
            val account = currentAccount ?: return Result.failure(
                IllegalStateException("No account connected")
            )

            val response = aptos.view(
                payload = ViewRequest(
                    function = "$CONTRACT_ADDRESS::$MODULE_NAME::get_bucket_count",
                    typeArguments = emptyList(),
                    functionArguments = listOf(account.accountAddress.toString())
                )
            )

            val count = when (val value = response[0]) {
                is String -> value.toIntOrNull() ?: 0
                is Number -> value.toInt()
                else -> 0
            }

            Result.success(count)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Get position count
     */
    suspend fun getPositionCount(): Result<Int> {
        return try {
            val account = currentAccount ?: return Result.failure(
                IllegalStateException("No account connected")
            )

            val response = aptos.view(
                payload = ViewRequest(
                    function = "$CONTRACT_ADDRESS::$MODULE_NAME::get_position_count",
                    typeArguments = emptyList(),
                    functionArguments = listOf(account.accountAddress.toString())
                )
            )

            val count = when (val value = response[0]) {
                is String -> value.toIntOrNull() ?: 0
                is Number -> value.toInt()
                else -> 0
            }

            Result.success(count)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Get position details
     */
    suspend fun getPositionDetails(positionId: Int): Result<PositionDetails> {
        return try {
            val account = currentAccount ?: return Result.failure(
                IllegalStateException("No account connected")
            )

            val response = aptos.view(
                payload = ViewRequest(
                    function = "$CONTRACT_ADDRESS::$MODULE_NAME::get_position_details",
                    typeArguments = emptyList(),
                    functionArguments = listOf(
                        account.accountAddress.toString(),
                        positionId.toString()
                    )
                )
            )

            val bucketId = (response[0] as? Number)?.toLong() ?: 0L
            val isLong = (response[1] as? Boolean) ?: true
            val marginOctas = (response[2] as? Number)?.toLong() ?: 0L
            val entryPrice = (response[3] as? Number)?.toLong() ?: 0L
            val active = (response[4] as? Boolean) ?: false

            Result.success(
                PositionDetails(
                    bucketId = bucketId,
                    isLong = isLong,
                    marginOctas = marginOctas,
                    entryPrice = entryPrice,
                    active = active
                )
            )
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Get oracle prices [BTC, ETH, SOL]
     */
    suspend fun getOraclePrices(): Result<List<Double>> {
        return try {
            val account = currentAccount ?: return Result.failure(
                IllegalStateException("No account connected")
            )

            val response = aptos.view(
                payload = ViewRequest(
                    function = "$CONTRACT_ADDRESS::$MODULE_NAME::get_oracle_prices",
                    typeArguments = emptyList(),
                    functionArguments = listOf(account.accountAddress.toString())
                )
            )

            val prices = (response[0] as? List<*>)?.mapNotNull { 
                when (it) {
                    is String -> it.toDoubleOrNull()?.div(100) // Convert cents to dollars
                    is Number -> it.toDouble() / 100
                    else -> null
                }
            } ?: emptyList()

            Result.success(prices)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * View dashboard - Get all account info
     */
    suspend fun viewDashboard(): Result<DashboardData> {
        return try {
            val balance = getCollateralBalance().getOrThrow()
            val bucketCount = getBucketCount().getOrThrow()
            val positionCount = getPositionCount().getOrThrow()
            val prices = getOraclePrices().getOrNull() ?: emptyList()

            Result.success(
                DashboardData(
                    collateralAPT = balance,
                    bucketCount = bucketCount,
                    positionCount = positionCount,
                    btcPrice = prices.getOrNull(0),
                    ethPrice = prices.getOrNull(1),
                    solPrice = prices.getOrNull(2)
                )
            )
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ============== HELPER FUNCTIONS ==============

    private fun refreshBalance() {
        viewModelScope.launch {
            getCollateralBalance().onSuccess { balance ->
                _uiState.value = _uiState.value.copy(
                    collateralBalance = balance
                )
            }
        }
    }

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
}

// Data Classes
data class BucketUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val collateralBalance: Double = 0.0
)

data class PositionDetails(
    val bucketId: Long,
    val isLong: Boolean,
    val marginOctas: Long,
    val entryPrice: Long,
    val active: Boolean
) {
    val marginAPT: Double get() = marginOctas / 100_000_000.0
    val direction: String get() = if (isLong) "LONG" else "SHORT"
    val entryPriceUSD: Double get() = entryPrice / 100.0 // Convert cents to dollars
}

data class DashboardData(
    val collateralAPT: Double,
    val bucketCount: Int,
    val positionCount: Int,
    val btcPrice: Double?,
    val ethPrice: Double?,
    val solPrice: Double?
)
