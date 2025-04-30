package api

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/pawaspy/MediBridge/db/sqlc"
	"github.com/pawaspy/MediBridge/token"
	"github.com/pawaspy/MediBridge/util"
)

type CreateSellerProfile struct {
	Username      string `json:"username" binding:"required,alphanum"`
	ShopName      string `json:"shop_name" binding:"required,regexp=^[a-zA-Z\\s-]+$"`
	LicenseNumber string `json:"license_number" binding:"required"`
	ShopAddress   string `json:"shop_address" binding:"required"`
	PhoneNumber   string `json:"phone_number" binding:"required"`
}

func (server *Server) createSellerProfile(ctx *gin.Context) {
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	var req CreateSellerProfile
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if authPayload.Role != util.Seller || authPayload.Username != req.Username {
		err := errors.New("cannot create seller profile with invalid role or username")
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
		return
	}

	if !isValidPhoneNumber(req.PhoneNumber) {
		err := errors.New("phone number must be exactly 10 digits")
		ctx.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.CreateSellerProfileParams{
		Username:      req.Username,
		ShopName:      req.ShopName,
		LicenseNumber: req.LicenseNumber,
		ShopAddress:   req.ShopAddress,
		PhoneNumber:   req.PhoneNumber,
	}

	seller, err := server.store.CreateSellerProfile(ctx, arg)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, seller)
}

type UpdateSellerProfileRequest struct {
	Username      string  `json:"username" binding:"required"`
	ShopName      *string `json:"shop_name" binding:"omitempty,regexp=^[a-zA-Z\\s-]+$"`
	LicenseNumber *string `json:"license_number" binding:"omitempty"`
	ShopAddress   *string `json:"shop_address" binding:"omitempty"`
	PhoneNumber   *string `json:"phone_number" binding:"omitempty"`
}

func (server *Server) updateSellerProfile(ctx *gin.Context) {
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	var req UpdateSellerProfileRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if authPayload.Role != util.Seller || authPayload.Username != req.Username {
		err := errors.New("cannot update seller profile with invalid role or username")
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
		return
	}

	arg := db.UpdateSellerProfileParams{
		Username: req.Username,
	}

	if req.ShopName != nil {
		arg.ShopName = pgtype.Text{
			String: *req.ShopName,
			Valid:  true,
		}
	}

	if req.LicenseNumber != nil {
		arg.LicenseNumber = pgtype.Text{
			String: *req.LicenseNumber,
			Valid:  true,
		}
	}

	if req.ShopAddress != nil {
		arg.ShopAddress = pgtype.Text{
			String: *req.ShopAddress,
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

	seller, err := server.store.UpdateSellerProfile(ctx, arg)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, seller)
}

type DeleteSellerProfileRequest struct {
	Username string `uri:"username" binding:"required,alphanum"`
}

func (server *Server) deleteSellerProfile(ctx *gin.Context) {
	var req DeleteSellerProfileRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	if authPayload.Role != util.Seller || authPayload.Username != req.Username {
		err := errors.New("unauthorized: sellers can only delete their own profile")
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
		return
	}

	username, err := server.store.DeleteSellerProfile(ctx, req.Username)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.AbortWithStatusJSON(http.StatusNotFound, errorResponse(err))
			return
		}
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"username": username,
		"message":  "seller profile deleted successfully",
	})
}

type searchShopsRequest struct {
	Keyword string `form:"keyword" binding:"required,alpha"`
	Offset  int32  `form:"offset" binding:"min=0"`
	Limit   int32  `form:"limit" binding:"required,min=1,max=50"`
}

func (server *Server) searchShops(ctx *gin.Context) {
	var req searchShopsRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	params := db.SearchShopsParams{
		Keyword: pgtype.Text{String: req.Keyword, Valid: true},
		Offset:  req.Offset,
		Limit:   req.Limit,
	}

	shops, err := server.store.SearchShops(ctx, params)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if len(shops) == 0 {
		ctx.JSON(http.StatusNotFound, errorResponse(errors.New("no shops found for given keyword")))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"shops": shops,
		"count": len(shops),
	})
}

