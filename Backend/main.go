package main

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pawaspy/MediBridge/api"
	db "github.com/pawaspy/MediBridge/db/sqlc"
	"github.com/pawaspy/MediBridge/util"
)

func main() {
	// Load configuration
	config, err := util.LoadConfig(".")
	if err != nil {
		log.Fatalf("cannot load config: %v", err)
	}

	// Connect to database
	connPool, err := pgxpool.New(context.Background(), config.DBSource)
	if err != nil {
		log.Fatalf("cannot connect to database: %v", err)
	}
	defer connPool.Close()

	// Create stores
	store := db.NewStore(connPool)

	// // Create email sender
	// emailSender := mail.NewSMTPSender(mail.SMTPConfig{
	// 	Host:     config.SMTPHost,
	// 	Port:     config.SMTPPort,
	// 	Username: config.SMTPUsername,
	// 	Password: config.SMTPPassword,
	// 	FromName: config.SenderName,
	// 	FromAddr: config.SenderEmail,
	// })

	// // Create and start expiry notifier
	// expiryNotifier := mail.NewExpiryNotifier(store, emailSender)
	// go expiryNotifier.StartPeriodicChecks(config.ExpiryCheckPeriod)

	// Start API server
	server, err := api.NewServer(config, store)
	if err != nil {
		log.Fatalf("cannot create server: %v", err)
	}

	err = server.Start(config.HTTPAddress)
	if err != nil {
		log.Fatalf("cannot start server: %v", err)
	}
}
