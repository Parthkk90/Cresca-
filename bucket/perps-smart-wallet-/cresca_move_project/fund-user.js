const { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } = require("@aptos-labs/ts-sdk");

const USER_ADDRESS = "0xccb1b8707a72868b378b99f17cc3e7a7070bc5f6ea0d4a499a0eaf3db2aa1dd4";
const PROTOCOL_PRIVATE_KEY = "0x5d784bae6e0041f4cfca701f8c77b8c5250cc189f0a8aee1b227f39e7134c78b";

async function main() {
    const config = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(config);

    const protocolAccount = Account.fromPrivateKey({
        privateKey: new Ed25519PrivateKey(PROTOCOL_PRIVATE_KEY)
    });

    console.log(`💸 Transferring 3 APT to user account...\n`);

    const txn = await aptos.transferCoinTransaction({
        sender: protocolAccount.accountAddress,
        recipient: USER_ADDRESS,
        amount: 300000000, // 3 APT
    });

    const result = await aptos.signAndSubmitTransaction({ signer: protocolAccount, transaction: txn });
    await aptos.waitForTransaction({ transactionHash: result.hash });
    
    console.log(`✅ Transfer complete: ${result.hash}\n`);

    const userBalance = await aptos.getAccountAPTAmount({ accountAddress: USER_ADDRESS });
    console.log(`💰 User balance now: ${(userBalance / 100000000).toFixed(6)} APT\n`);
}

main().catch(console.error);
