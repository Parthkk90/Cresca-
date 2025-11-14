// Jetpack Compose UI for closing positions
package com.aptpays.cresca.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.aptpays.cresca.viewmodel.ClosePositionState
import com.aptpays.cresca.viewmodel.ClosePositionViewModel

@Composable
fun ClosePositionScreen(
    positionId: Long,
    userAccount: Account, // Your Aptos account with private key
    viewModel: ClosePositionViewModel = viewModel(),
    onSuccess: () -> Unit = {}
) {
    val state by viewModel.state.collectAsState()
    val uriHandler = LocalUriHandler.current
    
    LaunchedEffect(state) {
        if (state is ClosePositionState.Success) {
            onSuccess()
        }
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        when (val currentState = state) {
            is ClosePositionState.Idle -> {
                Button(
                    onClick = { viewModel.closePosition(positionId, userAccount) },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Close Position #$positionId")
                }
            }
            
            is ClosePositionState.Loading -> {
                CircularProgressIndicator()
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = currentState.message,
                    style = MaterialTheme.typography.bodyMedium
                )
            }
            
            is ClosePositionState.Success -> {
                Icon(
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = "Success",
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(64.dp)
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(
                    text = "Position Closed Successfully!",
                    style = MaterialTheme.typography.headlineSmall
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = "Transaction: ${currentState.transactionHash.take(16)}...",
                    style = MaterialTheme.typography.bodySmall
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Button(onClick = { uriHandler.openUri(currentState.explorerUrl) }) {
                    Text("View on Explorer")
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                TextButton(onClick = { viewModel.resetState() }) {
                    Text("Done")
                }
            }
            
            is ClosePositionState.Error -> {
                Icon(
                    imageVector = Icons.Default.Error,
                    contentDescription = "Error",
                    tint = MaterialTheme.colorScheme.error,
                    modifier = Modifier.size(64.dp)
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(
                    text = "Error Closing Position",
                    style = MaterialTheme.typography.headlineSmall,
                    color = MaterialTheme.colorScheme.error
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = currentState.message,
                    style = MaterialTheme.typography.bodyMedium
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Button(
                    onClick = { viewModel.closePosition(positionId, userAccount) }
                ) {
                    Text("Retry")
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                TextButton(onClick = { viewModel.resetState() }) {
                    Text("Cancel")
                }
            }
        }
    }
}
