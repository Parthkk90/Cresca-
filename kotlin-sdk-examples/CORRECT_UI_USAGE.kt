// ✅ CORRECT UI USAGE EXAMPLES
// Verified against deployed V2 contract

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.navigation.NavController

// ════════════════════════════════════════════════════════════════════════════
// EXAMPLE 1: Trading Screen (Open Positions)
// ════════════════════════════════════════════════════════════════════════════

@Composable
fun TradingScreen(
    navController: NavController,
    viewModel: CrescaViewModel
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedDirection by remember { mutableStateOf("LONG") }
    var showError by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Balance Display
        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Balance", style = MaterialTheme.typography.labelMedium)
                Text(
                    "${String.format("%.4f", uiState.balance)} APT",
                    style = MaterialTheme.typography.headlineMedium
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Direction Selector
        Text("Select Direction", style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(8.dp))
        
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
                onClick = { selectedDirection = "LONG" },
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (selectedDirection == "LONG") 
                        MaterialTheme.colorScheme.primary 
                    else 
                        MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Text("LONG ↗")
            }
            
            Button(
                onClick = { selectedDirection = "SHORT" },
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (selectedDirection == "SHORT") 
                        MaterialTheme.colorScheme.error 
                    else 
                        MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Text("SHORT ↘")
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Position Info
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.secondaryContainer
            )
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Position Details", style = MaterialTheme.typography.titleSmall)
                Spacer(modifier = Modifier.height(8.dp))
                Text("Margin: 1 APT (Fixed)")
                Text("Leverage: 10x")
                Text("Exposure: 10 APT")
                Text("Bucket: BTC 50% / ETH 30% / SOL 20%")
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Open Position Button
        Button(
            onClick = {
                if (selectedDirection == "LONG") {
                    viewModel.openLongPosition { result ->
                        result.onSuccess { txHash ->
                            navController.navigate("position_success/$txHash")
                        }.onFailure { error ->
                            showError = error.message
                        }
                    }
                } else {
                    viewModel.openShortPosition { result ->
                        result.onSuccess { txHash ->
                            navController.navigate("position_success/$txHash")
                        }.onFailure { error ->
                            showError = error.message
                        }
                    }
                }
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = !uiState.isLoading && uiState.balance >= 1.0
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color = MaterialTheme.colorScheme.onPrimary
                )
            } else {
                Text("Open $selectedDirection Position (1 APT)")
            }
        }

        // Warning if insufficient balance
        if (uiState.balance < 1.0) {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                "⚠️ Insufficient balance. Need at least 1 APT + gas fees",
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall
            )
        }

        // Error Display
        showError?.let { error ->
            Spacer(modifier = Modifier.height(16.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.errorContainer
                )
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Error", style = MaterialTheme.typography.titleSmall)
                    Text(error, style = MaterialTheme.typography.bodySmall)
                    TextButton(onClick = { showError = null }) {
                        Text("Dismiss")
                    }
                }
            }
        }
    }
}

// ════════════════════════════════════════════════════════════════════════════
// EXAMPLE 2: My Positions Screen (View & Close)
// ════════════════════════════════════════════════════════════════════════════

@Composable
fun MyPositionsScreen(
    navController: NavController,
    viewModel: CrescaViewModel
) {
    val uiState by viewModel.uiState.collectAsState()
    var positions by remember { mutableStateOf<List<PositionInfo>>(emptyList()) }
    var isLoadingPositions by remember { mutableStateOf(false) }
    var closingPositionId by remember { mutableStateOf<Long?>(null) }

    // Load positions on first render
    LaunchedEffect(Unit) {
        isLoadingPositions = true
        positions = viewModel.getMyActivePositions()
        isLoadingPositions = false
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            "My Active Positions",
            style = MaterialTheme.typography.headlineMedium
        )

        Spacer(modifier = Modifier.height(16.dp))

        when {
            isLoadingPositions -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }

            positions.isEmpty() -> {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(
                        modifier = Modifier.padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("No Active Positions", style = MaterialTheme.typography.titleLarge)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "Open a position to start trading",
                            style = MaterialTheme.typography.bodyMedium
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(onClick = { navController.navigate("trading") }) {
                            Text("Open Position")
                        }
                    }
                }
            }

            else -> {
                positions.forEach { position ->
                    PositionCard(
                        position = position,
                        isClosing = closingPositionId == position.positionId,
                        onClose = {
                            closingPositionId = position.positionId
                            viewModel.closePosition(position.positionId) { result ->
                                result.onSuccess {
                                    // Refresh positions list
                                    isLoadingPositions = true
                                    kotlinx.coroutines.GlobalScope.launch {
                                        positions = viewModel.getMyActivePositions()
                                        isLoadingPositions = false
                                        closingPositionId = null
                                    }
                                }.onFailure { error ->
                                    // Handle error
                                    closingPositionId = null
                                }
                            }
                        }
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }
            }
        }
    }
}

@Composable
fun PositionCard(
    position: PositionInfo,
    isClosing: Boolean,
    onClose: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    "Position #${position.positionId}",
                    style = MaterialTheme.typography.titleMedium
                )
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = if (position.isLong)
                            MaterialTheme.colorScheme.primaryContainer
                        else
                            MaterialTheme.colorScheme.errorContainer
                    )
                ) {
                    Text(
                        if (position.isLong) "LONG ↗" else "SHORT ↘",
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelMedium
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text("Margin", style = MaterialTheme.typography.labelSmall)
                    Text(
                        "${String.format("%.2f", position.marginAPT)} APT",
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
                Column {
                    Text("Entry Price", style = MaterialTheme.typography.labelSmall)
                    Text(
                        "$${position.entryPrice}",
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
                Column {
                    Text("Leverage", style = MaterialTheme.typography.labelSmall)
                    Text(
                        "10x",
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = onClose,
                modifier = Modifier.fillMaxWidth(),
                enabled = !isClosing,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.error
                )
            ) {
                if (isClosing) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = MaterialTheme.colorScheme.onError
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Closing...")
                } else {
                    Text("Close Position")
                }
            }
        }
    }
}

// ════════════════════════════════════════════════════════════════════════════
// EXAMPLE 3: Complete Flow (One-time setup + Trading)
// ════════════════════════════════════════════════════════════════════════════

@Composable
fun CompleteFlowExample(viewModel: CrescaViewModel, navController: NavController) {
    
    // ✅ STEP 1: Update oracle prices BEFORE trading
    // (You can get real prices from CoinGecko API)
    LaunchedEffect(Unit) {
        viewModel.updateOraclePrices(
            btcPriceUSD = 95000.0,
            ethPriceUSD = 3500.0,
            solPriceUSD = 190.0
        ) { result ->
            result.onSuccess {
                // Oracle updated! Ready to trade
            }.onFailure { error ->
                // Handle error - can't trade without oracle prices
            }
        }
    }

    // ✅ STEP 2: User opens position
    Button(onClick = {
        viewModel.openLongPosition { result ->
            result.onSuccess { txHash ->
                // Success! Navigate to position details
                navController.navigate("positions")
            }
        }
    }) {
        Text("Open LONG Position")
    }

    // ✅ STEP 3: User views their positions
    Button(onClick = {
        navController.navigate("positions")
    }) {
        Text("View My Positions")
    }

    // ✅ STEP 4: User closes position (in MyPositionsScreen)
    // Done automatically when user clicks "Close Position" button
}

// ════════════════════════════════════════════════════════════════════════════
// ❌ WRONG USAGE - Don't do this!
// ════════════════════════════════════════════════════════════════════════════

@Composable
fun WrongUsageExample(viewModel: CrescaViewModel) {
    Button(onClick = {
        // ❌ WRONG: Closing immediately after opening!
        viewModel.openLongPosition { result ->
            result.onSuccess {
                // ❌ Don't do this!
                viewModel.closePosition(0) { 
                    // User never gets to see their position!
                }
            }
        }
    }) {
        Text("Open and Close Immediately (WRONG!)")
    }
    
    // ❌ WRONG: Hardcoded position ID
    Button(onClick = {
        viewModel.closePosition(0) { // ❌ Always closing position 0!
            // This might not be your position!
        }
    }) {
        Text("Close Position 0 (WRONG!)")
    }
    
    // ✅ CORRECT: Find user's position first
    Button(onClick = {
        kotlinx.coroutines.GlobalScope.launch {
            val positions = viewModel.getMyActivePositions()
            if (positions.isNotEmpty()) {
                val firstPosition = positions[0]
                viewModel.closePosition(firstPosition.positionId) {
                    // ✅ Closing actual user position!
                }
            }
        }
    }) {
        Text("Close My Position (CORRECT!)")
    }
}
