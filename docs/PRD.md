# Product Requirements Document (PRD)
# AptPays Payment Gateway - MVP

**Version**: 1.0  
**Date**: October 26, 2025  
**Status**: Draft  
**Owner**: Product Team

---

## 📌 Product Overview

### Vision
Enable any merchant to accept cryptocurrency payments (APT, USDC) on Aptos blockchain with automatic fiat settlement, gasless UX, and compliance-first design.

### Mission Statement
Reduce crypto payment friction to match traditional payment gateways while maintaining decentralization benefits.

---

## 🎯 Goals & Success Criteria

### Primary Goals (MVP)
1. **Merchant Adoption**: Onboard 10 pilot merchants by Week 20
2. **Transaction Success**: Achieve >98% payment success rate
3. **UX Excellence**: <30 second checkout time (wallet sign → confirmation)
4. **Compliance**: Zero regulatory incidents during beta

### Success Metrics
- **Volume**: $50,000 GMV in first month post-launch
- **Merchants**: 10 active merchants
- **Transactions**: 500+ successful payments
- **NPS**: >40 from merchants

---

## 👥 Target Users

### Primary: Online Merchants
**Profile:**
- Small to medium businesses
- E-commerce, SaaS, digital goods
- Annual revenue: $100k - $5M
- Tech-savvy but not crypto-native
- Looking to expand payment options

**Pain Points:**
- High credit card fees (2.9% + $0.30)
- Chargebacks and fraud
- Cross-border payment complexity
- Settlement delays (T+2 to T+7)

**Jobs to be Done:**
- Accept payments from crypto users
- Reduce payment processing costs
- Expand to global customers
- Avoid chargebacks

### Secondary: Crypto-Savvy Shoppers
**Profile:**
- Age 18-45
- Hold APT/USDC in wallet
- Prefer crypto for privacy/rewards
- Willing to try new payment methods

**Pain Points:**
- Need to buy gas tokens
- Complex checkout flows
- Trust concerns with new merchants

---

## ✨ Features & Requirements

### Epic 1: Merchant Onboarding
**Priority**: P0 (MVP Critical)

#### Features:
1. **Application Form**
   - Business details (name, registration, country)
   - Owner KYC (ID upload via Sumsub)
   - Bank account for payouts
   - Acceptance of terms of service

2. **Manual Review Dashboard** (Internal)
   - Queue of pending applications
   - AML screening results
   - Approve/reject with notes
   - Email notifications

3. **Merchant Portal Access**
   - Unique login credentials
   - API key generation
   - Webhook configuration

**Acceptance Criteria:**
- Merchant can complete application in <10 minutes
- Review completed within 48 hours
- Automated email notifications at each step

---

### Epic 2: Payment Processing
**Priority**: P0 (MVP Critical)

#### Features:
1. **Create Order API**
   ```
   POST /api/v1/orders
   {
     "merchant_id": "m_123",
     "amount": 12.50,
     "currency": "USD",
     "pay_currency": "USDC",
     "callback_url": "https://merchant.com/webhook",
     "order_reference": "order_456",
     "customer_email": "shopper@example.com"
   }
   
   Response:
   {
     "order_id": "o_abc123",
     "pay_url": "https://aptpays.com/pay/o_abc123",
     "amount_crypto": 12.50,
     "expires_at": "2025-10-26T13:00:00Z",
     "qr_code": "data:image/png;base64,..."
   }
   ```

2. **Checkout Widget**
   - Embeddable iframe or hosted page
   - Show payment amount in crypto
   - QR code for mobile wallet
   - Wallet connect button (Petra, Martian, Pontem)
   - Real-time status updates (pending → paid → confirmed)

3. **Gasless Payment Flow**
   - Shopper signs payment intent
   - Relayer submits tx + pays gas
   - Move contract emits event
   - Event watcher updates order status
   - Webhook sent to merchant

**Acceptance Criteria:**
- Order created in <500ms
- Payment confirmed within 30 seconds of submission
- 99%+ event detection accuracy
- Webhook delivered within 5 seconds of confirmation

---

### Epic 3: Move Smart Contract
**Priority**: P0 (MVP Critical)

#### Requirements:
1. **Payment Escrow**
   - Accept APT or USDC deposits
   - Link deposit to order_id
   - Emit event with order_id, payer, amount, token type
   - Time-based expiry (24 hours)

2. **Withdrawal Function**
   - Only authorized gateway address can withdraw
   - Batch withdrawals for gas efficiency
   - Emergency pause mechanism

3. **Refund Function**
   - Admin-only trigger
   - Refund to original payer address
   - Emit refund event

**Acceptance Criteria:**
- Gas cost <0.001 APT per payment
- Third-party audit completed before mainnet
- Zero critical/high vulnerabilities

---

### Epic 4: Paymaster/Relayer Service
**Priority**: P0 (MVP Critical)

#### Features:
1. **Sponsored Transaction Submission**
   - Accept signed payment intents via API
   - Construct transaction with gas payment
   - Submit to Aptos fullnode
   - Retry logic for failed submissions

2. **Gas Management**
   - Monitor relayer APT balance
   - Auto-alert when balance <100 APT
   - Transaction cost tracking

3. **Rate Limiting & Security**
   - Max 100 tx/min per IP
   - Max 10 tx/min per wallet address
   - Blacklist for abusive addresses
   - Cost cap: $100/day maximum spend

**Acceptance Criteria:**
- 99.9% uptime
- <2 second tx submission time
- Relayer balance never depletes unexpectedly

---

### Epic 5: Merchant Dashboard
**Priority**: P0 (MVP Critical)

#### Features:
1. **Overview Page**
   - Total volume (24h, 7d, 30d)
   - Transaction count
   - Success rate
   - Pending payouts

2. **Orders List**
   - Searchable/filterable table
   - Order ID, amount, status, timestamp
   - Export to CSV

3. **Settings**
   - API key management (view, rotate)
   - Webhook URL configuration
   - Payout preferences (fiat vs crypto)
   - Bank account details

4. **Payouts**
   - Request payout button
   - Payout history
   - Status tracking (scheduled → processing → completed)

**Acceptance Criteria:**
- Dashboard loads in <2 seconds
- Real-time updates (WebSocket or polling)
- Mobile-responsive design

---

### Epic 6: Settlement & Custody
**Priority**: P0 (MVP Critical)

#### Features:
1. **Custody Integration**
   - Hot wallet for incoming payments
   - Auto-sweep to cold storage (threshold: 10,000 USDC)
   - Fireblocks API integration

2. **Conversion Engine**
   - USDC → retain as-is
   - APT → convert to USDC within 15 minutes
   - Use DEX aggregator (Liquidswap) or CEX API

3. **Payout Processing**
   - Scheduled payouts (daily, weekly, monthly)
   - Fiat payouts via Transak/partner bank
   - Crypto payouts to merchant wallet address
   - T+2 settlement for fiat, T+0 for crypto

**Acceptance Criteria:**
- Zero funds loss
- <1% conversion slippage
- Payout success rate >99%

---

### Epic 7: Webhooks & Notifications
**Priority**: P0 (MVP Critical)

#### Features:
1. **Webhook Events**
   - `payment.pending`: Order created
   - `payment.confirmed`: Payment confirmed on-chain
   - `payment.failed`: Payment expired/failed
   - `payment.refunded`: Refund processed
   - `payout.completed`: Merchant payout completed

2. **Webhook Security**
   - HMAC signature (SHA-256)
   - Retry logic (3 attempts, exponential backoff)
   - Webhook logs in merchant dashboard

**Acceptance Criteria:**
- Webhook delivery within 5 seconds
- 99% delivery success rate
- Signature verification sample code provided

---

## 🚫 Out of Scope (MVP)

### Deferred to Phase 3+
- [ ] Multi-currency fiat payouts (only USD/INR in MVP)
- [ ] Subscription/recurring payments
- [ ] Invoice generation
- [ ] Advanced fraud detection (ML-based)
- [ ] Mobile SDK
- [ ] Point-of-sale (POS) integration
- [ ] Partial refunds (full refunds only in MVP)
- [ ] Dispute management system

---

## 🎨 User Flows

### Flow 1: Merchant Onboarding
```
1. Merchant visits aptpays.com
2. Clicks "Get Started"
3. Fills application form
4. Uploads KYC documents
5. Submits application
6. Receives email: "Application under review"
7. (24-48h later) Receives approval email
8. Logs into dashboard
9. Generates API key
10. Integrates with website
```

### Flow 2: Shopper Payment
```
1. Shopper adds item to cart on merchant site
2. Clicks "Checkout"
3. Selects "Pay with Crypto (Aptos)"
4. Redirected to AptPays checkout page
5. Sees payment amount in USDC/APT
6. Clicks "Connect Wallet"
7. Approves connection (Petra wallet)
8. Reviews transaction details
9. Signs payment (wallet popup)
10. Relayer submits tx + pays gas
11. Sees "Payment Processing..." (3-5 seconds)
12. Sees "Payment Confirmed!"
13. Redirected back to merchant site
14. Merchant receives webhook → fulfills order
```

### Flow 3: Merchant Payout
```
1. Merchant logs into dashboard
2. Navigates to "Payouts"
3. Sees available balance
4. Clicks "Request Payout"
5. Selects payout method (bank transfer/crypto)
6. Confirms bank details
7. Submits request
8. Receives email: "Payout scheduled"
9. (T+2 for fiat) Funds arrive in bank account
10. Receives email: "Payout completed"
```

---

## 🔒 Security & Compliance

### Security Requirements
1. **Data Protection**
   - PII encrypted at rest (AES-256)
   - TLS 1.3 for all API communication
   - API keys hashed in database

2. **Access Control**
   - Role-based access (admin, merchant, support)
   - API key rotation every 90 days (recommended)
   - Multi-factor authentication for dashboard (Phase 2)

3. **Smart Contract**
   - Formal verification of critical functions
   - Third-party audit (CertiK/Halborn)
   - Bug bounty program ($10k max payout)

### Compliance Requirements
1. **KYB (Merchants)**
   - Business registration verification
   - Owner identity verification (ID + selfie)
   - Bank account ownership proof
   - Sanctions screening (OFAC)

2. **AML Monitoring**
   - Transaction velocity checks
   - Large transaction alerts (>$10k)
   - Suspicious activity reporting
   - Record retention (7 years)

3. **Privacy**
   - GDPR compliance (EU merchants)
   - Data deletion requests honored
   - Privacy policy published
   - Cookie consent (website)

---

## 📊 Analytics & Monitoring

### Key Dashboards (Internal)
1. **Operations Dashboard**
   - Real-time transaction volume
   - Success/failure rates
   - Relayer gas spending
   - Event watcher lag

2. **Business Dashboard**
   - GMV (daily, weekly, monthly)
   - Active merchants
   - Average order value
   - Conversion funnel (order created → paid)

3. **Alerts**
   - Relayer balance <100 APT
   - Transaction success rate <95%
   - Webhook delivery failures >10/hour
   - Smart contract abnormal activity

---

## 🗓️ Release Plan

### Phase 1: PoC (Weeks 2-5)
- Testnet deployment
- Internal demo

### Phase 2: MVP Development (Weeks 6-17)
- Staging environment
- Security audits
- Documentation

### Phase 3: Beta (Weeks 18-25)
- 10 pilot merchants
- Limited production (max 100 tx/day)

### Phase 4: General Availability (Week 26+)
- Public launch
- Marketing campaign
- Remove transaction caps

---

## 📝 Open Questions

1. Should we support wallet-less payments (email-based) in MVP?
   - **Decision needed by**: Week 3

2. What's the minimum order amount?
   - **Recommendation**: $1 (to cover gas costs)

3. How do we handle partial refunds?
   - **MVP**: Full refunds only; partial in Phase 3

4. Should merchants set their own payment expiry time?
   - **MVP**: Fixed 24 hours; custom in Phase 2

---

## ✅ Acceptance Criteria (MVP Launch)

### Must Have:
- [x] 10 merchants onboarded
- [x] >98% transaction success rate
- [x] Smart contract audited
- [x] Legal terms approved
- [x] Custody provider integrated
- [x] Webhooks functional
- [x] Dashboard complete

### Nice to Have:
- [ ] Mobile-optimized widget
- [ ] Multi-language support
- [ ] Merchant API SDKs (Node.js, Python)

---

**Approved By:**
- [ ] Product Lead
- [ ] Engineering Lead
- [ ] Design Lead
- [ ] Legal Counsel

---

**Last Updated**: October 26, 2025
