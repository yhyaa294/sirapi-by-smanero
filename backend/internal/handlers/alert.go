package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/smartapd/backend/internal/database"
	"github.com/smartapd/backend/internal/models"
)

// ==================== ALERT HANDLERS ====================

// GetAlerts returns all alerts with optional filters
func GetAlerts(c *fiber.Ctx) error {
	var alerts []models.Alert

	db := database.GetDB()
	query := db.Order("created_at DESC")

	// Optional filters
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if severity := c.Query("severity"); severity != "" {
		query = query.Where("severity = ?", severity)
	}
	if limit := c.QueryInt("limit", 50); limit > 0 {
		query = query.Limit(limit)
	}

	if err := query.Find(&alerts).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch alerts"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    alerts,
		"count":   len(alerts),
	})
}

// CreateAlert creates a new alert
func CreateAlert(c *fiber.Ctx) error {
	alert := new(models.Alert)

	if err := c.BodyParser(alert); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	alert.Status = "pending"

	if err := database.GetDB().Create(alert).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create alert"})
	}

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"data":    alert,
		"message": "Alert created successfully",
	})
}

// AcknowledgeAlert marks an alert as acknowledged
func AcknowledgeAlert(c *fiber.Ctx) error {
	id := c.Params("id")
	var alert models.Alert

	if err := database.GetDB().First(&alert, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Alert not found"})
	}

	now := time.Now()
	alert.Status = "acknowledged"
	alert.AcknowledgedAt = &now
	alert.AcknowledgedBy = c.Query("user", "system")

	if err := database.GetDB().Save(&alert).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to acknowledge alert"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    alert,
		"message": "Alert acknowledged successfully",
	})
}
