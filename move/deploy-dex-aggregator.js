/**
 * Deploy CrescaDEXAggregator using Aptos TypeScript SDK
 * No Aptos CLI required!
 */

const fs = require('fs');
const path = require('path');

console.log('🔨 Cresca DEX Aggregator - Deploy to Testnet\n');
console.log('━'.repeat(60));

async function main() {
    try {
        // Import Aptos SDK
        const { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } = require('@aptos-labs/ts-sdk');
        
        // Configuration
        const PRIVATE_KEY = '0x40daf4e4316a895eec706d88006d6a3ba75f22b01f0b4390556d679101d6e309';
        const config = new AptosConfig({ network: Network.TESTNET });
        const aptos = new Aptos(config);
        
        // Load account
        const privateKey = new Ed25519PrivateKey(PRIVATE_KEY);
        const account = Account.fromPrivateKey({ privateKey });
        
        console.log('\n📋 Deployment Details:');
        console.log(`   Account: ${account.accountAddress.toString()}`);
        console.log(`   Network: Testnet`);
        console.log(`   Module: cresca::dex_aggregator`);
        
        // Check balance
        console.log('\n💰 Checking account balance...');
        const resources = await aptos.getAccountResources({ accountAddress: account.accountAddress });
        const coinResource = resources.find(r => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>');
        if (coinResource) {
            const balance = parseInt(coinResource.data.coin.value) / 100000000;
            console.log(`   Balance: ${balance} APT`);
            if (balance < 0.1) {
                console.log('⚠️  Warning: Low balance, deployment may fail');
            }
        }
        
        // Read Move.toml to get package info
        console.log('\n📖 Reading Move.toml...');
        const moveTomlPath = path.join(__dirname, 'Move.toml');
        const moveToml = fs.readFileSync(moveTomlPath, 'utf8');
        console.log('✅ Move.toml loaded');
        
        // Read compiled module
        console.log('\n📦 Reading compiled bytecode...');
        const buildPath = path.join(__dirname, 'build', 'AptPays', 'bytecode_modules');
        
        if (!fs.existsSync(buildPath)) {
            console.log('❌ Build directory not found!');
            console.log('   Please compile first with: aptos move compile');
            console.log('   Or use the online Aptos compiler at: https://playground.aptos.dev/');
            process.exit(1);
        }
        
        const moduleFiles = fs.readdirSync(buildPath).filter(f => f.endsWith('.mv'));
        if (moduleFiles.length === 0) {
            console.log('❌ No compiled modules found!');
            process.exit(1);
        }
        
        console.log(`   Found ${moduleFiles.length} module(s):`);
        moduleFiles.forEach(f => console.log(`   - ${f}`));
        
        // Read the dex_aggregator module
        const modulePath = path.join(buildPath, 'dex_aggregator.mv');
        if (!fs.existsSync(modulePath)) {
            console.log('❌ dex_aggregator.mv not found!');
            console.log('   Available modules:', moduleFiles.join(', '));
            process.exit(1);
        }
        
        const moduleBytes = fs.readFileSync(modulePath);
        console.log(`✅ Module size: ${moduleBytes.length} bytes`);
        
        // Read package metadata
        const buildInfoPath = path.join(__dirname, 'build', 'AptPays', 'package-metadata.bcs');
        let metadataBytes;
        if (fs.existsSync(buildInfoPath)) {
            metadataBytes = fs.readFileSync(buildInfoPath);
            console.log(`✅ Metadata size: ${metadataBytes.length} bytes`);
        } else {
            console.log('⚠️  No package metadata found, using empty metadata');
            metadataBytes = Buffer.from([]);
        }
        
        // Build transaction
        console.log('\n🚀 Publishing module to testnet...');
        console.log('   (This may take 30-60 seconds)');
        
        const transaction = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: {
                function: "0x1::code::publish_package_txn",
                functionArguments: [
                    metadataBytes,
                    [moduleBytes]
                ],
            },
        });
        
        const pendingTx = await aptos.signAndSubmitTransaction({
            signer: account,
            transaction,
        });
        
        console.log(`\n⏳ Transaction submitted: ${pendingTx.hash}`);
        console.log('   Waiting for confirmation...');
        
        // Wait for transaction
        const executedTx = await aptos.waitForTransaction({
            transactionHash: pendingTx.hash,
        });
        
        if (executedTx.success) {
            console.log('\n✅ CONTRACT DEPLOYED SUCCESSFULLY!\n');
            console.log('━'.repeat(60));
            console.log('📋 Deployment Summary:');
            console.log(`   Contract Address: ${account.accountAddress.toString()}`);
            console.log(`   Module: cresca::dex_aggregator`);
            console.log(`   Transaction: ${pendingTx.hash}`);
            console.log(`   Explorer: https://explorer.aptoslabs.com/txn/${pendingTx.hash}?network=testnet`);
            console.log('━'.repeat(60));
            
            console.log('\n🎯 Next Steps:');
            console.log('   1. Initialize the aggregator:');
            console.log(`      aptos move run --function-id ${account.accountAddress}::dex_aggregator::initialize --profile testnet`);
            console.log('   2. Test finding best route:');
            console.log(`      aptos move view --function-id ${account.accountAddress}::dex_aggregator::find_best_route --type-args "0x1::aptos_coin::AptosCoin" "USDC_TYPE" --args u64:100000000 address:${account.accountAddress}`);
            
            console.log('\n📝 Save this info to Move.toml:');
            console.log(`   cresca = "${account.accountAddress}"`);
            
        } else {
            console.log('\n❌ Transaction failed!');
            console.log('   Error:', executedTx.vm_status);
        }
        
    } catch (error) {
        console.error('\n❌ Deployment Error:', error.message);
        if (error.data) {
            console.error('   Details:', JSON.stringify(error.data, null, 2));
        }
        process.exit(1);
    }
}

// Check if SDK is installed
try {
    require('@aptos-labs/ts-sdk');
    main();
} catch (error) {
    console.log('\n❌ Aptos SDK not found!');
    console.log('   Installing @aptos-labs/ts-sdk...\n');
    
    const { exec } = require('child_process');
    exec('npm install @aptos-labs/ts-sdk', { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Failed to install SDK:', stderr);
            console.log('\n   Please install manually:');
            console.log('   npm install @aptos-labs/ts-sdk');
            process.exit(1);
        } else {
            console.log('✅ SDK installed! Running deployment...\n');
            main();
        }
    });
}
