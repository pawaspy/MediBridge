-- SQL dump generated using DBML (dbml.dbdiagram.io)
-- Database: PostgreSQL
-- Generated at: 2025-04-28T06:47:50.311Z

CREATE TYPE "user_role" AS ENUM (
  'doctor',
  'patient',
  'seller'
);

CREATE TABLE "users" (
  "username" varchar PRIMARY KEY,
  "full_name" varchar NOT NULL,
  "email" varchar UNIQUE NOT NULL,
  "hashed_password" varchar NOT NULL,
  "role" user_role NOT NULL,
  "is_email_verified" boolean NOT NULL DEFAULT false,
  "password_changed_at" timestamp NOT NULL DEFAULT (0001-01-01),
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "doctor_profiles" (
  "username" varchar PRIMARY KEY NOT NULL,
  "specialization" varchar,
  "experience_years" int,
  "clinic_address" varchar,
  "phone_number" varchar
);

CREATE TABLE "patient_profiles" (
  "username" varchar PRIMARY KEY NOT NULL,
  "age" int,
  "blood_group" varchar,
  "allergies" varchar,
  "phone_number" varchar
);

CREATE TABLE "seller_profiles" (
  "username" varchar PRIMARY KEY NOT NULL,
  "shop_name" varchar,
  "license_number" varchar,
  "shop_address" varchar,
  "phone_number" varchar
);

ALTER TABLE "doctor_profiles" ADD FOREIGN KEY ("username") REFERENCES "users" ("username");

ALTER TABLE "patient_profiles" ADD FOREIGN KEY ("username") REFERENCES "users" ("username");

ALTER TABLE "seller_profiles" ADD FOREIGN KEY ("username") REFERENCES "users" ("username");
