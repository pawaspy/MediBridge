-- name: CreateMedicine :one
INSERT INTO medicines (
    name, description, expiry_date, quantity, price, discount, seller_username
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
)
RETURNING *;

-- name: ListMedicines :many
SELECT * FROM medicines ORDER BY id LIMIT $1 OFFSET $2;

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
    name = COALESCE($1, name),
    description = COALESCE($2, description),
    expiry_date = COALESCE($3, expiry_date),
    quantity = COALESCE($4, quantity),
    price = COALESCE($5, price),
    discount = COALESCE($6, discount)
WHERE id = $7
RETURNING *;

-- name: DeleteMedicine :exec
DELETE FROM medicines WHERE id = $1;
