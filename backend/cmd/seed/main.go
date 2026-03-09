package main

import (
	"log"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"

	"github.com/sirapi/backend/internal/config"
	"github.com/sirapi/backend/internal/database"
	"github.com/sirapi/backend/internal/models"
)

func main() {
	// Load .env
	if err := godotenv.Load("../../.env"); err != nil {
		log.Println("⚠️  No .env file found in ../../.env (trying current dir or skipped)")
	}

	// Connect DB
	cfg := config.Load()
	if err := database.Connect(cfg.DatabaseURL); err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}

	// Create User
	password := "admin123"
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("❌ Failed to hash password: %v", err)
	}

	admin := models.User{
		Email:        "admin@sirapi.id",
		Name:         "Administrator",
		Role:         "admin",
		PasswordHash: string(hash),
		IsActive:     true,
		AvatarURL:    "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff",
	}

	// Upsert based on email
	var existing models.User
	if err := database.DB.Where("email = ?", admin.Email).First(&existing).Error; err == nil {
		log.Printf("ℹ️  User %s already exists. Updating password...", admin.Email)
		existing.PasswordHash = admin.PasswordHash
		existing.IsActive = true
		if err := database.DB.Save(&existing).Error; err != nil {
			log.Fatalf("❌ Failed to update user: %v", err)
		}
		log.Println("✅ Admin user updated successfully!")
	} else {
		if err := database.DB.Create(&admin).Error; err != nil {
			log.Fatalf("❌ Failed to create user: %v", err)
		}
		log.Println("✅ Admin user created successfully!")
	}
}
