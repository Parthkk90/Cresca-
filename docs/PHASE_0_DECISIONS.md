# Phase 0: Critical Decisions & Scope

**Date**: October 26, 2025  
**Status**: Draft for Review  
**Owner**: Product Team

---

## 🎯 Executive Summary

This document outlines the critical architectural and business decisions for the AptPays payment gateway MVP, defining the scope and tradeoffs that will guide the engineering effort.

---

## 1️⃣ Settlement Model

### **Decision: CUSTODIAL**

**Rationale:**
- ✅ Merchant-friendly fiat payouts without crypto knowledge
- ✅ Simplified tax/accounting for merchants
- ✅ Faster settlement (no waiting for merchant wallet setup)
- ✅ Better conversion rates through aggregated liquidity
- ⚠️ Requires robust custody infrastructure (Fireblocks/BitGo)
- ⚠️ Higher regulatory compliance burden

**Alternatives Considered:**
- Non-custodial: Rejected for MVP due to merchant friction and complexity

**Implementation Notes:**
- Use institutional custody provider (Fireblocks recommended)
- Hot wallet for operational funds, cold storage for reserves
- Multi-sig governance for large withdrawals

---

## 2️⃣ Supported Assets (MVP)

### **Decision: APT + USDC (Aptos-native)**

**Rationale:**
- ✅ APT: Native token, low gas fees, good liquidity
- ✅ USDC: Stablecoin reduces volatility risk
- ✅ Two assets keep integration simple
- ✅ USDC enables near-instant fiat conversion

**Future Expansion:**
- Phase 3: Add USDT, other Aptos stablecoins
- Phase 4: Consider wrapped BTC/ETH if demand exists

**Risk Mitigation:**
- Instant USDC → fiat conversion (max 1-minute hold time)
- APT converted to USDC/fiat within 15 minutes of receipt

---

## 3️⃣ User Experience

### **Decision: GASLESS (Paymaster-Sponsored)**

**Rationale:**
- ✅ Zero friction for shoppers (no APT needed)
- ✅ Competitive with traditional payment gateways
- ✅ Higher conversion rates at checkout
- ⚠️ Relayer cost: ~$0.001-0.01 per tx (acceptable for MVP)

**Implementation:**
- Relayer service maintains APT balance for gas sponsorship
- Rate limiting: max 100 txs/min per IP initially
- Anti-fraud: velocity checks, merchant whitelist

**Alternatives Considered:**
- User-pays-gas: Rejected (poor UX for non-crypto users)

---

## 4️⃣ Jurisdictions & Legal Posture

### **Decision: START WITH INDIA + GLOBAL (SELECT COUNTRIES)**

**Phase 1 (MVP):**
- 🇮🇳 India: Primary market
- 🇺🇸 USA: Select states (avoid NY, CT initially)
- 🇸🇬 Singapore: Crypto-friendly
- 🇦🇪 UAE: Growing market

**Compliance Level (MVP):**
- **KYC (Shoppers)**: None required (below threshold transactions)
- **KYB (Merchants)**: Basic verification
  - Business name, registration number
  - Owner ID verification (passport/national ID)
  - Bank account verification
  - Initial limit: $10,000/month

**Regulatory Strategy:**
- Legal consultation with local counsel (India: IT Act compliance)
- Start with pilot merchants (B2B relationships, low volume)
- Avoid money transmitter classification initially (custody model)
- AML monitoring via third-party provider

**Blocked Jurisdictions:**
- OFAC sanctioned countries
- High-risk jurisdictions per FATF

---

## 5️⃣ Merchant Onboarding Model

### **Decision: MANUAL REVIEW (MVP) → SELF-SERVE (Phase 3)**

**MVP Approach:**
- Application form submitted online
- Manual review within 24-48 hours
- Video call for high-risk verticals (gambling, forex)
- Approval/rejection via email

**Self-Serve Criteria (Future):**
- Verified business registration
- Clean AML screening
- Low-risk industry vertical
- Auto-approve below $5k/month limit

---

## 6️⃣ Fee Structure

### **Decision: 1.5% + $0.10 per transaction**

**Breakdown:**
- Processing: 1.5%
- Fixed fee: $0.10 (covers gas + overhead)
- Settlement: Free for USDC, 0.5% for APT (conversion cost)

**Competitive Analysis:**
- Stripe: 2.9% + $0.30
- PayPal: 2.9% + $0.30
- Coinbase Commerce: 1% (crypto-only)

**Merchant Payout:**
- Fiat (INR/USD): T+2 settlement
- Crypto (USDC): T+0 settlement (on request)

---

## 7️⃣ Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Smart Contracts | Move (Aptos) | Native blockchain language |
| Backend API | Node.js + TypeScript | Fast development, strong typing |
| Database | PostgreSQL | ACID compliance, JSON support |
| Frontend | React + Next.js | SSR, great DX |
| Relayer | TypeScript + Aptos SDK | Consistency with backend |
| Custody | Fireblocks | Industry standard, insurance |
| KYC/KYB | Sumsub | Global coverage, API-first |
| Off-Ramp | Transak/ChangeNOW | Liquidity + compliance |
| Monitoring | Datadog/Sentry | Observability |
| Hosting | AWS/GCP | Scalability, global CDN |

---

## 8️⃣ Security Posture

**Priorities:**
1. **Custody Security**: HSM, multi-sig, cold storage
2. **API Security**: Rate limiting, HMAC webhooks, TLS
3. **Smart Contract**: Third-party audit before mainnet
4. **Compliance**: AML screening, sanctions checks
5. **Data**: Encryption at rest, PII minimization

**Audits Required:**
- Move smart contract audit (Week 10)
- Penetration test (Week 15)
- SOC 2 preparation (Phase 4)

---

## 9️⃣ Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| Transaction success rate | >98% |
| Avg settlement latency | <5 minutes |
| Merchant onboarding time | <48 hours |
| Relayer uptime | >99.5% |
| False AML positives | <5% |
| Customer support response | <2 hours |

---

## 🔟 Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Regulatory shutdown | Low | High | Legal counsel, pilot-first approach |
| Custody breach | Low | Critical | Institutional custody + insurance |
| Volatility losses | Medium | Medium | Instant USDC conversion, 15min APT hold |
| Relayer DOS | Medium | Medium | Rate limiting, IP blocking, cost caps |
| Merchant fraud | Medium | Medium | KYB, velocity limits, manual review |
| Low adoption | High | Medium | Pilot merchants, referral incentives |

---

## ✅ Next Steps

1. **Week 1**: Get legal sign-off on compliance approach
2. **Week 1**: Finalize custody provider (Fireblocks vs BitGo)
3. **Week 2**: Begin Phase 1 (PoC development)
4. **Week 2**: Draft merchant terms of service & privacy policy

---

## 📝 Approvals

- [ ] Product Lead
- [ ] Engineering Lead
- [ ] Legal Counsel
- [ ] Compliance Officer

---

**Last Updated**: October 26, 2025
