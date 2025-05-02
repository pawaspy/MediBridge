package api

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/pawaspy/MediBridge/db/sqlc"
	"github.com/pawaspy/MediBridge/token"
	"github.com/pawaspy/MediBridge/util"
)

type CreateMedicineRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description" binding:"required"`
	ExpiryDate  string `json:"expiry_date" binding:"required"`
	Quantity    int32  `json:"quantity" binding:"required"`
	Price       string `json:"price" binding:"required"`
	Discount    int32  `json:"discount" binding:"required"`
	Seller      string `json:"seller" binding:"required"`
}

type UpdateMedicineRequest struct {
	Name        string `json:"name" binding:"omitempty"`
	Description string `json:"description" binding:"omitempty"`
	ExpiryDate  string `json:"expiry_date" binding:"omitempty"`
	Quantity    int32  `json:"quantity" binding:"omitempty"`
	Price       string `json:"price" binding:"omitempty"`
	Discount    int32  `json:"discount" binding:"omitempty"`
	Seller      string `json:"seller" binding:"omitempty"`
}

type MedicineResponse struct {
	ID             int32  `json:"id"`
	Name           string `json:"name"`
	Description    string `json:"description"`
	ExpiryDate     string `json:"expiry_date"`
	Quantity       int32  `json:"quantity"`
	Price          string `json:"price"`
	Discount       int32  `json:"discount"`
	SellerUsername string `json:"seller_username"`
	CreatedAt      string `json:"created_at"`
}

type DeleteMedicineRequest struct {
	ID int32 `uri:"id" binding:"required"`
}

type MedicineIDRequest struct {
	ID int32 `uri:"id" binding:"required"`
}

type ListSellerMedicinesRequest struct {
	SellerUsername string `uri:"username" binding:"required"`
	Limit          int32  `form:"limit,default=10"`
	Offset         int32  `form:"offset,default=0"`
}

type SearchMedicinesRequest struct {
	Name   string `form:"name" binding:"required"`
	Limit  int32  `form:"limit,default=10"`
	Offset int32  `form:"offset,default=0"`
}

func (server *Server) CreateMedicine(c *gin.Context) {
	authPayload := c.MustGet(authorizationPayloadKey).(*token.Payload)

	var req CreateMedicineRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.New("failed to bind JSON")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.Quantity < 0 {
		err := errors.New("quantity cannot be negative")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.Discount < 0 {
		err := errors.New("discount cannot be negative")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.Price == "" {
		err := errors.New("price cannot be empty")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.Seller == "" || req.Seller != authPayload.Username || req.Seller != authPayload.Role {
		err := errors.New("invalid seller username")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Check if the seller exists
	seller, err := server.store.GetSellerByName(c, req.Seller)
	if err != nil {
		if err == sql.ErrNoRows {
			err := errors.New("seller not found")
			c.JSON(http.StatusNotFound, errorResponse(err))
			return
		}
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	if seller.Username != req.Seller {
		err := errors.New("invalid seller username")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}
	// Check if the medicine already exists
	medicine, err := server.store.GetMedicineByName(c, req.Name)
	if err != nil {
		if err != sql.ErrNoRows {
			c.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}
	}

	if medicine.Name == req.Name && medicine.ExpiryDate.Time.Format("2006-01-02") == req.ExpiryDate {
		arg := db.UpdateMedicineParams{
			Quantity: pgtype.Int4{
				Int32: req.Quantity + medicine.Quantity,
				Valid: true,
			},
		}
		medicine, err = server.store.UpdateMedicine(c, arg)
		if err != nil {
			err := errors.New("failed to update medicine")
			c.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}
		c.JSON(http.StatusOK, medicine)
		return
	}

	// Convert the expiry date to the correct format
	expiryDate, err := time.Parse("2006-01-02", req.ExpiryDate)
	if err != nil {
		err := errors.New("invalid expiry date format")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}
	//Check if the expiry date is in the future
	if expiryDate.Before(time.Now()) {
		err := errors.New("expiry date must be in the future")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}
	price, err := strconv.Atoi(req.Price)
	if err != nil {
		err := errors.New("invalid price format")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.CreateMedicineParams{
		Name:        req.Name,
		Description: req.Description,
		ExpiryDate: pgtype.Date{
			Time:  expiryDate,
			Valid: true,
		},
		Quantity: req.Quantity,
		Price: pgtype.Numeric{
			Exp:   int32(price),
			Valid: true,
		},
		Discount:       req.Discount,
		SellerUsername: req.Seller,
	}

	medicine, err = server.store.CreateMedicine(c, arg)
	if err != nil {
		err := errors.New("failed to create medicine")
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	c.JSON(http.StatusOK, medicine)
}

func (server *Server) UpdateMedicine(c *gin.Context) {
	authPayload := c.MustGet(authorizationPayloadKey).(*token.Payload)

	var req UpdateMedicineRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		err = errors.New("failed to bind JSON")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.Quantity < 0 {
		err := errors.New("quantity cannot be negative")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.Discount < 0 {
		err := errors.New("discount cannot be negative")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.Price == "" {
		err := errors.New("price cannot be empty")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if req.Seller == "" || req.Seller != authPayload.Username || req.Seller != authPayload.Role {
		err := errors.New("invalid seller username")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	price, err := strconv.Atoi(req.Price)
	if err != nil {
		err := errors.New("invalid price format")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.UpdateMedicineParams{
		Name: pgtype.Text{
			String: req.Name,
			Valid:  true,
		},
		Description: pgtype.Text{
			String: req.Description,
			Valid:  true,
		},
		ExpiryDate: pgtype.Date{
			Time:  time.Now(),
			Valid: true,
		},
		Quantity: pgtype.Int4{
			Int32: req.Quantity,
			Valid: true,
		},
		Price: pgtype.Numeric{
			Exp:   int32(price),
			Valid: true,
		},
		Discount: pgtype.Int4{
			Int32: req.Discount,
			Valid: true,
		},
	}

	medicine, err := server.store.UpdateMedicine(c, arg)
	if err != nil {
		err := errors.New("failed to update medicine")
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	c.JSON(http.StatusOK, medicine)
}

func (server *Server) DeleteMedicine(c *gin.Context) {
	authPayload := c.MustGet(authorizationPayloadKey).(*token.Payload)

	var req DeleteMedicineRequest
	if err := c.ShouldBindUri(&req); err != nil {
		err = errors.New("failed to bind JSON")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	medicine, err := server.store.GetMedicine(c, req.ID)
	if err != nil {
		err := errors.New("medicine not found")
		c.JSON(http.StatusNotFound, errorResponse(err))
		return
	}

	if medicine.SellerUsername != authPayload.Username || util.Seller != authPayload.Role {
		err := errors.New("invalid seller username")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	_, err = server.store.DeleteMedicine(c, req.ID)
	if err != nil {
		if err == sql.ErrNoRows {
			err := errors.New("medicine not found")
			c.JSON(http.StatusNotFound, errorResponse(err))
			return
		}
		err := errors.New("failed to delete medicine")
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	c.JSON(http.StatusOK, medicine)
}

func (server *Server) GetMedicine(c *gin.Context) {
	var req MedicineIDRequest
	if err := c.ShouldBindUri(&req); err != nil {
		err = errors.New("failed to bind URI")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	medicine, err := server.store.GetMedicine(c, req.ID)
	if err != nil {
		if err == sql.ErrNoRows {
			err := errors.New("medicine not found")
			c.JSON(http.StatusNotFound, errorResponse(err))
			return
		}
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	c.JSON(http.StatusOK, medicine)
}

func (server *Server) ListSellerMedicinesByExpiry(c *gin.Context) {
	var req ListSellerMedicinesRequest
	if err := c.ShouldBindUri(&req); err != nil {
		err = errors.New("failed to bind URI")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	if err := c.ShouldBindQuery(&req); err != nil {
		err = errors.New("failed to bind query parameters")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Validate the seller exists
	_, err := server.store.GetSellerByName(c, req.SellerUsername)
	if err != nil {
		if err == sql.ErrNoRows {
			err := errors.New("seller not found")
			c.JSON(http.StatusNotFound, errorResponse(err))
			return
		}
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	arg := db.ListSellerMedicinesByExpiryParams{
		SellerUsername: req.SellerUsername,
		Limit:          req.Limit,
		Offset:         req.Offset,
	}

	medicines, err := server.store.ListSellerMedicinesByExpiry(c, arg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	c.JSON(http.StatusOK, medicines)
}

func (server *Server) SearchMedicinesByNameSortedByPrice(c *gin.Context) {
	var req SearchMedicinesRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		err = errors.New("failed to bind query parameters")
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.SearchMedicinesByNameSortedByPriceParams{
		Name: pgtype.Text{
			String: req.Name,
			Valid:  true,
		},
		Limit:  req.Limit,
		Offset: req.Offset,
	}

	medicines, err := server.store.SearchMedicinesByNameSortedByPrice(c, arg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	c.JSON(http.StatusOK, medicines)
}
