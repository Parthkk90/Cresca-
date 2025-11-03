import com.aptos.Aptos
import com.aptos.AptosConfig
import com.aptos.Network
import com.aptos.Account
import com.aptos.builder.entryFunctionData
import com.aptos.builder.functionArguments
import com.aptos.builder.typeArguments
import com.aptos.types.AccountAddress
import com.aptos.types.U64
import kotlinx.coroutines.runBlocking

// =============================================================================
// ✅ SIMPLEST WAY: Using Aptos Framework (Recommended)
// =============================================================================

object AptosTransfer {
    
    private val aptos = Aptos(AptosConfig(Network.TESTNET))
    
    // Helper: Convert APT to Octas
    fun aptToOctas(apt: Double): ULong {
        return (apt * 100_000_000.0).toULong()
    }
    
    /**
     * 🚀 SINGLE FUNCTION TO SEND APT
     * No initialization needed!
     * 
     * @param privateKey Your wallet private key (hex string starting with 0x)
     * @param recipientAddress Recipient's Aptos address
     * @param amountInApt Amount in APT (e.g., 0.001)
     * @return Transaction hash
     */
    suspend fun send(
        privateKey: String,
        recipientAddress: String,
        amountInApt: Double
    ): String {
        // Create account from private key
        val account = Account.fromPrivateKey(privateKey)
        
        // Convert amount to octas
        val amountInOctas = aptToOctas(amountInApt)
        
        // Build transaction
        val txn = aptos.buildTransaction.simple(
            sender = account.accountAddress,
            data = entryFunctionData {
                // Use Aptos framework's transfer function
                function = "0x1::aptos_account::transfer"
                
                // Arguments: (recipient, amount)
                functionArguments = functionArguments {
                    +AccountAddress.fromString(recipientAddress)
                    +U64(amountInOctas)
                }
            }
        )
        
        // Sign and submit
        val committedTxn = aptos.signAndSubmitTransaction(account, txn)
        
        // Wait for confirmation
        aptos.waitForTransaction(committedTxn.hash)
        
        return committedTxn.hash
    }
    
    /**
     * Get account balance in APT
     */
    suspend fun getBalance(address: String): Double {
        val accountAddress = AccountAddress.fromString(address)
        val balance = aptos.getAccountCoinAmount(accountAddress)
        return balance.toDouble() / 100_000_000.0
    }
    
    /**
     * Get account info
     */
    suspend fun getAccountInfo(address: String) {
        val accountAddress = AccountAddress.fromString(address)
        val balance = getBalance(address)
        println("Address: $address")
        println("Balance: $balance APT")
    }
}

// =============================================================================
// 🎯 USAGE EXAMPLES
// =============================================================================

fun main() = runBlocking {
    
    // Example 1: Send 0.001 APT
    println("=== Example 1: Simple Transfer ===")
    try {
        val txHash = AptosTransfer.send(
            privateKey = "0xYOUR_PRIVATE_KEY_HERE",
            recipientAddress = "0xRECIPIENT_ADDRESS_HERE",
            amountInApt = 0.001
        )
        println("✅ Transaction successful!")
        println("Hash: $txHash")
        println("Explorer: https://explorer.aptoslabs.com/txn/$txHash?network=testnet")
    } catch (e: Exception) {
        println("❌ Error: ${e.message}")
    }
    
    // Example 2: Check balance
    println("\n=== Example 2: Check Balance ===")
    try {
        AptosTransfer.getAccountInfo("0x5f971a43ff0c97789f67dc7f75a9fba019695943e0ecebbb81adc851eaa0a36f")
    } catch (e: Exception) {
        println("❌ Error: ${e.message}")
    }
    
    // Example 3: Send larger amount
    println("\n=== Example 3: Send 0.1 APT ===")
    try {
        val txHash = AptosTransfer.send(
            privateKey = "0xYOUR_PRIVATE_KEY_HERE",
            recipientAddress = "0xRECIPIENT_ADDRESS_HERE",
            amountInApt = 0.1
        )
        println("✅ Sent 0.1 APT")
        println("Hash: $txHash")
    } catch (e: Exception) {
        println("❌ Error: ${e.message}")
    }
}

// =============================================================================
// 📱 ANDROID USAGE (ViewModel Example)
// =============================================================================

class TransferViewModel : ViewModel() {
    
    private val _transferState = MutableStateFlow<TransferState>(TransferState.Idle)
    val transferState: StateFlow<TransferState> = _transferState.asStateFlow()
    
    sealed class TransferState {
        object Idle : TransferState()
        object Loading : TransferState()
        data class Success(val txHash: String) : TransferState()
        data class Error(val message: String) : TransferState()
    }
    
    fun sendAPT(privateKey: String, recipient: String, amount: Double) {
        viewModelScope.launch {
            _transferState.value = TransferState.Loading
            
            try {
                val txHash = AptosTransfer.send(privateKey, recipient, amount)
                _transferState.value = TransferState.Success(txHash)
            } catch (e: Exception) {
                _transferState.value = TransferState.Error(e.message ?: "Unknown error")
            }
        }
    }
    
    fun getBalance(address: String, onResult: (Double) -> Unit) {
        viewModelScope.launch {
            try {
                val balance = AptosTransfer.getBalance(address)
                onResult(balance)
            } catch (e: Exception) {
                onResult(0.0)
            }
        }
    }
}

// =============================================================================
// 🎨 JETPACK COMPOSE UI
// =============================================================================

@Composable
fun TransferScreen(viewModel: TransferViewModel = viewModel()) {
    var recipient by remember { mutableStateOf("") }
    var amount by remember { mutableStateOf("") }
    val transferState by viewModel.transferState.collectAsState()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text("Send APT", style = MaterialTheme.typography.headlineMedium)
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Recipient input
        OutlinedTextField(
            value = recipient,
            onValueChange = { recipient = it },
            label = { Text("Recipient Address") },
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("0x...") }
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        // Amount input
        OutlinedTextField(
            value = amount,
            onValueChange = { amount = it },
            label = { Text("Amount (APT)") },
            modifier = Modifier.fillMaxWidth(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
            placeholder = { Text("0.001") }
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Send button
        Button(
            onClick = {
                val privateKey = "0xYOUR_PRIVATE_KEY" // Get from secure storage
                viewModel.sendAPT(privateKey, recipient, amount.toDoubleOrNull() ?: 0.0)
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = transferState !is TransferViewModel.TransferState.Loading
        ) {
            if (transferState is TransferViewModel.TransferState.Loading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color = Color.White
                )
            } else {
                Text("Send")
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Status display
        when (val state = transferState) {
            is TransferViewModel.TransferState.Success -> {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.Green.copy(alpha = 0.1f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("✅ Transaction Successful!", fontWeight = FontWeight.Bold)
                        Text("Hash: ${state.txHash}", fontSize = 12.sp)
                        TextButton(onClick = {
                            // Open explorer
                        }) {
                            Text("View on Explorer")
                        }
                    }
                }
            }
            is TransferViewModel.TransferState.Error -> {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.Red.copy(alpha = 0.1f))
                ) {
                    Text(
                        "❌ Error: ${state.message}",
                        modifier = Modifier.padding(16.dp),
                        color = Color.Red
                    )
                }
            }
            else -> {}
        }
    }
}

// =============================================================================
// 🔑 SECURE PRIVATE KEY STORAGE (Android)
// =============================================================================

object SecureKeyStorage {
    
    private const val PREFS_NAME = "aptos_secure_prefs"
    private const val KEY_PRIVATE_KEY = "private_key"
    
    fun savePrivateKey(context: Context, privateKey: String) {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        
        val encryptedPrefs = EncryptedSharedPreferences.create(
            context,
            PREFS_NAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
        
        encryptedPrefs.edit().putString(KEY_PRIVATE_KEY, privateKey).apply()
    }
    
    fun getPrivateKey(context: Context): String? {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        
        val encryptedPrefs = EncryptedSharedPreferences.create(
            context,
            PREFS_NAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
        
        return encryptedPrefs.getString(KEY_PRIVATE_KEY, null)
    }
}
