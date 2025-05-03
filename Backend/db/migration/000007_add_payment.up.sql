CREATE TABLE payments (
    id serial PRIMARY KEY,
    order_id INT,
    user_id VARCHAR(255) NOT NULL,
    amount NUMERIC NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_intent_id VARCHAR(255) UNIQUE,
    charge_id VARCHAR(255) UNIQUE,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE payment_methods (
    id serial PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    payment_method_id VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    card_last4 VARCHAR(4),
    card_brand VARCHAR(50),
    card_exp_month INT,
    card_exp_year INT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_intent_id ON payments(payment_intent_id);
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
