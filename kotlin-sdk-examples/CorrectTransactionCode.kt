// ✅ CORRECT WAY - Using Your Deployed Smart Wallet

import com.aptos.Aptos
import com.aptos.AptosConfig
import com.aptos.Network
import com.aptos.Account
import com.aptos.builder.entryFunctionData
import com.aptos.builder.functionArguments
import com.aptos.builder.typeArguments
import com.aptos.types.TypeTagStruct
import com.aptos.types.U64
import com.aptos.types.AccountAddress

// =============================================================================
// OPTION A: Use Your Smart Wallet Contract (send_coins function)
// =============================================================================

suspend fun sendUsingSmartWallet() {
    val aptos = Aptos(AptosConfig(Network.TESTNET))
    val account = Account.fromPrivateKey(YOUR_PRIVATE_KEY)
    
    val recipientAddress = AccountAddress.fromString("0xRECIPIENT_ADDRESS_HERE")
    val amountInOctas = 1000000UL  // 0.01 APT (1 APT = 100,000,000 octas)
    
    // Build transaction using YOUR deployed smart_wallet::send_coins
    val txn = aptos.buildTransaction.simple(
        sender = account.accountAddress,
        data = entryFunctionData {
            // ✅ YOUR deployed contract address and module
            function = "0x2bc654f1f5009c045ba5486d11252d46724d7e0522db6dbde2ff0fe7e275a1bf::smart_wallet_v2::send_coins"
            
            // ✅ Arguments: (to: address, amount: u64)
            functionArguments = functionArguments {
                +recipientAddress
                +U64(amountInOctas)
            }
        }
    )
    
    // Sign and submit
    val committedTxn = aptos.signAndSubmitTransaction(account, txn)
    aptos.waitForTransaction(committedTxn.hash)
    
    println("✅ Transaction successful: ${committedTxn.hash}")
    println("Explorer: https://explorer.aptoslabs.com/txn/${committedTxn.hash}?network=testnet")
}

// =============================================================================
// OPTION B: Use Aptos Framework coin::transfer (Direct, No Smart Wallet)
// =============================================================================

suspend fun sendUsingFramework() {
    val aptos = Aptos(AptosConfig(Network.TESTNET))
    val account = Account.fromPrivateKey(YOUR_PRIVATE_KEY)
    
    val recipientAddress = AccountAddress.fromString("0xRECIPIENT_ADDRESS_HERE")
    val amountInOctas = 1000000UL  // 0.01 APT
    
    val txn = aptos.buildTransaction.simple(
        sender = account.accountAddress,
        data = entryFunctionData {
            // ✅ Use Aptos framework's coin module (address 0x1)
            function = "0x1::coin::transfer"
            
            // ✅ AptosCoin type from Aptos framework
            typeArguments = typeArguments {
                +TypeTagStruct("0x1::aptos_coin::AptosCoin")
            }
            
            // ✅ Arguments: (to: address, amount: u64)
            functionArguments = functionArguments {
                +recipientAddress
                +U64(amountInOctas)
            }
        }
    )
    
    val committedTxn = aptos.signAndSubmitTransaction(account, txn)
    aptos.waitForTransaction(committedTxn.hash)
    
    println("✅ Transaction successful: ${committedTxn.hash}")
}

// =============================================================================
// OPTION C: Use aptos_account::transfer (Simplest, Auto-creates Account)
// =============================================================================

suspend fun sendUsingAptosAccount() {
    val aptos = Aptos(AptosConfig(Network.TESTNET))
    val account = Account.fromPrivateKey(YOUR_PRIVATE_KEY)
    
    val recipientAddress = AccountAddress.fromString("0xRECIPIENT_ADDRESS_HERE")
    val amountInOctas = 1000000UL  // 0.01 APT
    
    val txn = aptos.buildTransaction.simple(
        sender = account.accountAddress,
        data = entryFunctionData {
            // ✅ Best for simple transfers - auto-creates recipient account if needed
            function = "0x1::aptos_account::transfer"
            
            // ✅ Arguments: (to: address, amount: u64)
            functionArguments = functionArguments {
                +recipientAddress
                +U64(amountInOctas)
            }
        }
    )
    
    val committedTxn = aptos.signAndSubmitTransaction(account, txn)
    aptos.waitForTransaction(committedTxn.hash)
    
    println("✅ Transaction successful: ${committedTxn.hash}")
}

// =============================================================================
// OPTION D: Use one-touch contract simple_transfer::transfer (no init needed)
// =============================================================================

suspend fun sendUsingOneTouchContract() {
    val aptos = Aptos(AptosConfig(Network.TESTNET))
    val account = Account.fromPrivateKey(YOUR_PRIVATE_KEY)
    
    val recipientAddress = AccountAddress.fromString("0xRECIPIENT_ADDRESS_HERE")
    val amountInOctas = 100000UL  // 0.001 APT
    
    val txn = aptos.buildTransaction.simple(
        sender = account.accountAddress,
        data = entryFunctionData {
            // ✅ Single function: auto-initialize + transfer
            function = "0x2bc654f1f5009c045ba5486d11252d46724d7e0522db6dbde2ff0fe7e275a1bf::simple_transfer::transfer"
            
            // ✅ Arguments must NOT be empty
            functionArguments = functionArguments {
                +recipientAddress
                +U64(amountInOctas)
            }
        }
    )
    
    val committedTxn = aptos.signAndSubmitTransaction(account, txn)
    aptos.waitForTransaction(committedTxn.hash)
}

// =============================================================================
// FIXING YOUR ORIGINAL CODE
// =============================================================================

// ❌ YOUR BROKEN CODE:
/*
val tnx = aptos.buildTransaction.simple(
    sender = account.accountAddress,
    data = entryFunctionData {
        function = "0x5f971a43ff0c97789f67dc7f75a9fba019695943e0ecebbb81adc851eaa0a36f::coin::transfer"
        //         ^^^^^^^^^^^^^^ YOUR ADDRESS ^^^^^^^^^^^^^^::coin::transfer
        //         This module doesn't exist in your contract!
        
        typeArguments = typeArguments { 
            +TypeTagStruct("0x5f971a43ff0c97789f67dc7f75a9fba019695943e0ecebbb81adc851eaa0a36f::aptos_coin::AptosCoin")
            //             ^^^^^^^^^^^^^^ YOUR ADDRESS ^^^^^^^^^^^^^^::aptos_coin::AptosCoin
            //             This type doesn't exist in your contract!
        }
        functionArguments = functionArguments {
            +reWalletAddress
            +U64(0.001.toULong())  // ❌ WRONG! 0.001 octas is almost nothing
            //                         Should be: 100000 for 0.001 APT
        }
    }
)
*/

// ✅ FIXED VERSION (Choose what you want):

// If you want to use YOUR smart wallet:
suspend fun yourCodeFixed_SmartWallet() {
    val aptos = Aptos(AptosConfig(Network.TESTNET))
    val account = Account.fromPrivateKey(YOUR_PRIVATE_KEY)
    val reWalletAddress = AccountAddress.fromString("0xRECIPIENT")
    
    val tnx = aptos.buildTransaction.simple(
        sender = account.accountAddress,
        data = entryFunctionData {
            function = "0x2bc654f1f5009c045ba5486d11252d46724d7e0522db6dbde2ff0fe7e275a1bf::smart_wallet_v2::send_coins"
            //         ^^^^^^^^^^^^^^^^^^^^^^^^^ YOUR CONTRACT ^^^^^^^^^^^^^^^^^::smart_wallet::send_coins
            
            typeArguments = typeArguments { }  // No type args needed
            
            functionArguments = functionArguments {
                +reWalletAddress
                +U64(100000UL)  // ✅ 0.001 APT = 100,000 octas
            }
        }
    )
    
    val committedTxn = aptos.signAndSubmitTransaction(account, tnx)
    aptos.waitForTransaction(committedTxn.hash)
}

// If you want direct transfer (no smart wallet):
suspend fun yourCodeFixed_Direct() {
    val aptos = Aptos(AptosConfig(Network.TESTNET))
    val account = Account.fromPrivateKey(YOUR_PRIVATE_KEY)
    val reWalletAddress = AccountAddress.fromString("0xRECIPIENT")
    
    val tnx = aptos.buildTransaction.simple(
        sender = account.accountAddress,
        data = entryFunctionData {
            function = "0x1::aptos_account::transfer"  // ✅ Framework function
            
            typeArguments = typeArguments { }
            
            functionArguments = functionArguments {
                +reWalletAddress
                +U64(100000UL)  // 0.001 APT
            }
        }
    )
    
    val committedTxn = aptos.signAndSubmitTransaction(account, tnx)
    aptos.waitForTransaction(committedTxn.hash)
}

// =============================================================================
// AMOUNT CONVERSION HELPERS
// =============================================================================

object AptosUnits {
    const val OCTAS_PER_APT = 100_000_000UL
    
    fun aptToOctas(apt: Double): ULong {
        return (apt * OCTAS_PER_APT.toDouble()).toULong()
    }
    
    fun octasToApt(octas: ULong): Double {
        return octas.toDouble() / OCTAS_PER_APT.toDouble()
    }
}

// Usage:
// val amountInOctas = AptosUnits.aptToOctas(0.001)  // 100,000 octas
// val amountInApt = AptosUnits.octasToApt(100000UL)  // 0.001 APT
