# Test Cresca Bucket Protocol

$CONTRACT = "0x5f971a43ff0c97789f67dc7f75a9fba019695943e0ecebbb81adc851eaa0a36f"

Write-Host "=== Cresca Bucket Protocol Test ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check collateral balance
Write-Host "1. Checking collateral balance..." -ForegroundColor Yellow
aptos move view --function-id ${CONTRACT}::bucket_protocol::get_collateral_balance --args address:${CONTRACT} --url https://api.testnet.aptoslabs.com/v1
Write-Host ""

# 2. Update oracle (using TypeScript SDK instead)
Write-Host "2. For vector arguments, use TypeScript SDK:" -ForegroundColor Yellow
Write-Host "   Example: update_oracle with prices [1000, 2000, 3000]" -ForegroundColor Gray
Write-Host ""

# 3. Open position (after bucket is created)
Write-Host "3. To open a position, first create bucket using SDK" -ForegroundColor Yellow
Write-Host ""

Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "Use TypeScript SDK for vector arguments:" -ForegroundColor White
Write-Host ""
Write-Host "// TypeScript example:" -ForegroundColor Gray
Write-Host "const aptos = new Aptos();" -ForegroundColor Gray
Write-Host "await aptos.transaction.build.simple({" -ForegroundColor Gray
Write-Host "  sender: account.accountAddress," -ForegroundColor Gray
Write-Host "  data: {" -ForegroundColor Gray
Write-Host "    function: '${CONTRACT}::bucket_protocol::create_bucket'," -ForegroundColor Gray
Write-Host "    typeArguments: []," -ForegroundColor Gray
Write-Host "    functionArguments: [" -ForegroundColor Gray
Write-Host "      ['0x1'], // assets vector" -ForegroundColor Gray
Write-Host "      [100],   // weights vector" -ForegroundColor Gray
Write-Host "      5        // leverage" -ForegroundColor Gray
Write-Host "    ]" -ForegroundColor Gray
Write-Host "  }" -ForegroundColor Gray
Write-Host "});" -ForegroundColor Gray
