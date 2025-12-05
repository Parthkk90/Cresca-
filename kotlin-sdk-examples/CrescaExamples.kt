package com.aptpays.examples

import com.aptpays.services.CrescaBucketService
import kotlinx.coroutines.runBlocking

/**
 * Practical examples for using Cresca Bucket Protocol in your Kotlin app
 */
class CrescaExamples {
    
    private val service = CrescaBucketService()
    
    /**
     * Example 1: Basic Deposit
     * User adds funds to their trading account
     */
    fun depositExample(privateKey: String) = runBlocking {
        println("=== Deposit Collateral ===")
        
        val result = service.depositCollateral(
            privateKey = privateKey,
            amountAPT = 1.0 // Deposit 1 APT
        )
        
        if (result.success) {
            println("✅ Success: ${result.message}")
            println("Transaction: ${result.txHash}")
        } else {
            println("❌ Error: ${result.error}")
        }
    }
    
    /**
     * Example 2: Create DeFi Index Bucket
     * Create a balanced portfolio with 5x leverage
     */
    fun createIndexBucketExample(privateKey: String) = runBlocking {
        println("\n=== Create DeFi Index Bucket ===")
        
        val result = service.createBucket(
            privateKey = privateKey,
            assets = listOf("0x1"), // APT for now (expand with more tokens)
            weights = listOf(100),   // 100% allocation
            leverage = 5             // 5x leverage
        )
        
        if (result.success) {
            println("✅ Bucket created: ${result.message}")
            println("Transaction: ${result.txHash}")
        } else {
            println("❌ Error: ${result.error}")
        }
    }
    
    /**
     * Example 3: Open LONG Position
     * User bets that APT price will go UP
     */
    fun openLongPositionExample(privateKey: String) = runBlocking {
        println("\n=== Open LONG Position ===")
        
        val result = service.openPosition(
            privateKey = privateKey,
            bucketId = 0,        // First bucket
            isLong = true,       // LONG = bet price goes up
            marginAPT = 0.5      // 0.5 APT margin
        )
        
        if (result.success) {
            println("✅ Position opened: ${result.message}")
            println("Transaction: ${result.txHash}")
        } else {
            println("❌ Error: ${result.error}")
        }
    }
    
    /**
     * Example 4: Open SHORT Position
     * User bets that APT price will go DOWN
     */
    fun openShortPositionExample(privateKey: String) = runBlocking {
        println("\n=== Open SHORT Position ===")
        
        val result = service.openPosition(
            privateKey = privateKey,
            bucketId = 0,
            isLong = false,      // SHORT = bet price goes down
            marginAPT = 0.3
        )
        
        if (result.success) {
            println("✅ Position opened: ${result.message}")
            println("Transaction: ${result.txHash}")
        } else {
            println("❌ Error: ${result.error}")
        }
    }
    
    /**
     * Example 5: View Account Dashboard
     * Show user's balance, buckets, and positions
     */
    fun viewDashboardExample(address: String) = runBlocking {
        println("\n=== Account Dashboard ===")
        
        val balance = service.getCollateralBalance(address)
        val buckets = service.getBucketCount(address)
        val positions = service.getPositionCount(address)
        
        println("💰 Collateral: ${"%.4f".format(balance)} APT")
        println("📦 Buckets: $buckets")
        println("📊 Positions: $positions")
        
        // Show position details if any exist
        if (positions > 0) {
            println("\n--- Position Details ---")
            for (i in 0 until positions) {
                val pos = service.getPositionDetails(address, i)
                if (pos != null && pos.active) {
                    println("Position #$i:")
                    println("  Type: ${pos.direction}")
                    println("  Margin: ${"%.4f".format(pos.marginAPT)} APT")
                    println("  Entry Price: $${pos.entryPrice / 100.0}")
                    println("  Bucket: ${pos.bucketId}")
                }
            }
        }
    }
    
    /**
     * Example 6: Close Position and Take Profit
     */
    fun closeProfitablePositionExample(privateKey: String) = runBlocking {
        println("\n=== Close Position ===")
        
        val result = service.closePosition(
            privateKey = privateKey,
            positionId = 0 // First position
        )
        
        if (result.success) {
            println("✅ Position closed: ${result.message}")
            println("Transaction: ${result.txHash}")
            println("💵 Profit/Loss added to collateral balance")
        } else {
            println("❌ Error: ${result.error}")
        }
    }
    
    /**
     * Example 7: Update Prices (for testing)
     * In production, this would be automated via Pyth Oracle
     */
    fun updatePricesExample(privateKey: String) = runBlocking {
        println("\n=== Update Oracle Prices ===")
        
        val result = service.updateOracle(
            privateKey = privateKey,
            prices = listOf(1050) // APT = $10.50
        )
        
        if (result.success) {
            println("✅ Prices updated: ${result.message}")
            println("Transaction: ${result.txHash}")
        } else {
            println("❌ Error: ${result.error}")
        }
    }
}

/**
 * Main function to run all examples
 */
fun main() {
    val examples = CrescaExamples()
    
    // Replace with your testnet credentials
    val privateKey = "YOUR_PRIVATE_KEY_HERE"
    val address = "YOUR_ADDRESS_HERE"
    
    // Run examples
    println("🚀 Cresca Bucket Protocol Examples\n")
    
    // 1. Deposit funds
    examples.depositExample(privateKey)
    
    // 2. View dashboard
    examples.viewDashboardExample(address)
    
    // 3. Create bucket
    examples.createIndexBucketExample(privateKey)
    
    // 4. Update prices
    examples.updatePricesExample(privateKey)
    
    // 5. Open LONG position
    examples.openLongPositionExample(privateKey)
    
    // 6. View updated dashboard
    examples.viewDashboardExample(address)
    
    // 7. Close position
    // Uncomment when ready to close:
    // examples.closeProfitablePositionExample(privateKey)
}
