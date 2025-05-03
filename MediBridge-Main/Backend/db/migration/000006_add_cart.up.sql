CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    patient_username VARCHAR NOT NULL REFERENCES patients(username) ON DELETE CASCADE,
    medicine_id INT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price NUMERIC NOT NULL CHECK (total_price > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(patient_username, medicine_id)
);