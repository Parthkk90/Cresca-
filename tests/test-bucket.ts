import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

const CONTRACT_ADDRESS = "0x5f971a43ff0c97789f67dc7f75a9fba019695943e0ecebbb81adc851eaa0a36f";

async function testBucketProtocol() {
  // Setup
  const config = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(config);
  
  // Load your account (replace with your private key)
  const privateKeyHex = "YOUR_PRIVATE_KEY_HERE";
  const privateKey = new Ed25519PrivateKey(privateKeyHex);
  const account = Account.fromPrivateKey({ privateKey });
  
  console.log("Account:", account.accountAddress.toString());
  console.log("\n=== Testing Bucket Protocol ===\n");

  try {
    // 1. Check collateral balance
    console.log("1. Checking collateral balance...");
    const balance = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::bucket_protocol::get_collateral_balance`,
        typeArguments: [],
        functionArguments: [CONTRACT_ADDRESS]
      }
    });
    console.log("Collateral balance:", balance[0], "Octas");

    // 2. Update oracle prices
    console.log("\n2. Updating oracle prices...");
    const updateOracleTx = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${CONTRACT_ADDRESS}::bucket_protocol::update_oracle`,
        typeArguments: [],
        functionArguments: [
          [1000, 2000, 3000] // APT, ETH, BTC mock prices
        ]
      }
    });
    
    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction: updateOracleTx
    });
    await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
    console.log("✅ Oracle updated:", committedTxn.hash);

    // 3. Create a bucket
    console.log("\n3. Creating bucket...");
    const createBucketTx = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${CONTRACT_ADDRESS}::bucket_protocol::create_bucket`,
        typeArguments: [],
        functionArguments: [
          ["0x1"], // assets (APT)
          [100],   // weights (100%)
          5        // leverage (5x)
        ]
      }
    });
    
    const bucketTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction: createBucketTx
    });
    await aptos.waitForTransaction({ transactionHash: bucketTxn.hash });
    console.log("✅ Bucket created:", bucketTxn.hash);

    // 4. Check bucket count
    const bucketCount = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::bucket_protocol::get_bucket_count`,
        typeArguments: [],
        functionArguments: [CONTRACT_ADDRESS]
      }
    });
    console.log("Total buckets:", bucketCount[0]);

    // 5. Open a LONG position
    console.log("\n5. Opening LONG position...");
    const openPositionTx = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${CONTRACT_ADDRESS}::bucket_protocol::open_position`,
        typeArguments: [],
        functionArguments: [
          0,        // bucket_id
          true,     // is_long
          10000000  // margin (0.1 APT)
        ]
      }
    });
    
    const positionTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction: openPositionTx
    });
    await aptos.waitForTransaction({ transactionHash: positionTxn.hash });
    console.log("✅ Position opened:", positionTxn.hash);

    // 6. Check position count
    const positionCount = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::bucket_protocol::get_position_count`,
        typeArguments: [],
        functionArguments: [CONTRACT_ADDRESS]
      }
    });
    console.log("Total positions:", positionCount[0]);

    // 7. Get position details
    const positionDetails = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::bucket_protocol::get_position_details`,
        typeArguments: [],
        functionArguments: [CONTRACT_ADDRESS, 0]
      }
    });
    console.log("\nPosition 0 Details:");
    console.log("  Bucket ID:", positionDetails[0]);
    console.log("  Is Long:", positionDetails[1]);
    console.log("  Margin:", positionDetails[2], "Octas");
    console.log("  Entry Price:", positionDetails[3]);
    console.log("  Active:", positionDetails[4]);

    // 8. Update oracle to simulate price movement
    console.log("\n8. Simulating price movement (APT +10%)...");
    const updatePriceTx = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${CONTRACT_ADDRESS}::bucket_protocol::update_oracle`,
        typeArguments: [],
        functionArguments: [
          [1100] // APT price increased to $11
        ]
      }
    });
    
    const priceTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction: updatePriceTx
    });
    await aptos.waitForTransaction({ transactionHash: priceTxn.hash });
    console.log("✅ Price updated");

    // 9. Close position (take profit)
    console.log("\n9. Closing position...");
    const closePositionTx = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${CONTRACT_ADDRESS}::bucket_protocol::close_position`,
        typeArguments: [],
        functionArguments: [0] // position_id
      }
    });
    
    const closeTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction: closePositionTx
    });
    await aptos.waitForTransaction({ transactionHash: closeTxn.hash });
    console.log("✅ Position closed:", closeTxn.hash);

    // 10. Check final collateral balance
    const finalBalance = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::bucket_protocol::get_collateral_balance`,
        typeArguments: [],
        functionArguments: [CONTRACT_ADDRESS]
      }
    });
    console.log("\nFinal collateral balance:", finalBalance[0], "Octas");
    console.log("Profit/Loss:", Number(finalBalance[0]) - Number(balance[0]), "Octas");

    console.log("\n✅ All tests passed!");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run tests
testBucketProtocol();
