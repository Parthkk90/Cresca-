# Compliance Checklist - AptPays Payment Gateway

**Version**: 1.0  
**Date**: October 26, 2025  
**Status**: Initial Assessment  
**Review Cycle**: Quarterly

---

## 🌍 Jurisdictional Compliance

### 🇮🇳 India
**Status**: Primary Market

#### Required Licenses & Registrations
- [ ] GST Registration (if revenue >₹20 lakh/year)
- [ ] Company Registration (Pvt Ltd/LLP)
- [ ] FEMA Compliance (Foreign Exchange Management Act)
- [ ] IT Act 2000 Compliance (digital payments)

#### Regulatory Considerations
- [ ] **RBI Consultation**: Payment aggregator guidelines (if applicable)
- [ ] **TDS Compliance**: Tax deduction on merchant payouts
- [ ] **GST on Crypto**: Clarify tax treatment of crypto transactions
- [ ] **Data Localization**: RBI data storage requirements (Indian servers)

#### KYC/AML Requirements
- [ ] PML Act 2002 compliance
- [ ] Aadhaar/PAN verification for merchants (via DigiLocker API)
- [ ] Suspicious Transaction Reporting (STR) to FIU-IND
- [ ] Record retention: 5 years minimum

#### Action Items
- [ ] Engage Indian legal counsel (Nishith Desai Associates / Khaitan & Co)
- [ ] Apply for GSTIN
- [ ] Set up Indian subsidiary/branch
- [ ] Consult with RBI on classification (PSP vs PA vs other)

---

### 🇺🇸 United States
**Status**: Secondary Market (Select States)

#### Federal Requirements
- [ ] **FinCEN Registration**: MSB (Money Services Business) if applicable
- [ ] **BSA/AML Program**: Bank Secrecy Act compliance
- [ ] **OFAC Sanctions Screening**: Real-time checks
- [ ] **IRS 1099-K Reporting**: Merchant transaction reporting (>$600/year)

#### State-Level Money Transmitter Licenses
**Phase 1 (Friendly States)**
- [ ] Wyoming: No MTL required for certain crypto activities
- [ ] Texas: May require MTL (consult counsel)
- [ ] Florida: May require MTL

**Phase 1 (Avoid)**
- ❌ New York: BitLicense (expensive, time-consuming)
- ❌ Connecticut: Complex MTL requirements

#### Action Items
- [ ] Engage US legal counsel (Coin Center / Perkins Coie)
- [ ] Determine if custodial model triggers MTL requirements
- [ ] File FinCEN MSB registration (if required)
- [ ] Implement OFAC screening (Chainalysis/Elliptic)

---

### 🇸🇬 Singapore
**Status**: Expansion Market

#### Required Licenses
- [ ] **MAS Payment Services Act**: Register as DPT service provider
- [ ] **ACRA Registration**: Company registration

#### KYC/AML Requirements
- [ ] MAS AML/CFT Guidelines compliance
- [ ] Customer Due Diligence (CDD)
- [ ] Enhanced Due Diligence (EDD) for high-risk customers

#### Action Items
- [ ] Engage Singapore legal counsel (Dentons Rodyk)
- [ ] Apply for MAS DPT license (6-12 month process)
- [ ] Set up Singapore entity

---

### 🇦🇪 United Arab Emirates (Dubai)
**Status**: Expansion Market

#### Required Licenses
- [ ] **VARA License**: Virtual Assets Regulatory Authority (Dubai)
- [ ] **Free Zone Company**: DMCC/ADGM registration

#### Action Items
- [ ] Engage UAE legal counsel
- [ ] Apply for VARA license (if operating in Dubai)
- [ ] Consider ADGM route (alternative)

---

## 🔐 Data Protection & Privacy

### GDPR (European Union)
**Applicability**: If serving EU merchants/customers

- [ ] **Data Protection Officer**: Appoint DPO (if >250 employees or high-risk processing)
- [ ] **Privacy Policy**: GDPR-compliant, plain language
- [ ] **Cookie Consent**: For website tracking
- [ ] **Right to Erasure**: Implement data deletion process
- [ ] **Data Breach Notification**: 72-hour reporting to supervisory authority
- [ ] **Data Processing Agreement**: With third-party vendors (Sumsub, Fireblocks)

### India (DPDP Act 2023)
- [ ] **Data Fiduciary Registration**: Register with Data Protection Board
- [ ] **Consent Management**: Clear, informed consent for data collection
- [ ] **Data Localization**: Critical personal data stored in India
- [ ] **Grievance Officer**: Appoint officer for user complaints

### Action Items
- [ ] Conduct Privacy Impact Assessment (PIA)
- [ ] Draft Privacy Policy & Terms of Service
- [ ] Implement consent management system
- [ ] Set up data retention/deletion workflows

---

## 💰 Tax Compliance

### India
- [ ] **GST**: 18% on service fees (check exemptions for crypto)
- [ ] **TDS**: Deduct tax on merchant payouts (if applicable)
- [ ] **Income Tax**: Corporate tax filing (30% + surcharge)
- [ ] **Crypto Tax Reporting**: Section 194S (1% TDS on crypto transfers >₹50k)

### USA
- [ ] **Federal Income Tax**: Corporate tax (21%)
- [ ] **State Taxes**: Varies by state
- [ ] **1099-K Reporting**: Issue to merchants (>$600/year)
- [ ] **Sales Tax**: SaaS tax (varies by state)

### Action Items
- [ ] Engage tax consultant (Big 4 or crypto-specialized firm)
- [ ] Set up automated tax calculation
- [ ] File appropriate tax registrations

---

## 🛡️ AML/CFT Program

### Required Components
- [ ] **Risk Assessment**: Annual review of money laundering risks
- [ ] **Customer Due Diligence**: KYB for all merchants
  - [ ] Business registration documents
  - [ ] Beneficial ownership (UBO) identification
  - [ ] Source of funds declaration
- [ ] **Transaction Monitoring**
  - [ ] Velocity checks (unusual transaction patterns)
  - [ ] Large transaction alerts (>$10,000)
  - [ ] Structuring detection (layering below reporting threshold)
- [ ] **Sanctions Screening**
  - [ ] OFAC (USA)
  - [ ] UN Sanctions List
  - [ ] EU Sanctions List
  - [ ] Local sanctions lists
- [ ] **Suspicious Activity Reporting**
  - [ ] STR/SAR filing procedures
  - [ ] Designated compliance officer
- [ ] **Record Keeping**
  - [ ] Transaction records: 5-7 years
  - [ ] KYC documents: 5-7 years
  - [ ] AML logs: 5 years

### Third-Party Providers
- [ ] **KYC/KYB**: Sumsub, Onfido, Jumio
- [ ] **Sanctions Screening**: Chainalysis, Elliptic, ComplyAdvantage
- [ ] **Transaction Monitoring**: Chainalysis KYT, Elliptic Navigator

### Action Items
- [ ] Appoint AML Compliance Officer
- [ ] Draft AML/CFT Policy
- [ ] Integrate KYC provider (Sumsub)
- [ ] Integrate sanctions screening (Chainalysis)
- [ ] Train staff on AML procedures

---

## 📜 Terms of Service & Legal Docs

### Merchant Agreements
- [ ] **Terms of Service**
  - Scope of services
  - Fee structure
  - Liability limitations
  - Termination clauses
  - Dispute resolution (arbitration clause)
- [ ] **Privacy Policy**
  - Data collection & usage
  - Third-party sharing
  - User rights
- [ ] **Acceptable Use Policy**
  - Prohibited businesses (gambling, adult, pharma without license)
  - Sanctions compliance
- [ ] **API Terms**
  - Rate limits
  - Intellectual property
  - Support SLAs

### Shopper-Facing
- [ ] **Checkout Terms** (brief)
  - Payment finality
  - Refund policy
  - Privacy notice

### Action Items
- [ ] Engage legal counsel to draft agreements
- [ ] Review with compliance officer
- [ ] Publish on website
- [ ] Implement clickwrap acceptance (logged)

---

## 🔒 Security & Custody

### Custody Standards
- [ ] **Institutional Custody**: Fireblocks/BitGo integration
- [ ] **Insurance**: Crime insurance ($10M+ coverage)
- [ ] **Multi-Signature**: 3-of-5 for cold storage withdrawals
- [ ] **Key Management**: HSM (Hardware Security Modules)
- [ ] **Audit Trail**: Immutable logs for all custody operations

### Security Certifications (Future)
- [ ] **SOC 2 Type II**: Service Organization Control (18-24 months)
- [ ] **ISO 27001**: Information security management
- [ ] **PCI DSS**: If handling card data (future scope)

### Action Items
- [ ] Sign custody agreement with Fireblocks
- [ ] Obtain crime insurance policy
- [ ] Implement security incident response plan
- [ ] Conduct annual penetration testing

---

## 🧪 Smart Contract Audit & Security

### Pre-Mainnet Requirements
- [ ] **Formal Verification**: Critical functions (escrow, withdrawal)
- [ ] **Third-Party Audit**: CertiK, Halborn, or Trail of Bits
  - Target: Zero critical/high vulnerabilities
  - Timeline: 2-4 weeks
  - Cost: $10k-$40k
- [ ] **Bug Bounty**: ImmuneFi or HackerOne
  - Max payout: $10,000
  - Duration: Ongoing

### Action Items
- [ ] Engage audit firm (Week 8)
- [ ] Launch bug bounty program (Week 10)
- [ ] Publish audit report (transparency)

---

## 🌐 Consumer Protection

### Refund Policy
- [ ] Clear refund terms (timeframe, conditions)
- [ ] Full refunds for failed/duplicate transactions
- [ ] Dispute resolution process

### Transparency
- [ ] Fee disclosure (no hidden charges)
- [ ] Exchange rate transparency (for APT → USDC conversion)
- [ ] Estimated settlement time

### Action Items
- [ ] Draft customer support SLA
- [ ] Publish fee schedule
- [ ] Create FAQ/Help Center

---

## 📊 Reporting & Record Keeping

### Transaction Records
- [ ] Store: Order ID, merchant, amount, timestamp, tx hash, status
- [ ] Retention: 7 years (extendable for legal holds)

### KYC/KYB Records
- [ ] Store: Encrypted documents, verification results, risk scores
- [ ] Retention: 7 years post-relationship

### Financial Records
- [ ] Merchant payouts, fee calculations, conversions
- [ ] Retention: 7 years (tax requirement)

### Action Items
- [ ] Implement secure document storage (AWS S3 + encryption)
- [ ] Set up automated retention policies
- [ ] Create data export process (for audits/investigations)

---

## 🚨 Incident Response

### Breach Notification Requirements
- [ ] **GDPR**: 72 hours to supervisory authority, immediate to affected users
- [ ] **India DPDP**: TBD (regulations pending)
- [ ] **USA**: Varies by state (California: immediate)

### Action Items
- [ ] Draft Incident Response Plan
- [ ] Designate Incident Response Team
- [ ] Conduct annual tabletop exercise

---

## ✅ Compliance Roadmap

### Week 1-2 (Phase 0)
- [x] Create compliance checklist
- [ ] Engage legal counsel (India + USA)
- [ ] Initial jurisdiction risk assessment

### Week 3-5 (Phase 1 PoC)
- [ ] Draft Terms of Service & Privacy Policy
- [ ] Select KYC provider (Sumsub)
- [ ] Select sanctions screening provider (Chainalysis)

### Week 6-12 (Phase 2 MVP)
- [ ] Integrate KYC/AML tools
- [ ] File necessary registrations (GST, FinCEN if applicable)
- [ ] Obtain crime insurance
- [ ] Conduct smart contract audit

### Week 13-20 (Phase 3 Beta)
- [ ] Onboard compliance officer (full-time or consultant)
- [ ] Run AML monitoring in production
- [ ] File first SAR/STR if needed
- [ ] Prepare for SOC 2 audit (kickoff)

### Week 21+ (Phase 4 Production)
- [ ] Obtain Money Transmitter Licenses (as needed)
- [ ] Expand to additional jurisdictions
- [ ] Complete SOC 2 Type II
- [ ] Annual compliance review

---

## 📞 Key Contacts

### Legal Counsel
- **India**: [TBD - Nishith Desai Associates]
- **USA**: [TBD - Perkins Coie / Coin Center]
- **Singapore**: [TBD - Dentons Rodyk]

### Compliance Providers
- **KYC/KYB**: Sumsub (contact: sales@sumsub.com)
- **AML Screening**: Chainalysis (contact: sales@chainalysis.com)
- **Custody**: Fireblocks (contact: sales@fireblocks.com)

### Regulatory Agencies
- **India RBI**: https://www.rbi.org.in
- **India FIU**: https://fiuindia.gov.in
- **USA FinCEN**: https://www.fincen.gov
- **Singapore MAS**: https://www.mas.gov.sg

---

## 📝 Notes

1. **This is a living document**: Update quarterly or when regulations change
2. **Not legal advice**: Always consult licensed attorneys in each jurisdiction
3. **Risk-based approach**: Prioritize based on business volume and jurisdiction
4. **Overcomply initially**: Better safe than sorry during MVP phase

---

**Last Updated**: October 26, 2025  
**Next Review**: January 26, 2026  
**Owner**: Compliance Officer / Legal Team
