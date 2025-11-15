// Netlify serverless function for close_position
const { 
  Aptos, 
  AptosConfig, 
  Network,
  Account,
  Ed25519PrivateKey,
  AccountAuthenticator
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

    // Validate request
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
    const positionResource = await aptos.getAccountResource({
      accountAddress: CONTRACT_ADDRESS,
      resourceType: `${CONTRACT_ADDRESS}::cresca_contract::Position`
    });

    const position = positionResource.positions?.find(
      p => p.id === positionId && p.owner === userAddress
    );

    if (!position) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Position not found or does not belong to user' 
        })
      };
    }

    if (!position.is_active) {
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

    // Deserialize the raw transaction
    const deserializer = new Deserializer(new Uint8Array(Buffer.from(rawTransaction, 'hex')));
    const transaction = RawTransaction.deserialize(deserializer);

    // Sign with protocol account
    const protocolAuthenticator = aptos.transaction.sign({
      signer: protocolAccount,
      transaction
    });

    // Extract signature
    const protocolSignature = {
      public_key: protocolAuthenticator.public_key,
      signature: protocolAuthenticator.signature
    };

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        protocolSignature: {
          public_key: Buffer.from(protocolSignature.public_key.toUint8Array()).toString('hex'),
          signature: Buffer.from(protocolSignature.signature.toUint8Array()).toString('hex')
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
