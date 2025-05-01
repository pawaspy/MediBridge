CREATE TABLE sellers (
    username varchar PRIMARY KEY,
    full_name varchar NOT NULL,
    email varchar UNIQUE NOT NULL,
    password varchar NOT NULL,
    mobile_number varchar NOT NULL,
    store_name varchar NOT NULL,
    gst_number varchar NOT NULL,
    drug_license_number varchar NOT NULL,
    seller_type varchar NOT NULL,
    store_address varchar NOT NULL
);
