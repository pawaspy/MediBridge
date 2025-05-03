-- name: CreateSeller :one
INSERT INTO sellers (
  username, full_name, email, password, mobile_number,
  store_name, gst_number, drug_license_number,
  seller_type, store_address
) VALUES (
  $1, $2, $3, $4, $5,
  $6, $7, $8,
  $9, $10
) RETURNING *;

-- name: GetSellerByName :one
SELECT * FROM sellers WHERE username = $1;

-- name: ListSellersByStoreName :many
SELECT * FROM sellers
WHERE store_name ILIKE '%' || sqlc.arg('store_name') || '%'
ORDER BY store_name
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');

-- name: UpdateSeller :one
UPDATE sellers SET
  full_name = COALESCE(sqlc.narg(full_name), full_name),
  email = COALESCE(sqlc.narg(email), email),
  password = COALESCE(sqlc.narg(password), password),
  mobile_number = COALESCE(sqlc.narg(mobile_number), mobile_number),
  store_name = COALESCE(sqlc.narg(store_name), store_name),
  gst_number = COALESCE(sqlc.narg(gst_number), gst_number),
  drug_license_number = COALESCE(sqlc.narg(drug_license_number), drug_license_number),
  seller_type = COALESCE(sqlc.narg(seller_type), seller_type),
  store_address = COALESCE(sqlc.narg(store_address), store_address),
  password_changed_at = COALESCE(sqlc.narg(password_changed_at), password_changed_at)
WHERE username = sqlc.arg(username)
RETURNING *;

-- name: DeleteSeller :one
DELETE FROM sellers WHERE username = $1
RETURNING username;