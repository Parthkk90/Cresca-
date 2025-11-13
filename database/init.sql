-- AptPays Database Initialization Script
-- This script creates the initial database schema for the AptPays payment gateway

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Merchants table
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address VARCHAR(66) NOT NULL UNIQUE,
    business_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    api_key VARCHAR(64) NOT NULL UNIQUE,
    api_secret_hash VARCHAR(128) NOT NULL,
    webhook_url VARCHAR(512),
    webhook_secret VARCHAR(128),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
    tier VARCHAR(20) DEFAULT 'basic' CHECK (tier IN ('basic', 'professional', 'enterprise')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(64) NOT NULL UNIQUE,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_address VARCHAR(66) NOT NULL,
    amount BIGINT NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) DEFAULT 'APT',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'refunded', 'failed')),
    description TEXT,
    metadata JSONB,
    tx_hash VARCHAR(66),
    tx_version BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    paid_at TIMESTAMP,
    expires_at TIMESTAMP
);

-- Payouts table
CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    amount BIGINT NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'APT',
    fiat_amount DECIMAL(12, 2),
    fiat_currency VARCHAR(3),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    transak_order_id VARCHAR(128) UNIQUE,
    transak_status VARCHAR(50),
    bank_account_id VARCHAR(255),
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Blockchain events table
CREATE TABLE IF NOT EXISTS blockchain_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('PaymentEvent', 'RefundEvent', 'WithdrawalEvent')),
    tx_version BIGINT NOT NULL UNIQUE,
    tx_hash VARCHAR(66) NOT NULL,
    sequence_number BIGINT NOT NULL,
    account_address VARCHAR(66) NOT NULL,
    event_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Webhooks log table
CREATE TABLE IF NOT EXISTS webhook_logs (
    id BIGSERIAL PRIMARY KEY,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    payload JSONB NOT NULL,
    url VARCHAR(512) NOT NULL,
    status_code INT,
    response_body TEXT,
    attempt_number INT DEFAULT 1,
    success BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- API keys table (for revocable API key management)
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    key_prefix VARCHAR(20) NOT NULL,
    key_hash VARCHAR(128) NOT NULL UNIQUE,
    name VARCHAR(100),
    permissions JSONB DEFAULT '["read", "write"]',
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fraud detection table
CREATE TABLE IF NOT EXISTS fraud_checks (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    risk_score INT CHECK (risk_score BETWEEN 0 AND 100),
    flags JSONB,
    decision VARCHAR(20) CHECK (decision IN ('allow', 'review', 'block')),
    reviewed_by UUID REFERENCES merchants(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Nonce tracking table (for relayer)
CREATE TABLE IF NOT EXISTS nonce_tracking (
    id SERIAL PRIMARY KEY,
    account_address VARCHAR(66) NOT NULL UNIQUE,
    current_nonce BIGINT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_orders_merchant ON orders(merchant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer ON orders(customer_address);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

CREATE INDEX idx_payouts_merchant ON payouts(merchant_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_transak ON payouts(transak_order_id);

CREATE INDEX idx_events_processed ON blockchain_events(processed) WHERE processed = false;
CREATE INDEX idx_events_type ON blockchain_events(event_type);
CREATE INDEX idx_events_created ON blockchain_events(created_at DESC);

CREATE INDEX idx_webhook_logs_merchant ON webhook_logs(merchant_id);
CREATE INDEX idx_webhook_logs_success ON webhook_logs(success);

CREATE INDEX idx_api_keys_merchant ON api_keys(merchant_id);
CREATE INDEX idx_api_keys_revoked ON api_keys(revoked) WHERE revoked = false;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON payouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert seed data for development
INSERT INTO merchants (address, business_name, email, api_key, api_secret_hash, status, kyc_status, tier)
VALUES (
    '0x0f9713e3c42951dbc4f05cc2e7ea211c1851b00a9d077e7e71f5d2a73041d606',
    'AptPays Test Merchant',
    'test@aptpays.com',
    'pk_test_1234567890abcdef',
    '$2b$10$X9n.P5YjKxJ7VZ8zP8YQxO5YqZ5YxZxZxZxZxZxZxZxZxZxZxZxZx', -- Hashed: "secret123"
    'active',
    'verified',
    'professional'
)
ON CONFLICT (address) DO NOTHING;

-- Create views for analytics
CREATE OR REPLACE VIEW merchant_analytics AS
SELECT 
    m.id,
    m.business_name,
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(DISTINCT CASE WHEN o.status = 'paid' THEN o.id END) as paid_orders,
    SUM(CASE WHEN o.status = 'paid' THEN o.amount ELSE 0 END) as total_revenue,
    COUNT(DISTINCT p.id) as total_payouts,
    SUM(CASE WHEN p.status = 'completed' THEN p.fiat_amount ELSE 0 END) as total_payouts_amount
FROM merchants m
LEFT JOIN orders o ON m.id = o.merchant_id
LEFT JOIN payouts p ON m.id = p.merchant_id
GROUP BY m.id, m.business_name;

COMMENT ON TABLE merchants IS 'Stores merchant account information and API credentials';
COMMENT ON TABLE orders IS 'Payment orders initiated by merchants';
COMMENT ON TABLE payouts IS 'Crypto-to-fiat conversion requests';
COMMENT ON TABLE blockchain_events IS 'Log of all blockchain events to be processed';
COMMENT ON TABLE webhook_logs IS 'Webhook delivery attempts and responses';
COMMENT ON TABLE api_keys IS 'Revocable API keys for merchant authentication';
COMMENT ON TABLE fraud_checks IS 'Fraud detection results for orders';
COMMENT ON TABLE nonce_tracking IS 'Transaction nonce tracking for the relayer account';
