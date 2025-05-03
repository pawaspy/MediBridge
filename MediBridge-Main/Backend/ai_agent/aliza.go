package ai_agent

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/pawaspy/MediBridge/db/sqlc"
)

// Aliza is the AI agent that helps users with medical queries
type Aliza struct {
	store db.Store
}

// NewAliza creates a new instance of the Aliza AI agent
func NewAliza(store db.Store) *Aliza {
	return &Aliza{
		store: store,
	}
}

// Response represents the structured response from Aliza
type Response struct {
	Message  string      `json:"message"`
	Data     interface{} `json:"data,omitempty"`
	Type     string      `json:"type,omitempty"`
	Followup string      `json:"followup,omitempty"`
}

// Intent represents the user's detected intent
type Intent struct {
	Type       string
	Condition  string
	Allergies  []string
	Specialty  string
	Parameters map[string]string
}

// ProcessQuery processes a user query and returns a response
func (a *Aliza) ProcessQuery(ctx context.Context, query string) (Response, error) {
	// Detect intent from the query
	intent := a.detectIntent(query)

	switch intent.Type {
	case "medicine_recommendation":
		return a.handleMedicineRecommendation(ctx, intent)
	case "find_doctors":
		return a.handleFindDoctors(ctx, intent)
	default:
		return Response{
			Message:  "I'm not sure how to help with that. I can recommend medicines for conditions or help you find doctors by specialty.",
			Followup: "Would you like to know what medicines can help with a specific condition, or find a doctor with a specific specialty?",
		}, nil
	}
}

// detectIntent analyzes the query to determine the user's intent
func (a *Aliza) detectIntent(query string) Intent {
	query = strings.ToLower(query)
	intent := Intent{
		Parameters: make(map[string]string),
	}

	// Medicine recommendation patterns
	medicinePatterns := []string{
		"medicine for (.+)",
		"treat(?:ment)? for (.+)",
		"i have (.+)",
		"suffering from (.+)",
		"medication for (.+)",
		"prescription for (.+)",
		"remedy for (.+)",
		"cure for (.+)",
		"help (?:with|for) (.+)",
		"medicine (?:that treats|for treating) (.+)",
	}

	for _, pattern := range medicinePatterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindStringSubmatch(query)
		if len(matches) > 1 {
			intent.Type = "medicine_recommendation"
			intent.Condition = matches[1]
			// Extract allergies if mentioned
			allergyMatches := regexp.MustCompile("allerg(?:ic|y) to (.+)").FindStringSubmatch(query)
			if len(allergyMatches) > 1 {
				allergies := strings.Split(allergyMatches[1], ",")
				for i, allergy := range allergies {
					allergies[i] = strings.TrimSpace(allergy)
				}
				intent.Allergies = allergies
			}
			return intent
		}
	}

	// Doctor finding patterns
	doctorPatterns := []string{
		"doctor(?:s)? (?:for|who treat(?:s)?|specialized in) (.+)",
		"find (?:a )?doctor (?:for|who treat(?:s)?|specialized in) (.+)",
		"specialist(?:s)? in (.+)",
		"specialists for (.+)",
		"doctors who can treat (.+)",
		"(.+) specialist",
		"(.+) doctor",
	}

	for _, pattern := range doctorPatterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindStringSubmatch(query)
		if len(matches) > 1 {
			intent.Type = "find_doctors"
			intent.Specialty = matches[1]
			return intent
		}
	}

	// Default intent
	intent.Type = "unknown"
	return intent
}

// handleMedicineRecommendation handles medicine recommendation intent
func (a *Aliza) handleMedicineRecommendation(ctx context.Context, intent Intent) (Response, error) {
	// Standardize common conditions
	condition := standardizeCondition(intent.Condition)

	// Search for medicines that can treat the condition
	medicines, err := a.searchMedicinesForCondition(ctx, condition)
	if err != nil {
		return Response{}, err
	}

	if len(medicines) == 0 {
		return Response{
			Message:  fmt.Sprintf("I couldn't find specific medicines for %s in our database. It would be best to consult a doctor for proper diagnosis and treatment.", condition),
			Followup: "Would you like me to help you find a doctor who specializes in treating this condition?",
			Type:     "no_results",
		}, nil
	}

	// Filter out medicines based on allergies if specified
	if len(intent.Allergies) > 0 {
		medicines = filterMedicinesByAllergies(medicines, intent.Allergies)
	}

	// Format response
	message := fmt.Sprintf("Based on your condition (%s), here are some recommended medicines:", condition)

	return Response{
		Message:  message,
		Data:     medicines,
		Type:     "medicine_list",
		Followup: "Would you like more information about any of these medicines, or would you prefer to speak with a doctor?",
	}, nil
}

// handleFindDoctors handles the find doctors intent
func (a *Aliza) handleFindDoctors(ctx context.Context, intent Intent) (Response, error) {
	// Standardize specialty
	specialty := standardizeSpecialty(intent.Specialty)

	// Search for doctors with the given specialty
	doctors, err := a.findDoctorsBySpecialty(ctx, specialty)
	if err != nil {
		return Response{}, err
	}

	if len(doctors) == 0 {
		return Response{
			Message:  fmt.Sprintf("I couldn't find doctors specializing in %s in our database.", specialty),
			Followup: "Would you like to search for a different specialty?",
			Type:     "no_results",
		}, nil
	}

	// Limit to top 5 doctors
	if len(doctors) > 5 {
		doctors = doctors[:5]
	}

	// Format response
	message := fmt.Sprintf("Here are the top doctors specializing in %s:", specialty)

	return Response{
		Message:  message,
		Data:     doctors,
		Type:     "doctor_list",
		Followup: "Would you like to book an appointment with any of these doctors?",
	}, nil
}

// searchMedicinesForCondition searches for medicines that treat a specific condition
func (a *Aliza) searchMedicinesForCondition(ctx context.Context, condition string) ([]map[string]interface{}, error) {
	// In a real implementation, we would have a more sophisticated search
	// For now, we'll use a simple keyword search on medicine names and descriptions

	// Get medicines from database
	arg := db.SearchMedicinesByNameSortedByPriceParams{
		Name: pgtype.Text{
			String: condition,
			Valid:  true,
		},
		Limit:  10,
		Offset: 0,
	}

	medicines, err := a.store.SearchMedicinesByNameSortedByPrice(ctx, arg)
	if err != nil {
		return nil, err
	}

	var results []map[string]interface{}

	for _, medicine := range medicines {
		// Convert to map for easier serialization and augmentation
		medicineMap := map[string]interface{}{
			"id":          medicine.ID,
			"name":        medicine.Name,
			"description": medicine.Description,
			"price":       medicine.Price,
			"expiry_date": medicine.ExpiryDate,
			"seller":      medicine.SellerUsername,
		}

		results = append(results, medicineMap)
	}

	// If we didn't find any medicines by name search, we could try other approaches
	// For this implementation, we're limited by the available queries in the database

	// Let's add more contextual information when available
	for i, medicine := range results {
		desc := medicine["description"].(string)
		if strings.Contains(strings.ToLower(desc), strings.ToLower(condition)) {
			results[i]["relevance"] = "high"
		} else {
			results[i]["relevance"] = "medium"
		}
	}

	return results, nil
}

// findDoctorsBySpecialty finds doctors with a specific specialty
func (a *Aliza) findDoctorsBySpecialty(ctx context.Context, specialty string) ([]map[string]interface{}, error) {
	// First, try to get doctors with the given specialization from database
	arg := db.ListDoctorsBySpecializationParams{
		Specialization: specialty,
		Limit:          10,
		Offset:         0,
	}

	doctors, err := a.store.ListDoctorsBySpecialization(ctx, arg)
	if err != nil {
		return nil, err
	}

	var results []map[string]interface{}

	for _, doctor := range doctors {
		// Convert to map for easier serialization and augmentation
		doctorMap := map[string]interface{}{
			"username":       doctor.Username,
			"full_name":      doctor.FullName,
			"specialization": doctor.Specialization,
			"email":          doctor.Email,
			"mobile_number":  doctor.MobileNumber,
			"hospital_name":  doctor.HospitalName,
		}

		results = append(results, doctorMap)
	}

	// If we didn't find any specific doctors, we could implement additional
	// search logic here, like finding doctors with similar specializations
	// or getting recommendations from other sources.

	return results, nil
}

// filterMedicinesByAllergies filters out medicines that may trigger allergies
func filterMedicinesByAllergies(medicines []map[string]interface{}, allergies []string) []map[string]interface{} {
	var filtered []map[string]interface{}

	for _, medicine := range medicines {
		allergic := false
		description := strings.ToLower(medicine["description"].(string))

		for _, allergy := range allergies {
			// Check if the description contains the allergy
			if strings.Contains(description, strings.ToLower(allergy)) {
				allergic = true
				break
			}
		}

		if !allergic {
			filtered = append(filtered, medicine)
		}
	}

	return filtered
}

// standardizeCondition standardizes common medical conditions
func standardizeCondition(condition string) string {
	condition = strings.ToLower(strings.TrimSpace(condition))

	// Map of common aliases to standardized condition names
	conditionMap := map[string]string{
		"headache":            "headache",
		"head ache":           "headache",
		"migraine":            "migraine",
		"cold":                "common cold",
		"flu":                 "influenza",
		"fever":               "fever",
		"high fever":          "fever",
		"cough":               "cough",
		"sore throat":         "sore throat",
		"throat pain":         "sore throat",
		"stomach ache":        "stomach pain",
		"stomach pain":        "stomach pain",
		"nausea":              "nausea",
		"vomiting":            "vomiting",
		"diarrhea":            "diarrhea",
		"constipation":        "constipation",
		"allergy":             "allergy",
		"rash":                "skin rash",
		"skin rash":           "skin rash",
		"acne":                "acne",
		"diabetes":            "diabetes",
		"high bp":             "hypertension",
		"high blood pressure": "hypertension",
		"hypertension":        "hypertension",
		"asthma":              "asthma",
		"arthritis":           "arthritis",
		"joint pain":          "joint pain",
		"back pain":           "back pain",
		"depression":          "depression",
		"anxiety":             "anxiety",
		"insomnia":            "insomnia",
		"sleep problems":      "insomnia",
		"can't sleep":         "insomnia",
	}

	// Check for exact matches
	if standardized, ok := conditionMap[condition]; ok {
		return standardized
	}

	// Check for partial matches
	for key, value := range conditionMap {
		if strings.Contains(condition, key) {
			return value
		}
	}

	// If no match, return the original condition
	return condition
}

// standardizeSpecialty standardizes doctor specialties
func standardizeSpecialty(specialty string) string {
	specialty = strings.ToLower(strings.TrimSpace(specialty))

	// Map of common aliases to standardized specialty names
	specialtyMap := map[string]string{
		"heart":            "cardiology",
		"cardiac":          "cardiology",
		"cardio":           "cardiology",
		"cardiology":       "cardiology",
		"skin":             "dermatology",
		"dermatology":      "dermatology",
		"brain":            "neurology",
		"neuro":            "neurology",
		"neurology":        "neurology",
		"bones":            "orthopedics",
		"joints":           "orthopedics",
		"orthopedic":       "orthopedics",
		"orthopedics":      "orthopedics",
		"eye":              "ophthalmology",
		"eyes":             "ophthalmology",
		"ophthalmology":    "ophthalmology",
		"ear":              "ent",
		"nose":             "ent",
		"throat":           "ent",
		"ent":              "ent",
		"children":         "pediatrics",
		"child":            "pediatrics",
		"pediatric":        "pediatrics",
		"pediatrics":       "pediatrics",
		"women":            "gynecology",
		"gynecology":       "gynecology",
		"pregnancy":        "obstetrics",
		"obstetrics":       "obstetrics",
		"kidney":           "nephrology",
		"nephrology":       "nephrology",
		"surgery":          "general surgery",
		"teeth":            "dentistry",
		"tooth":            "dentistry",
		"dental":           "dentistry",
		"dentistry":        "dentistry",
		"mental":           "psychiatry",
		"psychiatry":       "psychiatry",
		"psychology":       "psychology",
		"diabetes":         "endocrinology",
		"endocrine":        "endocrinology",
		"endocrinology":    "endocrinology",
		"lungs":            "pulmonology",
		"respiratory":      "pulmonology",
		"pulmonology":      "pulmonology",
		"stomach":          "gastroenterology",
		"digestive":        "gastroenterology",
		"gastro":           "gastroenterology",
		"gastroenterology": "gastroenterology",
	}

	// Check for exact matches
	if standardized, ok := specialtyMap[specialty]; ok {
		return standardized
	}

	// Check for partial matches
	for key, value := range specialtyMap {
		if strings.Contains(specialty, key) {
			return value
		}
	}

	// If no match, return the original specialty
	return specialty
}
