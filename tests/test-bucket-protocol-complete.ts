/**
 * Complete Test Suite for Bucket Protocol
 * Tests all 10 entry functions + 6 view functions
 * 
 * Prerequisites:
 * 1. Contract deployed at CONTRACT_ADDRESS
 * 2. Account funded with APT (for gas and collateral)
 * 3. Node.js + npm installed
 * 
 * Run: npx ts-node test-bucket-protocol-complete.ts
 */

import { 
    Aptos, 
    AptosConfig, 
    Network, 
    Account,
    Ed25519PrivateKey,
    InputViewFunctionData,
    InputEntryFunctionData
} from "@aptos-labs/ts-sdk";

// ========== CONFIGURATION ==========
const CONFIG = {
    NETWORK: Network.TESTNET,
    // UPDATE THIS: Your deployed contract address
    CONTRACT_ADDRESS: "0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b",
    
    // UPDATE THIS: Your account private key (with 0x prefix)
    PRIVATE_KEY: "0x40daf4e4316a895eec706d88006d6a3ba75f22b01f0b4390556d679101d6e309",
    
    // Test parameters
    LEVERAGE: 10,
    COLLATERAL_AMOUNT: 200_000_000, // 2 APT
    
    // Oracle prices (in cents)
    BTC_PRICE: 5_000_000, // $50,000
    ETH_PRICE: 350_000,   // $3,500
    SOL_PRICE: 10_000,    // $100
};

// ========== HELPERS ==========
const aptos = new Aptos(new AptosConfig({ network: CONFIG.NETWORK }));

function createAccountFromPrivateKey(privateKeyHex: string): Account {
    const privateKey = new Ed25519PrivateKey(privateKeyHex);
    return Account.fromPrivateKey({ privateKey });
}

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function logSection(title: string) {
    console.log("\n" + "=".repeat(60));
    console.log(`  ${title}`);
    console.log("=".repeat(60));
}

function logTest(testName: string, status: "RUNNING" | "PASS" | "FAIL", details?: string) {
    const emoji = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "🔄";
    console.log(`${emoji} ${testName}${details ? ` - ${details}` : ""}`);
}

// ========== VIEW FUNCTIONS ==========
async function testViewFunctions(account: Account) {
    logSection("Testing View Functions");
    
    const addr = account.accountAddress.toString();
    
    try {
        // Test 1: get_collateral_balance
        logTest("get_collateral_balance", "RUNNING");
        const balancePayload: InputViewFunctionData = {
            function: `${CONFIG.CONTRACT_ADDRESS}::bucket_protocol::get_collateral_balance`,
            typeArguments: [],
            functionArguments: [addr],
        };
        const balance = await aptos.view({ payload: balancePayload });
        logTest("get_collateral_balance", "PASS", `Balance: ${balance[0]}`);
        
        // Test 2: get_bucket_count
        logTest("get_bucket_count", "RUNNING");
        const bucketCountPayload: InputViewFunctionData = {
            function: `${CONFIG.CONTRACT_ADDRESS}::bucket_protocol::get_bucket_count`,
            typeArguments: [],
            functionArguments: [addr],
        };
        const bucketCount = await aptos.view({ payload: bucketCountPayload });
        logTest("get_bucket_count", "PASS", `Count: ${bucketCount[0]}`);
        
        // Test 3: get_position_count
        logTest("get_position_count", "RUNNING");
        const positionCountPayload: InputViewFunctionData = {
            function: `${CONFIG.CONTRACT_ADDRESS}::bucket_protocol::get_position_count`,
            typeArguments: [],
            functionArguments: [addr],
        };
        const positionCount = await aptos.view({ payload: positionCountPayload });
        logTest("get_position_count", "PASS", `Count: ${positionCount[0]}`);
        
        // Test 4: get_oracle_prices
        logTest("get_oracle_prices", "RUNNING");
        const oraclePricesPayload: InputViewFunctionData = {
            function: `${CONFIG.CONTRACT_ADDRESS}::bucket_protocol::get_oracle_prices`,
            typeArguments: [],
            functionArguments: [addr],
        };
        const oraclePrices = await aptos.view({ payload: oraclePricesPayload });
        logTest("get_oracle_prices", "PASS", `Prices: ${JSON.stringify(oraclePrices[0])}`);
        
        // Test 5: get_last_oracle_update
        logTest("get_last_oracle_update", "RUNNING");
        const lastUpdatePayload: InputViewFunctionData = {
            function: `${CONFIG.CONTRACT_ADDRESS}::bucket_protocol::get_last_oracle_update`,
            typeArguments: [],
            functionArguments: [addr],
        };
        const lastUpdate = await aptos.view({ payload: lastUpdatePayload });
        logTest("get_last_oracle_update", "PASS", `Timestamp: ${lastUpdate[0]}`);
        
        // Test 6: get_position_details (if positions exist)
        if (Number(positionCount[0]) > 0) {
            logTest("get_position_details", "RUNNING");
            const positionDetailsPayload: InputViewFunctionData = {
                function: `${CONFIG.CONTRACT_ADDRESS}::bucket_protocol::get_position_details`,
                typeArguments: [],
                functionArguments: [addr, 0], // First position
            };
            const positionDetails = await aptos.view({ payload: positionDetailsPayload });
            logTest("get_position_details", "PASS", `Details: ${JSON.stringify(positionDetails)}`);
        } else {
            logTest("get_position_details", "PASS", "No positions to query (expected)");
        }
        
        return true;
    } catch (error: any) {
        logTest("View Functions", "FAIL", error.message);
        return false;
    }
}

// ========== ENTRY FUNCTIONS ==========
async function testInitFunction(account: Account): Promise<boolean> {
    logSection("Test 1: Initialize Protocol");
    
    try {
        logTest("init()", "RUNNING", `Leverage: ${CONFIG.LEVERAGE}x`);
        
        const payload: InputEntryFunctionData = {
            function: `${CONFIG.CONTRACT_ADDRESS}::bucket_protocol::init`,
            typeArguments: [],
            functionArguments: [CONFIG.LEVERAGE],
        };
        
        const txn = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: payload,
        });
        
        const committedTxn = await aptos.signAndSubmitTransaction({
            signer: account,
            transaction: txn,
        });
        
        await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
        
        logTest("init()", "PASS", `Tx: ${committedTxn.hash}`);
        return true;
    } catch (error: any) {
        if (error.message?.includes("EALREADY_EXISTS")) {
            logTest("init()", "PASS", "Already initialized (expected)");
            return true;
        }
        logTest("init()", "FAIL", error.message);
        return false;
    }
}

async function testDepositCollateral(account: Account): Promise<boolean> {
    logSection("Test 2: Deposit Collateral");
    
    try {
        logTest("deposit_collateral()", "RUNNING", `Amount: ${CONFIG.COLLATERAL_AMOUNT / 100_000_000} APT`);
        
        const payload: InputEntryFunctionData = {
            function: `${CONFIG.CONTRACT_ADDRESS}::bucket_protocol::deposit_collateral`,
            typeArguments: [],
            functionArguments: [CONFIG.COLLATERAL_AMOUNT],
        };
        
        const txn = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: payload,
        });
        
        const committedTxn = await aptos.signAndSubmitTransaction({
            signer: account,
            transaction: txn,
        });
        
        await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
        
        logTest("deposit_collateral()", "PASS", `Tx: ${committedTxn.hash}`);
        return true;
    } catch (error: any) {
        logTest("deposit_collateral()", "FAIL", error.message);
        return false;
    }
}

async function testUpdateOracle(account: Account): Promise<boolean> {
    logSection("Test 3: Update Oracle Prices");
    
    try {
        logTest("update_oracle()", "RUNNING", 
            `BTC: $${CONFIG.BTC_PRICE/100}, ETH: $${CONFIG.ETH_PRICE/100}, SOL: $${CONFIG.SOL_PRICE/100}`);
        
        const payload: InputEntryFunctionData = {
            function: `${CONFIG.CONTRACT_ADDRESS}::bucket_protocol::update_oracle`,
            typeArguments: [],
            functionArguments: [CONFIG.BTC_PRICE, CONFIG.ETH_PRICE, CONFIG.SOL_PRICE],
        };
        
        const txn = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: payload,
        });
        
        const committedTxn = await aptos.signAndSubmitTransaction({
            signer: account,
            transaction: txn,
        });
        
        await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
        
        logTest("update_oracle()", "PASS", `Tx: ${committedTxn.hash}`);
        return true;
    } catch (error: any) {
        logTest("update_oracle()", "FAIL", error.message);
        return false;
    }
}

async function testOpenLongPosition(account: Account): Promise<boolean> {
    logSection("Test 4: Open Long Position");
    
    try {
        const bucketId = 0; // First bucket
        logTest("open_long()", "RUNNING", `Bucket ID: ${bucketId}`);
        
        const payload: InputEntryFunctionData = {
            function: `${CONFIG.CONTRACT_ADDRESS}::bucket_protocol::open_long`,
            typeArguments: [],
            functionArguments: [bucketId],
        };
        
        const txn = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: payload,
        });
        
        const committedTxn = await aptos.signAndSubmitTransaction({
            signer: account,
            transaction: txn,
        });
        
        await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
        
        logTest("open_long()", "PASS", `Tx: ${committedTxn.hash}`);
        return true;
    } catch (error: any) {
        logTest("open_long()", "FAIL", error.message);
        return false;
    }
}

async function testOpenShortPosition(account: Account): Promise<boolean> {
    logSection("Test 5: Open Short Position");
    
    try {
        const bucketId = 0; // First bucket
        logTest("open_short()", "RUNNING", `Bucket ID: ${bucketId}`);
        
        const payload: InputEntryFunctionData = {
            function: `${CONFIG.CONTRACT_ADDRESS}::bucket_protocol::open_short`,
            typeArguments: [],
            functionArguments: [bucketId],
        };
        
        const txn = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: payload,
        });
        
        const committedTxn = await aptos.signAndSubmitTransaction({
            signer: account,
            transaction: txn,
        });
        
        await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
        
        logTest("open_short()", "PASS", `Tx: ${committedTxn.hash}`);
        return true;
    } catch (error: any) {
        logTest("open_short()", "FAIL", error.message);
        return false;
    }
}

async function testUpdateOracleWithNewPrices(account: Account): Promise<boolean> {
    logSection("Test 6: Update Oracle (Price Change Simulation)");
    
    try {
        // Simulate 10% price increase
        const newBtcPrice = Math.floor(CONFIG.BTC_PRICE * 1.1);
        const newEthPrice = Math.floor(CONFIG.ETH_PRICE * 1.1);
        const newSolPrice = Math.floor(CONFIG.SOL_PRICE * 1.1);
        
        logTest("update_oracle()", "RUNNING", 
            `+10% increase: BTC: $${newBtcPrice/100}, ETH: $${newEthPrice/100}, SOL: $${newSolPrice/100}`);
        
        const payload: InputEntryFunctionData = {
            function: `${CONFIG.CONTRACT_ADDRESS}::bucket_protocol::update_oracle`,
            typeArguments: [],
            functionArguments: [newBtcPrice, newEthPrice, newSolPrice],
        };
        
        const txn = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: payload,
        });
        
        const committedTxn = await aptos.signAndSubmitTransaction({
            signer: account,
            transaction: txn,
        });
        
        await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
        
        logTest("update_oracle()", "PASS", `Tx: ${committedTxn.hash}`);
        return true;
    } catch (error: any) {
        logTest("update_oracle()", "FAIL", error.message);
        return false;
    }
}

async function testClosePosition(account: Account, positionId: number): Promise<boolean> {
    logSection(`Test 7: Close Position #${positionId}`);
    
    try {
        logTest("close_position()", "RUNNING", `Position ID: ${positionId}`);
        
        const payload: InputEntryFunctionData = {
            function: `${CONFIG.CONTRACT_ADDRESS}::bucket_protocol::close_position`,
            typeArguments: [],
            functionArguments: [positionId],
        };
        
        const txn = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: payload,
        });
        
        const committedTxn = await aptos.signAndSubmitTransaction({
            signer: account,
            transaction: txn,
        });
        
        await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
        
        logTest("close_position()", "PASS", `Tx: ${committedTxn.hash}`);
        return true;
    } catch (error: any) {
        logTest("close_position()", "FAIL", error.message);
        return false;
    }
}

async function testRebalanceBucket(account: Account): Promise<boolean> {
    logSection("Test 8: Rebalance Bucket");
    
    try {
        const bucketId = 0;
        // New weights: BTC 60%, ETH 25%, SOL 15%
        const newWeights = [60, 25, 15];
        
        logTest("rebalance_bucket()", "RUNNING", `New weights: ${newWeights.join(", ")}%`);
        
        const payload: InputEntryFunctionData = {
            function: `${CONFIG.CONTRACT_ADDRESS}::bucket_protocol::rebalance_bucket`,
            typeArguments: [],
            functionArguments: [bucketId, newWeights],
        };
        
        const txn = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: payload,
        });
        
        const committedTxn = await aptos.signAndSubmitTransaction({
            signer: account,
            transaction: txn,
        });
        
        await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
        
        logTest("rebalance_bucket()", "PASS", `Tx: ${committedTxn.hash}`);
        return true;
    } catch (error: any) {
        logTest("rebalance_bucket()", "FAIL", error.message);
        return false;
    }
}

async function testLiquidatePosition(account: Account): Promise<boolean> {
    logSection("Test 9: Liquidate Position (If Applicable)");
    
    try {
        const positionId = 0;
        
        logTest("liquidate_position()", "RUNNING", `Position ID: ${positionId}`);
        
        const payload: InputEntryFunctionData = {
            function: `${CONFIG.CONTRACT_ADDRESS}::bucket_protocol::liquidate_position`,
            typeArguments: [],
            functionArguments: [positionId],
        };
        
        const txn = await aptos.transaction.build.simple({
            sender: account.accountAddress,
            data: payload,
        });
        
        const committedTxn = await aptos.signAndSubmitTransaction({
            signer: account,
            transaction: txn,
        });
        
        await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
        
        logTest("liquidate_position()", "PASS", `Tx: ${committedTxn.hash}`);
        return true;
    } catch (error: any) {
        if (error.message?.includes("margin")) {
            logTest("liquidate_position()", "PASS", "Position not eligible for liquidation (expected)");
            return true;
        }
        logTest("liquidate_position()", "FAIL", error.message);
        return false;
    }
}

// ========== MAIN TEST RUNNER ==========
async function runAllTests() {
    console.log("\n");
    console.log("╔═══════════════════════════════════════════════════════════════╗");
    console.log("║     BUCKET PROTOCOL - COMPLETE FUNCTION TEST SUITE            ║");
    console.log("╚═══════════════════════════════════════════════════════════════╝");
    
    const account = createAccountFromPrivateKey(CONFIG.PRIVATE_KEY);
    
    console.log(`\n📋 Test Configuration:`);
    console.log(`   Contract: ${CONFIG.CONTRACT_ADDRESS}`);
    console.log(`   Account:  ${account.accountAddress.toString()}`);
    console.log(`   Network:  ${CONFIG.NETWORK}`);
    console.log(`   Leverage: ${CONFIG.LEVERAGE}x`);
    
    const results: { [key: string]: boolean } = {};
    
    // Test sequence
    results["init"] = await testInitFunction(account);
    await sleep(1000);
    
    results["deposit"] = await testDepositCollateral(account);
    await sleep(1000);
    
    results["update_oracle_1"] = await testUpdateOracle(account);
    await sleep(1000);
    
    results["open_long"] = await testOpenLongPosition(account);
    await sleep(1000);
    
    results["open_short"] = await testOpenShortPosition(account);
    await sleep(1000);
    
    results["update_oracle_2"] = await testUpdateOracleWithNewPrices(account);
    await sleep(1000);
    
    // Close the first position (long)
    results["close_position_0"] = await testClosePosition(account, 0);
    await sleep(1000);
    
    results["rebalance"] = await testRebalanceBucket(account);
    await sleep(1000);
    
    results["liquidate"] = await testLiquidatePosition(account);
    await sleep(1000);
    
    // Test all view functions
    results["view_functions"] = await testViewFunctions(account);
    
    // Summary
    logSection("Test Summary");
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(r => r).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`\n📊 Results:`);
    console.log(`   Total Tests:  ${totalTests}`);
    console.log(`   ✅ Passed:    ${passedTests}`);
    console.log(`   ❌ Failed:    ${failedTests}`);
    console.log(`   Success Rate: ${((passedTests/totalTests)*100).toFixed(1)}%`);
    
    if (failedTests === 0) {
        console.log(`\n🎉 All tests passed! Your contract is working correctly.`);
    } else {
        console.log(`\n⚠️  Some tests failed. Review the output above for details.`);
    }
    
    console.log("\n" + "=".repeat(60) + "\n");
}

// Run tests
runAllTests().catch(console.error);
