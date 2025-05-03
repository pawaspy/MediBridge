package api

import (
	"errors"
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
	authPayload := c.MustGet(authorizationPayloadKey).(*token.Payload)

	var req CreatePatientProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorResponse(errors.New("invalid request body")))
		return
	}

	// Verify the user can only create a profile for themselves
	if req.Username != authPayload.Username || authPayload.Role != util.Patient {
		c.JSON(http.StatusUnauthorized, errorResponse(errors.New("unauthorized: can only create profile for yourself")))
		return
	}

	// Verify the patient exists
	_, err := server.store.GetPatientByName(c, req.Username)
	if err != nil {
		c.JSON(http.StatusNotFound, errorResponse(errors.New("patient not found")))
		return
	}

	// Validate blood group
	if !isValidBloodGroup(req.BloodGroup) {
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

	// Create the patient profile
	patientProfile, err := server.store.CreatePatientProfile(c, arg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse(errors.New("failed to create patient profile")))
		return
	}

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
	authPayload := c.MustGet(authorizationPayloadKey).(*token.Payload)

	var req UpdatePatientProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorResponse(errors.New("invalid request body")))
		return
	}

	// Verify the user can only update their own profile
	if req.Username != authPayload.Username || authPayload.Role != util.Patient {
		c.JSON(http.StatusUnauthorized, errorResponse(errors.New("unauthorized: can only update your own profile")))
		return
	}

	// Check if the profile exists
	_, err := server.store.GetPatientProfile(c, req.Username)
	if err != nil {
		c.JSON(http.StatusNotFound, errorResponse(errors.New("patient profile not found")))
		return
	}

	// Validate blood group if provided
	if req.BloodGroup != nil && !isValidBloodGroup(*req.BloodGroup) {
		c.JSON(http.StatusBadRequest, errorResponse(errors.New("invalid blood group")))
		return
	}

	// Create update parameters
	arg := db.UpdatePatientProfileParams{
		Username: req.Username,
	}

	if req.DiseaseAllergies != nil {
		arg.DiseaseAllergies = pgtype.Text{
			String: *req.DiseaseAllergies,
			Valid:  true,
		}
	}

	if req.BloodGroup != nil {
		arg.BloodGroup = pgtype.Text{
			String: *req.BloodGroup,
			Valid:  true,
		}
	}

	if req.PrescribedMedicine != nil {
		arg.PrescribedMedicine = pgtype.Text{
			String: *req.PrescribedMedicine,
			Valid:  true,
		}
	}

	// Update the profile
	updatedProfile, err := server.store.UpdatePatientProfile(c, arg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse(errors.New("failed to update patient profile")))
		return
	}

	c.JSON(http.StatusOK, updatedProfile)
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
