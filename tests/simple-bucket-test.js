// Simple Node.js test for Bucket Protocol
// Run: node simple-bucket-test.js

const { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } = require("@aptos-labs/ts-sdk");

// Configuration
const CONFIG = {
    NETWORK: Network.TESTNET,
    CONTRACT_ADDRESS: "0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b",
    PRIVATE_KEY: "0x40daf4e4316a895eec706d88006d6a3ba75f22b01f0b4390556d679101d6e309",
    LEVERAGE: 10,
    COLLATERAL: 200_000_000, // 2 APT
    BTC_PRICE: 5_000_000,
    ETH_PRICE: 350_000,
    SOL_PRICE: 10_000,
};

const aptos = new Aptos(new AptosConfig({ network: CONFIG.NETWORK }));

function createAccount(privateKeyHex) {
    const privateKey = new Ed25519PrivateKey(privateKeyHex);
    return Account.fromPrivateKey({ privateKey });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testFunction(name, fn) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Testing: ${name}`);
    console.log("=".repeat(60));
    try {
        const result = await fn();
        console.log(`✅ PASS: ${name}`);
        if (result) console.log(`   Result: ${JSON.stringify(result)}`);
        return true;
    } catch (error) {
        if (error.message?.includes("EALREADY_EXISTS")) {
            console.log(`✅ PASS: ${name} (Already initialized)`);
            return true;
        }
        console.log(`❌ FAIL: ${name}`);
        console.log(`   Error: ${error.message}`);
        return false;
    }
}

async function testInit(account) {
    const payload = {
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
    return committedTxn.hash;
}

async function testDeposit(account) {
    const payload = {
        function: `${CONFIG.CONTRACT_ADDRESS}::bucket_protocol::deposit_collateral`,
        typeArguments: [],
        functionArguments: [CONFIG.COLLATERAL],
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
    return committedTxn.hash;
}

async function testUpdateOracle(account, btc, eth, sol) {
    const payload = {
        function: `${CONFIG.CONTRACT_ADDRESS}::bucket_protocol::update_oracle`,
        typeArguments: [],
        functionArguments: [btc, eth, sol],
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
    return committedTxn.hash;
}

async function testOpenLong(account) {
    const payload = {
        function: `${CONFIG.CONTRACT_ADDRESS}::bucket_protocol::open_long`,
        typeArguments: [],
        functionArguments: [0], // bucket_id
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
    return committedTxn.hash;
}

async function testOpenShort(account) {
    const payload = {
        function: `${CONFIG.CONTRACT_ADDRESS}::bucket_protocol::open_short`,
        typeArguments: [],
        functionArguments: [0], // bucket_id
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
    return committedTxn.hash;
}

async function testClosePosition(account, positionId) {
    const payload = {
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
    return committedTxn.hash;
}

async function testViewFunction(name, functionName, args) {
    const payload = {
        function: `${CONFIG.CONTRACT_ADDRESS}::bucket_protocol::${functionName}`,
        typeArguments: [],
        functionArguments: args,
    };
    
    const result = await aptos.view({ payload });
    console.log(`   ${name}: ${JSON.stringify(result)}`);
    return result;
}

async function main() {
    console.log("\n╔══════════════════════════════════════════════════════════╗");
    console.log("║  BUCKET PROTOCOL - FUNCTION TEST (Node.js)              ║");
    console.log("╚══════════════════════════════════════════════════════════╝");
    
    const account = createAccount(CONFIG.PRIVATE_KEY);
    const addr = account.accountAddress.toString();
    
    console.log(`\nContract: ${CONFIG.CONTRACT_ADDRESS}`);
    console.log(`Account:  ${addr}`);
    console.log(`Network:  ${CONFIG.NETWORK}`);
    
    const results = [];
    
    // Test 1: Init
    results.push(await testFunction("init()", () => testInit(account)));
    await sleep(2000);
    
    // Test 2: Deposit
    results.push(await testFunction("deposit_collateral()", () => testDeposit(account)));
    await sleep(2000);
    
    // Test 3: View collateral
    console.log("\n" + "=".repeat(60));
    console.log("View Functions (Read-Only)");
    console.log("=".repeat(60));
    await testViewFunction("Collateral Balance", "get_collateral_balance", [addr]);
    await testViewFunction("Bucket Count", "get_bucket_count", [addr]);
    await testViewFunction("Position Count", "get_position_count", [addr]);
    
    // Test 4: Update Oracle
    results.push(await testFunction("update_oracle()", () => 
        testUpdateOracle(account, CONFIG.BTC_PRICE, CONFIG.ETH_PRICE, CONFIG.SOL_PRICE)
    ));
    await sleep(2000);
    
    await testViewFunction("Oracle Prices", "get_oracle_prices", [addr]);
    
    // Test 5: Open Long
    results.push(await testFunction("open_long()", () => testOpenLong(account)));
    await sleep(2000);
    
    // Test 6: Open Short
    results.push(await testFunction("open_short()", () => testOpenShort(account)));
    await sleep(2000);
    
    await testViewFunction("Position Count After", "get_position_count", [addr]);
    
    // Test 7: Simulate price increase
    const newBtc = Math.floor(CONFIG.BTC_PRICE * 1.1);
    const newEth = Math.floor(CONFIG.ETH_PRICE * 1.1);
    const newSol = Math.floor(CONFIG.SOL_PRICE * 1.1);
    
    results.push(await testFunction("update_oracle() +10%", () => 
        testUpdateOracle(account, newBtc, newEth, newSol)
    ));
    await sleep(2000);
    
    // Test 8: Close first position
    results.push(await testFunction("close_position(0)", () => testClosePosition(account, 0)));
    await sleep(2000);
    
    await testViewFunction("Final Collateral", "get_collateral_balance", [addr]);
    
    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("SUMMARY");
    console.log("=".repeat(60));
    const passed = results.filter(r => r).length;
    const failed = results.length - passed;
    console.log(`Total Tests: ${results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed/results.length)*100).toFixed(1)}%`);
    
    if (failed === 0) {
        console.log("\n🎉 All tests passed! Contract is working correctly.\n");
    } else {
        console.log("\n⚠️  Some tests failed. Check output above.\n");
    }
}

main().catch(console.error);
