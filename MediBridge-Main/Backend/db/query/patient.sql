-- name: CreatePatient :one
INSERT INTO patients (
  username, full_name, mobile_number, gender, email,
  password, age, address, emergency_contact
) VALUES (
  $1, $2, $3, $4,
  $5, $6, $7, $8, $9
) RETURNING *;

-- name: GetPatientByName :one
SELECT * FROM patients WHERE username = $1;

-- name: UpdatePatient :one
UPDATE patients SET
  full_name = COALESCE(sqlc.narg(full_name), full_name),
  mobile_number = COALESCE(sqlc.narg(mobile_number), mobile_number),
  age = COALESCE(sqlc.narg(age), age),
  password = COALESCE(sqlc.narg(password), password),
  address = COALESCE(sqlc.narg(address), address),
  emergency_contact = COALESCE(sqlc.narg(emergency_contact), emergency_contact),
  password_changed_at = COALESCE(sqlc.narg(password_changed_at), password_changed_at)
WHERE username = sqlc.arg(username)
RETURNING *;

-- name: DeletePatient :one
DELETE FROM patients WHERE username = $1
RETURNING username;