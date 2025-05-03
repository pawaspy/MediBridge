-- name: AddToCart :one
INSERT INTO carts (patient_username, medicine_id, quantity, total_price)
VALUES ($1, $2, $3, (SELECT price * $3 FROM medicines WHERE id = $2))
ON CONFLICT (patient_username, medicine_id) DO UPDATE
SET 
    quantity = EXCLUDED.quantity,
    total_price = (SELECT price * EXCLUDED.quantity FROM medicines WHERE id = EXCLUDED.medicine_id)
RETURNING *;

-- name: GetCartItems :many
SELECT 
    c.id, 
    c.patient_username, 
    c.medicine_id, 
    c.quantity, 
    c.total_price, 
    c.created_at, 
    c.updated_at,
    m.name as medicine_name, 
    m.price as medicine_price,
    m.quantity as stock_quantity,
    m.expiry_date as medicine_expiry,
    s.full_name as seller_name
FROM carts c
JOIN medicines m ON c.medicine_id = m.id
JOIN sellers s ON m.seller_username = s.username
WHERE c.patient_username = $1
ORDER BY c.created_at DESC;

-- name: GetCartTotal :one
SELECT COALESCE(SUM(c.total_price), 0) as total_amount
FROM carts c
WHERE c.patient_username = $1;

-- name: GetCartCount :one
SELECT COUNT(*) as item_count
FROM carts c
WHERE c.patient_username = $1;

-- name: GetCartItem :one
SELECT c.* FROM carts c
WHERE c.id = $1 AND c.patient_username = $2;

-- name: UpdateCartItem :one
UPDATE carts c
SET 
    quantity = $1,
    total_price = (SELECT m.price * $1 FROM medicines m 
                  JOIN carts c2 ON m.id = c2.medicine_id 
                  WHERE c2.id = $2)
WHERE c.id = $2 AND c.patient_username = $3
RETURNING *;

-- name: DeleteCartItem :exec
DELETE FROM carts c
WHERE c.id = $1 AND c.patient_username = $2;

-- name: ClearCart :exec
DELETE FROM carts c
WHERE c.patient_username = $1;
