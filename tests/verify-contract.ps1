# Simple Contract Verification Script
# Uses Aptos REST API - No dependencies needed!
# Run: .\verify-contract.ps1

$ErrorActionPreference = "Continue"

# Configuration
$CONTRACT_ADDRESS = "0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b"
$APTOS_NODE = "https://fullnode.testnet.aptoslabs.com/v1"

function Log-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
}

function Log-Test {
    param(
        [string]$TestName,
        [string]$Status,
        [string]$Details = ""
    )
    
    $prefix = switch ($Status) {
        "RUNNING" { "[*]" }
        "PASS" { "[+]" }
        "FAIL" { "[-]" }
        "INFO" { "[i]" }
    }
    
    $color = switch ($Status) {
        "RUNNING" { "Yellow" }
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "INFO" { "Cyan" }
    }
    
    $message = "$prefix $TestName"
    if ($Details) {
        $message += " - $Details"
    }
    
    Write-Host $message -ForegroundColor $color
}

# Test if contract exists
function Test-ContractExists {
    Log-Section "Test 1: Verify Contract Deployment"
    Log-Test "Checking if contract exists" "RUNNING"
    
    try {
        $url = "$APTOS_NODE/accounts/$CONTRACT_ADDRESS/modules"
        $response = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
        
        if ($response -and $response.Count -gt 0) {
            $moduleNames = $response | ForEach-Object { $_.abi.name }
            Log-Test "Contract exists" "PASS" "Found $($response.Count) module(s): $($moduleNames -join ', ')"
            
            $bucketProtocol = $response | Where-Object { $_.abi.name -eq "bucket_protocol" }
            if ($bucketProtocol) {
                Log-Test "bucket_protocol module" "PASS" "Module found and deployed"
                return $bucketProtocol
            } else {
                Log-Test "bucket_protocol module" "FAIL" "Module not found"
                return $null
            }
        } else {
            Log-Test "Contract exists" "FAIL" "No modules found at this address"
            return $null
        }
    } catch {
        Log-Test "Contract exists" "FAIL" "Error: $($_.Exception.Message)"
        return $null
    }
}

# Check all functions
function Test-ModuleFunctions {
    param($Module)
    
    Log-Section "Test 2: Verify All Functions"
    
    $exposedFunctions = $Module.abi.exposed_functions
    
    Log-Test "Total functions" "INFO" "Found $($exposedFunctions.Count) functions"
    Write-Host ""
    
    $expectedFunctions = @(
        "init",
        "deposit_collateral",
        "open_long",
        "open_short",
        "close_position",
        "update_oracle",
        "rebalance_bucket",
        "liquidate_position",
        "get_collateral_balance",
        "get_bucket_count",
        "get_position_count",
        "get_position_details",
        "get_oracle_prices",
        "get_last_oracle_update"
    )
    
    $foundFunctions = @()
    $missingFunctions = @()
    
    foreach ($expectedFunc in $expectedFunctions) {
        $found = $exposedFunctions | Where-Object { $_.name -eq $expectedFunc }
        
        if ($found) {
            $isView = $found.is_view
            $funcType = if ($isView) { "view" } else { "entry" }
            Log-Test $expectedFunc "PASS" "Type: $funcType"
            $foundFunctions += $expectedFunc
        } else {
            Log-Test $expectedFunc "FAIL" "Function not found"
            $missingFunctions += $expectedFunc
        }
    }
    
    Write-Host ""
    Log-Test "Function coverage" "INFO" "$($foundFunctions.Count)/$($expectedFunctions.Count) functions found"
    
    if ($missingFunctions.Count -gt 0) {
        Write-Host "Missing functions: $($missingFunctions -join ', ')" -ForegroundColor Yellow
    }
    
    return ($missingFunctions.Count -eq 0)
}

# Check account resources
function Test-AccountResources {
    Log-Section "Test 3: Check Account Resources"
    Log-Test "Fetching account resources" "RUNNING"
    
    try {
        $url = "$APTOS_NODE/accounts/$CONTRACT_ADDRESS/resources"
        $response = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
        
        if ($response) {
            Log-Test "Account resources" "PASS" "Found $($response.Count) resource(s)"
            
            $protocolResource = $response | Where-Object { $_.type -like "*bucket_protocol::Protocol" }
            
            if ($protocolResource) {
                Log-Test "Protocol resource" "PASS" "Protocol initialized"
                
                Write-Host ""
                Write-Host "Protocol Data:" -ForegroundColor Cyan
                $data = $protocolResource.data
                Write-Host "  Collateral Balance: $($data.collateral_balance) octas" -ForegroundColor White
                Write-Host "  Buckets Count: $($data.buckets.Count)" -ForegroundColor White
                Write-Host "  Positions Count: $($data.positions.Count)" -ForegroundColor White
                Write-Host "  Oracle Prices: $($data.oracle_prices -join ', ')" -ForegroundColor White
                Write-Host "  Last Oracle Update: $($data.last_oracle_update)" -ForegroundColor White
                
                return $true
            } else {
                Log-Test "Protocol resource" "INFO" "Protocol not initialized yet"
                return $false
            }
        } else {
            Log-Test "Account resources" "FAIL" "No resources found"
            return $false
        }
    } catch {
        if ($_.Exception.Message -like "*404*") {
            Log-Test "Account resources" "INFO" "Account exists but no resources yet"
            return $false
        } else {
            Log-Test "Account resources" "FAIL" "Error: $($_.Exception.Message)"
            return $false
        }
    }
}

# Test view function
function Test-ViewFunction {
    param(
        [string]$FunctionName,
        [array]$Arguments
    )
    
    Log-Test "$FunctionName view" "RUNNING"
    
    try {
        $url = "$APTOS_NODE/view"
        $body = @{
            function = "${CONTRACT_ADDRESS}::bucket_protocol::$FunctionName"
            type_arguments = @()
            arguments = $Arguments
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        
        Log-Test "$FunctionName view" "PASS" "Result: $($response -join ', ')"
        return $true
    } catch {
        if ($_.Exception.Message -like "*RESOURCE_NOT_FOUND*") {
            Log-Test "$FunctionName view" "INFO" "Resource not found (not initialized)"
        } else {
            Log-Test "$FunctionName view" "FAIL" "Error: $($_.Exception.Message)"
        }
        return $false
    }
}

# Test all view functions
function Test-AllViewFunctions {
    Log-Section "Test 4: Test View Functions (Read-Only)"
    
    $results = @{}
    
    $results["get_collateral_balance"] = Test-ViewFunction "get_collateral_balance" @($CONTRACT_ADDRESS)
    $results["get_bucket_count"] = Test-ViewFunction "get_bucket_count" @($CONTRACT_ADDRESS)
    $results["get_position_count"] = Test-ViewFunction "get_position_count" @($CONTRACT_ADDRESS)
    $results["get_oracle_prices"] = Test-ViewFunction "get_oracle_prices" @($CONTRACT_ADDRESS)
    $results["get_last_oracle_update"] = Test-ViewFunction "get_last_oracle_update" @($CONTRACT_ADDRESS)
    
    return $results
}

# Show next steps
function Show-NextSteps {
    Log-Section "Next Steps"
    
    Write-Host ""
    Write-Host "To test entry functions (transactions), you need:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Install Node.js (Recommended)" -ForegroundColor Cyan
    Write-Host "  1. Download from https://nodejs.org/" -ForegroundColor White
    Write-Host "  2. Install Node.js" -ForegroundColor White
    Write-Host "  3. Run: npm install @aptos-labs/ts-sdk" -ForegroundColor White
    Write-Host "  4. Run: npx ts-node test-bucket-protocol-complete.ts" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: Install Aptos CLI" -ForegroundColor Cyan
    Write-Host "  1. Download from https://aptos.dev/tools/aptos-cli/install-cli/" -ForegroundColor White
    Write-Host "  2. Run: aptos init --profile testnet" -ForegroundColor White
    Write-Host "  3. Run: .\test-bucket-complete.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 3: Manual Testing via Explorer" -ForegroundColor Cyan
    Write-Host "  Visit: https://explorer.aptoslabs.com/account/$CONTRACT_ADDRESS/modules?network=testnet" -ForegroundColor White
    Write-Host "  Click on functions and test them interactively" -ForegroundColor White
    Write-Host ""
}

# Main function
function Main {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  BUCKET PROTOCOL - CONTRACT VERIFICATION                  " -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "Configuration:" -ForegroundColor Yellow
    Write-Host "   Contract: $CONTRACT_ADDRESS"
    Write-Host "   Network:  Testnet"
    Write-Host "   API:      $APTOS_NODE"
    
    $results = @{}
    
    $module = Test-ContractExists
    $results["contract_exists"] = ($null -ne $module)
    
    if ($module) {
        $results["all_functions"] = Test-ModuleFunctions $module
        $results["resources"] = Test-AccountResources
        $viewResults = Test-AllViewFunctions
        $results["view_functions"] = ($viewResults.Values | Where-Object { $_ -eq $true }).Count -gt 0
    }
    
    Log-Section "Verification Summary"
    
    $totalTests = $results.Count
    $passedTests = ($results.Values | Where-Object { $_ -eq $true }).Count
    $failedTests = $totalTests - $passedTests
    
    Write-Host ""
    Write-Host "Results:" -ForegroundColor Yellow
    Write-Host "   Total Checks: $totalTests"
    Write-Host "   [+] Passed:   $passedTests" -ForegroundColor Green
    Write-Host "   [-] Failed:   $failedTests" -ForegroundColor Red
    Write-Host "   Success Rate: $([math]::Round(($passedTests/$totalTests)*100, 1))%"
    
    if ($results["contract_exists"] -and $results["all_functions"]) {
        Write-Host ""
        Write-Host "[+] Contract is deployed and all functions are present!" -ForegroundColor Green
        Write-Host "[+] You can proceed with testing transactions." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "[!] Contract verification incomplete." -ForegroundColor Yellow
    }
    
    Show-NextSteps
    
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
}

# Run verification
Main
