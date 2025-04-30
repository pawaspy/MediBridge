-- name: CreateSellerProfile :one
INSERT INTO seller_profiles (
    username,
    shop_name,
    license_number,
    shop_address,
    phone_number
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *;

-- name: SearchShops :many
SELECT username, shop_name, license_number, shop_address, phone_number 
FROM seller_profiles
WHERE shop_name ILIKE '%' || sqlc.arg('name') || '%'
ORDER BY shop_name
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');

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

-- name: DeleteSellerProfile :one
DELETE FROM seller_profiles
WHERE username = $1
RETURNING username;