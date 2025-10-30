package com.aptpays.services

import com.aptos.Aptos
import com.aptos.AptosConfig
import com.aptos.Network
import com.aptos.Account
import com.aptos.Ed25519PrivateKey
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable

/**
 * Cresca Bucket Protocol Integration
 * 
 * Deployed Contract: 0x5f971a43ff0c97789f67dc7f75a9fba019695943e0ecebbb81adc851eaa0a36f::bucket_protocol
 * Network: Aptos Testnet
 */
class CrescaBucketService(
    private val contractAddress: String = "0x5f971a43ff0c97789f67dc7f75a9fba019695943e0ecebbb81adc851eaa0a36f",
    network: Network = Network.TESTNET
) {
    private val aptos = Aptos(AptosConfig(network))

    /**
     * Deposit collateral for trading
     * @param privateKey User's private key
     * @param amountAPT Amount in APT (will be converted to Octas)
     */
    suspend fun depositCollateral(
        privateKey: String,
        amountAPT: Double
    ): TransactionResult = withContext(Dispatchers.IO) {
        try {
            val account = Account.fromPrivateKey(Ed25519PrivateKey(privateKey))
            val amountOctas = (amountAPT * 100_000_000).toLong()
            
            val transaction = aptos.transaction.build.simple(
                sender = account.accountAddress,
                data = TransactionData(
                    function = "$contractAddress::bucket_protocol::deposit_collateral",
                    typeArguments = emptyList(),
                    functionArguments = listOf(amountOctas.toString())
                )
            )
            
            val committedTxn = aptos.signAndSubmitTransaction(
                signer = account,
                transaction = transaction
            )
            
            aptos.waitForTransaction(committedTxn.hash)
            
            TransactionResult(
                success = true,
                txHash = committedTxn.hash,
                message = "Deposited ${amountAPT} APT"
            )
        } catch (e: Exception) {
            TransactionResult(
                success = false,
                error = e.message ?: "Unknown error"
            )
        }
    }

    /**
     * Create a new bucket with custom asset allocation
     * @param privateKey User's private key
     * @param assets List of asset addresses (e.g., ["0x1"] for APT)
     * @param weights Allocation weights (must sum to 100)
     * @param leverage Leverage multiplier (1-20)
     */
    suspend fun createBucket(
        privateKey: String,
        assets: List<String>,
        weights: List<Long>,
        leverage: Int
    ): TransactionResult = withContext(Dispatchers.IO) {
        try {
            require(assets.size == weights.size) { "Assets and weights must have same length" }
            require(leverage in 1..20) { "Leverage must be between 1 and 20" }
            require(weights.sum() == 100L) { "Weights must sum to 100" }
            
            val account = Account.fromPrivateKey(Ed25519PrivateKey(privateKey))
            
            val transaction = aptos.transaction.build.simple(
                sender = account.accountAddress,
                data = TransactionData(
                    function = "$contractAddress::bucket_protocol::create_bucket",
                    typeArguments = emptyList(),
                    functionArguments = listOf(
                        assets,
                        weights.map { it.toString() },
                        leverage.toString()
                    )
                )
            )
            
            val committedTxn = aptos.signAndSubmitTransaction(
                signer = account,
                transaction = transaction
            )
            
            aptos.waitForTransaction(committedTxn.hash)
            
            TransactionResult(
                success = true,
                txHash = committedTxn.hash,
                message = "Bucket created with ${leverage}x leverage"
            )
        } catch (e: Exception) {
            TransactionResult(
                success = false,
                error = e.message ?: "Unknown error"
            )
        }
    }

    /**
     * Update oracle prices (for testing)
     * @param privateKey User's private key
     * @param prices List of prices in USD cents (e.g., [1000] = $10.00)
     */
    suspend fun updateOracle(
        privateKey: String,
        prices: List<Long>
    ): TransactionResult = withContext(Dispatchers.IO) {
        try {
            val account = Account.fromPrivateKey(Ed25519PrivateKey(privateKey))
            
            val transaction = aptos.transaction.build.simple(
                sender = account.accountAddress,
                data = TransactionData(
                    function = "$contractAddress::bucket_protocol::update_oracle",
                    typeArguments = emptyList(),
                    functionArguments = listOf(prices.map { it.toString() })
                )
            )
            
            val committedTxn = aptos.signAndSubmitTransaction(
                signer = account,
                transaction = transaction
            )
            
            aptos.waitForTransaction(committedTxn.hash)
            
            TransactionResult(
                success = true,
                txHash = committedTxn.hash,
                message = "Oracle updated with ${prices.size} prices"
            )
        } catch (e: Exception) {
            TransactionResult(
                success = false,
                error = e.message ?: "Unknown error"
            )
        }
    }

    /**
     * Open a leveraged position
     * @param privateKey User's private key
     * @param bucketId Which bucket to trade
     * @param isLong true = LONG (bet price goes up), false = SHORT (bet price goes down)
     * @param marginAPT Collateral amount in APT
     */
    suspend fun openPosition(
        privateKey: String,
        bucketId: Long,
        isLong: Boolean,
        marginAPT: Double
    ): TransactionResult = withContext(Dispatchers.IO) {
        try {
            val account = Account.fromPrivateKey(Ed25519PrivateKey(privateKey))
            val marginOctas = (marginAPT * 100_000_000).toLong()
            
            val transaction = aptos.transaction.build.simple(
                sender = account.accountAddress,
                data = TransactionData(
                    function = "$contractAddress::bucket_protocol::open_position",
                    typeArguments = emptyList(),
                    functionArguments = listOf(
                        bucketId.toString(),
                        isLong.toString(),
                        marginOctas.toString()
                    )
                )
            )
            
            val committedTxn = aptos.signAndSubmitTransaction(
                signer = account,
                transaction = transaction
            )
            
            aptos.waitForTransaction(committedTxn.hash)
            
            val direction = if (isLong) "LONG" else "SHORT"
            TransactionResult(
                success = true,
                txHash = committedTxn.hash,
                message = "Opened $direction position with ${marginAPT} APT margin"
            )
        } catch (e: Exception) {
            TransactionResult(
                success = false,
                error = e.message ?: "Unknown error"
            )
        }
    }

    /**
     * Close a position and realize P&L
     * @param privateKey User's private key
     * @param positionId Position to close
     */
    suspend fun closePosition(
        privateKey: String,
        positionId: Long
    ): TransactionResult = withContext(Dispatchers.IO) {
        try {
            val account = Account.fromPrivateKey(Ed25519PrivateKey(privateKey))
            
            val transaction = aptos.transaction.build.simple(
                sender = account.accountAddress,
                data = TransactionData(
                    function = "$contractAddress::bucket_protocol::close_position",
                    typeArguments = emptyList(),
                    functionArguments = listOf(positionId.toString())
                )
            )
            
            val committedTxn = aptos.signAndSubmitTransaction(
                signer = account,
                transaction = transaction
            )
            
            aptos.waitForTransaction(committedTxn.hash)
            
            TransactionResult(
                success = true,
                txHash = committedTxn.hash,
                message = "Position #$positionId closed"
            )
        } catch (e: Exception) {
            TransactionResult(
                success = false,
                error = e.message ?: "Unknown error"
            )
        }
    }

    /**
     * Get collateral balance
     */
    suspend fun getCollateralBalance(address: String): Double = withContext(Dispatchers.IO) {
        try {
            val result = aptos.view(
                ViewRequest(
                    function = "$contractAddress::bucket_protocol::get_collateral_balance",
                    typeArguments = emptyList(),
                    arguments = listOf(address)
                )
            )
            val octas = result[0].toString().toLongOrNull() ?: 0L
            octas / 100_000_000.0
        } catch (e: Exception) {
            0.0
        }
    }

    /**
     * Get number of buckets created
     */
    suspend fun getBucketCount(address: String): Long = withContext(Dispatchers.IO) {
        try {
            val result = aptos.view(
                ViewRequest(
                    function = "$contractAddress::bucket_protocol::get_bucket_count",
                    typeArguments = emptyList(),
                    arguments = listOf(address)
                )
            )
            result[0].toString().toLongOrNull() ?: 0L
        } catch (e: Exception) {
            0L
        }
    }

    /**
     * Get number of positions opened
     */
    suspend fun getPositionCount(address: String): Long = withContext(Dispatchers.IO) {
        try {
            val result = aptos.view(
                ViewRequest(
                    function = "$contractAddress::bucket_protocol::get_position_count",
                    typeArguments = emptyList(),
                    arguments = listOf(address)
                )
            )
            result[0].toString().toLongOrNull() ?: 0L
        } catch (e: Exception) {
            0L
        }
    }

    /**
     * Get position details
     */
    suspend fun getPositionDetails(
        address: String,
        positionId: Long
    ): PositionDetails? = withContext(Dispatchers.IO) {
        try {
            val result = aptos.view(
                ViewRequest(
                    function = "$contractAddress::bucket_protocol::get_position_details",
                    typeArguments = emptyList(),
                    arguments = listOf(address, positionId.toString())
                )
            )
            
            PositionDetails(
                bucketId = result[0].toString().toLong(),
                isLong = result[1].toString().toBoolean(),
                marginOctas = result[2].toString().toLong(),
                entryPrice = result[3].toString().toLong(),
                active = result[4].toString().toBoolean()
            )
        } catch (e: Exception) {
            null
        }
    }
}

// Data classes
@Serializable
data class TransactionResult(
    val success: Boolean,
    val txHash: String? = null,
    val message: String? = null,
    val error: String? = null
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
}

data class TransactionData(
    val function: String,
    val typeArguments: List<String>,
    val functionArguments: List<Any>
)

data class ViewRequest(
    val function: String,
    val typeArguments: List<String>,
    val arguments: List<String>
)
