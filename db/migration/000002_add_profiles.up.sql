CREATE TABLE "doctor_profiles" (
  "username" varchar PRIMARY KEY NOT NULL,
  "specialization" varchar NOT NULL,
  "experience_years" int NOT NULL,
  "clinic_address" varchar NOT NULL,
  "phone_number" varchar NOT NULL
);

CREATE TABLE "patient_profiles" (
  "username" varchar PRIMARY KEY NOT NULL,
  "age" int NOT NULL,
  "blood_group" varchar NOT NULL,
  "allergies" varchar NOT NULL,
  "phone_number" varchar NOT NULL
);

CREATE TABLE "seller_profiles" (
  "username" varchar PRIMARY KEY NOT NULL,
  "shop_name" varchar NOT NULL,
  "license_number" varchar NOT NULL,
  "shop_address" varchar NOT NULL,
  "phone_number" varchar NOT NULL
);

ALTER TABLE "doctor_profiles" ADD FOREIGN KEY ("username") REFERENCES "users" ("username");

ALTER TABLE "patient_profiles" ADD FOREIGN KEY ("username") REFERENCES "users" ("username");

ALTER TABLE "seller_profiles" ADD FOREIGN KEY ("username") REFERENCES "users" ("username");