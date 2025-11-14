// Updated client - No need to build raw transaction!
const { 
  Aptos, 
  AptosConfig, 
  Network,
  Account,
  Ed25519PrivateKey
} = require("@aptos-labs/ts-sdk");

const USER_PRIVATE_KEY = "0x22d458235594363f6b489228bcdcb62f05904c35bc932bc252488eee3c612323";
const CONTRACT_ADDRESS = "0x288fa4394bb01d5cadb6d48814d0a02f77dfbec4f4d7fa21581b15f22031e8f4";

// Use localhost for testing, or live API
const BACKEND_URL = process.argv[2] === 'live' 
  ? "https://cresca.netlify.app/api/close-position"
  : "http://localhost:8888/api/close-position";

async function closePosition(positionId) {
  console.log("🔒 Closing position with simplified API...");
  console.log("Position ID:", positionId);
  console.log("Backend:", BACKEND_URL);
  console.log("─".repeat(60));

  try {
    const config = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(config);
    const userAccount = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(USER_PRIVATE_KEY)
    });

    console.log("\n1️⃣ Calling API (server builds transaction)...");
    
    // SIMPLIFIED: Just send position ID and user address!
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        positionId: positionId.toString(),
        userAddress: userAccount.accountAddress.toString()
        // No rawTransaction needed! Server builds it ✨
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ Received from API:");
    console.log("   - Raw transaction (built by server)");
    console.log("   - Protocol signature");

    console.log("\n2️⃣ Deserializing transaction...");
    const { Deserializer, RawTransaction } = require("@aptos-labs/ts-sdk");
    const rawTxn = RawTransaction.deserialize(
      new Deserializer(new Uint8Array(Buffer.from(result.rawTransaction, 'hex')))
    );

    console.log("\n3️⃣ Signing with user account...");
    const userAuthenticator = aptos.transaction.sign({
      signer: userAccount,
      transaction: rawTxn,
    });

    console.log("\n4️⃣ Submitting multi-agent transaction...");
    const committedTxn = await aptos.transaction.submit.multiAgent({
      transaction: rawTxn,
      senderAuthenticator: userAuthenticator,
      additionalSignersAuthenticators: [
        aptos.transaction.parseAuthenticator(result.protocolSignature)
      ],
    });

    console.log("📤 Transaction submitted! Hash:", committedTxn.hash);

    await aptos.waitForTransaction({ transactionHash: committedTxn.hash });

    console.log("\n" + "═".repeat(60));
    console.log("✅ ✅ ✅ SUCCESS! Position closed! ✅ ✅ ✅");
    console.log("═".repeat(60));
    console.log("🔗 View on Explorer:");
    console.log(`   https://explorer.aptoslabs.com/txn/${committedTxn.hash}?network=testnet`);

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

const positionId = process.argv[3] || process.argv[2] || "4";
closePosition(positionId);
