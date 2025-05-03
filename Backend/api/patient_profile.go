package api

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/pawaspy/MediBridge/db/sqlc"
	"github.com/pawaspy/MediBridge/token"
	"github.com/pawaspy/MediBridge/util"
)

// CreatePatientProfileRequest defines the request parameters for creating a patient profile
type CreatePatientProfileRequest struct {
	Username           string `json:"username" binding:"required,alphanum"`
	DiseaseAllergies   string `json:"disease_allergies"`
	BloodGroup         string `json:"blood_group" binding:"required"`
	PrescribedMedicine string `json:"prescribed_medicine"`
}

// UpdatePatientProfileRequest defines the request parameters for updating a patient profile
type UpdatePatientProfileRequest struct {
	Username           string  `json:"username" binding:"required,alphanum"`
	DiseaseAllergies   *string `json:"disease_allergies"`
	BloodGroup         *string `json:"blood_group"`
	PrescribedMedicine *string `json:"prescribed_medicine"`
}

// GetPatientProfileRequest defines the request parameters for fetching a patient profile
type GetPatientProfileRequest struct {
	Username string `uri:"username" binding:"required,alphanum"`
}

// DeletePatientProfileRequest defines the request parameters for deleting a patient profile
type DeletePatientProfileRequest struct {
	Username string `uri:"username" binding:"required,alphanum"`
}

// CreatePatientProfile handles the creation of a new patient profile
func (server *Server) CreatePatientProfile(c *gin.Context) {
	// Get the authorization payload for authentication
	authPayload, exists := c.Get(authorizationPayloadKey)
	if !exists {
		util.LogError("Authorization payload not found in context")
		c.JSON(http.StatusUnauthorized, errorResponse(errors.New("missing authentication")))
		return
	}

	payload, ok := authPayload.(*token.Payload)
	if !ok {
		util.LogError("Failed to convert authorization payload to token.Payload")
		c.JSON(http.StatusInternalServerError, errorResponse(errors.New("invalid authentication data")))
		return
	}

	var req CreatePatientProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		util.LogError("Invalid request body: %v", err)
		c.JSON(http.StatusBadRequest, errorResponse(errors.New("invalid request body")))
		return
	}

	util.LogInfo("Create profile request for user %s by %s with role %s", req.Username, payload.Username, payload.Role)

	// Verify the user can only create a profile for themselves
	if req.Username != payload.Username || payload.Role != util.Patient {
		util.LogWarning("Unauthorized create attempt: %s (role: %s) tried to create profile for %s",
			payload.Username, payload.Role, req.Username)
		c.JSON(http.StatusUnauthorized, errorResponse(errors.New("unauthorized: can only create profile for yourself")))
		return
	}

	// Verify the patient exists
	_, err := server.store.GetPatientByName(c, req.Username)
	if err != nil {
		util.LogError("Patient not found for user %s: %v", req.Username, err)
		c.JSON(http.StatusNotFound, errorResponse(errors.New("patient not found")))
		return
	}

	// Validate blood group
	if !isValidBloodGroup(req.BloodGroup) {
		util.LogWarning("Invalid blood group %s for user %s", req.BloodGroup, req.Username)
		c.JSON(http.StatusBadRequest, errorResponse(errors.New("invalid blood group")))
		return
	}

	// Create database parameters
	arg := db.CreatePatientProfileParams{
		Username: req.Username,
		DiseaseAllergies: pgtype.Text{
			String: req.DiseaseAllergies,
			Valid:  req.DiseaseAllergies != "",
		},
		BloodGroup: pgtype.Text{
			String: req.BloodGroup,
			Valid:  req.BloodGroup != "",
		},
		PrescribedMedicine: pgtype.Text{
			String: req.PrescribedMedicine,
			Valid:  req.PrescribedMedicine != "",
		},
	}

	util.LogDebug("Creating profile with disease_allergies: %s, blood_group: %s, prescribed_medicine: %s",
		req.DiseaseAllergies, req.BloodGroup, req.PrescribedMedicine)

	// Create the patient profile
	patientProfile, err := server.store.CreatePatientProfile(c, arg)
	if err != nil {
		util.LogError("Failed to create patient profile for %s: %v", req.Username, err)
		c.JSON(http.StatusInternalServerError, errorResponse(errors.New("failed to create patient profile")))
		return
	}

	util.LogInfo("Successfully created profile for %s", req.Username)
	c.JSON(http.StatusCreated, patientProfile)
}

// GetPatientProfile handles fetching a patient profile by username
func (server *Server) GetPatientProfile(c *gin.Context) {
	var req GetPatientProfileRequest
	if err := c.ShouldBindUri(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorResponse(errors.New("invalid username format")))
		return
	}

	// Get the profile from database
	patientProfile, err := server.store.GetPatientProfile(c, req.Username)
	if err != nil {
		c.JSON(http.StatusNotFound, errorResponse(errors.New("patient profile not found")))
		return
	}

	c.JSON(http.StatusOK, patientProfile)
}

// UpdatePatientProfile handles updating an existing patient profile
func (server *Server) UpdatePatientProfile(c *gin.Context) {
	// Get the authorization payload for authentication
	authPayload, exists := c.Get(authorizationPayloadKey)
	if !exists {
		util.LogError("Authorization payload not found in context")
		c.JSON(http.StatusUnauthorized, errorResponse(errors.New("missing authentication")))
		return
	}

	payload, ok := authPayload.(*token.Payload)
	if !ok {
		util.LogError("Failed to convert authorization payload to token.Payload")
		c.JSON(http.StatusInternalServerError, errorResponse(errors.New("invalid authentication data")))
		return
	}

	// Read raw request for debugging purposes
	requestBody, err := io.ReadAll(c.Request.Body)
	if err != nil {
		util.LogError("Failed to read request body: %v", err)
		c.JSON(http.StatusBadRequest, errorResponse(errors.New("invalid request body")))
		return
	}

	// Log the raw request for debugging
	util.LogInfo("Raw update request body: %s", string(requestBody))

	// Restore body for binding
	c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody))

	var req UpdatePatientProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		util.LogError("Failed to bind request body: %v", err)
		c.JSON(http.StatusBadRequest, errorResponse(fmt.Errorf("invalid request body: %v", err)))
		return
	}

	util.LogInfo("Update request for user %s by %s with role %s", req.Username, payload.Username, payload.Role)
	util.LogInfo("Request details: %+v", req)

	// Verify the user can only update their own profile
	if req.Username != payload.Username || payload.Role != util.Patient {
		util.LogWarning("Unauthorized update attempt: %s (role: %s) tried to update profile for %s",
			payload.Username, payload.Role, req.Username)
		c.JSON(http.StatusUnauthorized, errorResponse(errors.New("unauthorized: can only update your own profile")))
		return
	}

	// Check if the profile exists
	existingProfile, err := server.store.GetPatientProfile(c, req.Username)
	if err != nil {
		if errors.Is(err, db.ErrRecordNotFound) {
			// Create a new profile if it doesn't exist
			server.createPatientProfileFromUpdate(c, req)
			return
		}

		util.LogError("Error retrieving patient profile: %v", err)
		c.JSON(http.StatusInternalServerError, errorResponse(fmt.Errorf("failed to retrieve patient profile: %v", err)))
		return
	}

	// Log existing profile for debugging
	util.LogInfo("Found existing profile for %s: %+v", req.Username, existingProfile)

	// Validate blood group if provided
	if req.BloodGroup != nil && *req.BloodGroup != "" && !isValidBloodGroup(*req.BloodGroup) {
		util.LogWarning("Invalid blood group %s for user %s", *req.BloodGroup, req.Username)
		c.JSON(http.StatusBadRequest, errorResponse(errors.New("invalid blood group")))
		return
	}

	// Create update parameters
	arg := db.UpdatePatientProfileParams{
		Username: req.Username,
	}

	// Set values from pointers, ensuring Valid is always true even for empty strings
	if req.DiseaseAllergies != nil {
		arg.DiseaseAllergies = pgtype.Text{
			String: *req.DiseaseAllergies,
			Valid:  true,
		}
		util.LogDebug("Setting disease_allergies for %s: %s", req.Username, *req.DiseaseAllergies)
	}

	if req.BloodGroup != nil {
		arg.BloodGroup = pgtype.Text{
			String: *req.BloodGroup,
			Valid:  true,
		}
		util.LogDebug("Setting blood_group for %s: %s", req.Username, *req.BloodGroup)
	}

	if req.PrescribedMedicine != nil {
		arg.PrescribedMedicine = pgtype.Text{
			String: *req.PrescribedMedicine,
			Valid:  true,
		}
		util.LogDebug("Setting prescribed_medicine for %s: %s", req.Username, *req.PrescribedMedicine)
	}

	// Log the final update parameters for debugging
	util.LogInfo("Final update parameters: %+v", arg)

	// Update the profile
	updatedProfile, err := server.store.UpdatePatientProfile(c, arg)
	if err != nil {
		util.LogError("Failed to update patient profile for %s: %v", req.Username, err)
		c.JSON(http.StatusInternalServerError, errorResponse(fmt.Errorf("failed to update patient profile: %v", err)))
		return
	}

	util.LogInfo("Successfully updated profile for %s", req.Username)
	c.JSON(http.StatusOK, updatedProfile)
}

// Helper function to create a profile from update request
func (server *Server) createPatientProfileFromUpdate(c *gin.Context, req UpdatePatientProfileRequest) {
	util.LogInfo("Creating new patient profile from update request for %s", req.Username)

	// Extract values from pointers, using defaults if nil
	diseaseAllergies := ""
	if req.DiseaseAllergies != nil {
		diseaseAllergies = *req.DiseaseAllergies
	}

	bloodGroup := ""
	if req.BloodGroup != nil {
		bloodGroup = *req.BloodGroup
	} else {
		// Blood group is required for creation
		util.LogWarning("Blood group is required but nil for user %s", req.Username)
		c.JSON(http.StatusBadRequest, errorResponse(errors.New("blood group is required for new profiles")))
		return
	}

	prescribedMedicine := ""
	if req.PrescribedMedicine != nil {
		prescribedMedicine = *req.PrescribedMedicine
	}

	// Validate blood group for new profile
	if !isValidBloodGroup(bloodGroup) {
		util.LogWarning("Invalid blood group %s for user %s", bloodGroup, req.Username)
		c.JSON(http.StatusBadRequest, errorResponse(errors.New("invalid blood group")))
		return
	}

	// Create parameters for new profile
	createArg := db.CreatePatientProfileParams{
		Username: req.Username,
		DiseaseAllergies: pgtype.Text{
			String: diseaseAllergies,
			Valid:  true, // Always set valid to true
		},
		BloodGroup: pgtype.Text{
			String: bloodGroup,
			Valid:  true, // Always set valid to true
		},
		PrescribedMedicine: pgtype.Text{
			String: prescribedMedicine,
			Valid:  true, // Always set valid to true
		},
	}

	util.LogInfo("Creating profile with params: %+v", createArg)

	newProfile, err := server.store.CreatePatientProfile(c, createArg)
	if err != nil {
		util.LogError("Failed to create new patient profile for %s: %v", req.Username, err)
		c.JSON(http.StatusInternalServerError, errorResponse(fmt.Errorf("failed to create patient profile: %v", err)))
		return
	}

	util.LogInfo("Successfully created new profile for %s", req.Username)
	c.JSON(http.StatusCreated, newProfile)
}

func (server *Server) DeletePatientProfile(c *gin.Context) {
	// Get the authorization payload for authentication
	authPayload := c.MustGet(authorizationPayloadKey).(*token.Payload)

	var req DeletePatientProfileRequest
	if err := c.ShouldBindUri(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorResponse(errors.New("invalid username format")))
		return
	}

	// Verify the user can only delete their own profile
	if req.Username != authPayload.Username || authPayload.Role != util.Patient {
		c.JSON(http.StatusUnauthorized, errorResponse(errors.New("unauthorized: can only delete your own profile")))
		return
	}

	// Delete the profile
	err := server.store.DeletePatientProfile(c, req.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse(errors.New("failed to delete patient profile")))
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "patient profile deleted successfully"})
}

func (server *Server) ListPatientProfiles(c *gin.Context) {
	authPayload := c.MustGet(authorizationPayloadKey).(*token.Payload)

	if authPayload.Role != util.Doctor {
		c.JSON(http.StatusUnauthorized, errorResponse(errors.New("unauthorized: only admins and doctors can list all profiles")))
		return
	}

	profiles, err := server.store.ListPatientProfiles(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse(errors.New("failed to list patient profiles")))
		return
	}

	c.JSON(http.StatusOK, profiles)
}

func isValidBloodGroup(bloodGroup string) bool {
	validBloodGroups := map[string]bool{
		"A+":  true,
		"A-":  true,
		"B+":  true,
		"B-":  true,
		"AB+": true,
		"AB-": true,
		"O+":  true,
		"O-":  true,
	}
	return validBloodGroups[bloodGroup]
}
