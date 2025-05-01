CREATE TABLE doctors (
    username varchar PRIMARY KEY,
    full_name varchar NOT NULL,
    mobile_number varchar NOT NULL,
    gender varchar NOT NULL,
    age INTEGER NOT NULL,
    specialization varchar NOT NULL,
    email varchar UNIQUE NOT NULL,
    password varchar NOT NULL,
    registration_number varchar UNIQUE NOT NULL,
    hospital_name varchar,
    years_experience INTEGER NOT NULL
);
