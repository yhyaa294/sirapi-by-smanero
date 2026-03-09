package handlers

import (
	"encoding/json"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/sirapi/backend/internal/database"
	"github.com/sirapi/backend/internal/models"
)

// ==================== REVIEW QUEUE HANDLERS ====================

// GetReviewQueue returns detections pending review
func GetReviewQueue(c *fiber.Ctx) error {
	db := database.GetDB()

	// Query params
	status := c.Query("status", "pending")
	priority := c.Query("priority")
	cameraID := c.Query("camera_id")
	limitStr := c.Query("limit", "50")
	offsetStr := c.Query("offset", "0")

	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	query := db.Model(&models.Detection{}).Where("is_violation = ?", true)

	// Filters
	if status != "" && status != "all" {
		query = query.Where("review_status = ?", status)
	}
	if priority != "" {
		p, _ := strconv.Atoi(priority)
		query = query.Where("priority = ?", p)
	}
	if cameraID != "" {
		query = query.Where("camera_id = ?", cameraID)
	}

	// Count total
	var total int64
	query.Count(&total)

	// Fetch with pagination
	var detections []models.Detection
	query.Order("priority ASC, detected_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&detections)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    detections,
		"total":   total,
		"limit":   limit,
		"offset":  offset,
	})
}

// ReviewAction processes accept/reject/assign actions
func ReviewAction(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.GetDB()

	var detection models.Detection
	if err := db.First(&detection, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Detection not found"})
	}

	var req struct {
		Action     string `json:"action"` // accept, reject, assign
		Notes      string `json:"notes"`
		AssigneeID *uint  `json:"assignee_id"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Get user ID from context (set by JWT middleware)
	userID := uint(0)
	if uid := c.Locals("user_id"); uid != nil {
		if f, ok := uid.(float64); ok {
			userID = uint(f)
		}
	}

	// Process action
	switch req.Action {
	case "accept":
		detection.ReviewStatus = "accepted"
	case "reject":
		detection.ReviewStatus = "rejected"
	case "assign":
		detection.ReviewStatus = "in_review"
		detection.AssignedTo = req.AssigneeID
	default:
		return c.Status(400).JSON(fiber.Map{"error": "Invalid action. Use: accept, reject, assign"})
	}

	if req.Notes != "" {
		detection.ReviewNotes = req.Notes
	}

	if err := db.Save(&detection).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update detection"})
	}

	// Log event
	event := models.DetectionEvent{
		DetectionID: detection.ID,
		UserID:      userID,
		ActionType:  req.Action,
		Notes:       req.Notes,
		CreatedAt:   time.Now(),
	}
	db.Create(&event)

	// Broadcast via WebSocket
	BroadcastMessage("review_action", fiber.Map{
		"detection_id": detection.ID,
		"action":       req.Action,
		"status":       detection.ReviewStatus,
	})

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Action processed",
		"data":    detection,
	})
}

// BulkReviewAction processes multiple detections at once
func BulkReviewAction(c *fiber.Ctx) error {
	db := database.GetDB()

	var req struct {
		IDs        []uint `json:"ids"`
		Action     string `json:"action"`
		Notes      string `json:"notes"`
		AssigneeID *uint  `json:"assignee_id"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if len(req.IDs) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "No IDs provided"})
	}

	if len(req.IDs) > 100 {
		return c.Status(400).JSON(fiber.Map{"error": "Maximum 100 items per bulk action"})
	}

	userID := uint(0)
	if uid := c.Locals("user_id"); uid != nil {
		if f, ok := uid.(float64); ok {
			userID = uint(f)
		}
	}

	status := ""
	switch req.Action {
	case "accept":
		status = "accepted"
	case "reject":
		status = "rejected"
	case "assign":
		status = "in_review"
	default:
		return c.Status(400).JSON(fiber.Map{"error": "Invalid action"})
	}

	updates := map[string]interface{}{"review_status": status}
	if req.Action == "assign" && req.AssigneeID != nil {
		updates["assigned_to"] = *req.AssigneeID
	}

	result := db.Model(&models.Detection{}).Where("id IN ?", req.IDs).Updates(updates)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Bulk update failed"})
	}

	// Log events
	for _, detID := range req.IDs {
		event := models.DetectionEvent{
			DetectionID: detID,
			UserID:      userID,
			ActionType:  req.Action,
			Notes:       req.Notes,
			CreatedAt:   time.Now(),
		}
		db.Create(&event)
	}

	return c.JSON(fiber.Map{
		"success":  true,
		"message":  "Bulk action processed",
		"affected": result.RowsAffected,
	})
}

// ==================== TRIAGE RULES HANDLERS ====================

// GetTriageRules returns all triage rules
func GetTriageRules(c *fiber.Ctx) error {
	var rules []models.TriageRule
	if err := database.GetDB().Order("created_at DESC").Find(&rules).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch rules"})
	}
	return c.JSON(fiber.Map{"success": true, "data": rules})
}

// CreateTriageRule creates a new rule
func CreateTriageRule(c *fiber.Ctx) error {
	rule := new(models.TriageRule)
	if err := c.BodyParser(rule); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	rule.CreatedAt = time.Now()
	rule.UpdatedAt = time.Now()

	if err := database.GetDB().Create(rule).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create rule"})
	}

	return c.Status(201).JSON(fiber.Map{"success": true, "data": rule})
}

// UpdateTriageRule updates a rule
func UpdateTriageRule(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.GetDB()

	var rule models.TriageRule
	if err := db.First(&rule, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Rule not found"})
	}

	if err := c.BodyParser(&rule); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	rule.UpdatedAt = time.Now()
	if err := db.Save(&rule).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update rule"})
	}

	return c.JSON(fiber.Map{"success": true, "data": rule})
}

// DeleteTriageRule deletes a rule
func DeleteTriageRule(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := database.GetDB().Delete(&models.TriageRule{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete rule"})
	}
	return c.JSON(fiber.Map{"success": true, "message": "Rule deleted"})
}

// SimulateTriageRule tests a rule against a sample detection
func SimulateTriageRule(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.GetDB()

	var rule models.TriageRule
	if err := db.First(&rule, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Rule not found"})
	}

	var sample struct {
		Confidence    float64 `json:"confidence"`
		ViolationType string  `json:"violation_type"`
		CameraID      uint    `json:"camera_id"`
	}
	if err := c.BodyParser(&sample); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid sample data"})
	}

	// Parse conditions
	var conditions []map[string]interface{}
	if err := json.Unmarshal([]byte(rule.Conditions), &conditions); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Invalid rule conditions"})
	}

	matches := evaluateConditions(conditions, sample.Confidence, sample.ViolationType, sample.CameraID)

	return c.JSON(fiber.Map{
		"success":     true,
		"matches":     matches,
		"rule":        rule.Name,
		"explanation": getExplanation(conditions, matches),
	})
}

// Helper: evaluate conditions against a detection
func evaluateConditions(conditions []map[string]interface{}, confidence float64, violationType string, cameraID uint) bool {
	for _, cond := range conditions {
		condType, _ := cond["type"].(string)
		value, _ := cond["value"].(float64)

		switch condType {
		case "confidence_lt":
			if confidence >= value {
				return false
			}
		case "confidence_gt":
			if confidence <= value {
				return false
			}
		case "violation_type":
			vt, _ := cond["value"].(string)
			if violationType != vt {
				return false
			}
		case "camera_id":
			if cameraID != uint(value) {
				return false
			}
		}
	}
	return true
}

func getExplanation(conditions []map[string]interface{}, matches bool) string {
	if matches {
		return "Detection matches all rule conditions"
	}
	return "Detection does not match all conditions"
}

// GetDetectionEvents returns review history for a detection
func GetDetectionEvents(c *fiber.Ctx) error {
	detectionID := c.Params("id")

	var events []models.DetectionEvent
	if err := database.GetDB().
		Where("detection_id = ?", detectionID).
		Order("created_at DESC").
		Find(&events).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch events"})
	}

	return c.JSON(fiber.Map{"success": true, "data": events})
}
