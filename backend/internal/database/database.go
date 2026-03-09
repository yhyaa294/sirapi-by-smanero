package database

import (
	"log"
	"strings"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/sirapi/backend/internal/models"
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

	// Configure connection pool
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}

	// SetMaxIdleConns sets the maximum number of connections in the idle connection pool.
	sqlDB.SetMaxIdleConns(10)
	// SetMaxOpenConns sets the maximum number of open connections to the database.
	sqlDB.SetMaxOpenConns(100)
	// SetConnMaxLifetime sets the maximum amount of time a connection may be reused.
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("✅ Database connected successfully (Pool: 10/100)")

	// Auto migrate models
	if err := DB.AutoMigrate(
		&models.Detection{},
		&models.Alert{},
		&models.Camera{},
		&models.User{},
		&models.ReportSchedule{},
		&models.ReportLog{},
		&models.RefreshToken{},
		&models.TriageRule{},
		&models.DetectionEvent{},
		&models.AnnotationBacklog{},
		&models.Zone{},
		&models.LoginActivity{},
		&models.AuditLog{},
		&models.Session{},
		&models.SecuritySettings{},
		// Telegram models
		&models.TelegramChat{},
		&models.SentMessageLog{},
		&models.TelegramRegistration{},
		&models.TelegramSubscription{},
	); err != nil {
		return err
	}

	log.Println("✅ Database migrated successfully")
	return nil
}

func GetDB() *gorm.DB {
	return DB
}
