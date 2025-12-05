# 🚀 Single Function APT Transfer - Complete Guide

## ✅ SIMPLEST METHOD (Recommended)

Use **Aptos Framework's built-in transfer** - no contract deployment needed!

### Kotlin Code (Copy-Paste Ready):

```kotlin
import com.aptos.Aptos
import com.aptos.AptosConfig
import com.aptos.Network
import com.aptos.Account
import com.aptos.builder.entryFunctionData
import com.aptos.builder.functionArguments
import com.aptos.builder.typeArguments
import com.aptos.types.AccountAddress
import com.aptos.types.U64

suspend fun sendAPT(
    privateKey: String,
    recipientAddress: String,
    amountInAPT: Double
): String {
    val aptos = Aptos(AptosConfig(Network.TESTNET))
    val account = Account.fromPrivateKey(privateKey)
    
    // Convert APT to octas (1 APT = 100,000,000 octas)
    val amountInOctas = (amountInAPT * 100_000_000).toULong()
    
    // Build transaction
    val txn = aptos.buildTransaction.simple(
        sender = account.accountAddress,
        data = entryFunctionData {
            function = "0x1::aptos_account::transfer"
            typeArguments = typeArguments { }
            functionArguments = functionArguments {
                +AccountAddress.fromString(recipientAddress)
                +U64(amountInOctas)
            }
        }
    )
    
    // Send and wait
    val committedTxn = aptos.signAndSubmitTransaction(account, txn)
    aptos.waitForTransaction(committedTxn.hash)
    
    return committedTxn.hash
}
```

### Usage:

```kotlin
// Send 0.001 APT
val txHash = sendAPT(
    privateKey = "0xYOUR_PRIVATE_KEY",
    recipientAddress = "0x5f971a43ff0c97789f67dc7f75a9fba019695943e0ecebbb81adc851eaa0a36f",
    amountInAPT = 0.001
)

println("Transaction: https://explorer.aptoslabs.com/txn/$txHash?network=testnet")
```

## 🎯 Your Credentials

```
Contract Address: 0x5f971a43ff0c97789f67dc7f75a9fba019695943e0ecebbb81adc851eaa0a36f
Network: Testnet
Your Private Key: [Check .aptos/config.yaml]
```

## 📊 Amount Conversion

| APT | Octas |
|-----|-------|
| 1 APT | 100,000,000 |
| 0.1 APT | 10,000,000 |
| 0.01 APT | 1,000,000 |
| 0.001 APT | 100,000 |
| 0.0001 APT | 10,000 |

## 🔧 Key Points

1. **No initialization needed** - Aptos framework handles everything
2. **Single function call** - `aptos_account::transfer` does it all
3. **Auto-creates recipient account** if it doesn't exist
4. **No gas estimation needed** - SDK handles it automatically
5. **Always use octas** for amount (multiply APT by 100,000,000)

## 🚨 Common Errors Fixed

### ❌ Wrong (Your Original Code):
```kotlin
function = "0x5f971a43...::coin::transfer"  // Module doesn't exist!
typeArguments = typeArguments { 
    +TypeTagStruct("0x5f971a43...::aptos_coin::AptosCoin")  // Wrong!
}
```

### ✅ Correct:
```kotlin
function = "0x1::aptos_account::transfer"  // Aptos framework
typeArguments = typeArguments { }  // Empty!
```

## 📱 Android Integration

```kotlin
class WalletViewModel : ViewModel() {
    
    fun transfer(recipient: String, amount: Double) {
        viewModelScope.launch {
            try {
                val txHash = sendAPT(
                    privateKey = getSecurePrivateKey(),
                    recipientAddress = recipient,
                    amountInAPT = amount
                )
                // Show success
            } catch (e: Exception) {
                // Show error
            }
        }
    }
}
```

## 🎨 Complete Files

Check these files for full examples:
- `SimpleTransferExample.kt` - Complete working code with UI
- `CorrectTransactionCode.kt` - Multiple transfer methods comparison

## 🔑 Get Your Private Key

```powershell
aptos config show-profiles
```

Look for `private_key` under `testnet` profile.

## 💡 Why This is Better

| Feature | Your Smart Contract | Aptos Framework |
|---------|-------------------|----------------|
| Deployment | Required | ❌ Not needed |
| Initialization | Required | ❌ Not needed |
| Gas Cost | Higher | ✅ Lower |
| Code Complexity | Complex | ✅ Simple |
| Maintenance | Manual | ✅ Automatic |

**Recommendation: Use `0x1::aptos_account::transfer` for everything!**
