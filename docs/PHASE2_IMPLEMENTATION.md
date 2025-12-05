# Phase 2 Implementation Plan

## Overview
This document outlines the detailed implementation plan for Phase 2 (MVP Development) of the AptPays payment gateway.

---

## 🎯 Phase 2 Goals

Transform the PoC into a production-ready MVP with:
- ✅ Persistent database storage
- ✅ Production-grade security
- ✅ Real-time event monitoring
- ✅ Merchant dashboard
- ✅ Complete API documentation

**Timeline**: 8 weeks  
**Current Progress**: 15%

---

## 📋 Sprint Breakdown

### **Sprint 1: Database & Infrastructure** (Weeks 1-2)

#### 1.1 PostgreSQL Setup
**Files to Create:**
- `docker-compose.yml` - PostgreSQL + Redis containers
- `src/database/connection.ts` - Database connection pool
- `src/database/migrations/` - Schema migrations

**Schema Design:**
```sql
-- Merchants table
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address VARCHAR(66) NOT NULL UNIQUE,
    business_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    api_key VARCHAR(64) NOT NULL UNIQUE,
    api_secret VARCHAR(128) NOT NULL,
    webhook_url VARCHAR(512),
    webhook_secret VARCHAR(128),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(64) NOT NULL UNIQUE,
    merchant_id UUID REFERENCES merchants(id),
    customer_address VARCHAR(66) NOT NULL,
    amount BIGINT NOT NULL,
    currency VARCHAR(10) DEFAULT 'APT',
    status VARCHAR(20) NOT NULL,
    tx_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'paid', 'expired', 'refunded'))
);

-- Payouts table
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id),
    order_id UUID REFERENCES orders(id),
    amount BIGINT NOT NULL,
    currency VARCHAR(10) NOT NULL,
    fiat_amount DECIMAL(12, 2),
    fiat_currency VARCHAR(3),
    status VARCHAR(20) NOT NULL,
    transak_order_id VARCHAR(128),
    transak_status VARCHAR(50),
    bank_account_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    CONSTRAINT valid_payout_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Events table (blockchain event log)
CREATE TABLE blockchain_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    tx_version BIGINT NOT NULL UNIQUE,
    tx_hash VARCHAR(66) NOT NULL,
    sequence_number BIGINT NOT NULL,
    account_address VARCHAR(66) NOT NULL,
    event_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_merchant ON orders(merchant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_payouts_merchant ON payouts(merchant_id);
CREATE INDEX idx_events_processed ON blockchain_events(processed);
CREATE INDEX idx_events_type ON blockchain_events(event_type);
```

**Tasks:**
- [ ] Create `docker-compose.yml` with PostgreSQL 15 + Redis 7
- [ ] Set up Prisma ORM with schema
- [ ] Create migration scripts
- [ ] Implement connection pooling
- [ ] Add database health checks
- [ ] Create seed data for testing

**Estimated Time**: 3 days

---

#### 1.2 Authentication System
**Files to Create:**
- `src/middleware/auth.ts` - JWT verification
- `src/services/authService.ts` - Token generation
- `src/types/auth.ts` - Auth type definitions

**Features:**
- JWT-based authentication for merchants
- API key authentication for programmatic access
- Refresh token rotation
- Rate limiting per merchant

**Implementation:**
```typescript
// JWT payload structure
interface JWTPayload {
  merchantId: string;
  address: string;
  role: 'merchant' | 'admin';
  iat: number;
  exp: number;
}

// API key structure
interface APIKey {
  key: string; // Public key
  secret: string; // Hashed secret
  merchantId: string;
  permissions: string[];
}
```

**Tasks:**
- [ ] Implement JWT generation with RS256
- [ ] Create API key CRUD operations
- [ ] Add rate limiting middleware (100 req/min per merchant)
- [ ] Implement refresh token logic
- [ ] Add authentication tests

**Estimated Time**: 2 days

---

#### 1.3 Event Watcher Service
**Files to Create:**
- `src/services/eventWatcher.ts` - Blockchain event listener
- `src/workers/eventProcessor.ts` - Event processing queue

**Architecture:**
```
Aptos Node (Events) → Event Watcher → Redis Queue → Event Processor → Database
```

**Event Types to Watch:**
1. `PaymentEvent` - Update order status
2. `RefundEvent` - Trigger refund webhook
3. `WithdrawalEvent` - Update payout status

**Tasks:**
- [ ] Create event polling service (5-second intervals)
- [ ] Implement Redis-backed queue for event processing
- [ ] Add retry logic for failed events
- [ ] Create event handlers for each event type
- [ ] Add monitoring/alerting for missed events

**Estimated Time**: 4 days

---

### **Sprint 2: Production Features** (Weeks 3-4)

#### 2.1 Production Relayer
**Files to Create:**
- `src/services/relayerService.ts` - Enhanced relayer
- `src/database/models/Nonce.ts` - Nonce tracking

**Features:**
- Sequential nonce management
- Transaction queue with retry
- Gas price estimation
- Failed transaction handling
- Relayer balance monitoring

**Tasks:**
- [ ] Implement nonce tracking in database
- [ ] Create transaction queue with Bull
- [ ] Add gas estimation before submission
- [ ] Implement exponential backoff retry
- [ ] Add relayer balance alerts (<0.1 APT)

**Estimated Time**: 3 days

---

#### 2.2 Fraud Detection
**Files to Create:**
- `src/services/fraudService.ts` - Fraud detection logic
- `src/models/RiskScore.ts` - Risk scoring model

**Detection Rules:**
1. **Velocity Check**: Max 5 orders per address per hour
2. **Amount Anomaly**: Flag orders >10x merchant average
3. **Duplicate Detection**: Same amount + address within 1 hour
4. **Blacklist**: Known fraudulent addresses

**Tasks:**
- [ ] Create risk scoring algorithm (0-100)
- [ ] Implement velocity checks
- [ ] Add anomaly detection
- [ ] Create merchant-level fraud thresholds
- [ ] Build admin review dashboard

**Estimated Time**: 3 days

---

#### 2.3 Webhook System
**Files to Create:**
- `src/services/webhookService.ts` - Webhook delivery
- `src/workers/webhookWorker.ts` - Retry queue

**Webhook Events:**
```typescript
type WebhookEvent = 
  | 'payment.created'
  | 'payment.confirmed'
  | 'payment.failed'
  | 'refund.processed'
  | 'payout.completed';

interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: {
    orderId: string;
    amount: string;
    status: string;
    txHash?: string;
  };
  signature: string; // HMAC-SHA256
}
```

**Tasks:**
- [ ] Implement HMAC signature generation
- [ ] Create webhook delivery queue
- [ ] Add retry logic (3 attempts, exponential backoff)
- [ ] Build webhook testing endpoint
- [ ] Add webhook logs for debugging

**Estimated Time**: 2 days

---

### **Sprint 3: Frontend & Documentation** (Weeks 5-6)

#### 3.1 Merchant Dashboard
**Tech Stack:**
- Next.js 14 (App Router)
- TailwindCSS + shadcn/ui
- React Query for API calls
- Recharts for analytics

**Pages:**
1. `/login` - Merchant authentication
2. `/dashboard` - Overview (revenue, orders, payouts)
3. `/orders` - Order management table
4. `/payouts` - Payout history
5. `/settings` - API keys, webhooks, profile
6. `/docs` - Integration guides

**Tasks:**
- [ ] Set up Next.js project with TypeScript
- [ ] Create authentication flow
- [ ] Build responsive dashboard layout
- [ ] Implement order/payout tables with filtering
- [ ] Add charts for revenue analytics
- [ ] Create API key management UI

**Estimated Time**: 7 days

---

#### 3.2 API Documentation
**Tools:**
- Swagger/OpenAPI 3.0
- Redoc for beautiful docs
- Postman collection

**Endpoints to Document:**
- All 11 existing endpoints
- New authentication endpoints
- Merchant management
- Webhook configuration

**Tasks:**
- [ ] Generate OpenAPI spec from code
- [ ] Add request/response examples
- [ ] Create integration tutorials
- [ ] Build interactive API playground
- [ ] Write SDK documentation

**Estimated Time**: 3 days

---

### **Sprint 4: Testing & Deployment** (Weeks 7-8)

#### 4.1 Testing Suite
**Coverage Goals:** >80%

**Test Types:**
1. **Unit Tests** (Jest)
   - Service layer logic
   - Utility functions
   - Validation logic

2. **Integration Tests** (Supertest)
   - API endpoint flows
   - Database operations
   - Event processing

3. **E2E Tests** (Playwright)
   - Complete payment flow
   - Merchant dashboard flows
   - Webhook delivery

**Tasks:**
- [ ] Write unit tests for all services
- [ ] Create integration tests for API routes
- [ ] Build E2E test scenarios
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Add test coverage reporting

**Estimated Time**: 5 days

---

#### 4.2 Production Deployment
**Infrastructure:**
- **Backend**: Railway / Render
- **Database**: Neon (serverless Postgres)
- **Redis**: Upstash
- **Frontend**: Vercel
- **Monitoring**: Sentry + LogTail

**Tasks:**
- [ ] Set up production PostgreSQL
- [ ] Configure environment variables
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Set up error monitoring
- [ ] Configure log aggregation
- [ ] Add uptime monitoring (UptimeRobot)

**Estimated Time**: 3 days

---

#### 4.3 Performance Optimization
**Goals:**
- API response time: <200ms (p95)
- Database queries: <50ms
- Event processing: <5s latency

**Tasks:**
- [ ] Add database query indexes
- [ ] Implement Redis caching for rates
- [ ] Optimize N+1 queries
- [ ] Add connection pooling
- [ ] Enable gzip compression
- [ ] Set up CDN for frontend

**Estimated Time**: 2 days

---

## 📊 Success Metrics

### Phase 2 Completion Criteria:
- [ ] All database schemas implemented
- [ ] 100% API endpoint coverage with auth
- [ ] Event watcher processing all blockchain events
- [ ] Merchant dashboard deployed and functional
- [ ] >80% test coverage
- [ ] Production deployment live
- [ ] API documentation published
- [ ] Security audit completed

### Performance Benchmarks:
- [ ] API handles 100 req/sec
- [ ] Database queries average <50ms
- [ ] Event processing latency <5s
- [ ] Frontend load time <2s
- [ ] 99.9% uptime SLA

---

## 🔄 Next Steps (Immediate)

### **This Week:**
1. ✅ Deploy smart contract to testnet
2. ⏳ Set up PostgreSQL with Docker
3. ⏳ Create Prisma schema
4. ⏳ Implement JWT authentication
5. ⏳ Start event watcher development

### **Commands to Run:**
```powershell
# 1. Deploy contract
.\scripts\deploy.ps1

# 2. Set up database
docker-compose up -d postgres redis

# 3. Run migrations
npx prisma migrate dev

# 4. Install new dependencies
npm install --save prisma @prisma/client jsonwebtoken bcrypt bull ioredis

# 5. Start development
npm run dev
```

---

## 📚 References

- [Aptos TypeScript SDK Docs](https://aptos.dev/sdks/ts-sdk)
- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/guides/database/postgresql)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Transak API Docs](https://docs.transak.com/)

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Owner**: AptPays Development Team
