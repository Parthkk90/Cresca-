# Quick Test Script for Bucket Protocol
$CONTRACT = "0x5f971a43ff0c97789f67dc7f75a9fba019695943e0ecebbb81adc851eaa0a36f"

Write-Host "=== Cresca Bucket Protocol - Quick Tests ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check initial collateral
Write-Host "Test 1: Current Collateral Balance" -ForegroundColor Yellow
aptos move view --function-id ${CONTRACT}::bucket_protocol::get_collateral_balance --args address:${CONTRACT} --url https://api.testnet.aptoslabs.com/v1
Write-Host ""

# Test 2: Deposit more collateral
Write-Host "Test 2: Depositing 0.5 APT..." -ForegroundColor Yellow
aptos move run --function-id ${CONTRACT}::bucket_protocol::deposit_collateral --args u64:50000000 --profile testnet
Write-Host ""

# Test 3: Check updated balance
Write-Host "Test 3: Updated Collateral Balance" -ForegroundColor Yellow
aptos move view --function-id ${CONTRACT}::bucket_protocol::get_collateral_balance --args address:${CONTRACT} --url https://api.testnet.aptoslabs.com/v1
Write-Host ""

# Test 4: Check bucket count
Write-Host "Test 4: Bucket Count" -ForegroundColor Yellow
aptos move view --function-id ${CONTRACT}::bucket_protocol::get_bucket_count --args address:${CONTRACT} --url https://api.testnet.aptoslabs.com/v1
Write-Host ""

# Test 5: Check position count
Write-Host "Test 5: Position Count" -ForegroundColor Yellow
aptos move view --function-id ${CONTRACT}::bucket_protocol::get_position_count --args address:${CONTRACT} --url https://api.testnet.aptoslabs.com/v1
Write-Host ""

Write-Host "=== CLI Tests Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "To test bucket creation and positions, run:" -ForegroundColor Cyan
Write-Host "  npm install" -ForegroundColor Gray
Write-Host "  npm run test" -ForegroundColor Gray
