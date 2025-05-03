CREATE TABLE patient_profiles (
    id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL REFERENCES patients(username) ON DELETE CASCADE,
    disease_allergies TEXT,
    blood_group VARCHAR(5),
    prescribed_medicine TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
