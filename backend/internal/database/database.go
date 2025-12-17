package database

import (
	"log"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/smartapd/backend/internal/models"
)

var DB *gorm.DB

func Connect(databaseURL string) error {
	var err error

	DB, err = gorm.Open(sqlite.Open(databaseURL), &gorm.Config{
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
