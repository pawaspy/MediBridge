-- name: CreateMedicine :one
INSERT INTO medicines (
    name, description, expiry_date, quantity, price, discount, seller_username
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
)
RETURNING *;

-- name: ListSellerMedicinesByExpiry :many
SELECT * FROM medicines
WHERE seller_username = $1
ORDER BY expiry_date ASC
LIMIT $2 OFFSET $3;

-- name: SearchMedicinesByNameSortedByPrice :many
SELECT * FROM medicines
WHERE name ILIKE '%' || sqlc.arg('name') || '%'
ORDER BY price ASC
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');

-- name: UpdateMedicine :one
UPDATE medicines SET
    name = COALESCE(sqlc.narg(name), name),
    description = COALESCE(sqlc.narg(description), description),
    expiry_date = COALESCE(sqlc.narg(expiry_date), expiry_date),
    quantity = COALESCE(sqlc.narg(quantity), quantity),
    price = COALESCE(sqlc.narg(price), price),
    discount = COALESCE(sqlc.narg(discount), discount)
WHERE id = sqlc.arg(id)
RETURNING *;

-- name: DeleteMedicine :one
DELETE FROM medicines WHERE id = $1
RETURNING id;

-- name: GetMedicineByName :one
SELECT * FROM medicines WHERE name = $1;

-- name: GetMedicine :one
SELECT * FROM medicines WHERE id = $1;

-- name: ListAllMedicines :many
SELECT * FROM medicines
ORDER BY id ASC;
