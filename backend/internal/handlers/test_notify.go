package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/smartapd/backend/internal/services"
)

// TestNotifyRequest represents the request body for test notification
type TestNotifyRequest struct {
	DetectionID   uint    `json:"detection_id"`
	CameraID      uint    `json:"camera_id"`
	ViolationType string  `json:"violation_type"`
	Location      string  `json:"location"`
	Confidence    float64 `json:"confidence"`
	ImagePath     string  `json:"image_path,omitempty"`
	Severity      string  `json:"severity,omitempty"`
}

// TestNotify handles POST /api/v1/test/notify
// Purpose: Accept sample detection JSON and push notification task to queue
func TestNotify(c *fiber.Ctx) error {
	var req TestNotifyRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if req.DetectionID == 0 || req.ViolationType == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "detection_id and violation_type are required",
		})
	}

	// Set defaults
	if req.Location == "" {
		req.Location = "Unknown Location"
	}
	if req.Severity == "" {
		req.Severity = "medium"
	}
	if req.Confidence == 0 {
		req.Confidence = 0.8
	}

	// Enqueue notification task
	queue := services.GetNotificationQueue()
	err := queue.EnqueueFromDetection(
		req.DetectionID,
		req.CameraID,
		req.ViolationType,
		req.Location,
		req.Confidence,
		req.ImagePath,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to queue notification",
		})
	}

	return c.Status(fiber.StatusAccepted).JSON(fiber.Map{
		"message":      "Notification queued",
		"detection_id": req.DetectionID,
	})
}
