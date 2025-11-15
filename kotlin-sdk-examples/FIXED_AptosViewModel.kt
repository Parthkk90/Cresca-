// ✅ CORRECTED VERSION - Only the functions you need for V2

class AptosViewModel(
    private val appLockRepository: AppLockRepository,
    private val bundleTransactionDao: BundleTransactionDao
) : ViewModel() {

    val aptos = Aptos(AptosConfig(AptosSettings(network = Network.TESTNET)))
    private var currentAccount: AptosAccount? = null
    
    // V2 Contract Address
    private val contractAddress = "0xba20b2115d382c7d8bbe01cc59fe7e33ab43c1c8853cfa9ff573ac8d383c91db"

    // ✅ CORRECT: Open LONG position
    fun openLong(onResult: (Result<String>) -> Unit) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val module = "$contractAddress::bucket_protocol::open_long"

                val result = executeOnChain(
                    module,
                    typeArgs = null,
                    funArgs = functionArguments {
                        +U64(0u) // bucket_id = 0 (the default bucket)
                    },
                    transactionAmount = "1.0" // Will lock 1 APT margin
                )

                result.fold(
                    onSuccess = { message ->
                        _uiState.value = _uiState.value.copy(isLoading = false, error = null)
                        refreshBalance()
                        onResult(Result.success(message))
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(isLoading = false, error = error.message)
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

    // ✅ CORRECT: Open SHORT position
    fun openShort(onResult: (Result<String>) -> Unit) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val module = "$contractAddress::bucket_protocol::open_short"

                val result = executeOnChain(
                    module,
                    typeArgs = null,
                    funArgs = functionArguments {
                        +U64(0u) // bucket_id = 0 (the default bucket)
                    },
                    transactionAmount = "1.0" // Will lock 1 APT margin
                )

                result.fold(
                    onSuccess = { message ->
                        _uiState.value = _uiState.value.copy(isLoading = false, error = null)
                        refreshBalance()
                        onResult(Result.success(message))
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(isLoading = false, error = error.message)
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

    // ✅ CORRECT: Close position - ONLY 1 argument!
    fun closePosition(
        positionId: Long,
        onResult: (Result<String>) -> Unit
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val module = "$contractAddress::bucket_protocol::close_position"

                val result = executeOnChain(
                    module,
                    typeArgs = null,
                    funArgs = functionArguments {
                        +U64(positionId.toULong()) // ✅ ONLY position_id!
                    },
                )

                result.fold(
                    onSuccess = { message ->
                        _uiState.value = _uiState.value.copy(isLoading = false, error = null)
                        refreshBalance()
                        onResult(Result.success(message))
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(isLoading = false, error = error.message)
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

    // ✅ NEW: Get user's active position IDs
    suspend fun getMyActivePositions(): List<Long> {
        return try {
            val userAddress = currentAccount?.accountAddress?.toString() 
                ?: return emptyList()

            // Get total position count
            val countResult = aptos.view(
                ViewRequest(
                    function = "$contractAddress::bucket_protocol::get_position_count",
                    typeArguments = emptyList(),
                    functionArguments = listOf(contractAddress)
                )
            )
            val totalPositions = (countResult[0] as String).toLongOrNull() ?: 0

            val activePositions = mutableListOf<Long>()

            // Find user's active positions
            for (positionId in 0 until totalPositions) {
                try {
                    val details = aptos.view(
                        ViewRequest(
                            function = "$contractAddress::bucket_protocol::get_position_details",
                            typeArguments = emptyList(),
                            functionArguments = listOf(contractAddress, positionId.toString())
                        )
                    )

                    val owner = details[4] as String
                    val active = details[5] as Boolean

                    if (owner.equals(userAddress, ignoreCase = true) && active) {
                        activePositions.add(positionId)
                    }
                } catch (e: Exception) {
                    println("Error checking position $positionId: ${e.message}")
                }
            }

            activePositions
        } catch (e: Exception) {
            println("Error getting positions: ${e.message}")
            emptyList()
        }
    }

    // ✅ REMOVE THESE - Not needed for V2:
    // - initializeBundle() - Already done once by protocol deployer
    // - depositCollateral() - Not needed, open_long/short handles it
    // - createBucket() - Already created on init
    // - updateOracle() - Only protocol owner can call this
}
