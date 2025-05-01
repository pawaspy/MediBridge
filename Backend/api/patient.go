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

type CreatePatientRequest struct {
	Username         string `json:"username" binding:"required,alphanum"`
	FullName         string `json:"full_name" binding:"required"`
	MobileNumber     string `json:"mobile_number" binding:"required"`
	Gender           string `json:"gender" binding:"required"`
	Email            string `json:"email" binding:"required,email"`
	Password         string `json:"password" binding:"required,min=6"`
	Age              int32  `json:"age" binding:"required"`
	Address          string `json:"address" binding:"required"`
	EmergencyContact string `json:"emergency_contact" binding:"required"`
}

type UpdatePatientRequest struct {
	Username         *string `json:"username" binding:"required,alphanum"`
	FullName         *string `json:"full_name" binding:"omitempty"`
	MobileNumber     *string `json:"mobile_number" binding:"omitempty"`
	Age              *int32  `json:"age" binding:"omitempty"`
	Password         *string `json:"password" binding:"omitempty,min=6"`
	Address          *string `json:"address" binding:"omitempty"`
	EmergencyContact *string `json:"emergency_contact" binding:"omitempty"`
}

type userResponse struct {
	Username          string           `json:"username"`
	FullName          string           `json:"full_name"`
	Email             string           `json:"email"`
	MobileNumber      string           `json:"mobile_number"`
	Gender            string           `json:"gender"`
	Age               int32            `json:"age"`
	Address           string           `json:"address"`
	EmergencyContact  string           `json:"emergency_contact"`
	PasswordChangedAt pgtype.Timestamp `json:"password_changed_at"`
	CreatedAt         pgtype.Timestamp `json:"created_at"`
}

func newUserResponse(user db.Patient) userResponse {
	return userResponse{
		Username:          user.Username,
		FullName:          user.FullName,
		Email:             user.Email,
		MobileNumber:      user.MobileNumber,
		Gender:            user.Gender,
		Age:               user.Age,
		Address:           user.Address,
		EmergencyContact:  user.EmergencyContact,
		PasswordChangedAt: user.PasswordChangedAt,
		CreatedAt:         user.CreatedAt,
	}
}

type GetPatientRequest struct {
	Username string `uri:"username" binding:"required"`
}

func (server *Server) GetPatient(c *gin.Context) {
	username := c.Param("username")

	patient, err := server.store.GetPatientByName(c, username)
	if err != nil {
		err := errors.New("failed to get patient")
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	c.JSON(http.StatusOK, newUserResponse(patient))
}

func (server *Server) CreatePatient(c *gin.Context) {
	var req CreatePatientRequest
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

	if !util.IsValidPhoneNumber(req.EmergencyContact) {
		err := errors.New("emergency number must be exactly 10 digits")
		c.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.Age < 0 {
		err := errors.New("age must be a positive number")
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

	arg := db.CreatePatientParams{
		Username:         req.Username,
		FullName:         req.FullName,
		MobileNumber:     req.MobileNumber,
		Gender:           req.Gender,
		Age:              req.Age,
		Email:            req.Email,
		Password:         hashPass,
		Address:          req.Address,
		EmergencyContact: req.EmergencyContact,
	}

	patient, err := server.store.CreatePatient(c, arg)
	if err != nil {
		err := errors.New("failed to create patient")
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	c.JSON(http.StatusOK, newUserResponse(patient))
}

func (server *Server) UpdatePatient(c *gin.Context) {
	authPayload := c.MustGet(authorizationPayloadKey).(*token.Payload)

	var req UpdatePatientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err := errors.New("invalid request body")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.Username == nil || *req.Username != authPayload.Username || authPayload.Role != util.Patient {
		err := errors.New("invalid username")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.MobileNumber != nil && !util.IsValidPhoneNumber(*req.MobileNumber) {
		err := errors.New("phone number must be exactly 10 digits")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.EmergencyContact != nil && !util.IsValidPhoneNumber(*req.EmergencyContact) {
		err := errors.New("emergency number must be exactly 10 digits")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.Age != nil && *req.Age < 0 {
		err := errors.New("age must be a positive number")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.UpdatePatientParams{
		Username: authPayload.Username,
		FullName: pgtype.Text{
			String: *req.FullName,
			Valid:  true,
		},
		MobileNumber: pgtype.Text{
			String: *req.MobileNumber,
			Valid:  true,
		},
		Age: pgtype.Int4{
			Int32: *req.Age,
			Valid: true,
		},
		Address: pgtype.Text{
			String: *req.Address,
			Valid:  true,
		},
		EmergencyContact: pgtype.Text{
			String: *req.EmergencyContact,
			Valid:  true,
		},
	}

	patient, err := server.store.GetPatientByName(c, authPayload.Username)
	if err != nil {
		err := errors.New("failed to get patient")
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if req.Password != nil {
		if *req.Password == patient.Password {
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

	patient, err = server.store.UpdatePatient(c, arg)
	if err != nil {
		err := errors.New("failed to update patient")
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	c.JSON(http.StatusOK, newUserResponse(patient))
}

type DeletePatientRequest struct {
	Username string `uri:"username" binding:"required"`
}

func (server *Server) DeletePatient(c *gin.Context) {
	var req DeletePatientRequest
	if err := c.ShouldBindUri(&req); err != nil {
		err = errors.New("invalid request body")
		c.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := c.MustGet(authorizationPayloadKey).(*token.Payload)

	if authPayload.Username != req.Username || authPayload.Role != util.Patient {
		err := errors.New("cannot delete other patient's account")
		c.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
		return
	}

	username, err := server.store.DeletePatient(c, req.Username)
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
		"message":  "user deleted successfully",
	})

}

type loginUserRequest struct {
	Username string `json:"username" binding:"required,alphanum"`
	Password string `json:"password" binding:"required,min=6"`
}

type loginUserResponse struct {
	AccessToken          string       `json:"access_token"`
	AccessTokenExpiresAt time.Time    `json:"access_token_expires_at"`
	User                 userResponse `json:"user"`
}

func (server *Server) loginPatient(ctx *gin.Context) {
	var req loginUserRequest
	if err := ctx.ShouldBindBodyWithJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	patient, err := server.store.GetPatientByName(ctx, req.Username)
	if err != nil {
		if errors.Is(err, db.ErrRecordNotFound) {
			err := errors.New("no patient found")
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if err := util.CheckPassword(req.Password, patient.Password); err != nil {
		err := errors.New("invalid password field")
		ctx.JSON(http.StatusUnauthorized, errorResponse(err))
		return
	}

	accessToken, accessPayload, err := server.tokenMaker.CreateToken(patient.Username, util.Patient, server.config.TokenDuration)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	rsp := loginUserResponse{
		AccessToken:          accessToken,
		AccessTokenExpiresAt: accessPayload.ExpiredAt,
		User:                 newUserResponse(patient),
	}

	ctx.JSON(http.StatusOK, rsp)
}
