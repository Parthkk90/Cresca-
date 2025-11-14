// Netlify serverless function for close_position
const { 
  Aptos, 
  AptosConfig, 
  Network,
  Account,
  Ed25519PrivateKey
} = require("@aptos-labs/ts-sdk");

// Configuration
const PROTOCOL_PRIVATE_KEY = process.env.PROTOCOL_PRIVATE_KEY || "0x5d784bae6e0041f4cfca701f8c77b8c5250cc189f0a8aee1b227f39e7134c78b";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x288fa4394bb01d5cadb6d48814d0a02f77dfbec4f4d7fa21581b15f22031e8f4";

// Initialize Aptos client
const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);
const protocolAccount = Account.fromPrivateKey({
  privateKey: new Ed25519PrivateKey(PROTOCOL_PRIVATE_KEY)
});

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { positionId, userAddress, userSignatureHex, rawTransactionHex } = JSON.parse(event.body);

    // If user signature is provided, complete and submit the transaction
    if (userSignatureHex && rawTransactionHex) {
      const {Ed25519PublicKey, Ed25519Signature, AccountAuthenticatorEd25519, RawTransaction, Deserializer, MultiAgentRawTransaction, AccountAddress} = require('@aptos-labs/ts-sdk');
      
      // Deserialize the SAME raw transaction that user signed
      const rawTxnBytes = new Uint8Array(Buffer.from(rawTransactionHex, 'hex'));
      const rawTxn = RawTransaction.deserialize(new Deserializer(rawTxnBytes));
      
      // Create multi-agent transaction wrapper
      const multiAgentTxn = new MultiAgentRawTransaction(
        rawTxn,
        [AccountAddress.from(protocolAccount.accountAddress)]
      );
      
      // Reconstruct user authenticator from signature
      const userPubKey = new Ed25519PublicKey(new Uint8Array(Buffer.from(userSignatureHex.publicKey, 'hex')));
      const userSig = new Ed25519Signature(new Uint8Array(Buffer.from(userSignatureHex.signature, 'hex')));
      const userAuth = new AccountAuthenticatorEd25519(userPubKey, userSig);
      
      // Sign with protocol account using the multi-agent transaction
      const protocolAuth = aptos.transaction.sign({
        signer: protocolAccount,
        transaction: multiAgentTxn
      });
      
      // Submit multi-agent transaction
      const txResponse = await aptos.transaction.submit.multiAgent({
        transaction: multiAgentTxn,
        senderAuthenticator: userAuth,
        additionalSignersAuthenticators: [protocolAuth],
      });
      
      // Wait for confirmation
      await aptos.waitForTransaction({ transactionHash: txResponse.hash });
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          transactionHash: txResponse.hash,
          explorerUrl: `https://explorer.aptoslabs.com/txn/${txResponse.hash}?network=testnet`
        })
      };
    }

    // Original flow: validate request and build transaction
    if (!positionId || !userAddress) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Missing required fields: positionId, userAddress' 
        })
      };
    }

    // Verify position exists and belongs to user
    const resource = await aptos.getAccountResource({
      accountAddress: CONTRACT_ADDRESS,
      resourceType: `${CONTRACT_ADDRESS}::bucket_protocol::Protocol`
    });

    // Find position by index (positions array doesn't have 'id' field)
    const positionIndex = parseInt(positionId);
    const position = resource.positions?.[positionIndex];

    if (!position) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: `Position ${positionId} not found. Total positions: ${resource.positions?.length || 0}` 
        })
      };
    }

    if (position.owner !== userAddress) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Position does not belong to user' 
        })
      };
    }

    if (!position.active) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Position is not active' 
        })
      };
    }

    // Build raw transaction on server side
    const rawTxn = await aptos.transaction.build.multiAgent({
      sender: userAddress,
      secondarySignerAddresses: [protocolAccount.accountAddress],
      data: {
        function: `${CONTRACT_ADDRESS}::bucket_protocol::close_position`,
        functionArguments: [parseInt(positionId)],
      },
      options: {
        expireTimestamp: Math.floor(Date.now() / 1000) + 600, // 10 minutes from now
      }
    });

    // Sign with protocol account
    const protocolAuthenticator = aptos.transaction.sign({
      signer: protocolAccount,
      transaction: rawTxn
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        rawTransaction: Buffer.from(rawTxn.bcsToBytes()).toString('hex'),
        protocolSignature: {
          public_key: Buffer.from(protocolAuthenticator.public_key.toUint8Array()).toString('hex'),
          signature: Buffer.from(protocolAuthenticator.signature.toUint8Array()).toString('hex')
        },
        protocolAddress: protocolAccount.accountAddress.toString()
      })
    };

  } catch (error) {
    console.error('Error processing close position request:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};
