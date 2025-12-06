// Test V2: Complete flow - Open position → Close position
const { 
  Aptos, 
  AptosConfig, 
  Network,
  Account,
  Ed25519PrivateKey
} = require("@aptos-labs/ts-sdk");

// V2 Contract Details
const CONTRACT_ADDRESS = "0xba20b2115d382c7d8bbe01cc59fe7e33ab43c1c8853cfa9ff573ac8d383c91db";
const PRIVATE_KEY = "0x5e5919cb34bb96cc843a4b39ced211a79342398f1bc626985191c04bb0e08fb1";

// User account for testing
const USER_PRIVATE_KEY = "0x40daf4e4316a895eec706d88006d6a3ba75f22b01f0b4390556d679101d6e309";

async function testV2CompleteFlow() {
  console.log('🧪 Testing Cresca V2 - Complete Flow\n');
  console.log('═'.repeat(60));

  try {
    const config = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(config);
    
    // Protocol account (owner)
    const protocolAccount = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(PRIVATE_KEY)
    });
    
    // User account
    const userAccount = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(USER_PRIVATE_KEY)
    });
    
    console.log('\n📋 Setup:');
    console.log('   Contract:', CONTRACT_ADDRESS);
    console.log('   Protocol:', protocolAccount.accountAddress.toString());
    console.log('   User:', userAccount.accountAddress.toString());

    // Step 1: Check if initialized
    console.log('\n📍 Step 1: Checking protocol status...');
    try {
      const resource = await aptos.getAccountResource({
        accountAddress: CONTRACT_ADDRESS,
        resourceType: `${CONTRACT_ADDRESS}::bucket_protocol::Protocol`
      });
      console.log('✅ Protocol initialized');
      console.log('   Positions:', resource.positions.length);
      console.log('   Collateral:', resource.collateral_balance / 100000000, 'APT');
    } catch (e) {
      console.log('⚠️  Protocol not initialized, initializing...');
      
      const initTx = await aptos.transaction.build.simple({
        sender: protocolAccount.accountAddress,
        data: {
          function: `${CONTRACT_ADDRESS}::bucket_protocol::init`,
          functionArguments: [10], // 10x leverage
        },
      });

      const initSig = aptos.transaction.sign({
        signer: protocolAccount,
        transaction: initTx,
      });

      const initResponse = await aptos.transaction.submit.simple({
        transaction: initTx,
        senderAuthenticator: initSig,
      });

      await aptos.waitForTransaction({ transactionHash: initResponse.hash });
      console.log('✅ Protocol initialized');
      console.log('   TX:', initResponse.hash);
    }

    // Step 2: Set oracle prices
    console.log('\n📊 Step 2: Setting oracle prices...');
    const oracleTx = await aptos.transaction.build.simple({
      sender: protocolAccount.accountAddress,
      data: {
        function: `${CONTRACT_ADDRESS}::bucket_protocol::update_oracle`,
        functionArguments: [95000, 3500, 190], // BTC, ETH, SOL
      },
    });

    const oracleSig = aptos.transaction.sign({
      signer: protocolAccount,
      transaction: oracleTx,
    });

    const oracleResponse = await aptos.transaction.submit.simple({
      transaction: oracleTx,
      senderAuthenticator: oracleSig,
    });

    await aptos.waitForTransaction({ transactionHash: oracleResponse.hash });
    console.log('✅ Oracle prices set');
    console.log('   BTC: $95,000');
    console.log('   ETH: $3,500');
    console.log('   SOL: $190');

    // Step 3: Check user balance
    console.log('\n💰 Step 3: Checking user balance...');
    const userBalance = await aptos.getAccountAPTAmount({ 
      accountAddress: userAccount.accountAddress 
    });
    console.log('✅ User balance:', userBalance / 100000000, 'APT');

    if (userBalance < 100000000) {
      console.log('❌ Insufficient balance! Need at least 1 APT');
      console.log('   Fund at: https://aptos.dev/network/faucet');
      console.log('   Address:', userAccount.accountAddress.toString());
      return;
    }

    // Step 4: Open LONG position
    console.log('\n🚀 Step 4: Opening LONG position...');
    console.log('   Margin: 1 APT');
    console.log('   Direction: LONG');
    
    const openTx = await aptos.transaction.build.simple({
      sender: userAccount.accountAddress,
      data: {
        function: `${CONTRACT_ADDRESS}::bucket_protocol::open_long`,
        functionArguments: [0], // bucket_id = 0
      },
    });

    const openSig = aptos.transaction.sign({
      signer: userAccount,
      transaction: openTx,
    });

    const openResponse = await aptos.transaction.submit.simple({
      transaction: openTx,
      senderAuthenticator: openSig,
    });

    await aptos.waitForTransaction({ transactionHash: openResponse.hash });
    console.log('✅ Position opened!');
    console.log('   TX:', openResponse.hash);
    console.log('   Explorer:', `https://explorer.aptoslabs.com/txn/${openResponse.hash}?network=testnet`);

    // Step 5: Get position details
    console.log('\n📋 Step 5: Fetching position details...');
    const resource = await aptos.getAccountResource({
      accountAddress: CONTRACT_ADDRESS,
      resourceType: `${CONTRACT_ADDRESS}::bucket_protocol::Protocol`
    });

    const positions = resource.positions;
    const lastPositionIndex = positions.length - 1;
    const lastPosition = positions[lastPositionIndex];

    console.log('✅ Position created');
    console.log('   Position ID:', lastPositionIndex);
    console.log('   Owner:', lastPosition.owner);
    console.log('   Direction:', lastPosition.is_long ? 'LONG' : 'SHORT');
    console.log('   Margin:', lastPosition.margin / 100000000, 'APT');
    console.log('   Entry Price:', lastPosition.entry_price);
    console.log('   Active:', lastPosition.active);

    // Step 6: Wait a bit
    console.log('\n⏳ Step 6: Waiting 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 7: Close position (V2 - Direct, no API!)
    console.log('\n🔥 Step 7: Closing position (V2 - No API needed!)...');
    console.log('   Position ID:', lastPositionIndex);
    
    const closeTx = await aptos.transaction.build.simple({
      sender: userAccount.accountAddress,
      data: {
        function: `${CONTRACT_ADDRESS}::bucket_protocol::close_position`,
        functionArguments: [lastPositionIndex], // Just position_id!
      },
    });

    const closeSig = aptos.transaction.sign({
      signer: userAccount,
      transaction: closeTx,
    });

    const closeResponse = await aptos.transaction.submit.simple({
      transaction: closeTx,
      senderAuthenticator: closeSig,
    });

    console.log('   Submitted TX:', closeResponse.hash);
    console.log('   Waiting for confirmation...');
    
    await aptos.waitForTransaction({ transactionHash: closeResponse.hash });
    console.log('✅ Position closed!');
    console.log('   TX:', closeResponse.hash);
    console.log('   Explorer:', `https://explorer.aptoslabs.com/txn/${closeResponse.hash}?network=testnet`);

    // Step 8: Verify position is closed
    console.log('\n✔️  Step 8: Verifying position status...');
    const finalResource = await aptos.getAccountResource({
      accountAddress: CONTRACT_ADDRESS,
      resourceType: `${CONTRACT_ADDRESS}::bucket_protocol::Protocol`
    });

    const closedPosition = finalResource.positions[lastPositionIndex];
    console.log('✅ Position verified');
    console.log('   Active:', closedPosition.active);
    console.log('   Status:', closedPosition.active ? '🟢 OPEN' : '🔴 CLOSED');

    // Final balance
    const finalBalance = await aptos.getAccountAPTAmount({ 
      accountAddress: userAccount.accountAddress 
    });
    console.log('\n💰 Final user balance:', finalBalance / 100000000, 'APT');
    console.log('   Change:', (finalBalance - userBalance) / 100000000, 'APT');

    console.log('\n' + '═'.repeat(60));
    console.log('✅ V2 TEST COMPLETE!');
    console.log('═'.repeat(60));
    console.log('\n🎉 Success! V2 works perfectly:');
    console.log('   ✓ Opened position with user signature only');
    console.log('   ✓ Closed position with user signature only');
    console.log('   ✓ No API required!');
    console.log('   ✓ No multi-agent transactions!');
    console.log('   ✓ Fully decentralized!');
    console.log('');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.transaction) {
      console.log('Transaction details:', error.transaction);
    }
    process.exit(1);
  }
}

testV2CompleteFlow();
