package util

import "regexp"

func IsValidPhoneNumber(phone string) bool {
	matched, _ := regexp.MatchString(`^\d{10}$`, phone)
	return matched
}

func ValidateGender(gender string) bool {
	if gender != Male && gender != Female && gender != Other {
		return false
	}
	return true
}
