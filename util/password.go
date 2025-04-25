package util

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("cannot hash password: %w", err)
	}

	return string(hashedPass), nil
}

func CheckPassword(password, hashedPass string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPass), []byte(password))
}