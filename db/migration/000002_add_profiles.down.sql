ALTER TABLE "doctor_profiles" DROP CONSTRAINT doctor_profiles_username_fkey;
ALTER TABLE "patient_profiles" DROP CONSTRAINT patient_profiles_username_fkey;
ALTER TABLE "seller_profiles" DROP CONSTRAINT seller_profiles_username_fkey;

DROP TABLE "doctor_profiles";
DROP TABLE "patient_profiles";
DROP TABLE "seller_profiles";
