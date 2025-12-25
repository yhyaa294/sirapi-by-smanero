package handlers

import (
	"encoding/json"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/smartapd/backend/internal/database"
	"github.com/smartapd/backend/internal/models"
)

// ==================== LOGIN ACTIVITY ====================

// GetLoginActivity returns login history
func GetLoginActivity(c *fiber.Ctx) error {
	db := database.GetDB()

	limitStr := c.Query("limit", "50")
	offsetStr := c.Query("offset", "0")
	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	var activities []models.LoginActivity
	var total int64

	db.Model(&models.LoginActivity{}).Count(&total)
	db.Order("created_at DESC").Limit(limit).Offset(offset).Find(&activities)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    activities,
		"total":   total,
	})
}

// LogLoginActivity records a login attempt (called from auth handler)
func LogLoginActivity(userID *uint, email, ip, userAgent string, success bool, failReason string) {
	db := database.GetDB()
	activity := models.LoginActivity{
		UserID:     userID,
		Email:      email,
		IPAddress:  ip,
		UserAgent:  userAgent,
		Success:    success,
		FailReason: failReason,
		CreatedAt:  time.Now(),
	}
	db.Create(&activity)
}

// ==================== AUDIT LOG ====================

// GetAuditLog returns audit logs
func GetAuditLog(c *fiber.Ctx) error {
	db := database.GetDB()

	resource := c.Query("resource", "")
	action := c.Query("action", "")
	limitStr := c.Query("limit", "50")
	offsetStr := c.Query("offset", "0")
	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	query := db.Model(&models.AuditLog{})
	if resource != "" {
		query = query.Where("resource = ?", resource)
	}
	if action != "" {
		query = query.Where("action = ?", action)
	}

	var logs []models.AuditLog
	var total int64

	query.Count(&total)
	query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&logs)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    logs,
		"total":   total,
	})
}

// CreateAuditLog records an audit entry (called from other handlers)
func CreateAuditLog(userID uint, action, resource string, resourceID *uint, details interface{}, ip string) {
	db := database.GetDB()

	detailsJSON := ""
	if details != nil {
		if b, err := json.Marshal(details); err == nil {
			detailsJSON = string(b)
		}
	}

	log := models.AuditLog{
		UserID:     userID,
		Action:     action,
		Resource:   resource,
		ResourceID: resourceID,
		Details:    detailsJSON,
		IPAddress:  ip,
		CreatedAt:  time.Now(),
	}
	db.Create(&log)
}

// ==================== SESSION MANAGEMENT ====================

// GetActiveSessions returns active sessions for current user
func GetActiveSessions(c *fiber.Ctx) error {
	db := database.GetDB()

	// Get user ID from context
	userID := uint(0)
	if uid := c.Locals("user_id"); uid != nil {
		if f, ok := uid.(float64); ok {
			userID = uint(f)
		}
	}

	var sessions []models.Session
	db.Where("user_id = ? AND expires_at > ?", userID, time.Now()).
		Order("last_active DESC").
		Find(&sessions)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    sessions,
		"count":   len(sessions),
	})
}

// RevokeSession terminates a specific session
func RevokeSession(c *fiber.Ctx) error {
	sessionID := c.Params("id")
	db := database.GetDB()

	// Get user ID from context
	userID := uint(0)
	if uid := c.Locals("user_id"); uid != nil {
		if f, ok := uid.(float64); ok {
			userID = uint(f)
		}
	}

	result := db.Where("id = ? AND user_id = ?", sessionID, userID).Delete(&models.Session{})
	if result.RowsAffected == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Session not found"})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Session revoked"})
}

// RevokeAllSessions terminates all sessions except current
func RevokeAllSessions(c *fiber.Ctx) error {
	db := database.GetDB()

	userID := uint(0)
	if uid := c.Locals("user_id"); uid != nil {
		if f, ok := uid.(float64); ok {
			userID = uint(f)
		}
	}

	currentToken := c.Get("Authorization")
	if strings.HasPrefix(currentToken, "Bearer ") {
		currentToken = strings.TrimPrefix(currentToken, "Bearer ")
	}

	result := db.Where("user_id = ? AND token != ?", userID, currentToken).Delete(&models.Session{})

	return c.JSON(fiber.Map{
		"success": true,
		"message": "All other sessions revoked",
		"count":   result.RowsAffected,
	})
}

// ==================== SECURITY SETTINGS ====================

// GetSecuritySettings returns security configuration
func GetSecuritySettings(c *fiber.Ctx) error {
	db := database.GetDB()

	var settings models.SecuritySettings
	if err := db.First(&settings).Error; err != nil {
		// Create default settings if not exists
		settings = models.SecuritySettings{
			MaxLoginAttempts: 5,
			LockoutDuration:  15,
			SessionTimeout:   30,
			TwoFactorEnabled: false,
			UpdatedAt:        time.Now(),
		}
		db.Create(&settings)
	}

	return c.JSON(fiber.Map{"success": true, "data": settings})
}

// UpdateSecuritySettings updates security configuration
func UpdateSecuritySettings(c *fiber.Ctx) error {
	db := database.GetDB()

	var settings models.SecuritySettings
	if err := db.First(&settings).Error; err != nil {
		settings = models.SecuritySettings{ID: 1}
	}

	if err := c.BodyParser(&settings); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	settings.UpdatedAt = time.Now()
	if err := db.Save(&settings).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save settings"})
	}

	// Log audit
	userID := uint(0)
	if uid := c.Locals("user_id"); uid != nil {
		if f, ok := uid.(float64); ok {
			userID = uint(f)
		}
	}
	CreateAuditLog(userID, "update", "security_settings", nil, settings, c.IP())

	return c.JSON(fiber.Map{"success": true, "data": settings, "message": "Settings saved"})
}

// CheckIPWhitelist validates if IP is allowed (middleware helper)
func CheckIPWhitelist(ip string) bool {
	db := database.GetDB()
	var settings models.SecuritySettings
	if err := db.First(&settings).Error; err != nil || settings.IPWhitelist == "" {
		return true // No whitelist = allow all
	}

	whitelist := strings.Split(settings.IPWhitelist, ",")
	for _, allowed := range whitelist {
		if strings.TrimSpace(allowed) == ip {
			return true
		}
	}
	return false
}

// CheckLoginAttempts returns whether user is locked out
func CheckLoginAttempts(email string) (bool, int) {
	db := database.GetDB()

	var settings models.SecuritySettings
	if err := db.First(&settings).Error; err != nil {
		return false, 0 // No settings = no lockout
	}

	since := time.Now().Add(-time.Duration(settings.LockoutDuration) * time.Minute)
	var failedCount int64
	db.Model(&models.LoginActivity{}).
		Where("email = ? AND success = ? AND created_at > ?", email, false, since).
		Count(&failedCount)

	if int(failedCount) >= settings.MaxLoginAttempts {
		return true, settings.LockoutDuration
	}
	return false, 0
}
