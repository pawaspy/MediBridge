package util

import (
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
)

// FormatDBError formats database errors in a human-readable way
func FormatDBError(err error) string {
	LogError("Database error: %v", err)

	if strings.Contains(err.Error(), "duplicate key") {
		return "A record with this information already exists"
	} else if strings.Contains(err.Error(), "violates not-null constraint") {
		return "Required field is missing"
	} else if strings.Contains(err.Error(), "violates unique constraint") {
		return "This value already exists in the database"
	} else if strings.Contains(err.Error(), "violates foreign key constraint") {
		return "Referenced record does not exist"
	} else if strings.Contains(err.Error(), "no rows in result set") {
		return "Record not found"
	} else if err == pgx.ErrNoRows {
		return "Record not found"
	}

	return fmt.Sprintf("Database error: %v", err)
}
