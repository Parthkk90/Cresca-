import com.aptos.Aptos
import com.aptos.AptosConfig
import com.aptos.AptosSettings
import com.aptos.Network
import com.aptos.Account
import com.aptos.builder.entryFunctionData
import com.aptos.builder.functionArguments
import com.aptos.types.AccountAddress
import com.aptos.types.U64
import com.aptos.HexInput
import kotlinx.coroutines.runBlocking

// =============================================================================
// ✅ ONE-TOUCH TRANSFER (Single-function contract)
// Calls aptpays::simple_transfer::transfer which auto-initializes + sends in 1 call
// Note: Avoid programmatic faucet on DEVNET (requires JWT header). Prefer TESTNET and
// fund once via CLI or Web Faucet, then run this example.
// =============================================================================

// Deployed package address on TESTNET
const val PACKAGE_ADDRESS = "0x2bc654f1f5009c045ba5486d11252d46724d7e0522db6dbde2ff0fe7e275a1bf" // update if redeployed

// Prefer providing secrets via environment variables for local runs.
// PowerShell example:
//   $env:APTOS_PRIVATE_KEY = "0x..."
//   $env:APTOS_RECIPIENT = "0x..."
private fun env(name: String, def: String = ""): String = System.getenv(name) ?: def

val SENDER_PRIVATE_KEY: String = env("APTOS_PRIVATE_KEY", "0xYOUR_PRIVATE_KEY_HERE")
val RECIPIENT_ADDRESS: String = env("APTOS_RECIPIENT", "0xRECIPIENT_ADDRESS_HERE")

fun main() = runBlocking {
    // Use TESTNET to avoid faucet JWT requirement seen on DEVNET.
    val aptos = Aptos(AptosConfig(AptosSettings(network = Network.TESTNET)))

    // Use a funded sender (fund once via CLI or Web Faucet).
    val sender = Account.fromPrivateKey(SENDER_PRIVATE_KEY)
    val recipient = AccountAddress.fromString(RECIPIENT_ADDRESS)

    println("Sending 0.001 APT from Sender -> Recipient via one-touch contract...")

    val txn = aptos.buildTransaction.simple(
        sender = sender.accountAddress,
        data = entryFunctionData {
            // Single function: auto-init + transfer
            function = "$PACKAGE_ADDRESS::simple_transfer::transfer"
            // Arguments are REQUIRED (cannot be empty): (to: address, amount: u64)
            functionArguments = functionArguments {
                +recipient
                +U64(100_000UL) // 0.001 APT in octas
            }
        }
    )

    val committed = aptos.signAndSubmitTransaction(sender, txn)
    val executed = aptos.waitForTransaction(HexInput.fromString(committed.expect("Tx failed").hash))

    println("✅ Executed: $executed")
}
