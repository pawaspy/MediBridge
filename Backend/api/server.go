package api

import (
	"context"
	"fmt"
	"log"
	"net/http"
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

	// Add a debug endpoint for testing seller creation
	router.GET("/api/test/seller", func(c *gin.Context) {
		util.LogInfo("Test seller creation endpoint called")

		// Create a test seller with hardcoded values
		hashedPassword, err := util.HashPassword("testpassword")
		if err != nil {
			util.LogError("Failed to hash password: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": fmt.Sprintf("Failed to hash password: %v", err),
			})
			return
		}

		testSeller := db.CreateSellerParams{
			Username:          "test_seller_" + fmt.Sprint(time.Now().Unix()),
			FullName:          "Test Seller",
			Email:             "test" + fmt.Sprint(time.Now().Unix()) + "@example.com",
			Password:          hashedPassword,
			MobileNumber:      "1234567890",
			StoreName:         "Test Store",
			GstNumber:         "TEST123456",
			DrugLicenseNumber: "DL123456",
			SellerType:        "retail",
			StoreAddress:      "Test Address",
		}

		util.LogInfo("Creating test seller: %+v", testSeller)

		seller, err := server.store.CreateSeller(c, testSeller)
		if err != nil {
			util.LogError("Failed to create test seller: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": fmt.Sprintf("Failed to create test seller: %v", err),
			})
			return
		}

		util.LogInfo("Successfully created test seller")
		c.JSON(http.StatusOK, gin.H{
			"message": "Test seller created successfully",
			"seller":  seller,
		})
	})

	// Setup routes
	publicRoutes := router.Group("/api")
	authRoutes := router.Group("/api").Use(authMiddleware(server.tokenMaker))

	// Auth routes
	publicRoutes.POST("/patients", server.CreatePatient)
	publicRoutes.POST("/loginpatient", server.LoginPatient)
	publicRoutes.POST("/doctors", server.CreateDoctor)
	publicRoutes.POST("/logindoctor", server.LoginDoctor)
	publicRoutes.POST("/sellers", server.CreateSeller)
	publicRoutes.POST("/loginseller", server.LoginSeller)

	// Patient routes
	publicRoutes.GET("/patients/:username", server.GetPatient)
	authRoutes.PUT("/patients", server.UpdatePatient)
	authRoutes.DELETE("/patients/:username", server.DeletePatient)

	// Patient Profile routes
	publicRoutes.GET("/patient-profiles/:username", server.GetPatientProfile)
	authRoutes.POST("/patient-profiles", server.CreatePatientProfile)
	authRoutes.PUT("/patient-profiles", server.UpdatePatientProfile)
	authRoutes.DELETE("/patient-profiles/:username", server.DeletePatientProfile)
	authRoutes.GET("/patient-profiles", server.ListPatientProfiles)

	// Doctor routes
	publicRoutes.GET("/doctors/:username", server.GetDoctor)
	authRoutes.PUT("/doctors", server.UpdateDoctor)
	authRoutes.DELETE("/doctors/:username", server.DeleteDoctor)

	// Seller routes
	publicRoutes.GET("/sellers/:username", server.GetSeller)
	authRoutes.PUT("/sellers", server.UpdateSeller)
	authRoutes.DELETE("/sellers/:username", server.DeleteSeller)

	// Medicine routes
	publicRoutes.GET("/medicines/:id", server.GetMedicine)
	publicRoutes.GET("/medicines/search", server.SearchMedicinesByNameSortedByPrice)
	publicRoutes.GET("/sellers/:username/medicines", server.ListSellerMedicinesByExpiry)
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
	alizaRoutes := publicRoutes.Group("/aliza")
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
