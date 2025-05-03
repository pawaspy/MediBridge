package api

import (
	"database/sql"
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	db "github.com/pawaspy/MediBridge/db/sqlc"
	"github.com/pawaspy/MediBridge/token"
)

// AddToCartRequest represents the request to add an item to the cart
type AddToCartRequest struct {
	MedicineID int32 `json:"medicine_id" binding:"required,min=1"`
	Quantity   int32 `json:"quantity" binding:"required,min=1"`
}

// CartIDRequest represents a request with a cart item ID
type CartIDRequest struct {
	ID int32 `uri:"id" binding:"required,min=1"`
}

// UpdateCartItemRequest represents a request to update cart item quantity
type UpdateCartItemRequest struct {
	Quantity int32 `json:"quantity" binding:"required,min=1"`
}

// AddToCart adds an item to the patient's cart
func (server *Server) AddToCart(c *gin.Context) {
	var req AddToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := c.MustGet("authorization_payload").(*token.Payload)
	patientUsername := authPayload.Username

	// Check if medicine exists and has sufficient stock
	medicine, err := server.store.GetMedicine(c, req.MedicineID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, errorResponse(errors.New("medicine not found")))
			return
		}
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Check stock availability
	if medicine.Quantity < req.Quantity {
		c.JSON(http.StatusBadRequest, errorResponse(errors.New("insufficient stock")))
		return
	}

	// Check if medicine is expired
	if medicine.ExpiryDate.Time.Before(time.Now()) {
		c.JSON(http.StatusBadRequest, errorResponse(errors.New("medicine has expired")))
		return
	}

	// Add to cart
	arg := db.AddToCartParams{
		PatientUsername: patientUsername,
		MedicineID:      req.MedicineID,
		Quantity:        req.Quantity,
	}

	cartItem, err := server.store.AddToCart(c, arg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	c.JSON(http.StatusOK, cartItem)
}

// GetCartItems retrieves all items in the patient's cart
func (server *Server) GetCartItems(c *gin.Context) {
	authPayload := c.MustGet("authorization_payload").(*token.Payload)
	patientUsername := authPayload.Username

	cartItems, err := server.store.GetCartItems(c, patientUsername)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Get cart total
	total, err := server.store.GetCartTotal(c, patientUsername)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"items": cartItems,
		"total": total,
		"count": len(cartItems),
	})
}

// UpdateCartItem updates the quantity of an item in the cart
func (server *Server) UpdateCartItem(c *gin.Context) {
	var req UpdateCartItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	var cartIDReq CartIDRequest
	if err := c.ShouldBindUri(&cartIDReq); err != nil {
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := c.MustGet("authorization_payload").(*token.Payload)
	patientUsername := authPayload.Username

	// Get cart item to verify medicine ID
	cartItem, err := server.store.GetCartItem(c, db.GetCartItemParams{
		ID:              cartIDReq.ID,
		PatientUsername: patientUsername,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, errorResponse(errors.New("cart item not found")))
			return
		}
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Check stock availability
	medicine, err := server.store.GetMedicine(c, cartItem.MedicineID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if medicine.Quantity < req.Quantity {
		c.JSON(http.StatusBadRequest, errorResponse(errors.New("insufficient stock")))
		return
	}

	// Update cart item
	arg := db.UpdateCartItemParams{
		Quantity:        req.Quantity,
		ID:              cartIDReq.ID,
		PatientUsername: patientUsername,
	}

	updatedItem, err := server.store.UpdateCartItem(c, arg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	c.JSON(http.StatusOK, updatedItem)
}

// DeleteCartItem removes an item from the cart
func (server *Server) DeleteCartItem(c *gin.Context) {
	var req CartIDRequest
	if err := c.ShouldBindUri(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := c.MustGet("authorization_payload").(*token.Payload)
	patientUsername := authPayload.Username

	// Check if item exists in cart
	_, err := server.store.GetCartItem(c, db.GetCartItemParams{
		ID:              req.ID,
		PatientUsername: patientUsername,
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, errorResponse(errors.New("cart item not found")))
			return
		}
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Delete cart item
	err = server.store.DeleteCartItem(c, db.DeleteCartItemParams{
		ID:              req.ID,
		PatientUsername: patientUsername,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

// ClearCart removes all items from the cart
func (server *Server) ClearCart(c *gin.Context) {
	authPayload := c.MustGet("authorization_payload").(*token.Payload)
	patientUsername := authPayload.Username

	err := server.store.ClearCart(c, patientUsername)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

// GetCartCount returns the number of items in the cart
func (server *Server) GetCartCount(c *gin.Context) {
	authPayload := c.MustGet("authorization_payload").(*token.Payload)
	patientUsername := authPayload.Username

	count, err := server.store.GetCartCount(c, patientUsername)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": count})
}
