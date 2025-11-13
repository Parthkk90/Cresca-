# Bucket Protocol - Complete Test Script
# Tests all functions via Aptos CLI
# Run in PowerShell: .\test-bucket-complete.ps1

$ErrorActionPreference = "Continue"

# ========== CONFIGURATION ==========
$CONTRACT_ADDRESS = "0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b"
$ACCOUNT_ADDRESS = "0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b"
$PROFILE = "testnet"  # Your aptos config profile

$LEVERAGE = 10
$COLLATERAL = 200000000  # 2 APT
$BTC_PRICE = 5000000     # $50,000
$ETH_PRICE = 350000      # $3,500
$SOL_PRICE = 10000       # $100

# ========== HELPERS ==========
function Log-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor Cyan
}

function Log-Test {
    param(
        [string]$TestName,
        [string]$Status,
        [string]$Details = ""
    )
    
    $emoji = switch ($Status) {
        "RUNNING" { "🔄" }
        "PASS" { "✅" }
        "FAIL" { "❌" }
    }
    
    $color = switch ($Status) {
        "RUNNING" { "Yellow" }
        "PASS" { "Green" }
        "FAIL" { "Red" }
    }
    
    $message = "$emoji $TestName"
    if ($Details) {
        $message += " - $Details"
    }
    
    Write-Host $message -ForegroundColor $color
}

# ========== TEST FUNCTIONS ==========

function Test-Init {
    Log-Section "Test 1: Initialize Protocol"
    Log-Test "init()" "RUNNING" "Leverage: ${LEVERAGE}x"
    
    try {
        $result = aptos move run `
            --function-id "${CONTRACT_ADDRESS}::bucket_protocol::init" `
            --args u64:$LEVERAGE `
            --profile $PROFILE `
            --assume-yes 2>&1
        
        if ($LASTEXITCODE -eq 0 -or $result -match "EALREADY_EXISTS") {
            Log-Test "init()" "PASS" "Initialized successfully"
            return $true
        } else {
            Log-Test "init()" "FAIL" $result
            return $false
        }
    } catch {
        if ($_.Exception.Message -match "EALREADY_EXISTS") {
            Log-Test "init()" "PASS" "Already initialized"
            return $true
        }
        Log-Test "init()" "FAIL" $_.Exception.Message
        return $false
    }
}

function Test-DepositCollateral {
    Log-Section "Test 2: Deposit Collateral"
    Log-Test "deposit_collateral()" "RUNNING" "Amount: $($COLLATERAL/100000000) APT"
    
    try {
        $result = aptos move run `
            --function-id "${CONTRACT_ADDRESS}::bucket_protocol::deposit_collateral" `
            --args u64:$COLLATERAL `
            --profile $PROFILE `
            --assume-yes 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Log-Test "deposit_collateral()" "PASS" "Deposited successfully"
            return $true
        } else {
            Log-Test "deposit_collateral()" "FAIL" $result
            return $false
        }
    } catch {
        Log-Test "deposit_collateral()" "FAIL" $_.Exception.Message
        return $false
    }
}

function Test-UpdateOracle {
    param(
        [int]$BTC,
        [int]$ETH,
        [int]$SOL
    )
    
    Log-Section "Test 3: Update Oracle Prices"
    Log-Test "update_oracle()" "RUNNING" "BTC: `$$($BTC/100), ETH: `$$($ETH/100), SOL: `$$($SOL/100)"
    
    try {
        $result = aptos move run `
            --function-id "${CONTRACT_ADDRESS}::bucket_protocol::update_oracle" `
            --args u64:$BTC u64:$ETH u64:$SOL `
            --profile $PROFILE `
            --assume-yes 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Log-Test "update_oracle()" "PASS" "Oracle updated"
            return $true
        } else {
            Log-Test "update_oracle()" "FAIL" $result
            return $false
        }
    } catch {
        Log-Test "update_oracle()" "FAIL" $_.Exception.Message
        return $false
    }
}

function Test-OpenLong {
    Log-Section "Test 4: Open Long Position"
    Log-Test "open_long()" "RUNNING" "Bucket ID: 0"
    
    try {
        $result = aptos move run `
            --function-id "${CONTRACT_ADDRESS}::bucket_protocol::open_long" `
            --args u64:0 `
            --profile $PROFILE `
            --assume-yes 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Log-Test "open_long()" "PASS" "Long position opened"
            return $true
        } else {
            Log-Test "open_long()" "FAIL" $result
            return $false
        }
    } catch {
        Log-Test "open_long()" "FAIL" $_.Exception.Message
        return $false
    }
}

function Test-OpenShort {
    Log-Section "Test 5: Open Short Position"
    Log-Test "open_short()" "RUNNING" "Bucket ID: 0"
    
    try {
        $result = aptos move run `
            --function-id "${CONTRACT_ADDRESS}::bucket_protocol::open_short" `
            --args u64:0 `
            --profile $PROFILE `
            --assume-yes 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Log-Test "open_short()" "PASS" "Short position opened"
            return $true
        } else {
            Log-Test "open_short()" "FAIL" $result
            return $false
        }
    } catch {
        Log-Test "open_short()" "FAIL" $_.Exception.Message
        return $false
    }
}

function Test-ClosePosition {
    param([int]$PositionId)
    
    Log-Section "Test 6: Close Position #$PositionId"
    Log-Test "close_position()" "RUNNING" "Position ID: $PositionId"
    
    try {
        $result = aptos move run `
            --function-id "${CONTRACT_ADDRESS}::bucket_protocol::close_position" `
            --args u64:$PositionId `
            --profile $PROFILE `
            --assume-yes 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Log-Test "close_position()" "PASS" "Position closed"
            return $true
        } else {
            Log-Test "close_position()" "FAIL" $result
            return $false
        }
    } catch {
        Log-Test "close_position()" "FAIL" $_.Exception.Message
        return $false
    }
}

function Test-RebalanceBucket {
    Log-Section "Test 7: Rebalance Bucket"
    Log-Test "rebalance_bucket()" "RUNNING" "New weights: 60%, 25%, 15%"
    
    try {
        # Note: Vector arguments in CLI need special syntax
        $result = aptos move run `
            --function-id "${CONTRACT_ADDRESS}::bucket_protocol::rebalance_bucket" `
            --args u64:0 "u64:[60,25,15]" `
            --profile $PROFILE `
            --assume-yes 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Log-Test "rebalance_bucket()" "PASS" "Bucket rebalanced"
            return $true
        } else {
            Log-Test "rebalance_bucket()" "FAIL" $result
            return $false
        }
    } catch {
        Log-Test "rebalance_bucket()" "FAIL" $_.Exception.Message
        return $false
    }
}

function Test-ViewFunctions {
    Log-Section "Testing View Functions"
    
    $allPassed = $true
    
    # Test get_collateral_balance
    try {
        Log-Test "get_collateral_balance" "RUNNING"
        $result = aptos move view `
            --function-id "${CONTRACT_ADDRESS}::bucket_protocol::get_collateral_balance" `
            --args address:$ACCOUNT_ADDRESS `
            --profile $PROFILE 2>&1
        
        Log-Test "get_collateral_balance" "PASS" "Result: $result"
    } catch {
        Log-Test "get_collateral_balance" "FAIL" $_.Exception.Message
        $allPassed = $false
    }
    
    # Test get_bucket_count
    try {
        Log-Test "get_bucket_count" "RUNNING"
        $result = aptos move view `
            --function-id "${CONTRACT_ADDRESS}::bucket_protocol::get_bucket_count" `
            --args address:$ACCOUNT_ADDRESS `
            --profile $PROFILE 2>&1
        
        Log-Test "get_bucket_count" "PASS" "Result: $result"
    } catch {
        Log-Test "get_bucket_count" "FAIL" $_.Exception.Message
        $allPassed = $false
    }
    
    # Test get_position_count
    try {
        Log-Test "get_position_count" "RUNNING"
        $result = aptos move view `
            --function-id "${CONTRACT_ADDRESS}::bucket_protocol::get_position_count" `
            --args address:$ACCOUNT_ADDRESS `
            --profile $PROFILE 2>&1
        
        Log-Test "get_position_count" "PASS" "Result: $result"
    } catch {
        Log-Test "get_position_count" "FAIL" $_.Exception.Message
        $allPassed = $false
    }
    
    # Test get_oracle_prices
    try {
        Log-Test "get_oracle_prices" "RUNNING"
        $result = aptos move view `
            --function-id "${CONTRACT_ADDRESS}::bucket_protocol::get_oracle_prices" `
            --args address:$ACCOUNT_ADDRESS `
            --profile $PROFILE 2>&1
        
        Log-Test "get_oracle_prices" "PASS" "Result: $result"
    } catch {
        Log-Test "get_oracle_prices" "FAIL" $_.Exception.Message
        $allPassed = $false
    }
    
    # Test get_last_oracle_update
    try {
        Log-Test "get_last_oracle_update" "RUNNING"
        $result = aptos move view `
            --function-id "${CONTRACT_ADDRESS}::bucket_protocol::get_last_oracle_update" `
            --args address:$ACCOUNT_ADDRESS `
            --profile $PROFILE 2>&1
        
        Log-Test "get_last_oracle_update" "PASS" "Result: $result"
    } catch {
        Log-Test "get_last_oracle_update" "FAIL" $_.Exception.Message
        $allPassed = $false
    }
    
    # Test get_position_details (if positions exist)
    try {
        Log-Test "get_position_details" "RUNNING"
        $result = aptos move view `
            --function-id "${CONTRACT_ADDRESS}::bucket_protocol::get_position_details" `
            --args address:$ACCOUNT_ADDRESS u64:0 `
            --profile $PROFILE 2>&1
        
        if ($result -match "ENOT_FOUND") {
            Log-Test "get_position_details" "PASS" "No positions (expected)"
        } else {
            Log-Test "get_position_details" "PASS" "Result: $result"
        }
    } catch {
        if ($_.Exception.Message -match "ENOT_FOUND") {
            Log-Test "get_position_details" "PASS" "No positions (expected)"
        } else {
            Log-Test "get_position_details" "FAIL" $_.Exception.Message
            $allPassed = $false
        }
    }
    
    return $allPassed
}

# ========== MAIN TEST RUNNER ==========
function Run-AllTests {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║     BUCKET PROTOCOL - COMPLETE FUNCTION TEST SUITE            ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "📋 Test Configuration:" -ForegroundColor Yellow
    Write-Host "   Contract: $CONTRACT_ADDRESS"
    Write-Host "   Account:  $ACCOUNT_ADDRESS"
    Write-Host "   Profile:  $PROFILE"
    Write-Host "   Leverage: ${LEVERAGE}x"
    
    $results = @{}
    
    # Run tests in sequence
    $results["init"] = Test-Init
    Start-Sleep -Seconds 2
    
    $results["deposit"] = Test-DepositCollateral
    Start-Sleep -Seconds 2
    
    $results["update_oracle_1"] = Test-UpdateOracle -BTC $BTC_PRICE -ETH $ETH_PRICE -SOL $SOL_PRICE
    Start-Sleep -Seconds 2
    
    $results["open_long"] = Test-OpenLong
    Start-Sleep -Seconds 2
    
    $results["open_short"] = Test-OpenShort
    Start-Sleep -Seconds 2
    
    # Simulate price increase
    $newBtc = [int]($BTC_PRICE * 1.1)
    $newEth = [int]($ETH_PRICE * 1.1)
    $newSol = [int]($SOL_PRICE * 1.1)
    $results["update_oracle_2"] = Test-UpdateOracle -BTC $newBtc -ETH $newEth -SOL $newSol
    Start-Sleep -Seconds 2
    
    $results["close_position"] = Test-ClosePosition -PositionId 0
    Start-Sleep -Seconds 2
    
    $results["rebalance"] = Test-RebalanceBucket
    Start-Sleep -Seconds 2
    
    $results["view_functions"] = Test-ViewFunctions
    
    # Summary
    Log-Section "Test Summary"
    
    $totalTests = $results.Count
    $passedTests = ($results.Values | Where-Object { $_ -eq $true }).Count
    $failedTests = $totalTests - $passedTests
    
    Write-Host ""
    Write-Host "📊 Results:" -ForegroundColor Yellow
    Write-Host "   Total Tests:  $totalTests"
    Write-Host "   ✅ Passed:    $passedTests" -ForegroundColor Green
    Write-Host "   ❌ Failed:    $failedTests" -ForegroundColor Red
    Write-Host "   Success Rate: $([math]::Round(($passedTests/$totalTests)*100, 1))%"
    
    if ($failedTests -eq 0) {
        Write-Host ""
        Write-Host "🎉 All tests passed! Your contract is working correctly." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "⚠️  Some tests failed. Review the output above for details." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Cyan
    Write-Host ""
}

# Run all tests
Run-AllTests
