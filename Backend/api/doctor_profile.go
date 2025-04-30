package api

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/pawaspy/MediBridge/db/sqlc"
	"github.com/pawaspy/MediBridge/token"
	"github.com/pawaspy/MediBridge/util"
)

type CreateDoctorProfile struct {
	Username        string `json:"username" binding:"required,alphanum"`
	Specialization  string `json:"specialization" binding:"required"`
	ExperienceYears int32  `json:"experience_years" binding:"required"`
	ClinicAddress   string `json:"clinic_address" binding:"required"`
	PhoneNumber     string `json:"phone_number" binding:"required"`
}

func (server *Server) createDoctorProfile(ctx *gin.Context) {
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	var req CreateDoctorProfile
	if err := ctx.ShouldBindBodyWithJSON(&req); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if authPayload.Role != util.Doctor || authPayload.Username != req.Username {
		err := errors.New("cannot create user with invalid role or username")
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
		return
	}

	if req.ExperienceYears < 0 {
		err := errors.New("experience years cannot be negative")
		ctx.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if !isValidPhoneNumber(req.PhoneNumber) {
		err := errors.New("phone number must be exactly 10 digits")
		ctx.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.CreateDoctorProfileParams{
		Username:        req.Username,
		Specialization:  req.Specialization,
		ExperienceYears: req.ExperienceYears,
		ClinicAddress:   req.ClinicAddress,
		PhoneNumber:     req.PhoneNumber,
	}

	doctor, err := server.store.CreateDoctorProfile(ctx, arg)
	if err != nil {
		fmt.Printf("failed to create doctor profile: %v\n", err)
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, doctor)
}

type ListDoctorsBySpecializationRequest struct {
	Specialization string `uri:"specialization" binding:"required"`
}

func (server *Server) listDoctorsBySpecialization(ctx *gin.Context) {
	var req ListDoctorsBySpecializationRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	doctors, err := server.store.ListDoctorsBySpecialization(ctx, req.Specialization)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, doctors)
}

type UpdateDoctorProfileRequest struct {
	Username        *string `json:"username" binding:"required"`
	Specialization  *string `json:"specialization" binding:"omitempty"`
	ExperienceYears *int32  `json:"experience_years" binding:"omitempty,gte=0"`
	ClinicAddress   *string `json:"clinic_address" binding:"omitempty"`
	PhoneNumber     *string `json:"phone_number" binding:"omitempty"`
}

func (server *Server) updateDoctorProfile(ctx *gin.Context) {
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	var req UpdateDoctorProfileRequest
	if err := ctx.ShouldBindBodyWithJSON(&req); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if authPayload.Role != util.Doctor || authPayload.Username != *req.Username || *req.Username == "" {
		err := errors.New("cannot update user for invalid username or role")
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
		return
	}

	arg := db.UpdateDoctorProfileParams{
		Username: authPayload.Username,
	}

	if req.Specialization != nil {
		arg.Specialization = pgtype.Text{
			String: *req.Specialization,
			Valid:  true,
		}
	}

	if req.ExperienceYears != nil {
		arg.ExperienceYears = pgtype.Int4{
			Int32: *req.ExperienceYears,
			Valid: true,
		}
	}

	if req.ClinicAddress != nil {
		arg.ClinicAddress = pgtype.Text{
			String: *req.ClinicAddress,
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

	doctor, err := server.store.UpdateDoctorProfile(ctx, arg)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, doctor)
}

type DeleteDoctorProfileRequest struct {
	Username string `uri:"username" binding:"required,alphanum"`
}

func (server *Server) deleteDoctorProfile(ctx *gin.Context) {
	var req DeleteDoctorProfileRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	if authPayload.Role != util.Doctor || authPayload.Username != req.Username {
		err := errors.New("unauthorized: doctors can only delete their own profile")
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
		return
	}

	_, err := server.store.DeleteDoctorProfile(ctx, req.Username)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			ctx.AbortWithStatusJSON(http.StatusNotFound, errorResponse(err))
			return
		}
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "doctor profile deleted successfully"})
}

type FindDoctorsByNameRequest struct {
	FullName string `form:"full_name" binding:"required,alpha"`
	Limit    int32  `form:"limit,default=10"`
	Offset   int32  `form:"offset,default=0"`
}

func (server *Server) findDoctorsByName(ctx *gin.Context) {
	var req FindDoctorsByNameRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.FindDoctorsByNameParams{
		Name: pgtype.Text{String: req.FullName, Valid: true},
		Limit:    req.Limit,
		Offset:   req.Offset,
	}

	doctors, err := server.store.FindDoctorsByName(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if len(doctors) == 0 {
		ctx.JSON(http.StatusNotFound, errorResponse(errors.New("no doctors found with the given name")))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"doctors": doctors,
		"count":   len(doctors),
	})
}
