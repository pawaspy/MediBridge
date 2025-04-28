-- name: CreateSellerProfile :one
INSERT INTO seller_profiles (
    shop_name,
    license_number,
    shop_address,
    phone_number
) VALUES (
    $1, $2, $3, $4
) RETURNING *;

-- name: GetSellerProfile :one
SELECT * FROM seller_profiles
WHERE shop_name = $1 LIMIT 1;

-- name: UpdateSellerProfile :one
UPDATE seller_profiles
SET
    shop_name = COALESCE(sqlc.narg(shop_name), shop_name),
    license_number = COALESCE(sqlc.narg(license_number), license_number),
    shop_address = COALESCE(sqlc.narg(shop_address), shop_address),
    phone_number = COALESCE(sqlc.narg(phone_number), phone_number)
WHERE
    username = sqlc.arg(username)
RETURNING *;