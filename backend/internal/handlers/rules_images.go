package handlers

import (
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/sirapi/backend/internal/database"
	"github.com/sirapi/backend/internal/models"
)

// ==================== ALERT RULE HANDLERS ====================

// GetAlertRules returns all alert rules
func GetAlertRules(c *fiber.Ctx) error {
	var rules []models.AlertRule
	if err := database.GetDB().Find(&rules).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch rules"})
	}
	return c.JSON(fiber.Map{"success": true, "data": rules})
}

// CreateAlertRule creates a new rule
func CreateAlertRule(c *fiber.Ctx) error {
	rule := new(models.AlertRule)
	if err := c.BodyParser(rule); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
	}

	if err := database.GetDB().Create(rule).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create rule"})
	}

	return c.Status(201).JSON(fiber.Map{"success": true, "data": rule})
}

// DeleteAlertRule deletes a rule
func DeleteAlertRule(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := database.GetDB().Delete(&models.AlertRule{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete rule"})
	}
	return c.JSON(fiber.Map{"success": true})
}

// SimulateRule tests a rule against a sample payload
func SimulateRule(c *fiber.Ctx) error {
	type SimulationRequest struct {
		Rule   models.AlertRule `json:"rule"`
		Sample models.Detection `json:"sample"`
	}

	var req SimulationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
	}

	// Simple logic simulation
	triggered := false
	reason := "Condition not met"

	// Mock logic for demonstration
	if req.Rule.Condition == "always" {
		triggered = true
		reason = "Condition 'always' matched"
	} else if req.Rule.Condition == "confidence_gt" {
		if req.Sample.Confidence*100 > float64(req.Rule.Threshold) {
			triggered = true
			reason = fmt.Sprintf("Confidence %.2f > %d", req.Sample.Confidence*100, req.Rule.Threshold)
		}
	} else if req.Rule.Condition == "violation_type" {
		if strings.Contains(req.Sample.ViolationType, "no_") {
			triggered = true
			reason = "Violation detected"
		}
	}

	return c.JSON(fiber.Map{
		"success":   true,
		"triggered": triggered,
		"reason":    reason,
	})
}

// ==================== IMAGE HANDLERS ====================

// GetBlurredImage proxies the request to the AI Engine to blur faces
func GetBlurredImage(c *fiber.Ctx) error {
	id := c.Params("id")
	level := c.Query("level", "5")

	// 1. Get detection to find image path (Optional, or just pass ID/Filename if consistent)
	// Assuming ID is detection ID, we fetch detection first
	var detection models.Detection
	if err := database.GetDB().First(&detection, id).Error; err != nil {
		// If ID is not detection ID but filename, use it directly?
		// Stick to detection ID for safety and mapping
		return c.Status(404).JSON(fiber.Map{"error": "Detection not found"})
	}

	// Extract filename from path
	// path is like "data/screenshots/no_topi_....jpg"
	// Python expects just filename
	parts := strings.Split(detection.ImagePath, "\\")
	if len(parts) == 1 {
		parts = strings.Split(detection.ImagePath, "/")
	}
	filename := parts[len(parts)-1]

	// 2. Call AI Engine
	aiEngineURL := "http://localhost:8000/screenshots/" + filename + "/blur?level=" + level
	resp, err := http.Get(aiEngineURL)
	if err != nil {
		return c.Status(502).JSON(fiber.Map{"error": "AI Engine unavailable"})
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return c.Status(resp.StatusCode).JSON(fiber.Map{"error": "Failed to blur image"})
	}

	// 3. Stream back
	c.Set("Content-Type", "image/jpeg")
	// Copy stream
	_, err = io.Copy(c.Response().BodyWriter(), resp.Body)
	return err
}
