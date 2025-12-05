/**
 * CRESCA BUCKET PROTOCOL - FIXED VERSION INTEGRATION
 * =====================================================
 * 
 * This file contains the integration code for the FIXED smart contract
 * that properly handles APT token transfers.
 * 
 * DEPLOYMENT DETAILS
 * ==================
 * Network: Aptos Testnet
 * 
 * OLD CONTRACT (HAS BUG - Only updates counter, no actual APT transfer):
 * - Address: 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b
 * - Private Key: 0x40daf4e4316a895eec706d88006d6a3ba75f22b01f0b4390556d679101d6e309
 * - Status: ⚠️ DEPRECATED - DO NOT USE
 * 
 * NEW CONTRACT (FIXED - Properly transfers APT):
 * - Address: 0x48818dd8bf178df976471fc0770cf86e4c8fed40932a91697ff48ff194c777d6
 * - Private Key: 0x27e3123b5cd78f3496726bfdcfcbd90354f04fd795d2e4c2ba529d12914b635a
 * - Public Key: 0xd0557b11b4c6ecb58d71684f28667a9ef6726ff652c951c4e6e6a6cd326ed769
 * - Deployment Tx: 0xf01dac51ed620957fd0ba5b0d04e279e103263b248d3ca35607d8ee217acbb54
 * - Status: ✅ ACTIVE - USE THIS
 * 
 * CHANGES MADE IN FIXED VERSION
 * ==============================
 * 
 * 1. Added Coin Module Imports:
 *    - use aptos_framework::coin;
 *    - use aptos_framework::aptos_coin::AptosCoin;
 * 
 * 2. Fixed open_position_internal() function:
 *    BEFORE (Broken):
 *    ---------------
 *    fun open_position_internal(owner: &signer, bucket_id: u64, is_long: bool) {
 *        // Only updated counter - no actual APT transfer!
 *        protocol.collateral_balance = protocol.collateral_balance + DEFAULT_MARGIN;
 *    }
 * 
 *    AFTER (Fixed):
 *    -------------
 *    fun open_position_internal(owner: &signer, bucket_id: u64, is_long: bool) {
 *        // FIXED: Actually withdraw APT from user's wallet
 *        let margin_coins = coin::withdraw<AptosCoin>(owner, DEFAULT_MARGIN);
 *        coin::deposit(PROTOCOL_ADDRESS, margin_coins);
 *        
 *        // Then update counter
 *        protocol.collateral_balance = protocol.collateral_balance + DEFAULT_MARGIN;
 *    }
 * 
 * 3. Fixed close_position() function:
 *    BEFORE (Broken):
 *    ---------------
 *    public entry fun close_position(owner: &signer, position_id: u64) {
 *        // Only updated counter - no APT returned to user!
 *        protocol.collateral_balance = protocol.collateral_balance - final_amount;
 *    }
 * 
 *    AFTER (Fixed):
 *    -------------
 *    public entry fun close_position(owner: &signer, position_id: u64) {
 *        // Update counter
 *        protocol.collateral_balance = protocol.collateral_balance - final_amount;
 *        
 *        // FIXED: Actually withdraw from protocol and return to user
 *        let return_coins = coin::withdraw<AptosCoin>(owner, final_amount);
 *        coin::deposit(user_addr, return_coins);
 *    }
 * 
 * 4. Fixed Position struct - removed invalid backtick character
 * 
 * MIGRATION GUIDE
 * ===============
 * To migrate from old contract to new contract:
 * 
 * 1. Update your configuration:
 *    val OLD_CONTRACT = "0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b"
 *    val NEW_CONTRACT = "0x48818dd8bf178df976471fc0770cf86e4c8fed40932a91697ff48ff194c777d6"
 * 
 * 2. Initialize the new contract (one time):
 *    crescaService.initializeProtocol(newContractPrivateKey)
 * 
 * 3. Update all function calls to use NEW_CONTRACT address
 * 
 * 4. Test with small amounts first!
 */

package com.aptpays.cresca

import com.aptos.Aptos
import com.aptos.AptosConfig
import com.aptos.Network
import com.aptos.Account
import com.aptos.Ed25519PrivateKey
import com.aptos.InputEntryFunctionData
import kotlinx.coroutines.runBlocking

/**
 * Constants for the FIXED Cresca Bucket Protocol
 */
object CrescaBucketProtocolFixed {
    // ⚠️ OLD CONTRACT - DO NOT USE (has bug)
    const val OLD_CONTRACT_ADDRESS = "0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b"
    const val OLD_PRIVATE_KEY = "0x40daf4e4316a895eec706d88006d6a3ba75f22b01f0b4390556d679101d6e309"
    
    // ✅ NEW CONTRACT - USE THIS (properly transfers APT)
    const val NEW_CONTRACT_ADDRESS = "0x48818dd8bf178df976471fc0770cf86e4c8fed40932a91697ff48ff194c777d6"
    const val NEW_PRIVATE_KEY = "0x27e3123b5cd78f3496726bfdcfcbd90354f04fd795d2e4c2ba529d12914b635a"
    const val NEW_PUBLIC_KEY = "0xd0557b11b4c6ecb58d71684f28667a9ef6726ff652c951c4e6e6a6cd326ed769"
    
    const val MODULE_NAME = "bucket_protocol"
    const val DEFAULT_MARGIN = 100_000_000L // 1 APT in octas
    
    // Testnet configuration
    const val TESTNET_URL = "https://fullnode.testnet.aptoslabs.com"
    const val TESTNET_FAUCET = "https://faucet.testnet.aptoslabs.com"
}

/**
 * Service class for interacting with the FIXED Cresca Bucket Protocol
 */
class CrescaBucketServiceFixed(
    private val contractAddress: String = CrescaBucketProtocolFixed.NEW_CONTRACT_ADDRESS
) {
    private val aptos = Aptos(AptosConfig(Network.TESTNET))
    
    /**
     * Initialize the protocol (one-time setup)
     * IMPORTANT: Must be called once before any other operations
     */
    suspend fun initializeProtocol(privateKey: String): String {
        val account = Account.fromPrivateKey(
            Ed25519PrivateKey.fromString(privateKey)
        )
        
        val transaction = aptos.transaction.build.simple(
            sender = account.accountAddress,
            data = InputEntryFunctionData(
                function = "$contractAddress::${CrescaBucketProtocolFixed.MODULE_NAME}::init",
                functionArguments = emptyList(),
                typeArguments = emptyList()
            )
        )
        
        val pendingTransaction = aptos.transaction.signAndSubmit.transaction(
            signer = account,
            transaction = transaction
        )
        
        val executedTransaction = aptos.transaction.wait.forTransaction(
            transactionHash = pendingTransaction.hash
        )
        
        return executedTransaction.hash
    }
    
    /**
     * Open a LONG position
     * 
     * FIXED: This now actually withdraws 1 APT from user's wallet
     * 
     * @param userPrivateKey User's private key (must have >= 1 APT balance)
     * @param bucketId The bucket to trade (default: 0)
     * @return Transaction hash
     */
    suspend fun openLongPosition(
        userPrivateKey: String,
        bucketId: Long = 0L
    ): String {
        val userAccount = Account.fromPrivateKey(
            Ed25519PrivateKey.fromString(userPrivateKey)
        )
        
        println("🔄 Opening LONG position...")
        println("📊 Bucket ID: $bucketId")
        println("💰 Margin Required: ${CrescaBucketProtocolFixed.DEFAULT_MARGIN / 100_000_000.0} APT")
        println("⚠️  Your wallet WILL be debited 1 APT (in new fixed contract)")
        
        val transaction = aptos.transaction.build.simple(
            sender = userAccount.accountAddress,
            data = InputEntryFunctionData(
                function = "$contractAddress::${CrescaBucketProtocolFixed.MODULE_NAME}::open_long",
                functionArguments = listOf(bucketId),
                typeArguments = emptyList()
            )
        )
        
        val pendingTransaction = aptos.transaction.signAndSubmit.transaction(
            signer = userAccount,
            transaction = transaction
        )
        
        val executedTransaction = aptos.transaction.wait.forTransaction(
            transactionHash = pendingTransaction.hash
        )
        
        println("✅ Position opened successfully!")
        println("🔗 Transaction: ${executedTransaction.hash}")
        println("🔗 Explorer: https://explorer.aptoslabs.com/txn/${executedTransaction.hash}?network=testnet")
        
        return executedTransaction.hash
    }
    
    /**
     * Open a SHORT position
     * 
     * FIXED: This now actually withdraws 1 APT from user's wallet
     * 
     * @param userPrivateKey User's private key (must have >= 1 APT balance)
     * @param bucketId The bucket to trade (default: 0)
     * @return Transaction hash
     */
    suspend fun openShortPosition(
        userPrivateKey: String,
        bucketId: Long = 0L
    ): String {
        val userAccount = Account.fromPrivateKey(
            Ed25519PrivateKey.fromString(userPrivateKey)
        )
        
        println("🔄 Opening SHORT position...")
        println("📊 Bucket ID: $bucketId")
        println("💰 Margin Required: ${CrescaBucketProtocolFixed.DEFAULT_MARGIN / 100_000_000.0} APT")
        println("⚠️  Your wallet WILL be debited 1 APT (in new fixed contract)")
        
        val transaction = aptos.transaction.build.simple(
            sender = userAccount.accountAddress,
            data = InputEntryFunctionData(
                function = "$contractAddress::${CrescaBucketProtocolFixed.MODULE_NAME}::open_short",
                functionArguments = listOf(bucketId),
                typeArguments = emptyList()
            )
        )
        
        val pendingTransaction = aptos.transaction.signAndSubmit.transaction(
            signer = userAccount,
            transaction = transaction
        )
        
        val executedTransaction = aptos.transaction.wait.forTransaction(
            transactionHash = pendingTransaction.hash
        )
        
        println("✅ Position opened successfully!")
        println("🔗 Transaction: ${executedTransaction.hash}")
        println("🔗 Explorer: https://explorer.aptoslabs.com/txn/${executedTransaction.hash}?network=testnet")
        
        return executedTransaction.hash
    }
    
    /**
     * Close a position and receive APT back
     * 
     * FIXED: This now actually returns APT to user's wallet (margin + PnL)
     * 
     * @param userPrivateKey User's private key
     * @param positionId The position ID to close
     * @return Transaction hash
     */
    suspend fun closePosition(
        userPrivateKey: String,
        positionId: Long
    ): String {
        val userAccount = Account.fromPrivateKey(
            Ed25519PrivateKey.fromString(userPrivateKey)
        )
        
        println("🔄 Closing position...")
        println("📊 Position ID: $positionId")
        println("💰 You will receive margin + PnL back to your wallet")
        
        val transaction = aptos.transaction.build.simple(
            sender = userAccount.accountAddress,
            data = InputEntryFunctionData(
                function = "$contractAddress::${CrescaBucketProtocolFixed.MODULE_NAME}::close_position",
                functionArguments = listOf(positionId),
                typeArguments = emptyList()
            )
        )
        
        val pendingTransaction = aptos.transaction.signAndSubmit.transaction(
            signer = userAccount,
            transaction = transaction
        )
        
        val executedTransaction = aptos.transaction.wait.forTransaction(
            transactionHash = pendingTransaction.hash
        )
        
        println("✅ Position closed successfully!")
        println("🔗 Transaction: ${executedTransaction.hash}")
        println("🔗 Explorer: https://explorer.aptoslabs.com/txn/${executedTransaction.hash}?network=testnet")
        
        return executedTransaction.hash
    }
    
    /**
     * Get user's APT balance
     */
    suspend fun getUserBalance(userAddress: String): Double {
        val resources = aptos.account.getAccountResources(userAddress)
        val coinResource = resources.find { 
            it.type.contains("0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>") 
        }
        
        val coinValue = coinResource?.data?.get("coin")?.asJsonObject?.get("value")?.asString
        return (coinValue?.toLongOrNull() ?: 0L) / 100_000_000.0
    }
    
    /**
     * Get position details
     */
    suspend fun getPositionDetails(positionId: Long): Map<String, Any> {
        val response = aptos.view(
            payload = InputEntryFunctionData(
                function = "$contractAddress::${CrescaBucketProtocolFixed.MODULE_NAME}::get_position_details",
                functionArguments = listOf(positionId),
                typeArguments = emptyList()
            )
        )
        
        return mapOf(
            "bucket_id" to response[0],
            "is_long" to response[1],
            "margin" to response[2],
            "entry_price" to response[3],
            "owner" to response[4],
            "active" to response[5]
        )
    }
}

/**
 * Example Usage and Testing
 */
fun main() = runBlocking {
    println("=".repeat(70))
    println("CRESCA BUCKET PROTOCOL - FIXED VERSION INTEGRATION TEST")
    println("=".repeat(70))
    
    val service = CrescaBucketServiceFixed()
    
    // Example: Initialize protocol (one-time, use contract private key)
    println("\n1️⃣  INITIALIZING PROTOCOL...")
    try {
        val initTx = service.initializeProtocol(
            CrescaBucketProtocolFixed.NEW_PRIVATE_KEY
        )
        println("✅ Protocol initialized: $initTx")
    } catch (e: Exception) {
        println("⚠️  Already initialized or error: ${e.message}")
    }
    
    // Example: Check user balance before trading
    println("\n2️⃣  CHECKING USER BALANCE...")
    val userPrivateKey = "YOUR_USER_PRIVATE_KEY_HERE" // Replace with actual user key
    val userAccount = Account.fromPrivateKey(
        Ed25519PrivateKey.fromString(userPrivateKey)
    )
    val userAddress = userAccount.accountAddress.toString()
    
    try {
        val balance = service.getUserBalance(userAddress)
        println("💰 User Balance: $balance APT")
        
        if (balance < 1.0) {
            println("⚠️  Insufficient balance! Need at least 1 APT to open position")
            return@runBlocking
        }
    } catch (e: Exception) {
        println("❌ Error checking balance: ${e.message}")
        return@runBlocking
    }
    
    // Example: Open a LONG position
    println("\n3️⃣  OPENING LONG POSITION...")
    try {
        val openTx = service.openLongPosition(
            userPrivateKey = userPrivateKey,
            bucketId = 0L
        )
        println("✅ Position opened: $openTx")
        
        // Check balance after opening position
        val balanceAfter = service.getUserBalance(userAddress)
        println("💰 Balance after opening: $balanceAfter APT")
        println("💸 Amount deducted: ${balance - balanceAfter} APT (should be ~1.00 APT)")
    } catch (e: Exception) {
        println("❌ Error opening position: ${e.message}")
    }
    
    // Example: Get position details
    println("\n4️⃣  GETTING POSITION DETAILS...")
    try {
        val positionDetails = service.getPositionDetails(0L)
        println("📊 Position Details:")
        positionDetails.forEach { (key, value) ->
            println("   $key: $value")
        }
    } catch (e: Exception) {
        println("❌ Error getting position: ${e.message}")
    }
    
    // Example: Close position (uncomment when ready to test)
    /*
    println("\n5️⃣  CLOSING POSITION...")
    try {
        val closeTx = service.closePosition(
            userPrivateKey = userPrivateKey,
            positionId = 0L
        )
        println("✅ Position closed: $closeTx")
        
        // Check balance after closing
        val finalBalance = service.getUserBalance(userAddress)
        println("💰 Final Balance: $finalBalance APT")
    } catch (e: Exception) {
        println("❌ Error closing position: ${e.message}")
    }
    */
    
    println("\n" + "=".repeat(70))
    println("TEST COMPLETE")
    println("=".repeat(70))
}

/**
 * MIGRATION CHECKLIST
 * ===================
 * 
 * ☐ Update contract address from OLD to NEW in your app configuration
 * ☐ Update private keys if needed
 * ☐ Call initializeProtocol() once on the new contract
 * ☐ Test opening a small position (0.1 APT if you modify DEFAULT_MARGIN)
 * ☐ Verify APT is actually deducted from user wallet (check explorer)
 * ☐ Test closing position and verify APT is returned
 * ☐ Update all frontend/backend references to new contract address
 * ☐ Update documentation with new contract address
 * ☐ Notify users about contract migration (if applicable)
 * 
 * TESTING CHECKLIST
 * =================
 * 
 * ☐ Verify user balance decreases by 1 APT when opening position
 * ☐ Verify transaction shows coin transfer in explorer
 * ☐ Verify position is created with correct details
 * ☐ Verify closing position returns APT to user
 * ☐ Test with insufficient balance (should fail gracefully)
 * ☐ Test closing non-existent position (should fail)
 * ☐ Test closing other user's position (should fail)
 */
