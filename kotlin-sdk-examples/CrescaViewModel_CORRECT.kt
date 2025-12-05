package com.developerstring.nexpay.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import xyz.mcxross.kaptos.Aptos
import xyz.mcxross.kaptos.model.*
import xyz.mcxross.kaptos.account.Account as AptosAccount

/**
 * ✅ CORRECT IMPLEMENTATION - Verified against deployed V2 contract
 * Contract: 0xba20b2115d382c7d8bbe01cc59fe7e33ab43c1c8853cfa9ff573ac8d383c91db
 * Network: Aptos Testnet
 */
class CrescaViewModel : ViewModel() {

    // ✅ V2 Contract Configuration
    private val CONTRACT_ADDRESS = "0xba20b2115d382c7d8bbe01cc59fe7e33ab43c1c8853cfa9ff573ac8d383c91db"
    private val aptos = Aptos(AptosConfig(AptosSettings(network = Network.TESTNET)))
    private var currentAccount: AptosAccount? = null

    private val _uiState = MutableStateFlow(CrescaUiState())
    val uiState: StateFlow<CrescaUiState> = _uiState.asStateFlow()

    // ════════════════════════════════════════════════════════════════════════════
    // WALLET MANAGEMENT
    // ════════════════════════════════════════════════════════════════════════════

    fun connectWallet(privateKey: String?) {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null)

                // Create or import account
                val account = if (privateKey != null) {
                    AptosAccount.fromPrivateKey(privateKey)
                } else {
                    AptosAccount.generate()
                }

                currentAccount = account
                val balance = getBalance()

                _uiState.value = _uiState.value.copy(
                    isConnected = true,
                    isLoading = false,
                    walletAddress = account.accountAddress.toString(),
                    balance = balance,
                    error = null
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Failed to connect wallet: ${e.message}"
                )
            }
        }
    }

    private suspend fun getBalance(): Double {
        return try {
            currentAccount?.let { account ->
                val balanceOctas = aptos.getAccountAPTAmount(account.accountAddress)
                balanceOctas.toDouble() / 100_000_000.0
            } ?: 0.0
        } catch (e: Exception) {
            0.0
        }
    }

    fun refreshBalance() {
        viewModelScope.launch {
            try {
                val balance = getBalance()
                _uiState.value = _uiState.value.copy(balance = balance)
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = "Failed to refresh balance: ${e.message}"
                )
            }
        }
    }

    // ════════════════════════════════════════════════════════════════════════════
    // PROTOCOL INITIALIZATION (Call once - usually already done)
    // ════════════════════════════════════════════════════════════════════════════

    /**
     * Initialize the protocol with specified leverage
     * ⚠️ Only needs to be called ONCE when protocol is first deployed
     * ⚠️ Your V2 contract is already initialized - skip this in production
     * 
     * @param leverage Leverage multiplier (1-20)
     */
    fun initializeProtocol(leverage: Int, onResult: (Result<String>) -> Unit) {
        viewModelScope.launch {
            try {
                val account = currentAccount 
                    ?: return@launch onResult(Result.failure(Exception("No wallet connected")))

                _uiState.value = _uiState.value.copy(isLoading = true, error = null)

                val transaction = aptos.buildTransaction.simple(
                    sender = account.accountAddress,
                    data = entryFunctionData {
                        function = "$CONTRACT_ADDRESS::bucket_protocol::init"
                        functionArguments = functionArguments {
                            +U64(leverage.toULong())
                        }
                    }
                )

                val committed = aptos.signAndSubmitTransaction(account, transaction)
                val txHash = committed.expect("Transaction failed").hash
                
                aptos.waitForTransaction(HexInput.fromString(txHash))

                _uiState.value = _uiState.value.copy(isLoading = false)
                onResult(Result.success(txHash))

            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Failed to initialize: ${e.message}"
                )
                onResult(Result.failure(e))
            }
        }
    }

    // ════════════════════════════════════════════════════════════════════════════
    // ORACLE PRICE UPDATES (Required before trading!)
    // ════════════════════════════════════════════════════════════════════════════

    /**
     * Update oracle prices for BTC, ETH, and SOL
     * ✅ REQUIRED before opening positions (used to calculate entry_price)
     * 
     * @param btcPriceUSD Bitcoin price in USD (e.g., 95000.0)
     * @param ethPriceUSD Ethereum price in USD (e.g., 3500.0)
     * @param solPriceUSD Solana price in USD (e.g., 190.0)
     */
    fun updateOraclePrices(
        btcPriceUSD: Double,
        ethPriceUSD: Double,
        solPriceUSD: Double,
        onResult: (Result<String>) -> Unit
    ) {
        viewModelScope.launch {
            try {
                val account = currentAccount 
                    ?: return@launch onResult(Result.failure(Exception("No wallet connected")))

                _uiState.value = _uiState.value.copy(isLoading = true, error = null)

                // Convert prices to u64 format (contract expects integer values)
                val btcPrice = btcPriceUSD.toLong()
                val ethPrice = ethPriceUSD.toLong()
                val solPrice = solPriceUSD.toLong()

                val transaction = aptos.buildTransaction.simple(
                    sender = account.accountAddress,
                    data = entryFunctionData {
                        function = "$CONTRACT_ADDRESS::bucket_protocol::update_oracle"
                        functionArguments = functionArguments {
                            +U64(btcPrice.toULong())
                            +U64(ethPrice.toULong())
                            +U64(solPrice.toULong())
                        }
                    }
                )

                val committed = aptos.signAndSubmitTransaction(account, transaction)
                val txHash = committed.expect("Transaction failed").hash
                
                aptos.waitForTransaction(HexInput.fromString(txHash))

                _uiState.value = _uiState.value.copy(isLoading = false)
                onResult(Result.success(txHash))

            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Failed to update oracle: ${e.message}"
                )
                onResult(Result.failure(e))
            }
        }
    }

    // ════════════════════════════════════════════════════════════════════════════
    // POSITION MANAGEMENT
    // ════════════════════════════════════════════════════════════════════════════

    /**
     * Open a LONG position (bet price goes UP)
     * ✅ Automatically withdraws 1 APT margin from user
     * ✅ Uses bucket_id = 0 (default bucket: BTC 50%, ETH 30%, SOL 20%)
     */
    fun openLongPosition(onResult: (Result<String>) -> Unit) {
        viewModelScope.launch {
            try {
                val account = currentAccount 
                    ?: return@launch onResult(Result.failure(Exception("No wallet connected")))

                _uiState.value = _uiState.value.copy(isLoading = true, error = null)

                val transaction = aptos.buildTransaction.simple(
                    sender = account.accountAddress,
                    data = entryFunctionData {
                        function = "$CONTRACT_ADDRESS::bucket_protocol::open_long"
                        functionArguments = functionArguments {
                            +U64(0u) // bucket_id = 0 (default bucket)
                        }
                    }
                )

                val committed = aptos.signAndSubmitTransaction(account, transaction)
                val txHash = committed.expect("Transaction failed").hash
                
                aptos.waitForTransaction(HexInput.fromString(txHash))

                _uiState.value = _uiState.value.copy(isLoading = false)
                refreshBalance()
                onResult(Result.success(txHash))

            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Failed to open LONG: ${e.message}"
                )
                onResult(Result.failure(e))
            }
        }
    }

    /**
     * Open a SHORT position (bet price goes DOWN)
     * ✅ Automatically withdraws 1 APT margin from user
     * ✅ Uses bucket_id = 0 (default bucket: BTC 50%, ETH 30%, SOL 20%)
     */
    fun openShortPosition(onResult: (Result<String>) -> Unit) {
        viewModelScope.launch {
            try {
                val account = currentAccount 
                    ?: return@launch onResult(Result.failure(Exception("No wallet connected")))

                _uiState.value = _uiState.value.copy(isLoading = true, error = null)

                val transaction = aptos.buildTransaction.simple(
                    sender = account.accountAddress,
                    data = entryFunctionData {
                        function = "$CONTRACT_ADDRESS::bucket_protocol::open_short"
                        functionArguments = functionArguments {
                            +U64(0u) // bucket_id = 0 (default bucket)
                        }
                    }
                )

                val committed = aptos.signAndSubmitTransaction(account, transaction)
                val txHash = committed.expect("Transaction failed").hash
                
                aptos.waitForTransaction(HexInput.fromString(txHash))

                _uiState.value = _uiState.value.copy(isLoading = false)
                refreshBalance()
                onResult(Result.success(txHash))

            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Failed to open SHORT: ${e.message}"
                )
                onResult(Result.failure(e))
            }
        }
    }

    /**
     * Close a specific position
     * ✅ CRITICAL: Only takes 1 parameter (position_id)
     * ✅ Returns margin + PnL to user
     * ⚠️ Can only close positions owned by current user
     * 
     * @param positionId The ID of the position to close (get from getMyActivePositions)
     */
    fun closePosition(positionId: Long, onResult: (Result<String>) -> Unit) {
        viewModelScope.launch {
            try {
                val account = currentAccount 
                    ?: return@launch onResult(Result.failure(Exception("No wallet connected")))

                _uiState.value = _uiState.value.copy(isLoading = true, error = null)

                val transaction = aptos.buildTransaction.simple(
                    sender = account.accountAddress,
                    data = entryFunctionData {
                        function = "$CONTRACT_ADDRESS::bucket_protocol::close_position"
                        functionArguments = functionArguments {
                            +U64(positionId.toULong()) // ✅ ONLY position_id!
                        }
                    }
                )

                val committed = aptos.signAndSubmitTransaction(account, transaction)
                val txHash = committed.expect("Transaction failed").hash
                
                aptos.waitForTransaction(HexInput.fromString(txHash))

                _uiState.value = _uiState.value.copy(isLoading = false)
                refreshBalance()
                onResult(Result.success(txHash))

            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Failed to close position: ${e.message}"
                )
                onResult(Result.failure(e))
            }
        }
    }

    // ════════════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS (Read-only queries)
    // ════════════════════════════════════════════════════════════════════════════

    /**
     * Get all active positions owned by current user
     * ✅ Use this to find which position IDs the user can close
     */
    suspend fun getMyActivePositions(): List<PositionInfo> {
        return try {
            val userAddress = currentAccount?.accountAddress?.toString() 
                ?: return emptyList()

            // Get total position count
            val countResult = aptos.view(
                ViewRequest(
                    function = "$CONTRACT_ADDRESS::bucket_protocol::get_position_count",
                    typeArguments = emptyList(),
                    functionArguments = listOf(CONTRACT_ADDRESS)
                )
            )
            val totalPositions = (countResult[0] as String).toLongOrNull() ?: 0

            val activePositions = mutableListOf<PositionInfo>()

            // Check each position
            for (positionId in 0 until totalPositions) {
                try {
                    val details = aptos.view(
                        ViewRequest(
                            function = "$CONTRACT_ADDRESS::bucket_protocol::get_position_details",
                            typeArguments = emptyList(),
                            functionArguments = listOf(CONTRACT_ADDRESS, positionId.toString())
                        )
                    )

                    val bucketId = (details[0] as String).toLong()
                    val isLong = details[1] as Boolean
                    val margin = (details[2] as String).toLong()
                    val entryPrice = (details[3] as String).toLong()
                    val owner = details[4] as String
                    val active = details[5] as Boolean

                    // Only include active positions owned by current user
                    if (owner.equals(userAddress, ignoreCase = true) && active) {
                        activePositions.add(
                            PositionInfo(
                                positionId = positionId,
                                bucketId = bucketId,
                                isLong = isLong,
                                marginOctas = margin,
                                marginAPT = margin.toDouble() / 100_000_000.0,
                                entryPrice = entryPrice,
                                owner = owner,
                                active = active
                            )
                        )
                    }
                } catch (e: Exception) {
                    // Skip positions that can't be read
                    continue
                }
            }

            activePositions
        } catch (e: Exception) {
            emptyList()
        }
    }

    /**
     * Get current oracle prices
     */
    suspend fun getOraclePrices(): OraclePrices? {
        return try {
            val result = aptos.view(
                ViewRequest(
                    function = "$CONTRACT_ADDRESS::bucket_protocol::get_oracle_prices",
                    typeArguments = emptyList(),
                    functionArguments = listOf(CONTRACT_ADDRESS)
                )
            )

            val prices = result[0] as List<*>
            if (prices.size >= 3) {
                OraclePrices(
                    btcPrice = (prices[0] as String).toLong(),
                    ethPrice = (prices[1] as String).toLong(),
                    solPrice = (prices[2] as String).toLong()
                )
            } else {
                null
            }
        } catch (e: Exception) {
            null
        }
    }
}

// ════════════════════════════════════════════════════════════════════════════
// DATA MODELS
// ════════════════════════════════════════════════════════════════════════════

data class CrescaUiState(
    val isConnected: Boolean = false,
    val isLoading: Boolean = false,
    val walletAddress: String? = null,
    val balance: Double = 0.0,
    val error: String? = null
)

data class PositionInfo(
    val positionId: Long,
    val bucketId: Long,
    val isLong: Boolean,
    val marginOctas: Long,
    val marginAPT: Double,
    val entryPrice: Long,
    val owner: String,
    val active: Boolean
)

data class OraclePrices(
    val btcPrice: Long,
    val ethPrice: Long,
    val solPrice: Long
)
