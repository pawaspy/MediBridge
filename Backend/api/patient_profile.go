package api

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"regexp"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/pawaspy/MediBridge/db/sqlc"
	"github.com/pawaspy/MediBridge/token"
	"github.com/pawaspy/MediBridge/util"
)

type CreatePatientProfile struct {
	Username    string `json:"username" binding:"required,alphanum"`
	Age         int64  `json:"age" binding:"required"`
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
	Username string `uri:"username" binding:"required,alphanum"`
}

func (server *Server) getPatient(ctx *gin.Context) {
	var req GetPatientRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	patient, err := server.store.GetPatientProfile(ctx, req.Username)

	if err != nil {
		if errors.Is(err, db.ErrRecordNotFound) {
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if authPayload.Role == util.Seller || (authPayload.Role == util.Patient && patient.Username != authPayload.Username) {
		err := errors.New("unauthorized access to patient profile")
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

func (server *Server) updatePatientProfile(ctx *gin.Context) {
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	var req UpdatePatientProfileRequest
	if err := ctx.ShouldBindBodyWithJSON(&req); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if authPayload.Role != util.Patient || authPayload.Username != *req.Username || *req.Username == "" {
		err := errors.New("cannot update user for invalid username or role")
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
		return
	}

	arg := db.UpdatePatientProfileParams{
		Username: authPayload.Username,
	}

	if req.Age != nil {
		arg.Age = pgtype.Int4{
			Int32: *req.Age,
			Valid: true,
		}
	}

	if req.BloodGroup != nil {
		arg.BloodGroup = pgtype.Text{
			String: *req.BloodGroup,
			Valid:  true,
		}
	}

	if req.Allergies != nil {
		arg.Allergies = pgtype.Text{
			String: *req.Allergies,
			Valid:  true,
		}
	}

	if req.PhoneNumber != nil {
		if !isValidPhoneNumber(*req.PhoneNumber) {
			err := errors.New("phone number must be exactly 10 digits")
			ctx.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
			return
		}
		arg.PhoneNumber = pgtype.Text{
			String: *req.PhoneNumber,
			Valid:  true,
		}
	}

	user, err := server.store.UpdatePatientProfile(ctx, arg)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, user)
}

type DeletePatientProfileRequest struct {
	Username string `uri:"username" binding:"required,alphanum"`
}

func (server *Server) deletePatientProfile(ctx *gin.Context) {
	var req DeletePatientProfileRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	if authPayload.Role != util.Patient || authPayload.Username != req.Username {
		err := errors.New("unauthorized: patients can only delete their own profile")
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
		return
	}

	_, err := server.store.DeletePatientProfile(ctx, req.Username)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			ctx.AbortWithStatusJSON(http.StatusNotFound, errorResponse(err))
			return
		}
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "patient profile deleted successfully"})
}

func isValidPhoneNumber(phone string) bool {
	matched, _ := regexp.MatchString(`^\d{10}$`, phone)
	return matched
}
