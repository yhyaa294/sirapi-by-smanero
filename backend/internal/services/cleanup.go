package services

import (
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/sirapi/backend/internal/database"
	"github.com/sirapi/backend/internal/models"
)

type CleanupService struct {
	RetentionDays int
	StoragePath   string
}

func NewCleanupService() *CleanupService {
	// 30 days retention policy
	return &CleanupService{
		RetentionDays: 30,
		StoragePath:   "./uploads/detections", // Adjust as necessary
	}
}

func (s *CleanupService) Start() {
	// Run cleanup daily
	ticker := time.NewTicker(24 * time.Hour)
	go func() {
		for range ticker.C {
			s.PerformCleanup()
		}
	}()

	// Run once on startup
	go s.PerformCleanup()
}

func (s *CleanupService) PerformCleanup() {
	log.Println("🧹 Starting scheduled cleanup job...")

	cutoff := time.Now().AddDate(0, 0, -s.RetentionDays)

	// 1. Clean up database records (soft delete or hard delete depending on policy)
	// For privacy, we likely want to nullify image paths or delete records

	// Find old detections
	var detections []models.Detection
	result := database.GetDB().Where("created_at < ?", cutoff).Find(&detections) // Changed timestamp to created_at
	if result.Error != nil {
		log.Printf("❌ Failed to query old records: %v", result.Error)
		return
	}

	count := 0
	for _, d := range detections {
		// Delete image file if exists
		if d.ImagePath != "" {
			// Assuming ImagePath is relative path or we can construct it
			// This needs careful path handling in production
			// For this example, we assume ImagePath stores filename or relative path

			// Safety check: ensure we don't traverse up
			cleanPath := filepath.Clean(d.ImagePath)
			if cleanPath == "." || cleanPath == "/" {
				continue
			}

			fullPath := filepath.Join(".", cleanPath) // Adjust base path

			// Remove file
			if err := os.Remove(fullPath); err == nil {
				count++
			}
		}
	}

	// Optional: Delete records from DB or update them
	// database.GetDB().Where("created_at < ?", cutoff).Delete(&models.Detection{})

	log.Printf("✅ Cleanup finished. Removed %d old images older than %d days.", count, s.RetentionDays)
}
