const express = require('express');
const { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } = require("@aptos-labs/ts-sdk");

const app = express();
app.use(express.json());

const CONTRACT_ADDRESS = "0x288fa4394bb01d5cadb6d48814d0a02f77dfbec4f4d7fa21581b15f22031e8f4";
const PROTOCOL_PRIVATE_KEY = process.env.PROTOCOL_PRIVATE_KEY || "0x5d784bae6e0041f4cfca701f8c77b8c5250cc189f0a8aee1b227f39e7134c78b";

const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

const protocolAccount = Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(PROTOCOL_PRIVATE_KEY)
});

console.log(`🏦 Protocol Service Running`);
console.log(`📍 Address: ${protocolAccount.accountAddress}\n`);

// Endpoint: Request to close position
app.post('/api/close-position', async (req, res) => {
    try {
        const { userAddress, positionId, userSignature, rawTransaction } = req.body;

        // 1. Validate position ownership
        const positionDetails = await aptos.view({
            payload: {
                function: `${CONTRACT_ADDRESS}::bucket_protocol::get_position_details`,
                functionArguments: [CONTRACT_ADDRESS, positionId.toString()],
            },
        });

        const [bucketId, isLong, margin, entryPrice, owner, active] = positionDetails;

        // Security checks
        if (!active) {
            return res.status(400).json({ error: 'Position already closed' });
        }

        if (owner.toString() !== userAddress) {
            return res.status(403).json({ error: 'User does not own this position' });
        }

        // 2. Build multi-agent transaction
        const transaction = await aptos.transaction.build.multiAgent({
            sender: userAddress,
            secondarySignerAddresses: [protocolAccount.accountAddress],
            data: {
                function: `${CONTRACT_ADDRESS}::bucket_protocol::close_position`,
                functionArguments: [positionId.toString()],
            },
        });

        // 3. Protocol signs the transaction
        const protocolAuth = aptos.transaction.sign({
            signer: protocolAccount,
            transaction: transaction
        });

        // 4. Return protocol signature to user
        res.json({
            success: true,
            protocolSignature: protocolAuth,
            message: 'Protocol has co-signed the transaction'
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', protocol: protocolAccount.accountAddress.toString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Close Position Service running on port ${PORT}`);
});
