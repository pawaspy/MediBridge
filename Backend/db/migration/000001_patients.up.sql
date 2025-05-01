CREATE TABLE patients (
    "username" varchar PRIMARY KEY,
    "full_name" varchar NOT NULL,
    "email" varchar UNIQUE NOT NULL,
    "mobile_number" varchar NOT NULL,
    "password" varchar NOT NULL,
    "gender" varchar NOT NULL,
    "age" INTEGER NOT NULL,
    "address" varchar NOT NULL,
    "emergency_contact" varchar NOT NULL,
    "password_changed_at" timestamp NOT NULL DEFAULT '0001-01-01 00:00:00',
    "created_at" timestamp NOT NULL DEFAULT (now())
);
