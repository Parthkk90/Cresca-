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
    const { positionId, userAddress, rawTransaction } = JSON.parse(event.body);

    if (!positionId || !userAddress || !rawTransaction) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Missing required fields: positionId, userAddress, rawTransaction' 
        })
      };
    }

    // Verify position exists and belongs to user
    const resource = await aptos.getAccountResource({
      accountAddress: CONTRACT_ADDRESS,
      resourceType: `${CONTRACT_ADDRESS}::bucket_protocol::Protocol`
    });

    // Find position by index
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

    // Sign the raw transaction with protocol account
    const rawTxnBytes = new Uint8Array(Buffer.from(rawTransaction, 'hex'));
    const protocolSignatureBytes = protocolAccount.sign(rawTxnBytes);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        protocolSignature: {
          public_key: Buffer.from(protocolAccount.publicKey.toUint8Array()).toString('hex'),
          signature: Buffer.from(protocolSignatureBytes.toUint8Array()).toString('hex')
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
