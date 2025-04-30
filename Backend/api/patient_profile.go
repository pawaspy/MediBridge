package api

import (
	"errors"
	"fmt"
	"net/http"
	"regexp"

	"github.com/gin-gonic/gin"
	db "github.com/pawaspy/MediBridge/db/sqlc"
	"github.com/pawaspy/MediBridge/token"
	"github.com/pawaspy/MediBridge/util"
)

type CreatePatientProfile struct {
	Username    string `json:"username" binding:"required,alphanum"`
	Age         int64  `json:"age" binding:"required,gte=0"`
	BloodGroup  string `json:"blood_group" binding:"required"`
	Allergies   string `json:"allergies" binding:"required"`
	PhoneNumber string `json:"phone_number" binding:"required"`
}

func (server *Server) createPatientProfile(ctx *gin.Context) {
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	var req CreatePatientProfile
	if err := ctx.ShouldBindBodyWithJSON(&req); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if authPayload.Role != util.Patient || authPayload.Username != req.Username {
		err := errors.New("cannot create user with invalid role or username")
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
		return
	}

	if req.Age < 0 {
		err := errors.New("age cannot be negative")
		ctx.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if !isValidPhoneNumber(req.PhoneNumber) {
		err := errors.New("phone number must be exactly 10 digits")
		ctx.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.CreatePatientProfileParams{
		Username:    req.Username,
		Age:         int32(req.Age),
		BloodGroup:  req.BloodGroup,
		Allergies:   req.Allergies,
		PhoneNumber: req.PhoneNumber,
	}

	patient, err := server.store.CreatePatientProfile(ctx, arg)
	if err != nil {
		fmt.Printf("failed to create patient profile: %v\n", err)
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, patient)
}

type GetPatientRequest struct {
	Username string `json:"username" binding:"required,min=1"`
}

func (server *Server) getPatient(ctx *gin.Context) {
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	var req GetPatientRequest

	if err := ctx.ShouldBindBodyWithJSON(&req); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	patient, err := server.store.GetPatientProfile(ctx, req.Username)

	if err != nil {
		if errors.Is(err, db.ErrRecordNotFound) {
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if authPayload.Role == util.Seller || patient.Username != authPayload.Username {
		err := errors.New("cannot provide user to invalid username or role")
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, patient)
}

type UpdatePatientProfileRequest struct {
	Username    *string `json:"username" binding:"required"`
	Age         *int32  `json:"age" binding:"omitempty,gte=0"`
	BloodGroup  *string `json:"blood_group" binding:"omitempty"`
	Allergies   *string `json:"allergies" binding:"omitempty"`
	PhoneNumber *string `json:"phone_number" binding:"omitempty"`
}

// func (server *Server) updatePatientProfile(ctx *gin.Context) {
// 	authPayload := server.authorizeUser(ctx, []string{util.Patient})

// }

func isValidPhoneNumber(phone string) bool {
	matched, _ := regexp.MatchString(`^\d{10}$`, phone)
	return matched
}
