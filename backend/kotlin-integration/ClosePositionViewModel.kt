// Complete ViewModel for closing positions with Aptos SDK
package com.aptpays.cresca.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aptpays.cresca.api.CrescaApiClient
import com.aptos.android.AptosClient
import com.aptos.android.Account
import com.aptos.android.Network
import com.aptos.android.RawTransaction
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * ViewModel for managing position close operations
 */
class ClosePositionViewModel : ViewModel() {
    
    private val apiClient = CrescaApiClient()
    private val aptosClient = AptosClient(Network.TESTNET)
    
    private val _state = MutableStateFlow<ClosePositionState>(ClosePositionState.Idle)
    val state: StateFlow<ClosePositionState> = _state.asStateFlow()
    
    /**
     * Close a position with multi-agent signature
     * @param positionId The position ID to close
     * @param userAccount The user's Aptos account with private key
     */
    fun closePosition(positionId: Long, userAccount: Account) {
        viewModelScope.launch {
            try {
                _state.value = ClosePositionState.Loading("Requesting protocol signature...")
                
                // Step 1: Call API to get raw transaction and protocol signature
                val apiResult = apiClient.closePosition(
                    positionId = positionId,
                    userAddress = userAccount.address.toString()
                )
                
                if (apiResult.isFailure) {
                    _state.value = ClosePositionState.Error(
                        apiResult.exceptionOrNull()?.message ?: "API request failed"
                    )
                    return@launch
                }
                
                val response = apiResult.getOrThrow()
                
                _state.value = ClosePositionState.Loading("Signing transaction...")
                
                // Step 2: Deserialize raw transaction from API
                val rawTxnBytes = hexToBytes(response.rawTransaction)
                val rawTransaction = RawTransaction.deserialize(rawTxnBytes)
                
                // Step 3: Sign with user account
                val userSignature = userAccount.sign(rawTransaction)
                
                // Step 4: Parse protocol signature from API
                val protocolPublicKey = hexToBytes(response.protocolSignature.public_key)
                val protocolSignatureBytes = hexToBytes(response.protocolSignature.signature)
                
                _state.value = ClosePositionState.Loading("Submitting transaction...")
                
                // Step 5: Submit multi-agent transaction
                val txHash = aptosClient.submitMultiAgentTransaction(
                    rawTransaction = rawTransaction,
                    senderSignature = userSignature,
                    secondarySignatures = listOf(
                        Pair(protocolPublicKey, protocolSignatureBytes)
                    )
                )
                
                // Step 6: Wait for transaction confirmation
                _state.value = ClosePositionState.Loading("Waiting for confirmation...")
                aptosClient.waitForTransaction(txHash)
                
                _state.value = ClosePositionState.Success(
                    transactionHash = txHash,
                    explorerUrl = "https://explorer.aptoslabs.com/txn/$txHash?network=testnet"
                )
                
            } catch (e: Exception) {
                _state.value = ClosePositionState.Error(e.message ?: "Unknown error")
            }
        }
    }
    
    fun resetState() {
        _state.value = ClosePositionState.Idle
    }
    
    private fun hexToBytes(hex: String): ByteArray {
        val cleanHex = hex.removePrefix("0x")
        return cleanHex.chunked(2)
            .map { it.toInt(16).toByte() }
            .toByteArray()
    }
}

/**
 * UI State for close position operation
 */
sealed class ClosePositionState {
    object Idle : ClosePositionState()
    data class Loading(val message: String) : ClosePositionState()
    data class Success(val transactionHash: String, val explorerUrl: String) : ClosePositionState()
    data class Error(val message: String) : ClosePositionState()
}
