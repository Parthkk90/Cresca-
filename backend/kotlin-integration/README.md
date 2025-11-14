# Kotlin Integration Guide for Cresca API

Complete integration guide for Android apps using Kotlin and Jetpack Compose.

## 📦 Dependencies

Add to your `build.gradle.kts`:

```kotlin
dependencies {
    // OkHttp for API calls
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    
    // Kotlinx Serialization
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
    
    // Aptos SDK (adjust version as needed)
    implementation("com.aptos:aptos-sdk-android:1.0.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    
    // Jetpack Compose (if using UI)
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.compose.material3:material3:1.2.0")
}
```

In your `build.gradle.kts` (project level):

```kotlin
plugins {
    kotlin("plugin.serialization") version "1.9.0"
}
```

## 🚀 Quick Start

### 1. Add the API Client

Copy `CrescaApiClient.kt` to your project:
```
app/src/main/java/com/yourapp/api/CrescaApiClient.kt
```

### 2. Add the ViewModel

Copy `ClosePositionViewModel.kt` to your project:
```
app/src/main/java/com/yourapp/viewmodel/ClosePositionViewModel.kt
```

### 3. Add the UI (Optional - Compose)

Copy `ClosePositionScreen.kt` to your project:
```
app/src/main/java/com/yourapp/ui/ClosePositionScreen.kt
```

## 💻 Usage Examples

### Basic Usage (Coroutines)

```kotlin
import com.aptpays.cresca.api.CrescaApiClient
import kotlinx.coroutines.launch

class MyActivity : AppCompatActivity() {
    private val apiClient = CrescaApiClient()
    
    fun closePosition(positionId: Long, userAccount: Account) {
        lifecycleScope.launch {
            try {
                // Call API
                val result = apiClient.closePosition(
                    positionId = positionId,
                    userAddress = userAccount.address.toString()
                )
                
                result.onSuccess { response ->
                    // Got raw transaction and protocol signature
                    Log.d("API", "Raw Transaction: ${response.rawTransaction}")
                    Log.d("API", "Protocol Address: ${response.protocolAddress}")
                    
                    // Now sign with user and submit
                    submitTransaction(response, userAccount)
                }
                
                result.onFailure { error ->
                    Log.e("API", "Error: ${error.message}")
                }
                
            } catch (e: Exception) {
                Log.e("API", "Exception: ${e.message}")
            }
        }
    }
}
```

### Using ViewModel (Recommended)

```kotlin
class MyFragment : Fragment() {
    private val viewModel: ClosePositionViewModel by viewModels()
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // Observe state
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.state.collect { state ->
                when (state) {
                    is ClosePositionState.Loading -> showLoading(state.message)
                    is ClosePositionState.Success -> showSuccess(state.transactionHash)
                    is ClosePositionState.Error -> showError(state.message)
                    ClosePositionState.Idle -> hideLoading()
                }
            }
        }
        
        // Close position
        closeButton.setOnClickListener {
            viewModel.closePosition(
                positionId = 4L,
                userAccount = getUserAccount() // Your user's account
            )
        }
    }
}
```

### Jetpack Compose Usage

```kotlin
@Composable
fun MyScreen() {
    val positionId = 4L
    val userAccount = remember { getUserAccount() }
    
    ClosePositionScreen(
        positionId = positionId,
        userAccount = userAccount,
        onSuccess = {
            // Navigate back or show success message
            navController.popBackStack()
        }
    )
}
```

## 🔐 Security Notes

1. **Never hardcode private keys** - Use secure storage:
```kotlin
// Use Android Keystore
val keyStore = KeyStore.getInstance("AndroidKeyStore")
keyStore.load(null)

// Or encrypted SharedPreferences
val encryptedPrefs = EncryptedSharedPreferences.create(...)
```

2. **Validate responses** - Always check API responses:
```kotlin
if (response.success && response.rawTransaction.isNotBlank()) {
    // Process transaction
} else {
    // Handle invalid response
}
```

3. **Handle errors gracefully**:
```kotlin
result.onFailure { error ->
    when (error) {
        is IOException -> showNetworkError()
        is JsonDecodingException -> showInvalidResponseError()
        else -> showGenericError(error.message)
    }
}
```

## 📱 Complete Example

```kotlin
// MainActivity.kt
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            CrescaTheme {
                val viewModel: ClosePositionViewModel = viewModel()
                val state by viewModel.state.collectAsState()
                
                Surface(modifier = Modifier.fillMaxSize()) {
                    when (state) {
                        ClosePositionState.Idle -> {
                            Button(onClick = {
                                viewModel.closePosition(4L, userAccount)
                            }) {
                                Text("Close Position #4")
                            }
                        }
                        
                        is ClosePositionState.Loading -> {
                            CircularProgressIndicator()
                            Text((state as ClosePositionState.Loading).message)
                        }
                        
                        is ClosePositionState.Success -> {
                            val success = state as ClosePositionState.Success
                            Column {
                                Text("✅ Position Closed!")
                                Text("TX: ${success.transactionHash}")
                                Button(onClick = { 
                                    openUrl(success.explorerUrl) 
                                }) {
                                    Text("View on Explorer")
                                }
                            }
                        }
                        
                        is ClosePositionState.Error -> {
                            val error = state as ClosePositionState.Error
                            Column {
                                Text("❌ Error: ${error.message}")
                                Button(onClick = { viewModel.resetState() }) {
                                    Text("Retry")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
```

## 🧪 Testing

Test with Aptos Testnet:

```kotlin
// Test configuration
private const val TEST_POSITION_ID = 4L
private const val TEST_USER_ADDRESS = "0x4c9650f2be23466deab3c6688d36d34d22c8ea0e09a216dd821880cfe67ba835"

@Test
fun testClosePosition() = runBlocking {
    val client = CrescaApiClient()
    val result = client.closePosition(TEST_POSITION_ID, TEST_USER_ADDRESS)
    
    assert(result.isSuccess)
    val response = result.getOrThrow()
    assert(response.success)
    assert(response.rawTransaction.isNotBlank())
}
```

## 🔗 API Endpoint

```
POST https://cresca.netlify.app/api/close-position
```

**Request:**
```json
{
  "positionId": "4",
  "userAddress": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "rawTransaction": "hex...",
  "protocolSignature": {
    "public_key": "hex...",
    "signature": "hex..."
  },
  "protocolAddress": "0x..."
}
```

## 📚 Additional Resources

- [Aptos SDK Documentation](https://aptos.dev)
- [OkHttp Documentation](https://square.github.io/okhttp/)
- [Kotlinx Serialization Guide](https://github.com/Kotlin/kotlinx.serialization)

## 🆘 Troubleshooting

**Network Error:**
```kotlin
// Add internet permission in AndroidManifest.xml
<uses-permission android:name="android.permission.INTERNET" />
```

**SSL Certificate Error:**
```kotlin
// For production, ensure proper certificate pinning
val client = OkHttpClient.Builder()
    .certificatePinner(certificatePinner)
    .build()
```

**Coroutine Context Error:**
```kotlin
// Always use appropriate dispatcher
withContext(Dispatchers.IO) {
    // Network call
}
```

## 📄 License

MIT License - See LICENSE file for details
