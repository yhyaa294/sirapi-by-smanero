package database

import (
	"log"
	"strings"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/smartapd/backend/internal/models"
)

var DB *gorm.DB

func Connect(databaseURL string) error {
	var err error
	var dialector gorm.Dialector

	if strings.HasPrefix(databaseURL, "postgres") {
		dialector = postgres.Open(databaseURL)
	} else {
		dialector = sqlite.Open(databaseURL)
	}

	DB, err = gorm.Open(dialector, &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return err
	}

	log.Println("✅ Database connected successfully")

	// Auto migrate models
	if err := DB.AutoMigrate(
		&models.Detection{},
		&models.Alert{},
		&models.Camera{},
		&models.User{},
	); err != nil {
		return err
	}

	log.Println("✅ Database migrated successfully")
	return nil
}

func GetDB() *gorm.DB {
	return DB
}
