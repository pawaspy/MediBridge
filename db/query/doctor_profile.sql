-- name: CreateDoctorProfile :one
INSERT INTO doctor_profiles(
    username,
    specialization,
    experience_years,
    clinic_address,
    phone_number
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *;

-- name: FindDoctorsByName :many
SELECT 
    d.*,
    u.full_name,
    u.email
FROM doctor_profiles d
JOIN users u ON d.username = u.username
WHERE u.full_name ILIKE '%' || $1 || '%'
ORDER BY d.experience_years DESC
LIMIT $2
OFFSET $3;

-- name: ListDoctorsBySpecialization :many
SELECT d.* FROM doctor_profiles d
WHERE d.specialization = $1
ORDER BY d.experience_years DESC;

-- name: UpdateDoctorProfile :one
UPDATE doctor_profiles
SET
    specialization = COALESCE(sqlc.narg(specialization), specialization),
    experience_years = COALESCE(sqlc.narg(experience_years), experience_years),
    clinic_address = COALESCE(sqlc.narg(clinic_address), clinic_address),
    phone_number = COALESCE(sqlc.narg(phone_number), phone_number)
WHERE
    username = sqlc.arg(username)
RETURNING *;