package mail

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"math"
	"time"

	db "github.com/pawaspy/MediBridge/db/sqlc"
	"github.com/pawaspy/MediBridge/util"
)

// ExpiryChecker manages the process of checking medicine expiry dates
type ExpiryChecker struct {
	store  db.Store
	mailer *Mailer
	config util.Config
}

// NewExpiryChecker creates a new ExpiryChecker
func NewExpiryChecker(store db.Store, mailer *Mailer, config util.Config) *ExpiryChecker {
	return &ExpiryChecker{
		store:  store,
		mailer: mailer,
		config: config,
	}
}

// StartExpiryCheckScheduler schedules the daily expiry check job
func (e *ExpiryChecker) StartExpiryCheckScheduler(ctx context.Context) {
	// Run immediately on startup
	e.CheckExpiry(ctx)

	// Set up periodic check
	ticker := time.NewTicker(e.config.ExpiryCheckPeriod)
	go func() {
		for {
			select {
			case <-ticker.C:
				e.CheckExpiry(ctx)
			case <-ctx.Done():
				ticker.Stop()
				return
			}
		}
	}()
}

// CheckExpiry checks for expiring and expired medicines
func (e *ExpiryChecker) CheckExpiry(ctx context.Context) {
	log.Println("Starting medicine expiry check...")

	// Get all medicines
	medicines, err := e.getAllMedicines(ctx)
	if err != nil {
		log.Printf("Error getting medicines: %v", err)
		return
	}

	now := time.Now()
	var expiringCount, expiredCount int

	// Process each medicine
	for _, medicine := range medicines {
		if !medicine.ExpiryDate.Valid {
			continue
		}

		expiryDate := medicine.ExpiryDate.Time
		daysUntilExpiry := int(math.Ceil(expiryDate.Sub(now).Hours() / 24))

		// Get seller information
		seller, err := e.store.GetSellerByName(ctx, medicine.SellerUsername)
		if err != nil {
			log.Printf("Error getting seller %s: %v", medicine.SellerUsername, err)
			continue
		}

		// Handle expired medicines
		if expiryDate.Before(now) {
			daysSinceExpiry := int(math.Ceil(now.Sub(expiryDate).Hours() / 24))
			err = e.handleExpiredMedicine(ctx, medicine, seller, daysSinceExpiry)
			if err != nil {
				log.Printf("Error handling expired medicine %d: %v", medicine.ID, err)
			} else {
				expiredCount++
			}
			continue
		}

		// Handle medicines expiring within 180 days
		if daysUntilExpiry <= 180 && daysUntilExpiry >= 0 {
			err = e.handleExpiringMedicine(medicine, seller, daysUntilExpiry)
			if err != nil {
				log.Printf("Error handling expiring medicine %d: %v", medicine.ID, err)
			} else {
				expiringCount++
			}
		}
	}

	log.Printf("Expiry check completed. Processed %d expiring and %d expired medicines.", expiringCount, expiredCount)
}

// getAllMedicines retrieves all medicines from the database
func (e *ExpiryChecker) getAllMedicines(ctx context.Context) ([]db.Medicine, error) {
	return e.store.ListAllMedicines(ctx)
}

// handleExpiringMedicine handles medicines that will expire soon
func (e *ExpiryChecker) handleExpiringMedicine(medicine db.Medicine, seller db.Seller, daysUntilExpiry int) error {
	// Convert numeric price to string
	price := "0.00"
	if medicine.Price.Valid {
		var priceFloat float64
		err := medicine.Price.Scan(&priceFloat)
		if err == nil {
			price = fmt.Sprintf("%.2f", priceFloat)
		}
	}

	// Send email notification
	err := e.mailer.SendExpiringMedicineEmail(
		seller.Email,
		seller.FullName,
		medicine.ID,
		medicine.Name,
		price,
		medicine.Quantity,
		medicine.ExpiryDate.Time,
		daysUntilExpiry,
	)
	if err != nil {
		return fmt.Errorf("failed to send expiring medicine email: %w", err)
	}

	log.Printf("Sent expiring medicine notification for %s (ID: %d) to %s",
		medicine.Name, medicine.ID, seller.Email)
	return nil
}

// handleExpiredMedicine handles medicines that have already expired
func (e *ExpiryChecker) handleExpiredMedicine(ctx context.Context, medicine db.Medicine, seller db.Seller, daysSinceExpiry int) error {
	// Send email notification
	err := e.mailer.SendExpiredMedicineEmail(
		seller.Email,
		seller.FullName,
		medicine.ID,
		medicine.Name,
		medicine.Quantity,
		medicine.ExpiryDate.Time,
		daysSinceExpiry,
	)
	if err != nil {
		return fmt.Errorf("failed to send expired medicine email: %w", err)
	}

	// Delete the expired medicine
	_, err = e.store.DeleteMedicine(ctx, medicine.ID)
	if err != nil && err != sql.ErrNoRows {
		return fmt.Errorf("failed to delete expired medicine: %w", err)
	}

	log.Printf("Deleted expired medicine %s (ID: %d) and notified seller %s",
		medicine.Name, medicine.ID, seller.Email)
	return nil
}
