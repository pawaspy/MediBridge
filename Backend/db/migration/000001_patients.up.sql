CREATE TABLE patients (
    username varchar PRIMARY KEY,
    full_name varchar NOT NULL,
    email varchar UNIQUE NOT NULL,
    mobile_number varchar NOT NULL,
    password varchar NOT NULL,
    gender varchar NOT NULL,
    age INTEGER NOT NULL,
    address varchar NOT NULL,
    emergency_contact varchar NOT NULL
);
