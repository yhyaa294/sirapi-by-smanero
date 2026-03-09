package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/sirapi/backend/internal/database"
	"github.com/sirapi/backend/internal/models"
	"github.com/sirapi/backend/internal/services"
)

// ==================== DETECTION HANDLERS ====================

type DetectionHandler struct {
	service *services.DetectionService
}

func NewDetectionHandler(service *services.DetectionService) *DetectionHandler {
	return &DetectionHandler{
		service: service,
	}
}

// GetDetections returns all detections with optional filters
func (h *DetectionHandler) GetDetections(c *fiber.Ctx) error {
	var detections []models.Detection

	db := database.GetDB()
	query := db.Order("created_at DESC")

	// Optional filters
	if cameraID := c.Query("camera_id"); cameraID != "" {
		query = query.Where("camera_id = ?", cameraID)
	}
	if violationType := c.Query("type"); violationType != "" {
		query = query.Where("violation_type = ?", violationType)
	}
	if limit := c.QueryInt("limit", 50); limit > 0 {
		query = query.Limit(limit)
	}

	if err := query.Find(&detections).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch detections"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    detections,
		"count":   len(detections),
	})
}

// GetDetection returns a single detection by ID
func (h *DetectionHandler) GetDetection(c *fiber.Ctx) error {
	id := c.Params("id")
	var detection models.Detection

	if err := database.GetDB().First(&detection, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Detection not found"})
	}

	return c.JSON(fiber.Map{"success": true, "data": detection})
}

// CreateDetection creates a new detection record
func (h *DetectionHandler) CreateDetection(c *fiber.Ctx) error {
	detection := new(models.Detection)

	if err := c.BodyParser(detection); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// SECURITY: Input Validation
	if detection.CameraID == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid camera_id"})
	}
	if detection.Confidence < 0 || detection.Confidence > 1 {
		return c.Status(400).JSON(fiber.Map{"error": "Confidence must be between 0 and 1"})
	}
	if detection.ViolationType == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Violation type is required"})
	}

	detection.DetectedAt = time.Now()

	// Use service to process detection (handles alerts, stats, db save)
	if err := h.service.ProcessNewDetection(detection); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to process detection"})
	}

	// Broadcast to WebSocket clients
	BroadcastDetection(detection)

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"data":    detection,
		"message": "Detection processed successfully",
	})
}

// GetDetectionStats returns detection statistics
func (h *DetectionHandler) GetDetectionStats(c *fiber.Ctx) error {
	// Use cached stats from service
	stats := h.service.GetTodayStats()
	complianceRate := h.service.GetComplianceRate()

	// Use DB for breakdown if needed, or implement in service.
	// For now, keeping the DB query for breakdown as service only caches totals.
	db := database.GetDB()

	var results []struct {
		ViolationType string
		Count         int64
	}
	db.Model(&models.Detection{}).
		Select("violation_type, count(*) as count").
		Where("is_violation = ?", true).
		Group("violation_type").
		Scan(&results)

	byType := make(map[string]int64)
	for _, r := range results {
		byType[r.ViolationType] = r.Count
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": models.DetectionStats{
			TotalDetections: stats.TotalToday,
			TotalViolations: stats.ViolationsToday,
			ComplianceRate:  complianceRate,
			ByViolationType: byType,
		},
	})
}

// DeleteDetection deletes a detection record by ID
func (h *DetectionHandler) DeleteDetection(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.GetDB()

	var detection models.Detection
	// Check if exists first
	if err := db.First(&detection, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Detection not found"})
	}

	// Delete record
	if err := db.Delete(&detection).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete detection"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Detection deleted successfully",
		"id":      id,
	})
}
