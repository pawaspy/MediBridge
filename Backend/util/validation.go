package util

// Validation functions for input validation
import (
	"regexp"
	"strings"
)

// IsValidEmail validates email format
func IsValidEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// IsValidPassword checks if password meets minimum requirements
// At least 8 characters, containing at least one uppercase, one lowercase, one digit
func IsValidPassword(password string) bool {
	if len(password) < 8 {
		return false
	}

	hasUpper := false
	hasLower := false
	hasDigit := false

	for _, char := range password {
		if 'A' <= char && char <= 'Z' {
			hasUpper = true
		} else if 'a' <= char && char <= 'z' {
			hasLower = true
		} else if '0' <= char && char <= '9' {
			hasDigit = true
		}
	}

	return hasUpper && hasLower && hasDigit
}

// IsValidMobileNumber validates mobile number format
func IsValidMobileNumber(mobile string) bool {
	mobileRegex := regexp.MustCompile(`^[0-9]{10}$`)
	return mobileRegex.MatchString(mobile)
}

// IsValidUsername checks if username meets requirements
// Alphanumeric, 3-20 characters, no spaces
func IsValidUsername(username string) bool {
	if len(username) < 3 || len(username) > 20 {
		return false
	}
	usernameRegex := regexp.MustCompile(`^[a-zA-Z0-9_]+$`)
	return usernameRegex.MatchString(username) && !strings.Contains(username, " ")
}

// IsNonEmptyString checks if a string is not empty after trimming
func IsNonEmptyString(s string) bool {
	return strings.TrimSpace(s) != ""
}
