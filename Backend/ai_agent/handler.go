package ai_agent

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// QueryRequest represents a query to the AI agent
type QueryRequest struct {
	Query string `json:"query" binding:"required"`
}

// Handler is the API handler for the Aliza AI agent
type Handler struct {
	aliza *Aliza
}

// NewHandler creates a new Aliza handler
func NewHandler(aliza *Aliza) *Handler {
	return &Handler{
		aliza: aliza,
	}
}

// RegisterRoutes registers the routes for the Aliza AI agent
func (h *Handler) RegisterRoutes(router *gin.RouterGroup) {
	router.POST("/query", h.Query)
}

// Query handles a query to the AI agent
func (h *Handler) Query(c *gin.Context) {
	var req QueryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	response, err := h.aliza.ProcessQuery(c, req.Query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	c.JSON(http.StatusOK, response)
}

// errorResponse creates an error response
func errorResponse(err error) gin.H {
	return gin.H{"error": err.Error()}
}
