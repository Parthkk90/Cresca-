// ✅ CORRECTED UI FLOW - Proper trading workflow

// ⚠️ PARTIALLY WRONG FLOW - Don't do this:
/*
❌ initializeBundle() → depositCollateral() → updateOracle() → openLong() → closePosition()
   
   ✅ initializeBundle() - REQUIRED (but only ONCE!)
   ❌ depositCollateral() - NOT NEEDED (open_long/short handles it automatically)
   ✅ updateOracle() - REQUIRED (prices needed for entry_price calculation!)
   ✅ openLong() - User opens position
   ❌ closePosition() - Don't close immediately! Let user trade!
*/

// ✅ CORRECT FLOW:

// 1️⃣ One-time setup (Do this ONCE when protocol is first used)
aptosViewModel.initializeBundle(leverage = 10) {
    // Protocol initialized! Now set oracle prices
    aptosViewModel.updateOracle(
        btcPrice = 95000.0,
        ethPrice = 3500.0,
        solPrice = 190.0
    ) {
        // Ready to trade!
    }
} 

// 2️⃣ USER OPENS A POSITION (Your app does this)
Button("Open LONG Position") {
    isLoading = true
    
    aptosViewModel.openLong { result ->
        result.onSuccess {
            isLoading = false
            Toast.makeText(context, "Position opened!", Toast.LENGTH_SHORT).show()
            navController.navigate(PositionDetailScreen)  // Show position details
        }.onFailure { error ->
            isLoading = false
            Toast.makeText(context, "Error: ${error.message}", Toast.LENGTH_SHORT).show()
        }
    }
}

// 3️⃣ USER VIEWS THEIR POSITIONS (Later in a different screen)
LaunchedEffect(Unit) {
    val positions = aptosViewModel.getMyActivePositions()
    if (positions.isNotEmpty()) {
        // Show positions in UI
        positions.forEach { positionId ->
            println("You have position ID: $positionId")
        }
    }
}

// 4️⃣ USER CLOSES A POSITION (When they want to take profit/loss)
Button("Close Position") {
    isLoading = true
    
    // Get the position ID first!
    val positionId = 1L // Or get from getMyActivePositions()
    
    aptosViewModel.closePosition(positionId) { result ->
        result.onSuccess {
            isLoading = false
            Toast.makeText(context, "Position closed!", Toast.LENGTH_SHORT).show()
            navController.navigate(HomeScreen)
        }.onFailure { error ->
            isLoading = false
            Toast.makeText(context, "Error: ${error.message}", Toast.LENGTH_SHORT).show()
        }
    }
}

// ✅ COMPLETE EXAMPLE - Proper flow:
@Composable
fun TradingScreen(
    navController: NavController,
    aptosViewModel: AptosViewModel
) {
    var isLoading by remember { mutableStateOf(false) }
    var tradeType by remember { mutableStateOf("LONG") }
    
    Column(modifier = Modifier.padding(16.dp)) {
        
        // Trade type selector
        Row {
            Button(onClick = { tradeType = "LONG" }) {
                Text("LONG")
            }
            Button(onClick = { tradeType = "SHORT" }) {
                Text("SHORT")
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Open position button
        Button(
            onClick = {
                isLoading = true
                
                if (tradeType == "LONG") {
                    aptosViewModel.openLong { result ->
                        isLoading = false
                        result.onSuccess {
                            navController.navigate("position_opened")
                        }.onFailure { error ->
                            // Show error
                        }
                    }
                } else {
                    aptosViewModel.openShort { result ->
                        isLoading = false
                        result.onSuccess {
                            navController.navigate("position_opened")
                        }.onFailure { error ->
                            // Show error
                        }
                    }
                }
            },
            enabled = !isLoading
        ) {
            if (isLoading) {
                CircularProgressIndicator(modifier = Modifier.size(24.dp))
            } else {
                Text("Open $tradeType Position (1 APT)")
            }
        }
    }
}

@Composable
fun MyPositionsScreen(
    navController: NavController,
    aptosViewModel: AptosViewModel
) {
    var positions by remember { mutableStateOf<List<Long>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }
    
    // Load positions when screen opens
    LaunchedEffect(Unit) {
        positions = aptosViewModel.getMyActivePositions()
    }
    
    Column(modifier = Modifier.padding(16.dp)) {
        Text("Your Active Positions", style = MaterialTheme.typography.h5)
        
        if (positions.isEmpty()) {
            Text("No active positions")
            Button(onClick = { navController.navigate("trading") }) {
                Text("Open a Position")
            }
        } else {
            positions.forEach { positionId ->
                Card(modifier = Modifier.padding(8.dp)) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Position ID: $positionId")
                        Text("Margin: 1 APT")
                        
                        Button(
                            onClick = {
                                isLoading = true
                                aptosViewModel.closePosition(positionId) { result ->
                                    isLoading = false
                                    result.onSuccess {
                                        // Refresh positions list
                                        positions = positions.filter { it != positionId }
                                    }
                                }
                            },
                            enabled = !isLoading
                        ) {
                            Text("Close Position")
                        }
                    }
                }
            }
        }
    }
}
