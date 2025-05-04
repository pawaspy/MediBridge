package api

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/pawaspy/MediBridge/db/sqlc"
	"github.com/pawaspy/MediBridge/token"
	"github.com/pawaspy/MediBridge/util"
)

type CreateDoctorRequest struct {
	Username           string `json:"username" binding:"required,alphanum"`
	FullName           string `json:"full_name" binding:"required"`
	MobileNumber       string `json:"mobile_number" binding:"required"`
	Gender             string `json:"gender" binding:"required"`
	Email              string `json:"email" binding:"required,email"`
	Password           string `json:"password" binding:"required,min=6"`
	Age                int32  `json:"age" binding:"required"`
	Specialization     string `json:"specialization" binding:"required"`
	RegistrationNumber string `json:"registration_number" binding:"required"`
	HospitalName       string `json:"hospital_name"`
	YearsExperience    int32  `json:"years_experience" binding:"required"`
}

type UpdateDoctorRequest struct {
	Username           *string `json:"username" binding:"required,alphanum"`
	FullName           *string `json:"full_name" binding:"omitempty"`
	MobileNumber       *string `json:"mobile_number" binding:"omitempty"`
	Gender             *string `json:"gender" binding:"omitempty"`
	Age                *int32  `json:"age" binding:"omitempty"`
	Password           *string `json:"password" binding:"omitempty,min=6"`
	Email              *string `json:"email" binding:"omitempty,email"`
	Specialization     *string `json:"specialization" binding:"omitempty"`
	RegistrationNumber *string `json:"registration_number" binding:"omitempty"`
	HospitalName       *string `json:"hospital_name" binding:"omitempty"`
	YearsExperience    *int32  `json:"years_experience" binding:"omitempty"`
}

type doctorResponse struct {
	Username           string           `json:"username"`
	FullName           string           `json:"full_name"`
	Email              string           `json:"email"`
	MobileNumber       string           `json:"mobile_number"`
	Gender             string           `json:"gender"`
	Age                int32            `json:"age"`
	Specialization     string           `json:"specialization"`
	RegistrationNumber string           `json:"registration_number"`
	HospitalName       pgtype.Text      `json:"hospital_name"`
	YearsExperience    int32            `json:"years_experience"`
	PasswordChangedAt  pgtype.Timestamp `json:"password_changed_at"`
	CreatedAt          pgtype.Timestamp `json:"created_at"`
}

func newDoctorResponse(doctor db.Doctor) doctorResponse {
	return doctorResponse{
		Username:           doctor.Username,
		FullName:           doctor.FullName,
		Email:              doctor.Email,
		MobileNumber:       doctor.MobileNumber,
		Gender:             doctor.Gender,
		Age:                doctor.Age,
		Specialization:     doctor.Specialization,
		RegistrationNumber: doctor.RegistrationNumber,
		HospitalName:       doctor.HospitalName,
		YearsExperience:    doctor.YearsExperience,
		PasswordChangedAt:  doctor.PasswordChangedAt,
		CreatedAt:          doctor.CreatedAt,
	}
}

type GetDoctorRequest struct {
	Username string `uri:"username" binding:"required"`
}

func (server *Server) GetDoctor(c *gin.Context) {
	username := c.Param("username")

	doctor, err := server.store.GetDoctorByName(c, username)
	if err != nil {
		err := errors.New("failed to get doctor")
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	c.JSON(http.StatusOK, newDoctorResponse(doctor))
}

func (server *Server) CreateDoctor(c *gin.Context) {
	var req CreateDoctorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err := errors.New("invalid request body")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if !util.IsValidPhoneNumber(req.MobileNumber) {
		err := errors.New("phone number must be exactly 10 digits")
		c.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.Age < 0 {
		err := errors.New("age must be a positive number")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.YearsExperience < 0 {
		err := errors.New("years of experience must be a positive number")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	hashPass, err := util.HashPassword(req.Password)
	if err != nil {
		err := errors.New("failed to hash password")
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if !util.ValidateGender(req.Gender) {
		err := errors.New("invalid gender provided")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	var hospitalNamePgText pgtype.Text
	if req.HospitalName != "" {
		hospitalNamePgText = pgtype.Text{
			String: req.HospitalName,
			Valid:  true,
		}
	}

	arg := db.CreateDoctorParams{
		Username:           req.Username,
		FullName:           req.FullName,
		MobileNumber:       req.MobileNumber,
		Gender:             req.Gender,
		Age:                req.Age,
		Email:              req.Email,
		Password:           hashPass,
		Specialization:     req.Specialization,
		RegistrationNumber: req.RegistrationNumber,
		HospitalName:       hospitalNamePgText,
		YearsExperience:    req.YearsExperience,
	}

	doctor, err := server.store.CreateDoctor(c, arg)
	if err != nil {
		err := errors.New("failed to create doctor")
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	c.JSON(http.StatusOK, newDoctorResponse(doctor))
}

func (server *Server) UpdateDoctor(c *gin.Context) {
	authPayload := c.MustGet(authorizationPayloadKey).(*token.Payload)

	var req UpdateDoctorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err := errors.New("invalid request body")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.Username == nil || *req.Username != authPayload.Username || authPayload.Role != util.Doctor {
		err := errors.New("invalid username")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.MobileNumber != nil && !util.IsValidPhoneNumber(*req.MobileNumber) {
		err := errors.New("phone number must be exactly 10 digits")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.Age != nil && *req.Age < 0 {
		err := errors.New("age must be a positive number")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.YearsExperience != nil && *req.YearsExperience < 0 {
		err := errors.New("years of experience must be a positive number")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.Gender != nil && !util.ValidateGender(*req.Gender) {
		err := errors.New("invalid gender provided")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.UpdateDoctorParams{
		Username: authPayload.Username,
	}

	if req.FullName != nil {
		arg.FullName = pgtype.Text{
			String: *req.FullName,
			Valid:  true,
		}
	}

	if req.MobileNumber != nil {
		arg.MobileNumber = pgtype.Text{
			String: *req.MobileNumber,
			Valid:  true,
		}
	}

	if req.Gender != nil {
		arg.Gender = pgtype.Text{
			String: *req.Gender,
			Valid:  true,
		}
	}

	if req.Age != nil {
		arg.Age = pgtype.Int4{
			Int32: *req.Age,
			Valid: true,
		}
	}

	if req.Specialization != nil {
		arg.Specialization = pgtype.Text{
			String: *req.Specialization,
			Valid:  true,
		}
	}

	if req.Email != nil {
		arg.Email = pgtype.Text{
			String: *req.Email,
			Valid:  true,
		}
	}

	if req.RegistrationNumber != nil {
		arg.RegistrationNumber = pgtype.Text{
			String: *req.RegistrationNumber,
			Valid:  true,
		}
	}

	if req.HospitalName != nil {
		arg.HospitalName = pgtype.Text{
			String: *req.HospitalName,
			Valid:  true,
		}
	}

	if req.YearsExperience != nil {
		arg.YearsExperience = pgtype.Int4{
			Int32: *req.YearsExperience,
			Valid: true,
		}
	}

	doctor, err := server.store.GetDoctorByName(c, authPayload.Username)
	if err != nil {
		err := errors.New("failed to get doctor")
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if req.Password != nil {
		if *req.Password == doctor.Password {
			err := errors.New("new password cannot be same as old password")
			c.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}
		hashPass, err := util.HashPassword(*req.Password)
		if err != nil {
			err := errors.New("failed to hash password")
			c.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}
		arg.Password = pgtype.Text{
			String: hashPass,
			Valid:  true,
		}
		arg.PasswordChangedAt = pgtype.Timestamp{
			Time:  time.Now(),
			Valid: true,
		}
	}

	doctor, err = server.store.UpdateDoctor(c, arg)
	if err != nil {
		err := errors.New("failed to update doctor")
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	c.JSON(http.StatusOK, newDoctorResponse(doctor))
}

type DeleteDoctorRequest struct {
	Username string `uri:"username" binding:"required"`
}

func (server *Server) DeleteDoctor(c *gin.Context) {
	var req DeleteDoctorRequest
	if err := c.ShouldBindUri(&req); err != nil {
		err = errors.New("invalid request body")
		c.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := c.MustGet(authorizationPayloadKey).(*token.Payload)

	if authPayload.Username != req.Username || authPayload.Role != util.Doctor {
		err := errors.New("cannot delete other doctor's account")
		c.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
		return
	}

	username, err := server.store.DeleteDoctor(c, req.Username)
	if err != nil {
		if errors.Is(err, db.ErrRecordNotFound) {
			err = errors.New("user not found")
			c.AbortWithStatusJSON(http.StatusNotFound, errorResponse(err))
			return
		}
		c.AbortWithStatusJSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"username": username,
		"message":  "doctor deleted successfully",
	})
}

type loginDoctorRequest struct {
	Username string `json:"username" binding:"required,alphanum"`
	Password string `json:"password" binding:"required,min=6"`
}

type loginDoctorResponse struct {
	AccessToken          string         `json:"access_token"`
	AccessTokenExpiresAt time.Time      `json:"access_token_expires_at"`
	Doctor               doctorResponse `json:"doctor"`
}

func (server *Server) LoginDoctor(ctx *gin.Context) {
	var req loginDoctorRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	doctor, err := server.store.GetDoctorByName(ctx, req.Username)
	if err != nil {
		if errors.Is(err, db.ErrRecordNotFound) {
			err := errors.New("no doctor found")
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if err := util.CheckPassword(req.Password, doctor.Password); err != nil {
		err := errors.New("invalid password field")
		ctx.JSON(http.StatusUnauthorized, errorResponse(err))
		return
	}

	accessToken, accessPayload, err := server.tokenMaker.CreateToken(doctor.Username, util.Doctor, server.config.TokenDuration)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	rsp := loginDoctorResponse{
		AccessToken:          accessToken,
		AccessTokenExpiresAt: accessPayload.ExpiredAt,
		Doctor:               newDoctorResponse(doctor),
	}

	ctx.JSON(http.StatusOK, rsp)
}

type ListDoctorsBySpecializationRequest struct {
	Specialization string `form:"specialization" binding:"required"`
	PageID         int32  `form:"page_id" binding:"required,min=1"`
	PageSize       int32  `form:"page_size" binding:"required,min=5,max=10"`
}

func (server *Server) ListDoctorsBySpecialization(c *gin.Context) {
	var req ListDoctorsBySpecializationRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.ListDoctorsBySpecializationParams{
		Specialization: req.Specialization,
		Limit:          req.PageSize,
		Offset:         (req.PageID - 1) * req.PageSize,
	}

	doctors, err := server.store.ListDoctorsBySpecialization(c, arg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	response := make([]doctorResponse, len(doctors))
	for i, doctor := range doctors {
		response[i] = newDoctorResponse(doctor)
	}

	c.JSON(http.StatusOK, response)
}
