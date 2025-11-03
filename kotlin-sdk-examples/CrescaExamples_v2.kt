package com.aptpays.examples

import com.aptpays.viewmodels.CrescaBucketViewModel
import kotlinx.coroutines.runBlocking
import xyz.mcxross.kaptos.account.Account
import xyz.mcxross.kaptos.model.Ed25519PrivateKey

/**
 * Cresca Bucket Protocol - Usage Examples
 * Contract: 0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b
 */

fun main() = runBlocking {
    // Setup account
    val privateKey = "0x40daf4e4316a895eec706d88006d6a3ba75f22b01f0b4390556d679101d6e309"
    val account = Account.fromPrivateKey(Ed25519PrivateKey(privateKey))
    
    val viewModel = CrescaBucketViewModel(currentAccount = account)
    
    // Example 1: Initialize Protocol
    example1_InitializeProtocol(viewModel)
    
    // Example 2: Deposit Funds
    example2_DepositFunds(viewModel)
    
    // Example 3: Update Oracle Prices
    example3_UpdateOracle(viewModel)
    
    // Example 4: Open LONG Position
    example4_OpenLongPosition(viewModel)
    
    // Example 5: Open SHORT Position
    example5_OpenShortPosition(viewModel)
    
    // Example 6: View Dashboard
    example6_ViewDashboard(viewModel)
    
    // Example 7: Close Position
    example7_ClosePosition(viewModel)
}

/**
 * Example 1: Initialize protocol with 10x leverage
 * Creates default bucket: BTC (50%), ETH (30%), SOL (20%)
 */
suspend fun example1_InitializeProtocol(viewModel: CrescaBucketViewModel) {
    println("=== Example 1: Initialize Protocol ===")
    
    viewModel.init(leverage = 10).fold(
        onSuccess = { txHash ->
            println("✅ Protocol initialized!")
            println("📦 Default bucket created: BTC 50%, ETH 30%, SOL 20%")
            println("⚡ Leverage: 10x")
            println("🔗 $txHash")
        },
        onFailure = { error ->
            println("❌ Error: ${error.message}")
        }
    )
}

/**
 * Example 2: Deposit 5 APT for trading
 */
suspend fun example2_DepositFunds(viewModel: CrescaBucketViewModel) {
    println("\n=== Example 2: Deposit Funds ===")
    
    viewModel.depositCollateral(amountAPT = 5.0).fold(
        onSuccess = { txHash ->
            println("✅ Deposited 5 APT")
            println("💰 Ready to trade!")
            println("🔗 $txHash")
        },
        onFailure = { error ->
            println("❌ Error: ${error.message}")
        }
    )
}

/**
 * Example 3: Update oracle prices
 * BTC = $50,000, ETH = $3,500, SOL = $100
 */
suspend fun example3_UpdateOracle(viewModel: CrescaBucketViewModel) {
    println("\n=== Example 3: Update Oracle Prices ===")
    
    viewModel.updateOracle(
        btcPrice = 50000.0,  // $50,000
        ethPrice = 3500.0,   // $3,500
        solPrice = 100.0     // $100
    ).fold(
        onSuccess = { txHash ->
            println("✅ Oracle updated!")
            println("₿ BTC: $50,000")
            println("Ξ ETH: $3,500")
            println("◎ SOL: $100")
            println("🔗 $txHash")
        },
        onFailure = { error ->
            println("❌ Error: ${error.message}")
        }
    )
}

/**
 * Example 4: Open LONG position
 * Bet that crypto prices will go UP
 * Uses 0.05 APT margin automatically
 */
suspend fun example4_OpenLongPosition(viewModel: CrescaBucketViewModel) {
    println("\n=== Example 4: Open LONG Position ===")
    
    viewModel.openLong(bucketId = 0).fold(
        onSuccess = { txHash ->
            println("✅ LONG position opened!")
            println("📈 Betting prices go UP")
            println("💵 Margin: 0.05 APT")
            println("⚡ Leverage: 10x")
            println("🎯 Potential: 10x gains/losses")
            println("🔗 $txHash")
        },
        onFailure = { error ->
            println("❌ Error: ${error.message}")
        }
    )
}

/**
 * Example 5: Open SHORT position
 * Bet that crypto prices will go DOWN
 * Uses 0.05 APT margin automatically
 */
suspend fun example5_OpenShortPosition(viewModel: CrescaBucketViewModel) {
    println("\n=== Example 5: Open SHORT Position ===")
    
    viewModel.openShort(bucketId = 0).fold(
        onSuccess = { txHash ->
            println("✅ SHORT position opened!")
            println("📉 Betting prices go DOWN")
            println("💵 Margin: 0.05 APT")
            println("⚡ Leverage: 10x")
            println("🎯 Potential: 10x gains/losses")
            println("🔗 $txHash")
        },
        onFailure = { error ->
            println("❌ Error: ${error.message}")
        }
    )
}

/**
 * Example 6: View dashboard with all account info
 */
suspend fun example6_ViewDashboard(viewModel: CrescaBucketViewModel) {
    println("\n=== Example 6: Dashboard ===")
    
    viewModel.viewDashboard().fold(
        onSuccess = { data ->
            println("✅ Dashboard loaded!")
            println("💰 Collateral: ${data.collateralAPT} APT")
            println("📦 Buckets: ${data.bucketCount}")
            println("📊 Positions: ${data.positionCount}")
            println("\n📈 Current Prices:")
            data.btcPrice?.let { println("  ₿ BTC: $$it") }
            data.ethPrice?.let { println("  Ξ ETH: $$it") }
            data.solPrice?.let { println("  ◎ SOL: $$it") }
        },
        onFailure = { error ->
            println("❌ Error: ${error.message}")
        }
    )
}

/**
 * Example 7: Close position and collect P&L
 */
suspend fun example7_ClosePosition(viewModel: CrescaBucketViewModel) {
    println("\n=== Example 7: Close Position ===")
    
    viewModel.closePosition(positionId = 0).fold(
        onSuccess = { txHash ->
            println("✅ Position closed!")
            println("💰 P&L added to collateral")
            println("🔗 $txHash")
        },
        onFailure = { error ->
            println("❌ Error: ${error.message}")
        }
    )
}

/**
 * Example 8: Complete trading flow
 * Simulates a profitable LONG trade
 */
suspend fun example8_CompleteTradingFlow(viewModel: CrescaBucketViewModel) {
    println("\n=== Example 8: Complete Trading Flow ===")
    
    // 1. Init
    println("1️⃣ Initializing protocol...")
    viewModel.init(leverage = 10).getOrNull()
    
    // 2. Deposit
    println("2️⃣ Depositing 5 APT...")
    viewModel.depositCollateral(amountAPT = 5.0).getOrNull()
    
    // 3. Set initial prices
    println("3️⃣ Setting initial prices...")
    viewModel.updateOracle(50000.0, 3500.0, 100.0).getOrNull()
    
    // 4. Open LONG
    println("4️⃣ Opening LONG position...")
    viewModel.openLong(bucketId = 0).getOrNull()
    
    // 5. Simulate price increase (10%)
    println("5️⃣ Prices increased 10%...")
    viewModel.updateOracle(55000.0, 3850.0, 110.0).getOrNull()
    
    // 6. Close position (take profit)
    println("6️⃣ Closing position (taking profit)...")
    viewModel.closePosition(positionId = 0).fold(
        onSuccess = { 
            println("✅ Profit collected!")
            println("💰 With 10x leverage, 10% gain = 100% profit on margin!")
        },
        onFailure = { error ->
            println("❌ Error: ${error.message}")
        }
    )
}

/**
 * Example 9: View position details
 */
suspend fun example9_ViewPositionDetails(viewModel: CrescaBucketViewModel) {
    println("\n=== Example 9: Position Details ===")
    
    viewModel.getPositionDetails(positionId = 0).fold(
        onSuccess = { position ->
            println("✅ Position found!")
            println("📊 Direction: ${position.direction}")
            println("💵 Margin: ${position.marginAPT} APT")
            println("💰 Entry Price: $${position.entryPriceUSD}")
            println("🔴 Active: ${position.active}")
            println("📦 Bucket ID: ${position.bucketId}")
        },
        onFailure = { error ->
            println("❌ Error: ${error.message}")
        }
    )
}

/**
 * Example 10: Check balances
 */
suspend fun example10_CheckBalances(viewModel: CrescaBucketViewModel) {
    println("\n=== Example 10: Check Balances ===")
    
    val collateral = viewModel.getCollateralBalance().getOrNull()
    val buckets = viewModel.getBucketCount().getOrNull()
    val positions = viewModel.getPositionCount().getOrNull()
    
    println("💰 Collateral: ${collateral ?: 0} APT")
    println("📦 Buckets: ${buckets ?: 0}")
    println("📊 Open Positions: ${positions ?: 0}")
}
