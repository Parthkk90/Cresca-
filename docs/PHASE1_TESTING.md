# Phase 1 PoC - Testing Guide

## ✅ What's Been Completed

### 1. Move Smart Contract ✓
- **Location**: `move/sources/Payment.move`
- **Compiled**: Yes
- **Features**:
  - Payment escrow with order tracking
  - Event emission (PaymentEvent, RefundEvent, WithdrawalEvent)
  - Merchant registration
  - Balance tracking
  - Withdrawal & refund functions

### 2. Backend Gateway API ✓
- **Framework**: Express + TypeScript
- **Running on**: http://localhost:3000
- **Endpoints**:
  - `GET /health` - Health check
  - `POST /api/v1/orders` - Create payment order
  - `GET /api/v1/orders/:id` - Get order status
  - `POST /api/v1/merchants` - Register merchant
  - `GET /api/v1/merchants/:id` - Get merchant details

### 3. Aptos Integration ✓
- **SDK**: @aptos-labs/ts-sdk v1.28.0
- **Network**: Testnet
- **Relayer Account**: 0x0f9713e3c42951dbc4f05cc2e7ea211c1851b00a9d077e7e71f5d2a73041d606

## 🧪 Testing Instructions

### Step 1: Fund Relayer Account

Visit: https://aptos.dev/network/faucet?address=0x0f9713e3c42951dbc4f05cc2e7ea211c1851b00a9d077e7e71f5d2a73041d606

Click "Faucet" to get 1 APT on testnet.

### Step 2: Deploy Move Contract

```bash
cd move
aptos move publish --named-addresses aptpays_addr=0x0f9713e3c42951dbc4f05cc2e7ea211c1851b00a9d077e7e71f5d2a73041d606
```

### Step 3: Test API Endpoints

#### Health Check
```bash
curl http://localhost:3000/health
```

#### Create Merchant
```bash
curl -X POST http://localhost:3000/api/v1/merchants \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "Test Store",
    "email": "merchant@test.com",
    "wallet_address": "0x123"
  }'
```

#### Create Order
```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": "m_123",
    "amount": 12.50,
    "currency": "USD",
    "pay_currency": "APT"
  }'
```

#### Get Order Status
```bash
curl http://localhost:3000/api/v1/orders/{order_id}
```

### Step 4: Run Setup Script

```bash
npm run setup:testnet
```

This will:
1. Initialize relayer account
2. Fund it from faucet
3. Deploy payment module
4. Create test merchant
5. Register merchant on-chain

## 📊 Phase 1 PoC Status

| Component | Status | Notes |
|-----------|--------|-------|
| Move Contract | ✅ Compiled | Ready for deployment |
| Backend API | ✅ Running | Port 3000 |
| Relayer Service | ✅ Implemented | Needs funding |
| Event Watcher | ⏳ Pending | Phase 2 |
| Payment Widget | ⏳ Pending | Phase 2 |
| Database | ⏳ In-memory | PostgreSQL in Phase 2 |

## 🎯 Next Steps (Phase 2)

1. **Deploy Move Contract to Testnet**
   - Fund account
   - Run `aptos move publish`
   - Verify deployment

2. **Add Event Watcher**
   - Listen to PaymentEvent emissions
   - Update order status in database
   - Trigger webhooks

3. **Implement Sponsored Transactions**
   - Full paymaster functionality
   - Gas fee estimation
   - Transaction batching

4. **Build Payment Widget**
   - React component
   - QR code generation
   - Wallet connection (Petra, Martian)

5. **Database Integration**
   - PostgreSQL setup
   - Schema migrations
   - Order & merchant models

## 🔗 Important Links

- **Aptos Explorer (Testnet)**: https://explorer.aptoslabs.com/?network=testnet
- **Account Address**: 0x0f9713e3c42951dbc4f05cc2e7ea211c1851b00a9d077e7e71f5d2a73041d606
- **Faucet**: https://aptos.dev/network/faucet
- **API Docs**: http://localhost:3000/health

## 📝 Configuration

All configuration is in `.env`:

```env
APTOS_NETWORK=testnet
MODULE_ADDRESS=0x0f9713e3c42951dbc4f05cc2e7ea211c1851b00a9d077e7e71f5d2a73041d606
RELAYER_PRIVATE_KEY=e6d320f25b6e50369cf0b458fc5da25177f7f76c1f53385b13d178ec3b5bfc14
```

## ⚠️ Important Notes

- **Never commit `.env`** - Private keys are sensitive
- **Testnet only** - Not for production use
- **In-memory storage** - Orders reset on server restart
- **No authentication** - Add JWT/API keys in Phase 2

## 🐛 Troubleshooting

### Server won't start
```bash
npm install
npm run dev
```

### Move compilation fails
```bash
cd move
aptos move clean
aptos move compile
```

### Faucet not working
Use web interface: https://aptos.dev/network/faucet

### Can't connect to Aptos
Check network status: https://status.aptoslabs.com/
