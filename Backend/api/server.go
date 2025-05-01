package api

import (
	"fmt"

	"github.com/gin-gonic/gin"
	db "github.com/pawaspy/MediBridge/db/sqlc"
	"github.com/pawaspy/MediBridge/token"
	"github.com/pawaspy/MediBridge/util"
)

type Server struct {
	config     util.Config
	store      db.Store
	router     *gin.Engine
	tokenMaker token.Maker
}

func NewServer(config util.Config, store db.Store) (*Server, error) {
	tokenMaker, err := token.NewPasetoMaker(config.TokenSymmetricKey)
	if err != nil {
		return nil, fmt.Errorf("cannot create token: %w", err)
	}

	server := &Server{
		config:     config,
		store:      store,
		tokenMaker: tokenMaker,
	}

	server.setupRouter()

	return server, nil
}

func (server *Server) setupRouter() {
	router := gin.Default()

	authRoutes := router.Group("/api").Use(authMiddleware(server.tokenMaker))
	// Patient
	router.POST("/api/patients", server.CreatePatient)
	router.GET("/api/patients/:id", server.GetPatient)
	router.POST("/api/loginpatient", server.loginPatient)
	authRoutes.PUT("/patients", server.UpdatePatient)
	authRoutes.DELETE("/api/patients/:id", server.DeletePatient)
	
	// Doctor
	

	server.router = router
}


func (server *Server) Start(address string) error {
	return server.router.Run(address)
}

func errorResponse(err error) gin.H {
	return gin.H{
		"error": gin.H{
			"message": err.Error(),
		},
	}
}