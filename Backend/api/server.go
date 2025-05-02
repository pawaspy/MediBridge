package api

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/pawaspy/MediBridge/ai_agent"
	db "github.com/pawaspy/MediBridge/db/sqlc"
	"github.com/pawaspy/MediBridge/mail"
	"github.com/pawaspy/MediBridge/token"
	"github.com/pawaspy/MediBridge/util"
)

type Server struct {
	config        util.Config
	store         db.Store
	router        *gin.Engine
	tokenMaker    token.Maker
	mailer        *mail.Mailer
	expiryChecker *mail.ExpiryChecker
	alizaHandler  *ai_agent.Handler
}

func NewServer(config util.Config, store db.Store) (*Server, error) {
	tokenMaker, err := token.NewPasetoMaker(config.TokenSymmetricKey)
	if err != nil {
		return nil, fmt.Errorf("cannot create token: %w", err)
	}

	// Initialize the mailer
	mailer, err := mail.NewMailer(config)
	if err != nil {
		return nil, fmt.Errorf("cannot create mailer: %w", err)
	}

	// Initialize the expiry checker
	expiryChecker := mail.NewExpiryChecker(store, mailer, config)

	// Initialize Aliza AI agent handler
	alizaHandler := ai_agent.NewHandler(ai_agent.NewAliza(store))

	server := &Server{
		config:        config,
		store:         store,
		tokenMaker:    tokenMaker,
		mailer:        mailer,
		expiryChecker: expiryChecker,
		alizaHandler:  alizaHandler,
	}

	server.setupRouter()

	return server, nil
}

func (server *Server) setupRouter() {
	router := gin.Default()

	// Add CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Add routes
	authRoutes := router.Group("/api").Use(authMiddleware(server.tokenMaker))

	// Auth routes
	router.POST("/api/patients", server.CreatePatient)
	router.POST("/api/loginpatient", server.loginPatient)
	router.POST("/api/doctors", server.CreateDoctor)
	router.POST("/api/logindoctor", server.loginDoctor)
	router.POST("/api/sellers", server.CreateSeller)
	router.POST("/api/loginseller", server.loginSeller)

	// Patient routes
	router.GET("/api/patients/:username", server.GetPatient)
	authRoutes.PUT("/patients", server.UpdatePatient)
	authRoutes.DELETE("/patients/:username", server.DeletePatient)

	// Patient Profile routes
	router.GET("/api/patient-profiles/:username", server.GetPatientProfile)
	authRoutes.POST("/patient-profiles", server.CreatePatientProfile)
	authRoutes.PUT("/patient-profiles", server.UpdatePatientProfile)
	authRoutes.DELETE("/patient-profiles/:username", server.DeletePatientProfile)
	authRoutes.GET("/patient-profiles", server.ListPatientProfiles)

	// Doctor routes
	router.GET("/api/doctors/:username", server.GetDoctor)
	authRoutes.PUT("/doctors", server.UpdateDoctor)
	authRoutes.DELETE("/doctors/:username", server.DeleteDoctor)

	// Seller routes
	router.GET("/api/sellers/:username", server.GetSeller)
	authRoutes.PUT("/sellers", server.UpdateSeller)
	authRoutes.DELETE("/sellers/:username", server.DeleteSeller)

	// Medicine routes
	router.GET("/api/medicines/:id", server.GetMedicine)
	router.GET("/api/medicines/search", server.SearchMedicinesByNameSortedByPrice)
	router.GET("/api/sellers/:username/medicines", server.ListSellerMedicinesByExpiry)
	authRoutes.POST("/medicines", server.CreateMedicine)
	authRoutes.PUT("/medicines", server.UpdateMedicine)
	authRoutes.DELETE("/medicines/:id", server.DeleteMedicine)

	// Cart routes
	authRoutes.POST("/cart", server.AddToCart)
	authRoutes.GET("/cart", server.GetCartItems)
	authRoutes.PUT("/cart/:id", server.UpdateCartItem)
	authRoutes.DELETE("/cart/:id", server.DeleteCartItem)
	authRoutes.DELETE("/cart", server.ClearCart)
	authRoutes.GET("/cart/count", server.GetCartCount)

	// Aliza AI agent routes
	alizaRoutes := router.Group("/api/aliza")
	server.alizaHandler.RegisterRoutes(alizaRoutes)

	server.router = router
}

func (server *Server) Start(address string) error {
	// Start the medicine expiry checker in a background goroutine
	ctx := context.Background()
	server.expiryChecker.StartExpiryCheckScheduler(ctx)
	log.Printf("Medicine expiry checker scheduled to run")

	return server.router.Run(address)
}

func errorResponse(err error) gin.H {
	return gin.H{
		"error": gin.H{
			"message": err.Error(),
		},
	}
}
