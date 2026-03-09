package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/sirapi/backend/internal/database"
	"github.com/sirapi/backend/internal/models"
)

// ==================== ZONE HANDLERS ====================

// GetZones returns all zones
func GetZones(c *fiber.Ctx) error {
	var zones []models.Zone
	if err := database.GetDB().Order("name ASC").Find(&zones).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch zones"})
	}
	return c.JSON(fiber.Map{"success": true, "data": zones, "count": len(zones)})
}

// GetZone returns a single zone
func GetZone(c *fiber.Ctx) error {
	id := c.Params("id")
	var zone models.Zone
	if err := database.GetDB().First(&zone, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Zone not found"})
	}
	return c.JSON(fiber.Map{"success": true, "data": zone})
}

// CreateZone creates a new zone
func CreateZone(c *fiber.Ctx) error {
	zone := new(models.Zone)
	if err := c.BodyParser(zone); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	zone.CreatedAt = time.Now()
	zone.UpdatedAt = time.Now()

	if err := database.GetDB().Create(zone).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create zone"})
	}

	return c.Status(201).JSON(fiber.Map{"success": true, "data": zone, "message": "Zone created"})
}

// UpdateZone updates a zone
func UpdateZone(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.GetDB()

	var zone models.Zone
	if err := db.First(&zone, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Zone not found"})
	}

	if err := c.BodyParser(&zone); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	zone.UpdatedAt = time.Now()
	if err := db.Save(&zone).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update zone"})
	}

	return c.JSON(fiber.Map{"success": true, "data": zone, "message": "Zone updated"})
}

// DeleteZone deletes a zone
func DeleteZone(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := database.GetDB().Delete(&models.Zone{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete zone"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Zone deleted"})
}

// GetCamerasWithZones returns cameras with zone info
func GetCamerasWithZones(c *fiber.Ctx) error {
	var cameras []models.Camera
	if err := database.GetDB().Preload("Zone").Find(&cameras).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch cameras"})
	}
	return c.JSON(fiber.Map{"success": true, "data": cameras, "count": len(cameras)})
}
