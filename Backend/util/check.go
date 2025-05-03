package util

import (
	"fmt"
	"regexp"
	"strings"
)

func IsValidPhoneNumber(phone string) bool {
	// Allow optional country code like '+91'
	matched, _ := regexp.MatchString(`^(\+\d{1,3}[- ]?)?\d{10}$`, phone)
	return matched
}

func ValidateGender(gender string) bool {
	// Case-insensitive check for gender values
	genderLower := strings.ToLower(gender)
	maleLower := strings.ToLower(Male)
	femaleLower := strings.ToLower(Female)
	otherLower := strings.ToLower(Other)

	// Add debug logging
	fmt.Printf("Validating gender: input='%s', lowercase='%s'\n", gender, genderLower)
	fmt.Printf("Comparing with: male='%s', female='%s', other='%s'\n", maleLower, femaleLower, otherLower)

	if genderLower != maleLower && genderLower != femaleLower && genderLower != otherLower {
		fmt.Println("Gender validation failed")
		return false
	}
	fmt.Println("Gender validation passed")
	return true
}
