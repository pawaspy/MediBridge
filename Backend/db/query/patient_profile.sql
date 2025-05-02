-- name: CreatePatientProfile :one
INSERT INTO patient_profiles (
    username, disease_allergies, blood_group, prescribed_medicine
) VALUES (
    $1, $2, $3, $4
)
RETURNING *;

-- name: GetPatientProfile :one
SELECT * FROM patient_profiles
WHERE username = $1;

-- name: UpdatePatientProfile :one
UPDATE patient_profiles
SET
    disease_allergies = COALESCE(sqlc.narg(disease_allergies), disease_allergies),
    blood_group = COALESCE(sqlc.narg(blood_group), blood_group),
    prescribed_medicine = COALESCE(sqlc.narg(prescribed_medicine), prescribed_medicine),
    updated_at = now()
WHERE username = sqlc.arg(username)
RETURNING *;

-- name: DeletePatientProfile :exec
DELETE FROM patient_profiles
WHERE username = sqlc.arg(username);

-- name: ListPatientProfiles :many
SELECT * FROM patient_profiles
ORDER BY id;
