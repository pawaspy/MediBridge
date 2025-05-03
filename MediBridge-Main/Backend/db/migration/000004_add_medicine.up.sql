CREATE TABLE medicines (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR NOT NULL,
    "description" TEXT NOT NULL,
    "expiry_date" DATE UNIQUE NOT NULL,
    "quantity" INTEGER NOT NULL CHECK (quantity >= 0),
    "price" NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    "discount" INTEGER NOT NULL DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
    "seller_username" VARCHAR NOT NULL REFERENCES sellers(username) ON DELETE CASCADE,
    "created_at" TIMESTAMP NOT NULL DEFAULT (now())
);
