-- name: CreateDoctor :one
INSERT INTO doctors (
  username, full_name, mobile_number, gender, age,
  specialization, email, password,
  registration_number, hospital_name, years_experience
) VALUES (
  $1, $2, $3, $4, $5,
  $6, $7, $8,
  $9, $10, $11
) RETURNING *;

-- name: GetDoctorByName :one
SELECT * FROM doctors WHERE username = $1;

-- name: ListDoctorsBySpecialization :many
SELECT * FROM doctors
WHERE specialization = $1
ORDER BY years_experience DESC
LIMIT $2 OFFSET $3;

-- name: UpdateDoctor :one
UPDATE doctors SET
  full_name = COALESCE(sqlc.narg(full_name), full_name),
  mobile_number = COALESCE(sqlc.narg(mobile_number), mobile_number),
  gender = COALESCE(sqlc.narg(gender), gender),
  age = COALESCE(sqlc.narg(age), age),
  specialization = COALESCE(sqlc.narg(specialization), specialization),
  email = COALESCE(sqlc.narg(email), email),
  password = COALESCE(sqlc.narg(password), password),
  registration_number = COALESCE(sqlc.narg(registration_number), registration_number),
  hospital_name = COALESCE(sqlc.narg(hospital_name), hospital_name),
  years_experience = COALESCE(sqlc.narg(years_experience), years_experience),
  password_changed_at = COALESCE(sqlc.narg(password_changed_at), password_changed_at)
WHERE username = sqlc.arg(username)
RETURNING *;

-- name: DeleteDoctor :one
DELETE FROM doctors WHERE username = $1
RETURNING username;