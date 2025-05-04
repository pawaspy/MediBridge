package api

import (
	"bytes"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/pawaspy/MediBridge/db/sqlc"
	"github.com/pawaspy/MediBridge/token"
	"github.com/pawaspy/MediBridge/util"
)

type CreateSellerRequest struct {
	Username          string `json:"username" binding:"required,alphanum"`
	FullName          string `json:"full_name" binding:"required"`
	Email             string `json:"email" binding:"required,email"`
	Password          string `json:"password" binding:"required,min=6"`
	MobileNumber      string `json:"mobile_number" binding:"required"`
	StoreName         string `json:"store_name" binding:"required"`
	GstNumber         string `json:"gst_number" binding:"required"`
	DrugLicenseNumber string `json:"drug_license_number" binding:"required"`
	SellerType        string `json:"seller_type" binding:"required"`
	StoreAddress      string `json:"store_address" binding:"required"`
}

type UpdateSellerRequest struct {
	Username          *string `json:"username" binding:"required,alphanum"`
	FullName          *string `json:"full_name" binding:"omitempty"`
	Email             *string `json:"email" binding:"omitempty,email"`
	Password          *string `json:"password" binding:"omitempty,min=6"`
	MobileNumber      *string `json:"mobile_number" binding:"omitempty"`
	StoreName         *string `json:"store_name" binding:"omitempty"`
	GstNumber         *string `json:"gst_number" binding:"omitempty"`
	DrugLicenseNumber *string `json:"drug_license_number" binding:"omitempty"`
	SellerType        *string `json:"seller_type" binding:"omitempty"`
	StoreAddress      *string `json:"store_address" binding:"omitempty"`
}

type sellerResponse struct {
	Username          string           `json:"username"`
	FullName          string           `json:"full_name"`
	Email             string           `json:"email"`
	MobileNumber      string           `json:"mobile_number"`
	StoreName         string           `json:"store_name"`
	GstNumber         string           `json:"gst_number"`
	DrugLicenseNumber string           `json:"drug_license_number"`
	SellerType        string           `json:"seller_type"`
	StoreAddress      string           `json:"store_address"`
	PasswordChangedAt pgtype.Timestamp `json:"password_changed_at"`
	CreatedAt         pgtype.Timestamp `json:"created_at"`
}

func newSellerResponse(seller db.Seller) sellerResponse {
	return sellerResponse{
		Username:          seller.Username,
		FullName:          seller.FullName,
		Email:             seller.Email,
		MobileNumber:      seller.MobileNumber,
		StoreName:         seller.StoreName,
		GstNumber:         seller.GstNumber,
		DrugLicenseNumber: seller.DrugLicenseNumber,
		SellerType:        seller.SellerType,
		StoreAddress:      seller.StoreAddress,
		PasswordChangedAt: seller.PasswordChangedAt,
		CreatedAt:         seller.CreatedAt,
	}
}

type GetSellerRequest struct {
	Username string `uri:"username" binding:"required"`
}

func (server *Server) GetSeller(c *gin.Context) {
	username := c.Param("username")

	seller, err := server.store.GetSellerByName(c, username)
	if err != nil {
		err := errors.New("failed to get seller")
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	c.JSON(http.StatusOK, newSellerResponse(seller))
}

func (server *Server) CreateSeller(c *gin.Context) {
	// Read and log raw request body for debugging
	rawBody, err := c.GetRawData()
	if err != nil {
		util.LogError("Failed to read raw request body: %v", err)
		c.JSON(http.StatusBadRequest, errorResponse(fmt.Errorf("failed to read request body: %v", err)))
		return
	}

	// Log the raw request for debugging
	util.LogInfo("Raw seller registration request: %s", string(rawBody))

	// Convert the raw request body back to io.ReadCloser for ShouldBindJSON
	c.Request.Body = NewReadCloser(rawBody)

	var req CreateSellerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		util.LogError("Invalid seller registration request body: %v", err)
		c.JSON(http.StatusBadRequest, errorResponse(fmt.Errorf("invalid request body: %v", err)))
		return
	}

	// Log the received request for debugging
	util.LogInfo("Received seller registration request for username: %s", req.Username)
	util.LogInfo("Seller registration request details: %+v", req)

	// Extensive validation
	if req.Username == "" {
		err := errors.New("username is required and cannot be empty")
		util.LogError("%v", err)
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.Email == "" {
		err := errors.New("email is required and cannot be empty")
		util.LogError("%v", err)
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if !util.IsValidPhoneNumber(req.MobileNumber) {
		err := errors.New("phone number must be exactly 10 digits")
		util.LogWarning("Invalid phone number format: %s", req.MobileNumber)
		c.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if !util.IsValidSellerType(req.SellerType) {
		util.LogWarning("Invalid seller type: %s", req.SellerType)
		validTypes := []string{util.RetailSeller, util.WholesaleSeller, util.HospitalSeller, util.NGOSeller}
		err := fmt.Errorf("invalid seller type provided: %s. Valid types are: %v", req.SellerType, validTypes)
		c.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	hashPass, err := util.HashPassword(req.Password)
	if err != nil {
		util.LogError("Failed to hash password for user %s: %v", req.Username, err)
		c.JSON(http.StatusInternalServerError, errorResponse(errors.New("failed to hash password")))
		return
	}

	arg := db.CreateSellerParams{
		Username:          req.Username,
		FullName:          req.FullName,
		Email:             req.Email,
		Password:          hashPass,
		MobileNumber:      req.MobileNumber,
		StoreName:         req.StoreName,
		GstNumber:         req.GstNumber,
		DrugLicenseNumber: req.DrugLicenseNumber,
		SellerType:        req.SellerType,
		StoreAddress:      req.StoreAddress,
	}

	// Log the final parameters being sent to the database
	util.LogInfo("Attempting to create seller with params: %+v", arg)

	// Check if user with this username already exists
	_, userErr := server.store.GetSellerByName(c, req.Username)
	if userErr == nil {
		// No error means user was found, so it's a duplicate
		err := fmt.Errorf("seller with username %s already exists", req.Username)
		util.LogWarning("%v", err)
		c.JSON(http.StatusConflict, errorResponse(err))
		return
	}

	// Check if email is already in use by listing all sellers and checking emails
	sellers, err := server.store.ListSellersByStoreName(c, db.ListSellersByStoreNameParams{
		StoreName: pgtype.Text{String: "", Valid: true}, // Empty to get all sellers
		Limit:     100,
		Offset:    0,
	})
	if err == nil {
		for _, seller := range sellers {
			if seller.Email == req.Email {
				err := fmt.Errorf("email %s is already registered", req.Email)
				util.LogWarning("%v", err)
				c.JSON(http.StatusConflict, errorResponse(err))
				return
			}
		}
	}

	// Try to create the seller
	seller, err := server.store.CreateSeller(c, arg)
	if err != nil {
		util.LogError("Database error creating seller %s: %v", req.Username, err)
		// Use the new error formatter for better error details
		formattedError := util.FormatDBError(err)
		c.JSON(http.StatusInternalServerError, errorResponse(fmt.Errorf("failed to create seller: %s", formattedError)))
		return
	}

	util.LogInfo("Successfully created seller: %s", req.Username)
	c.JSON(http.StatusOK, newSellerResponse(seller))
}

// NewReadCloser creates a new io.ReadCloser from byte slice
func NewReadCloser(body []byte) *BodyReadCloser {
	return &BodyReadCloser{bytes.NewReader(body)}
}

// BodyReadCloser implements io.ReadCloser
type BodyReadCloser struct {
	reader *bytes.Reader
}

// Read implements io.Reader
func (brc *BodyReadCloser) Read(p []byte) (n int, err error) {
	return brc.reader.Read(p)
}

// Close implements io.Closer
func (brc *BodyReadCloser) Close() error {
	return nil
}

func (server *Server) UpdateSeller(c *gin.Context) {
	authPayload := c.MustGet(authorizationPayloadKey).(*token.Payload)

	var req UpdateSellerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err := errors.New("invalid request body")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.Username == nil || *req.Username != authPayload.Username || authPayload.Role != util.Seller {
		err := errors.New("invalid username")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.MobileNumber != nil && !util.IsValidPhoneNumber(*req.MobileNumber) {
		err := errors.New("phone number must be exactly 10 digits")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.SellerType != nil && !util.IsValidSellerType(*req.SellerType) {
		err := errors.New("invalid seller type provided")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.UpdateSellerParams{
		Username: authPayload.Username,
	}

	if req.FullName != nil {
		arg.FullName = pgtype.Text{
			String: *req.FullName,
			Valid:  true,
		}
	}

	if req.Email != nil {
		arg.Email = pgtype.Text{
			String: *req.Email,
			Valid:  true,
		}
	}

	if req.MobileNumber != nil {
		arg.MobileNumber = pgtype.Text{
			String: *req.MobileNumber,
			Valid:  true,
		}
	}

	if req.StoreName != nil {
		arg.StoreName = pgtype.Text{
			String: *req.StoreName,
			Valid:  true,
		}
	}

	if req.GstNumber != nil {
		arg.GstNumber = pgtype.Text{
			String: *req.GstNumber,
			Valid:  true,
		}
	}

	if req.DrugLicenseNumber != nil {
		arg.DrugLicenseNumber = pgtype.Text{
			String: *req.DrugLicenseNumber,
			Valid:  true,
		}
	}

	if req.SellerType != nil {
		arg.SellerType = pgtype.Text{
			String: *req.SellerType,
			Valid:  true,
		}
	}

	if req.StoreAddress != nil {
		arg.StoreAddress = pgtype.Text{
			String: *req.StoreAddress,
			Valid:  true,
		}
	}

	seller, err := server.store.GetSellerByName(c, authPayload.Username)
	if err != nil {
		err := errors.New("failed to get seller")
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if req.Password != nil {
		if *req.Password == seller.Password {
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

	seller, err = server.store.UpdateSeller(c, arg)
	if err != nil {
		err := errors.New("failed to update seller")
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	c.JSON(http.StatusOK, newSellerResponse(seller))
}

type DeleteSellerRequest struct {
	Username string `uri:"username" binding:"required"`
}

func (server *Server) DeleteSeller(c *gin.Context) {
	var req DeleteSellerRequest
	if err := c.ShouldBindUri(&req); err != nil {
		err = errors.New("invalid request body")
		c.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := c.MustGet(authorizationPayloadKey).(*token.Payload)

	if authPayload.Username != req.Username || authPayload.Role != util.Seller {
		err := errors.New("cannot delete other seller's account")
		c.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
		return
	}

	username, err := server.store.DeleteSeller(c, req.Username)
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
		"message":  "seller deleted successfully",
	})
}

type loginSellerRequest struct {
	Username string `json:"username" binding:"required,alphanum"`
	Password string `json:"password" binding:"required,min=6"`
}

type loginSellerResponse struct {
	AccessToken          string         `json:"access_token"`
	AccessTokenExpiresAt time.Time      `json:"access_token_expires_at"`
	Seller               sellerResponse `json:"seller"`
}

func (server *Server) LoginSeller(ctx *gin.Context) {
	var req loginSellerRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	seller, err := server.store.GetSellerByName(ctx, req.Username)
	if err != nil {
		if errors.Is(err, db.ErrRecordNotFound) {
			err := errors.New("no seller found")
			ctx.JSON(http.StatusNotFound, errorResponse(err))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if err := util.CheckPassword(req.Password, seller.Password); err != nil {
		err := errors.New("invalid password field")
		ctx.JSON(http.StatusUnauthorized, errorResponse(err))
		return
	}

	accessToken, accessPayload, err := server.tokenMaker.CreateToken(seller.Username, util.Seller, server.config.TokenDuration)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	rsp := loginSellerResponse{
		AccessToken:          accessToken,
		AccessTokenExpiresAt: accessPayload.ExpiredAt,
		Seller:               newSellerResponse(seller),
	}

	ctx.JSON(http.StatusOK, rsp)
}

type ListSellersByStoreNameRequest struct {
	StoreName string `form:"store_name" binding:"required"`
	PageID    int32  `form:"page_id" binding:"required,min=1"`
	PageSize  int32  `form:"page_size" binding:"required,min=5,max=10"`
}

func (server *Server) ListSellersByStoreName(c *gin.Context) {
	var req ListSellersByStoreNameRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		err := errors.New("invalid request body")
		c.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.ListSellersByStoreNameParams{
		StoreName: pgtype.Text{
			String: req.StoreName,
			Valid:  true,
		},
		Limit:  req.PageSize,
		Offset: (req.PageID - 1) * req.PageSize,
	}

	sellers, err := server.store.ListSellersByStoreName(c, arg)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	items := make([]sellerResponse, len(sellers))
	for i, seller := range sellers {
		items[i] = newSellerResponse(seller)
	}
	c.JSON(http.StatusOK, items)
}
