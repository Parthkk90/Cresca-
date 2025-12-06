const { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } = require("@aptos-labs/ts-sdk");

const CONTRACT_ADDRESS = "0x288fa4394bb01d5cadb6d48814d0a02f77dfbec4f4d7fa21581b15f22031e8f4";

// User account private key (from per_user_v1 profile)
const USER_PRIVATE_KEY = "0x22d458235594363f6b489228bcdcb62f05904c35bc932bc252488eee3c612323";

// Protocol account private key (from centralized_final profile)  
const PROTOCOL_PRIVATE_KEY = "0x5d784bae6e0041f4cfca701f8c77b8c5250cc189f0a8aee1b227f39e7134c78b";

async function main() {
    const config = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(config);

    const userAccount = Account.fromPrivateKey({
        privateKey: new Ed25519PrivateKey(USER_PRIVATE_KEY)
    });
    
    const protocolAccount = Account.fromPrivateKey({
        privateKey: new Ed25519PrivateKey(PROTOCOL_PRIVATE_KEY)
    });

    console.log(`👤 User: ${userAccount.accountAddress}`);
    console.log(`🏦 Protocol: ${protocolAccount.accountAddress}\n`);

    // Step 1: Open a new position
    console.log("🚀 Opening new LONG position...");
    const userBalance = await aptos.getAccountAPTAmount({ accountAddress: userAccount.accountAddress });
    console.log(`   User balance before: ${(userBalance / 100000000).toFixed(6)} APT`);

    const openTxn = await aptos.transaction.build.simple({
        sender: userAccount.accountAddress,
        data: {
            function: `${CONTRACT_ADDRESS}::bucket_protocol::open_long`,
            functionArguments: ["0"],
        },
    });
    const openResult = await aptos.signAndSubmitTransaction({ signer: userAccount, transaction: openTxn });
    await aptos.waitForTransaction({ transactionHash: openResult.hash });
    console.log(`✅ Position opened: ${openResult.hash}\n`);

    // Get position count to find the new position ID
    const positionCount = await aptos.view({
        payload: {
            function: `${CONTRACT_ADDRESS}::bucket_protocol::get_position_count`,
            functionArguments: [CONTRACT_ADDRESS],
        },
    });
    const newPositionId = parseInt(positionCount[0]) - 1;
    console.log(`📋 New position ID: ${newPositionId}\n`);

    // Step 2: Update oracle (simulate price change)
    console.log("📈 Updating oracle with +10% prices...");
    const oracleTxn = await aptos.transaction.build.simple({
        sender: userAccount.accountAddress,
        data: {
            function: `${CONTRACT_ADDRESS}::bucket_protocol::update_oracle`,
            functionArguments: [5500000, 330000, 11000],
        },
    });
    const oracleResult = await aptos.signAndSubmitTransaction({ signer: userAccount, transaction: oracleTxn });
    await aptos.waitForTransaction({ transactionHash: oracleResult.hash });
    console.log(`✅ Oracle updated\n`);

    // Step 3: Close position with multi-agent
    console.log(`🔒 Closing position ${newPositionId} (multi-agent transaction)...`);
    
    const contractBalance = await aptos.getAccountAPTAmount({ accountAddress: CONTRACT_ADDRESS });
    console.log(`   Contract balance before: ${(contractBalance / 100000000).toFixed(6)} APT`);

    try {
        // Build multi-agent transaction
        const rawTxn = await aptos.transaction.build.multiAgent({
            sender: userAccount.accountAddress,
            secondarySignerAddresses: [protocolAccount.accountAddress],
            data: {
                function: `${CONTRACT_ADDRESS}::bucket_protocol::close_position`,
                functionArguments: [newPositionId.toString()],
            },
        });

        console.log("   ✓ Transaction built");

        // Sign with both accounts
        const userAuth = aptos.transaction.sign({ 
            signer: userAccount, 
            transaction: rawTxn 
        });
        console.log("   ✓ User signed");

        const protocolAuth = aptos.transaction.sign({ 
            signer: protocolAccount, 
            transaction: rawTxn 
        });
        console.log("   ✓ Protocol signed");

        // Submit multi-agent transaction
        const committedTxn = await aptos.transaction.submit.multiAgent({
            transaction: rawTxn,
            senderAuthenticator: userAuth,
            additionalSignersAuthenticators: [protocolAuth],
        });

        console.log(`   ✓ Submitted: ${committedTxn.hash}`);

        await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
        console.log(`✅ Position closed successfully!\n`);

        // Check final balances
        const finalUserBalance = await aptos.getAccountAPTAmount({ accountAddress: userAccount.accountAddress });
        const finalContractBalance = await aptos.getAccountAPTAmount({ accountAddress: CONTRACT_ADDRESS });
        
        console.log(`💰 User balance after: ${(finalUserBalance / 100000000).toFixed(6)} APT`);
        console.log(`💰 Contract balance after: ${(finalContractBalance / 100000000).toFixed(6)} APT`);
        console.log(`📊 User P&L: ${((finalUserBalance - userBalance) / 100000000).toFixed(6)} APT (including gas)`);
        console.log(`📊 Contract change: ${((finalContractBalance - contractBalance) / 100000000).toFixed(6)} APT\n`);

        console.log("✅ ✅ ✅ CLOSE_POSITION WORKS! ✅ ✅ ✅\n");
        
    } catch (error) {
        console.log(`❌ Error closing position: ${error.message}\n`);
        if (error.transaction) {
            console.log(`Transaction hash: ${error.transaction.hash}`);
            console.log(`VM Status: ${error.transaction.vm_status}`);
        }
    }
}

main().catch(console.error);
