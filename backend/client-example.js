const { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } = require("@aptos-labs/ts-sdk");
const axios = require("axios");

const CONTRACT_ADDRESS = "0x288fa4394bb01d5cadb6d48814d0a02f77dfbec4f4d7fa21581b15f22031e8f4";
const BACKEND_URL = "http://localhost:3000"; // Your backend service

const USER_PRIVATE_KEY = "0x22d458235594363f6b489228bcdcb62f05904c35bc932bc252488eee3c612323";

async function closePositionWithBackend(positionId) {
    const config = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(config);

    const userAccount = Account.fromPrivateKey({
        privateKey: new Ed25519PrivateKey(USER_PRIVATE_KEY)
    });

    console.log(`👤 User: ${userAccount.accountAddress}`);
    console.log(`🔒 Requesting to close position ${positionId}...\n`);

    try {
        // Step 1: Build the multi-agent transaction
        const protocolAddress = "0x288fa4394bb01d5cadb6d48814d0a02f77dfbec4f4d7fa21581b15f22031e8f4";
        
        const transaction = await aptos.transaction.build.multiAgent({
            sender: userAccount.accountAddress,
            secondarySignerAddresses: [protocolAddress],
            data: {
                function: `${CONTRACT_ADDRESS}::bucket_protocol::close_position`,
                functionArguments: [positionId.toString()],
            },
        });

        console.log("✓ Transaction built");

        // Step 2: User signs the transaction
        const userAuth = aptos.transaction.sign({
            signer: userAccount,
            transaction: transaction
        });

        console.log("✓ User signed");

        // Step 3: Request backend to co-sign
        const response = await axios.post(`${BACKEND_URL}/api/close-position`, {
            userAddress: userAccount.accountAddress.toString(),
            positionId: positionId,
        });

        if (!response.data.success) {
            throw new Error(response.data.error);
        }

        const protocolAuth = response.data.protocolSignature;
        console.log("✓ Protocol co-signed");

        // Step 4: Submit multi-agent transaction
        const committedTxn = await aptos.transaction.submit.multiAgent({
            transaction: transaction,
            senderAuthenticator: userAuth,
            additionalSignersAuthenticators: [protocolAuth],
        });

        console.log(`✓ Transaction submitted: ${committedTxn.hash}`);

        await aptos.waitForTransaction({ transactionHash: committedTxn.hash });
        console.log(`\n✅ Position ${positionId} closed successfully!`);

        // Check balance
        const balance = await aptos.getAccountAPTAmount({ accountAddress: userAccount.accountAddress });
        console.log(`💰 Your balance: ${(balance / 100000000).toFixed(6)} APT\n`);

    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        if (error.response) {
            console.error(`Backend error: ${JSON.stringify(error.response.data)}`);
        }
    }
}

// Usage
const positionId = process.argv[2] || 3; // Get position ID from command line
closePositionWithBackend(positionId);
