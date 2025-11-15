// Test the live Netlify API
const { 
  Aptos, 
  AptosConfig, 
  Network,
  Account,
  Ed25519PrivateKey
} = require("@aptos-labs/ts-sdk");

// Configuration
const USER_PRIVATE_KEY = "0x22d458235594363f6b489228bcdcb62f05904c35bc932bc252488eee3c612323";
const CONTRACT_ADDRESS = "0x288fa4394bb01d5cadb6d48814d0a02f77dfbec4f4d7fa21581b15f22031e8f4";
const PROTOCOL_ADDRESS = "0x288fa4394bb01d5cadb6d48814d0a02f77dfbec4f4d7fa21581b15f22031e8f4";

// LIVE API ENDPOINT
const API_URL = "https://cresca.netlify.app/api/close-position";

async function testLiveAPI() {
  console.log("🌐 Testing LIVE Netlify API at:", API_URL);
  console.log("─".repeat(60));

  try {
    // Initialize Aptos client
    const config = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(config);
    const userAccount = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(USER_PRIVATE_KEY)
    });

    console.log("\n1️⃣ Opening a new position...");
    
    // Open a position first
    const openTx = await aptos.transaction.build.simple({
      sender: userAccount.accountAddress,
      data: {
        function: `${CONTRACT_ADDRESS}::cresca_contract::open_long_position`,
        functionArguments: [1_00000000], // 1 APT
      },
    });

    const openResponse = await aptos.signAndSubmitTransaction({
      signer: userAccount,
      transaction: openTx,
    });

    await aptos.waitForTransaction({ transactionHash: openResponse.hash });
    console.log("✅ Position opened! Hash:", openResponse.hash);

    // Get the position ID
    const resource = await aptos.getAccountResource({
      accountAddress: CONTRACT_ADDRESS,
      resourceType: `${CONTRACT_ADDRESS}::cresca_contract::ProtocolState`
    });

    const positionId = resource.next_position_id - 1;
    console.log("📍 Position ID:", positionId);

    console.log("\n2️⃣ Building multi-agent close_position transaction...");

    // Build multi-agent transaction
    const rawTxn = await aptos.transaction.build.multiAgent({
      sender: userAccount.accountAddress,
      secondarySignerAddresses: [PROTOCOL_ADDRESS],
      data: {
        function: `${CONTRACT_ADDRESS}::cresca_contract::close_position`,
        functionArguments: [positionId],
      },
    });

    console.log("\n3️⃣ Signing with user account...");
    const userAuthenticator = aptos.transaction.sign({
      signer: userAccount,
      transaction: rawTxn,
    });

    console.log("\n4️⃣ Calling LIVE API for protocol signature...");
    console.log("   API:", API_URL);

    // Call LIVE Netlify API
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        positionId: positionId.toString(),
        userAddress: userAccount.accountAddress.toString(),
        rawTransaction: Buffer.from(rawTxn.bcsToBytes()).toString('hex')
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const apiResult = await response.json();
    console.log("✅ Received protocol signature from LIVE API!");
    console.log("   Protocol Address:", apiResult.protocolAddress);

    console.log("\n5️⃣ Submitting multi-agent transaction...");

    // Submit the transaction
    const committedTxn = await aptos.transaction.submit.multiAgent({
      transaction: rawTxn,
      senderAuthenticator: userAuthenticator,
      additionalSignersAuthenticators: [
        aptos.transaction.parseAuthenticator(apiResult.protocolSignature)
      ],
    });

    console.log("📤 Transaction submitted! Hash:", committedTxn.hash);

    // Wait for confirmation
    const executedTransaction = await aptos.waitForTransaction({ 
      transactionHash: committedTxn.hash 
    });

    console.log("\n" + "═".repeat(60));
    console.log("✅ ✅ ✅ SUCCESS! Position closed via LIVE API! ✅ ✅ ✅");
    console.log("═".repeat(60));
    console.log("🔗 View on Explorer:");
    console.log(`   https://explorer.aptoslabs.com/txn/${committedTxn.hash}?network=testnet`);
    console.log("\n📊 Your API is working perfectly on Netlify!");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.response) {
      console.error("Response:", await error.response.text());
    }
    process.exit(1);
  }
}

testLiveAPI();
