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
	router.GET("/api/patients/:username", server.GetPatient)
	router.POST("/api/loginpatient", server.loginPatient)
	authRoutes.PUT("/patients", server.UpdatePatient)
	authRoutes.DELETE("/patients/:username", server.DeletePatient)
	
	// Doctor
	router.POST("/api/doctors", server.CreateDoctor)
	router.GET("/api/doctors/:username", server.GetDoctor)
	router.POST("/api/logindoctor", server.loginDoctor)
	authRoutes.PUT("/doctors", server.UpdateDoctor)
	authRoutes.DELETE("/doctors/:username", server.DeleteDoctor)

	// Seller
	router.POST("/api/sellers", server.CreateSeller)
	router.GET("/api/sellers/:username", server.GetSeller)
	router.POST("/api/loginseller", server.loginSeller)
	authRoutes.PUT("/sellers", server.UpdateSeller)
	authRoutes.DELETE("/sellers/:username", server.DeleteSeller)

	// // Medicine
	// router.POST("/api/medicines", server.CreateMedicine)
	// router.GET("/api/medicines/:id", server.GetMedicine)
	// router.GET("/api/medicines", server.ListMedicines)
	// authRoutes.PUT("/medicines", server.UpdateMedicine)
	// authRoutes.DELETE("/medicines/:id", server.DeleteMedicine)
	
	// // Order
	// router.POST("/api/orders", server.CreateOrder)
	// router.GET("/api/orders/:id", server.GetOrder)
	// router.GET("/api/orders", server.ListOrders)
	// authRoutes.PUT("/orders", server.UpdateOrder)
	// authRoutes.DELETE("/orders/:id", server.DeleteOrder)

	// // Prescription
	// router.POST("/api/prescriptions", server.CreatePrescription)
	// router.GET("/api/prescriptions/:id", server.GetPrescription)
	// router.GET("/api/prescriptions", server.ListPrescriptions)
	// authRoutes.PUT("/prescriptions", server.UpdatePrescription)
	// authRoutes.DELETE("/prescriptions/:id", server.DeletePrescription)

	// // Cart
	// router.POST("/api/carts", server.CreateCart)
	// router.GET("/api/carts/:id", server.GetCart)
	// router.GET("/api/carts", server.ListCarts)
	// authRoutes.PUT("/carts", server.UpdateCart)
	// authRoutes.DELETE("/carts/:id", server.DeleteCart)

	// // Payment
	// router.POST("/api/payments", server.CreatePayment)
	// router.GET("/api/payments/:id", server.GetPayment)
	// router.GET("/api/payments", server.ListPayments)
	// authRoutes.PUT("/payments", server.UpdatePayment)
	// authRoutes.DELETE("/payments/:id", server.DeletePayment)
	// // Notification
	// router.POST("/api/notifications", server.CreateNotification)
	// router.GET("/api/notifications/:id", server.GetNotification)
	// router.GET("/api/notifications", server.ListNotifications)
	// authRoutes.PUT("/notifications", server.UpdateNotification)
	// authRoutes.DELETE("/notifications/:id", server.DeleteNotification)

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