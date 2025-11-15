# Close Position Backend Service

Backend service that co-signs close_position transactions for the Cresca Bucket Protocol.

## Why is this needed?

The `close_position` function requires **2 signatures**:
1. **User signature** - proves the user wants to close their position
2. **Protocol signature** - authorizes withdrawing APT from the contract

This backend holds the protocol private key and co-signs valid close requests.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set environment variable (optional):
```bash
# Windows PowerShell
$env:PROTOCOL_PRIVATE_KEY="0x5d784bae6e0041f4cfca701f8c77b8c5250cc189f0a8aee1b227f39e7134c78b"

# Linux/Mac
export PROTOCOL_PRIVATE_KEY="0x5d784bae6e0041f4cfca701f8c77b8c5250cc189f0a8aee1b227f39e7134c78b"
```

3. Start the service:
```bash
npm start
```

## How it works

### 1. Start Backend Service
```bash
node close-position-service.js
```

Backend runs on http://localhost:3000

### 2. User Requests to Close Position

User app calls:
```javascript
POST http://localhost:3000/api/close-position
{
  "userAddress": "0xccb1b8707a72868b378b99f17cc3e7a7070bc5f6ea0d4a499a0eaf3db2aa1dd4",
  "positionId": 3
}
```

### 3. Backend Validates & Co-Signs

Backend:
- ✅ Checks position exists and is active
- ✅ Verifies user owns the position
- ✅ Signs the transaction with protocol private key
- ✅ Returns signature to user

### 4. User Submits Transaction

User combines both signatures and submits to blockchain.

## Test It

Run the example client:
```bash
node client-example.js 3
```

This will:
1. Build a close_position transaction for position ID 3
2. Sign it with the user's key
3. Request backend to co-sign
4. Submit the multi-agent transaction
5. Close the position and return funds to user

## Security Notes

⚠️ **IMPORTANT**: 
- Keep `PROTOCOL_PRIVATE_KEY` secret and secure
- In production, use proper authentication (JWT tokens, API keys)
- Add rate limiting to prevent abuse
- Log all transactions for audit trails
- Consider using AWS KMS or similar for key management

## API Endpoints

### POST /api/close-position
Close a position (requires user signature)

**Request:**
```json
{
  "userAddress": "0x...",
  "positionId": 3
}
```

**Response:**
```json
{
  "success": true,
  "protocolSignature": { ... },
  "message": "Protocol has co-signed the transaction"
}
```

### GET /health
Health check

**Response:**
```json
{
  "status": "ok",
  "protocol": "0x288fa4394bb01d5cadb6d48814d0a02f77dfbec4f4d7fa21581b15f22031e8f4"
}
```

## Contract Address

```
0x288fa4394bb01d5cadb6d48814d0a02f77dfbec4f4d7fa21581b15f22031e8f4
```

## Next Steps

For production:
1. Deploy backend to cloud (AWS, Google Cloud, Azure)
2. Add authentication middleware
3. Implement rate limiting
4. Set up monitoring and alerts
5. Use environment variables for all secrets
6. Add comprehensive logging
7. Implement circuit breakers for blockchain calls
