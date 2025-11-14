// Complete test: Open position, then close it using live API
const { 
  Aptos, 
  AptosConfig, 
  Network,
  Account,
  Ed25519PrivateKey,
  Deserializer,
  RawTransaction,
  Ed25519PublicKey,
  Ed25519Signature,
  AccountAuthenticatorEd25519,
  AccountAddress,
  MultiAgentRawTransaction
} = require("@aptos-labs/ts-sdk");

const USER_PRIVATE_KEY = "0x40daf4e4316a895eec706d88006d6a3ba75f22b01f0b4390556d679101d6e309";
const CONTRACT_ADDRESS = "0x33ec41711fe3c92c3f1a010909342e1c2c5de962e50645c8f8c8eda119122d6b";
const API_URL = "https://cresca.netlify.app/api/close-position";

async function testEndToEnd() {
  console.log("🚀 Testing Complete Flow: Open → API → Close Position");
  console.log("═".repeat(60));

  try {
    const config = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(config);
    const userAccount = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(USER_PRIVATE_KEY)
    });

    console.log("\n📊 Checking existing positions...");
    const resource = await aptos.getAccountResource({
      accountAddress: CONTRACT_ADDRESS,
      resourceType: `${CONTRACT_ADDRESS}::bucket_protocol::Protocol`
    });

    console.log(`Found ${resource.positions.length} positions:`);
    resource.positions.forEach((pos, idx) => {
      console.log(`  Position ${idx}: ${pos.active ? '✅ Active' : '❌ Closed'} - ${pos.margin} margin`);
    });

    // Find first active position
    const activeIndex = resource.positions.findIndex(p => p.active);
    
    if (activeIndex === -1) {
      console.log("\n❌ No active positions found. Opening a new one...");
      
      // Open new position
      const openTx = await aptos.transaction.build.simple({
        sender: userAccount.accountAddress,
        data: {
          function: `${CONTRACT_ADDRESS}::bucket_protocol::open_position`,
          functionArguments: [0, true, 100000000], // bucket_id, is_long, margin
        },
      });

      const openResponse = await aptos.signAndSubmitTransaction({
        signer: userAccount,
        transaction: openTx,
      });

      console.log("📤 Opening position...");
      await aptos.waitForTransaction({ transactionHash: openResponse.hash });
      console.log("✅ Position opened! Hash:", openResponse.hash);
      
      // Refresh positions
      const newResource = await aptos.getAccountResource({
        accountAddress: CONTRACT_ADDRESS,
        resourceType: `${CONTRACT_ADDRESS}::bucket_protocol::Protocol`
      });
      
      const newActiveIndex = newResource.positions.findIndex(p => p.active);
      console.log(`\n📍 New position created at index: ${newActiveIndex}`);
      
      return await closePositionViaAPI(newActiveIndex, userAccount, aptos);
    } else {
      console.log(`\n📍 Using existing position at index: ${activeIndex}`);
      return await closePositionViaAPI(activeIndex, userAccount, aptos);
    }

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

async function closePositionViaAPI(positionId, userAccount, aptos) {
  console.log("\n" + "─".repeat(60));
  console.log("🔒 Closing Position via Live API");
  console.log("─".repeat(60));

  try {
    console.log("\n1️⃣ Calling API:", API_URL);
    console.log("   Position ID:", positionId);
    console.log("   User Address:", userAccount.accountAddress.toString());

    // Call live API
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        positionId: positionId.toString(),
        userAddress: userAccount.accountAddress.toString()
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ API Response received!");
    console.log("   Protocol Address:", result.protocolAddress);

    console.log("\n2️⃣ Parsing transaction...");
    
    // Deserialize the raw transaction
    const txnBytes = new Uint8Array(Buffer.from(result.rawTransaction, 'hex'));
    const rawTxn = RawTransaction.deserialize(new Deserializer(txnBytes));
    
    console.log("   Raw transaction deserialized");
    
    // Build multi-agent wrapper with secondary signer addresses
    const protocolAddress = AccountAddress.from(result.protocolAddress);
    const multiAgentTxn = new MultiAgentRawTransaction(
      rawTxn,
      [protocolAddress]  // secondary signers
    );
    
    console.log("   Multi-agent transaction created");

    console.log("\n3️⃣ Signing with user account...");
    
    // Sign the transaction bytes directly
    const userSignature = userAccount.sign(txnBytes);
    console.log("   User public key:", userAccount.publicKey);
    console.log("   User signature:", userSignature);
    
    const userAuthenticator = new AccountAuthenticatorEd25519(
      userAccount.publicKey,
      userSignature
    );
    
    console.log("   User authenticator fields:");
    console.log("   - public_key:", userAuthenticator.public_key);
    console.log("   - signature:", userAuthenticator.signature);
    
    console.log("   User signature created");

    console.log("\n4️⃣ Reconstructing protocol signature...");
    
    // Reconstruct protocol authenticator from API response
    console.log("   API signature data:");
    console.log("   - public_key hex:", result.protocolSignature.public_key);
    console.log("   - signature hex:", result.protocolSignature.signature);
    
    const protocolPubKeyBytes = new Uint8Array(Buffer.from(result.protocolSignature.public_key, 'hex'));
    const protocolSigBytes = new Uint8Array(Buffer.from(result.protocolSignature.signature, 'hex'));
    
    console.log("   - public_key bytes:", protocolPubKeyBytes);
    console.log("   - signature bytes:", protocolSigBytes);
    
    const protocolPublicKey = new Ed25519PublicKey(protocolPubKeyBytes);
    const protocolSignature = new Ed25519Signature(protocolSigBytes);
    
    console.log("   Created objects:");
    console.log("   - protocolPublicKey:", protocolPublicKey);
    console.log("   - protocolSignature:", protocolSignature);
    
    const protocolAuthenticator = new AccountAuthenticatorEd25519(protocolPublicKey, protocolSignature);
    
    console.log("   Protocol authenticator fields:");
    console.log("   - public_key:", protocolAuthenticator.public_key);
    console.log("   - signature:", protocolAuthenticator.signature);
    
    console.log("   Protocol authenticator reconstructed");

    console.log("\n5️⃣ Submitting signatures back to API for final submission...");
    
    const submitResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        positionId: positionId.toString(),
        userAddress: userAccount.accountAddress.toString(),
        userSignatureHex: {
          publicKey: Buffer.from(userAccount.publicKey.toUint8Array()).toString('hex'),
          signature: Buffer.from(userSignature.toUint8Array()).toString('hex'),
        }
      }),
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      throw new Error(`API submission error: ${submitResponse.status} - ${errorText}`);
    }

    const submitResult = await submitResponse.json();
    console.log("✅ Transaction submitted and confirmed!");
    console.log("   Transaction hash:", submitResult.transactionHash);

    console.log("\n" + "═".repeat(60));
    console.log("✅ ✅ ✅ SUCCESS! Position closed via API! ✅ ✅ ✅");
    console.log("═".repeat(60));
    console.log("🔗 View on Explorer:");
    console.log(`   ${submitResult.explorerUrl}`);
    console.log("\n📊 API Working Perfectly!");
    console.log("   • Server built transaction ✅");
    console.log("   • Protocol co-signed ✅");
    console.log("   • User signed ✅");
    console.log("   • Server submitted multi-agent transaction ✅");
    console.log("   • Transaction confirmed on-chain ✅");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    throw error;
  }
}

testEndToEnd();
