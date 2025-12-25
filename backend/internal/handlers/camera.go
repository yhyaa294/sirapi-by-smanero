package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/smartapd/backend/internal/database"
	"github.com/smartapd/backend/internal/models"
)

// ==================== CAMERA HANDLERS ====================

// GetCameras returns all cameras
func GetCameras(c *fiber.Ctx) error {
	var cameras []models.Camera

	db := database.GetDB()
	query := db.Order("created_at DESC")

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if isActive := c.Query("active"); isActive != "" {
		query = query.Where("is_active = ?", isActive == "true")
	}

	if err := query.Find(&cameras).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch cameras"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    cameras,
		"count":   len(cameras),
	})
}

// GetCamera returns a single camera by ID
func GetCamera(c *fiber.Ctx) error {
	id := c.Params("id")
	var camera models.Camera

	if err := database.GetDB().First(&camera, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Camera not found"})
	}

	return c.JSON(fiber.Map{"success": true, "data": camera})
}

// CreateCamera creates a new camera
func CreateCamera(c *fiber.Ctx) error {
	camera := new(models.Camera)

	if err := c.BodyParser(camera); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	camera.Status = "offline"
	camera.IsActive = true

	if err := database.GetDB().Create(camera).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create camera"})
	}

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"data":    camera,
		"message": "Camera created successfully",
	})
}

// UpdateCamera updates a camera
func UpdateCamera(c *fiber.Ctx) error {
	id := c.Params("id")
	var camera models.Camera

	if err := database.GetDB().First(&camera, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Camera not found"})
	}

	if err := c.BodyParser(&camera); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := database.GetDB().Save(&camera).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update camera"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    camera,
		"message": "Camera updated successfully",
	})
}

// DeleteCamera deletes a camera
func DeleteCamera(c *fiber.Ctx) error {
	id := c.Params("id")
	var camera models.Camera

	if err := database.GetDB().First(&camera, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Camera not found"})
	}

	if err := database.GetDB().Delete(&camera).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete camera"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Camera deleted successfully",
	})
}

// ReconnectCamera triggers a camera reconnection process
func ReconnectCamera(c *fiber.Ctx) error {
	id := c.Params("id")
	var camera models.Camera

	if err := database.GetDB().First(&camera, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Camera not found"})
	}

	// Mock reconnection trigger
	camera.Status = "reconnecting"
	database.GetDB().Save(&camera)

	// Simulate async reconnection process
	go func() {
		// In a real system, this would trigger the AI Engine or RTSP client
		time.Sleep(3 * time.Second)

		// Update to online with fresh health metrics
		camera.Status = "online"
		now := time.Now()
		camera.LastSeen = &now
		camera.FPS = 25
		camera.Latency = 45 // mock latency
		database.GetDB().Save(&camera)
	}()

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Camera reconnection initiated",
		"data":    camera,
	})
}
