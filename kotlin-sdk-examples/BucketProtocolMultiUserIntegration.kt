package com.aptpays.bucket

import com.aptos.Aptos
import com.aptos.AptosConfig
import com.aptos.Network
import com.aptos.request.buildTransaction
import com.aptos.request.inputEntryFunctionData
import com.aptos.request.inputViewFunctionData
import com.aptos.request.waitForTransaction
import com.aptos.transaction.authenticator.account.SingleKeyAccount
import com.aptos.utils.MoveString
import com.aptos.utils.U64
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CRESCA BUCKET PROTOCOL - MULTI-USER VERSION
 * Kotlin Integration for Changed Functions Only
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * ⚠️ CRITICAL CHANGE: Multi-User Architecture
 * 
 * OLD ARCHITECTURE (Single-User):
 * - Each user had their own Protocol storage at their address
 * - Functions used: borrow_global_mut<Protocol>(user_address)
 * - Isolated collateral pools per user
 * 
 * NEW ARCHITECTURE (Multi-User):
 * - Single shared Protocol storage at PROTOCOL_ADDRESS
 * - Functions use: borrow_global_mut<Protocol>(PROTOCOL_ADDRESS)
 * - Shared collateral pool across all users
 * - Individual position ownership tracked via Position.owner field
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */
class BucketProtocolMultiUserSDK(
    private val aptos: Aptos,
    private val account: SingleKeyAccount
) {
    
    companion object {
        // Contract Address - Shared Protocol Storage Location
        const val CONTRACT_ADDRESS = "0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b"
        const val MODULE_NAME = "bucket_protocol"
        
        // Hardcoded Protocol Constants
        const val PROTOCOL_ADDRESS = "0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b"
        const val DEFAULT_MARGIN_OCTAS = 100_000_000L // 1 APT
        const val OCTAS_PER_APT = 100_000_000L
        
        fun create(privateKeyHex: String, network: Network = Network.TESTNET): BucketProtocolMultiUserSDK {
            val config = AptosConfig.Builder().network(network).build()
            val aptos = Aptos(config)
            val account = SingleKeyAccount.fromPrivateKey(privateKeyHex)
            return BucketProtocolMultiUserSDK(aptos, account)
        }
    }
    
    // Result wrapper
    data class TransactionResult(
        val success: Boolean,
        val txHash: String? = null,
        val error: String? = null,
        val gasUsed: Long? = null
    )
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CHANGED FUNCTION #1: deposit_collateral()
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Deposit APT collateral to SHARED PROTOCOL POOL
     * 
     * 🔄 CHANGE SUMMARY:
     * - OLD: Deposited to user's own Protocol storage
     *   Code: `borrow_global_mut<Protocol>(signer::address_of(owner))`
     * 
     * - NEW: Deposits to shared Protocol at PROTOCOL_ADDRESS
     *   Code: `borrow_global_mut<Protocol>(PROTOCOL_ADDRESS)`
     * 
     * ⚠️ IMPACT:
     * - All users now share the same collateral pool
     * - Collateral balance is global, not per-user
     * - Any user can use the shared collateral to open positions
     * 
     * MOVE FUNCTION SIGNATURE:
     * ```move
     * public entry fun deposit_collateral(owner: &signer, amount: u64) acquires Protocol
     * ```
     * 
     * @param amountAPT Amount to deposit in APT (e.g., 5.0 = 5 APT)
     * 
     * PARAMETERS PASSED TO BLOCKCHAIN:
     * - owner: &signer - Automatically provided by transaction signer
     * - amount: u64 - APT amount converted to octas (amountAPT * 100_000_000)
     * 
     * EXAMPLE:
     * ```kotlin
     * val result = depositCollateral(5.0)  // Deposit 5 APT
     * if (result.success) {
     *     println("Deposited to shared pool: ${result.txHash}")
     * }
     * ```
     */
    suspend fun depositCollateral(amountAPT: Double): TransactionResult = withContext(Dispatchers.IO) {
        return@withContext try {
            // Convert APT to octas (1 APT = 100,000,000 octas)
            val amountOctas = (amountAPT * OCTAS_PER_APT).toLong()
            
            // Build transaction
            val transaction = aptos.buildTransaction(
                sender = account.accountAddress,
                data = inputEntryFunctionData {
                    function = "$CONTRACT_ADDRESS::$MODULE_NAME::deposit_collateral"
                    functionArguments {
                        +U64(amountOctas.toULong())  // amount: u64
                    }
                }
            )
            
            // Sign and submit
            val signedTx = account.signTransaction(transaction)
            val response = aptos.submitTransaction(signedTx)
            aptos.waitForTransaction(response.hash)
            
            TransactionResult(
                success = true,
                txHash = response.hash,
                error = null
            )
        } catch (e: Exception) {
            TransactionResult(
                success = false,
                error = "Deposit failed: ${e.message}"
            )
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CHANGED FUNCTION #2: open_long()
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Open LONG position (bet crypto basket price goes UP)
     * 
     * 🔄 CHANGE SUMMARY:
     * - OLD: Accessed user's own Protocol storage
     *   Code: `borrow_global_mut<Protocol>(signer::address_of(owner))`
     * 
     * - NEW: Accesses shared Protocol at PROTOCOL_ADDRESS
     *   Code: `borrow_global_mut<Protocol>(PROTOCOL_ADDRESS)`
     *   Tracks user ownership: `owner: user_addr` in Position struct
     * 
     * ⚠️ IMPACT:
     * - Uses shared collateral pool (deducts 1 APT from global balance)
     * - Position ownership tracked via Position.owner field
     * - Multiple users can open positions simultaneously
     * 
     * MOVE FUNCTION SIGNATURE:
     * ```move
     * public entry fun open_long(owner: &signer, bucket_id: u64) acquires Protocol
     * ```
     * 
     * INTERNAL BEHAVIOR:
     * - Automatically deducts DEFAULT_MARGIN (1 APT = 100,000,000 octas)
     * - Records entry_price as weighted average of BTC/ETH/SOL (50/30/20)
     * - Creates Position with owner = user's address
     * 
     * @param bucketId Index of bucket to trade (usually 0 for BTC/ETH/SOL basket)
     * 
     * PARAMETERS PASSED TO BLOCKCHAIN:
     * - owner: &signer - Transaction signer (automatically provided)
     * - bucket_id: u64 - Bucket index (default: 0)
     * 
     * EXAMPLE:
     * ```kotlin
     * val result = openLongPosition(bucketId = 0)
     * if (result.success) {
     *     println("LONG position opened: ${result.txHash}")
     *     println("Used 1 APT margin from shared pool")
     * }
     * ```
     */
    suspend fun openLongPosition(bucketId: Int = 0): TransactionResult = withContext(Dispatchers.IO) {
        return@withContext try {
            val transaction = aptos.buildTransaction(
                sender = account.accountAddress,
                data = inputEntryFunctionData {
                    function = "$CONTRACT_ADDRESS::$MODULE_NAME::open_long"
                    functionArguments {
                        +U64(bucketId.toULong())  // bucket_id: u64
                    }
                }
            )
            
            val signedTx = account.signTransaction(transaction)
            val response = aptos.submitTransaction(signedTx)
            aptos.waitForTransaction(response.hash)
            
            TransactionResult(
                success = true,
                txHash = response.hash,
                error = null
            )
        } catch (e: Exception) {
            TransactionResult(
                success = false,
                error = "LONG position failed: ${e.message}"
            )
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CHANGED FUNCTION #3: open_short()
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Open SHORT position (bet crypto basket price goes DOWN)
     * 
     * 🔄 CHANGE SUMMARY:
     * - OLD: Accessed user's own Protocol storage
     * - NEW: Accesses shared Protocol at PROTOCOL_ADDRESS
     * 
     * ⚠️ IMPACT: Same as open_long() - shared pool, user ownership tracked
     * 
     * MOVE FUNCTION SIGNATURE:
     * ```move
     * public entry fun open_short(owner: &signer, bucket_id: u64) acquires Protocol
     * ```
     * 
     * @param bucketId Index of bucket to trade (usually 0)
     * 
     * PARAMETERS PASSED TO BLOCKCHAIN:
     * - owner: &signer - Transaction signer
     * - bucket_id: u64 - Bucket index
     * 
     * EXAMPLE:
     * ```kotlin
     * val result = openShortPosition(bucketId = 0)
     * if (result.success) {
     *     println("SHORT position opened: ${result.txHash}")
     * }
     * ```
     */
    suspend fun openShortPosition(bucketId: Int = 0): TransactionResult = withContext(Dispatchers.IO) {
        return@withContext try {
            val transaction = aptos.buildTransaction(
                sender = account.accountAddress,
                data = inputEntryFunctionData {
                    function = "$CONTRACT_ADDRESS::$MODULE_NAME::open_short"
                    functionArguments {
                        +U64(bucketId.toULong())  // bucket_id: u64
                    }
                }
            )
            
            val signedTx = account.signTransaction(transaction)
            val response = aptos.submitTransaction(signedTx)
            aptos.waitForTransaction(response.hash)
            
            TransactionResult(
                success = true,
                txHash = response.hash,
                error = null
            )
        } catch (e: Exception) {
            TransactionResult(
                success = false,
                error = "SHORT position failed: ${e.message}"
            )
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CHANGED FUNCTION #4: close_position()
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Close position and realize profit/loss
     * 
     * 🔄 CHANGE SUMMARY:
     * - OLD: Accessed user's own Protocol storage
     *   Code: `borrow_global_mut<Protocol>(signer::address_of(owner))`
     * 
     * - NEW: Accesses shared Protocol at PROTOCOL_ADDRESS
     *   Code: `borrow_global_mut<Protocol>(PROTOCOL_ADDRESS)`
     *   Verifies: `assert!(position.owner == user_addr, EPERMISSION_DENIED)`
     * 
     * ⚠️ IMPACT:
     * - Returns margin + P&L to shared collateral pool
     * - Only position owner can close their position (ownership check added)
     * - P&L calculation uses leverage from bucket
     * 
     * MOVE FUNCTION SIGNATURE:
     * ```move
     * public entry fun close_position(owner: &signer, position_id: u64) acquires Protocol
     * ```
     * 
     * INTERNAL BEHAVIOR:
     * 1. Verifies caller owns the position
     * 2. Calculates P&L: (exit_price - entry_price) * margin * leverage / entry_price
     * 3. Returns final_amount to shared collateral pool
     * 4. Marks position as inactive
     * 
     * @param positionId Index of position to close (0, 1, 2...)
     * 
     * PARAMETERS PASSED TO BLOCKCHAIN:
     * - owner: &signer - Must be position owner
     * - position_id: u64 - Position index
     * 
     * EXAMPLE:
     * ```kotlin
     * val result = closePosition(positionId = 0)
     * if (result.success) {
     *     println("Position closed: ${result.txHash}")
     *     println("P&L returned to shared pool")
     * }
     * ```
     */
    suspend fun closePosition(positionId: Int): TransactionResult = withContext(Dispatchers.IO) {
        return@withContext try {
            val transaction = aptos.buildTransaction(
                sender = account.accountAddress,
                data = inputEntryFunctionData {
                    function = "$CONTRACT_ADDRESS::$MODULE_NAME::close_position"
                    functionArguments {
                        +U64(positionId.toULong())  // position_id: u64
                    }
                }
            )
            
            val signedTx = account.signTransaction(transaction)
            val response = aptos.submitTransaction(signedTx)
            aptos.waitForTransaction(response.hash)
            
            TransactionResult(
                success = true,
                txHash = response.hash,
                error = null
            )
        } catch (e: Exception) {
            TransactionResult(
                success = false,
                error = "Close position failed: ${e.message}"
            )
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CHANGED FUNCTION #5: update_oracle()
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Update oracle prices for BTC/ETH/SOL (Oracle Service Only)
     * 
     * 🔄 CHANGE SUMMARY:
     * - OLD: Updated prices in user's own Protocol storage
     * - NEW: Updates shared Protocol prices at PROTOCOL_ADDRESS
     * 
     * ⚠️ IMPACT:
     * - Single global price feed for all users
     * - All positions use same oracle prices
     * - Weighted price = (BTC*50 + ETH*30 + SOL*20) / 100
     * 
     * MOVE FUNCTION SIGNATURE:
     * ```move
     * public entry fun update_oracle(
     *     _oracle: &signer,
     *     btc_price: u64,
     *     eth_price: u64,
     *     sol_price: u64
     * ) acquires Protocol
     * ```
     * 
     * PRICE FORMAT:
     * - Prices in CENTS (not dollars)
     * - BTC $50,000 = 5,000,000
     * - ETH $3,500 = 350,000
     * - SOL $100 = 10,000
     * 
     * @param btcPriceCents Bitcoin price in cents
     * @param ethPriceCents Ethereum price in cents
     * @param solPriceCents Solana price in cents
     * 
     * PARAMETERS PASSED TO BLOCKCHAIN:
     * - _oracle: &signer - Oracle service signer
     * - btc_price: u64 - BTC price in cents
     * - eth_price: u64 - ETH price in cents
     * - sol_price: u64 - SOL price in cents
     * 
     * EXAMPLE:
     * ```kotlin
     * val result = updateOraclePrices(
     *     btcPriceCents = 5_000_000,  // $50,000
     *     ethPriceCents = 350_000,    // $3,500
     *     solPriceCents = 10_000      // $100
     * )
     * ```
     */
    suspend fun updateOraclePrices(
        btcPriceCents: Long,
        ethPriceCents: Long,
        solPriceCents: Long
    ): TransactionResult = withContext(Dispatchers.IO) {
        return@withContext try {
            val transaction = aptos.buildTransaction(
                sender = account.accountAddress,
                data = inputEntryFunctionData {
                    function = "$CONTRACT_ADDRESS::$MODULE_NAME::update_oracle"
                    functionArguments {
                        +U64(btcPriceCents.toULong())  // btc_price: u64
                        +U64(ethPriceCents.toULong())  // eth_price: u64
                        +U64(solPriceCents.toULong())  // sol_price: u64
                    }
                }
            )
            
            val signedTx = account.signTransaction(transaction)
            val response = aptos.submitTransaction(signedTx)
            aptos.waitForTransaction(response.hash)
            
            TransactionResult(
                success = true,
                txHash = response.hash,
                error = null
            )
        } catch (e: Exception) {
            TransactionResult(
                success = false,
                error = "Oracle update failed: ${e.message}"
            )
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CHANGED VIEW FUNCTIONS (All read from PROTOCOL_ADDRESS)
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Get SHARED collateral balance (global pool, not per-user)
     * 
     * 🔄 CHANGE: Now reads from PROTOCOL_ADDRESS instead of user address
     * OLD: `borrow_global<Protocol>(addr).collateral_balance`
     * NEW: `borrow_global<Protocol>(PROTOCOL_ADDRESS).collateral_balance`
     * 
     * MOVE FUNCTION SIGNATURE:
     * ```move
     * #[view]
     * public fun get_collateral_balance(_addr: address): u64 acquires Protocol
     * ```
     * 
     * NOTE: _addr parameter is IGNORED in multi-user version
     * 
     * @return Collateral balance in octas (divide by 100_000_000 for APT)
     */
    suspend fun getCollateralBalance(): Long? = withContext(Dispatchers.IO) {
        return@withContext try {
            val response = aptos.view(
                payload = inputViewFunctionData {
                    function = "$CONTRACT_ADDRESS::$MODULE_NAME::get_collateral_balance"
                    functionArguments {
                        +MoveString(account.accountAddress.toString())  // Ignored parameter
                    }
                }
            )
            (response[0] as String).toLong()
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Get TOTAL bucket count (shared across all users)
     * 
     * 🔄 CHANGE: Reads from PROTOCOL_ADDRESS
     * 
     * @return Number of buckets created
     */
    suspend fun getBucketCount(): Long? = withContext(Dispatchers.IO) {
        return@withContext try {
            val response = aptos.view(
                payload = inputViewFunctionData {
                    function = "$CONTRACT_ADDRESS::$MODULE_NAME::get_bucket_count"
                    functionArguments {
                        +MoveString(account.accountAddress.toString())
                    }
                }
            )
            (response[0] as String).toLong()
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Get TOTAL position count (all users, not just caller)
     * 
     * 🔄 CHANGE: Returns global position count from PROTOCOL_ADDRESS
     * 
     * @return Total number of positions opened by all users
     */
    suspend fun getPositionCount(): Long? = withContext(Dispatchers.IO) {
        return@withContext try {
            val response = aptos.view(
                payload = inputViewFunctionData {
                    function = "$CONTRACT_ADDRESS::$MODULE_NAME::get_position_count"
                    functionArguments {
                        +MoveString(account.accountAddress.toString())
                    }
                }
            )
            (response[0] as String).toLong()
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Get position details by ID
     * 
     * 🔄 CHANGE: Reads from PROTOCOL_ADDRESS
     * Position ownership tracked via Position.owner field
     * 
     * MOVE FUNCTION SIGNATURE:
     * ```move
     * #[view]
     * public fun get_position_details(_addr: address, position_id: u64): 
     *     (u64, bool, u64, u64, bool) acquires Protocol
     * ```
     * 
     * RETURN VALUES:
     * - bucket_id: u64 - Which bucket this position trades
     * - is_long: bool - true = LONG, false = SHORT
     * - margin: u64 - Collateral amount (100,000,000 octas = 1 APT)
     * - entry_price: u64 - Weighted average price at open
     * - active: bool - true = open, false = closed
     * 
     * @param positionId Position index
     * @return Tuple of (bucketId, isLong, margin, entryPrice, active)
     */
    suspend fun getPositionDetails(positionId: Int): PositionDetails? = withContext(Dispatchers.IO) {
        return@withContext try {
            val response = aptos.view(
                payload = inputViewFunctionData {
                    function = "$CONTRACT_ADDRESS::$MODULE_NAME::get_position_details"
                    functionArguments {
                        +MoveString(account.accountAddress.toString())
                        +U64(positionId.toULong())
                    }
                }
            )
            
            PositionDetails(
                bucketId = (response[0] as String).toLong(),
                isLong = (response[1] as String).toBoolean(),
                margin = (response[2] as String).toLong(),
                entryPrice = (response[3] as String).toLong(),
                active = (response[4] as String).toBoolean()
            )
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Get current oracle prices [BTC, ETH, SOL]
     * 
     * 🔄 CHANGE: Reads from PROTOCOL_ADDRESS (single global price feed)
     * 
     * @return List of [btcPriceCents, ethPriceCents, solPriceCents]
     */
    suspend fun getOraclePrices(): List<Long>? = withContext(Dispatchers.IO) {
        return@withContext try {
            val response = aptos.view(
                payload = inputViewFunctionData {
                    function = "$CONTRACT_ADDRESS::$MODULE_NAME::get_oracle_prices"
                    functionArguments {
                        +MoveString(account.accountAddress.toString())
                    }
                }
            )
            
            @Suppress("UNCHECKED_CAST")
            (response[0] as List<String>).map { it.toLong() }
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Get last oracle update timestamp
     * 
     * 🔄 CHANGE: Reads from PROTOCOL_ADDRESS
     * 
     * @return Unix timestamp of last price update
     */
    suspend fun getLastOracleUpdate(): Long? = withContext(Dispatchers.IO) {
        return@withContext try {
            val response = aptos.view(
                payload = inputViewFunctionData {
                    function = "$CONTRACT_ADDRESS::$MODULE_NAME::get_last_oracle_update"
                    functionArguments {
                        +MoveString(account.accountAddress.toString())
                    }
                }
            )
            (response[0] as String).toLong()
        } catch (e: Exception) {
            null
        }
    }
    
    // Data class for position details
    data class PositionDetails(
        val bucketId: Long,
        val isLong: Boolean,
        val margin: Long,
        val entryPrice: Long,
        val active: Boolean
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
// USAGE EXAMPLE
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Example usage of the multi-user bucket protocol SDK
 * 
 * ```kotlin
 * fun main() = runBlocking {
 *     val privateKey = "0x40daf4e4316a895eec706d88006d6a3ba75f22b01f0b4390556d679101d6e309"
 *     val sdk = BucketProtocolMultiUserSDK.create(privateKey, Network.TESTNET)
 *     
 *     // 1. Deposit to shared pool
 *     val depositResult = sdk.depositCollateral(5.0)  // 5 APT
 *     println("Deposit: ${depositResult.txHash}")
 *     
 *     // 2. Update oracle (if you're oracle service)
 *     sdk.updateOraclePrices(
 *         btcPriceCents = 5_000_000,  // $50,000
 *         ethPriceCents = 350_000,    // $3,500
 *         solPriceCents = 10_000      // $100
 *     )
 *     
 *     // 3. Open LONG position (uses 1 APT from shared pool)
 *     val longResult = sdk.openLongPosition(bucketId = 0)
 *     println("LONG opened: ${longResult.txHash}")
 *     
 *     // 4. Check position details
 *     val position = sdk.getPositionDetails(0)
 *     println("Position 0: isLong=${position?.isLong}, entry=${position?.entryPrice}")
 *     
 *     // 5. Close position
 *     val closeResult = sdk.closePosition(0)
 *     println("Position closed: ${closeResult.txHash}")
 *     
 *     // 6. Check shared collateral balance
 *     val balance = sdk.getCollateralBalance()
 *     println("Shared pool balance: ${balance?.div(100_000_000)} APT")
 * }
 * ```
 */
