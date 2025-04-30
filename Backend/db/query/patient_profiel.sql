-- name: CreatePatientProfile :one
INSERT INTO patient_profiles (
    username,
    age,
    blood_group,
    allergies,
    phone_number
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *;

-- name: GetPatientProfile :one
SELECT * FROM patient_profiles
WHERE username = $1 LIMIT 1;

-- name: UpdatePatientProfile :one
UPDATE patient_profiles
SET
    age = COALESCE(sqlc.narg(age), age),
    blood_group = COALESCE(sqlc.narg(blood_group), blood_group),
    allergies = COALESCE(sqlc.narg(allergies), allergies),
    phone_number = COALESCE(sqlc.narg(phone_number), phone_number)
WHERE
    username = sqlc.arg(username)
RETURNING *;

-- name: DeletePatientProfile :one
DELETE FROM patient_profiles
WHERE username = $1
RETURNING username;