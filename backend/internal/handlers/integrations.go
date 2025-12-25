package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/smartapd/backend/internal/database"
	"github.com/smartapd/backend/internal/models"
)

// ==================== INTEGRATION HANDLERS ====================

// GetIntegrations returns all integrations
func GetIntegrations(c *fiber.Ctx) error {
	var integrations []models.Integration
	if err := database.GetDB().Find(&integrations).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch integrations"})
	}
	return c.JSON(fiber.Map{"success": true, "data": integrations})
}

// CreateIntegration creates a new integration
func CreateIntegration(c *fiber.Ctx) error {
	integration := new(models.Integration)
	if err := c.BodyParser(integration); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
	}

	if err := database.GetDB().Create(integration).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create integration"})
	}

	return c.Status(201).JSON(fiber.Map{"success": true, "data": integration})
}

// UpdateIntegration updates an existing integration
func UpdateIntegration(c *fiber.Ctx) error {
	id := c.Params("id")
	integration := new(models.Integration)

	if err := database.GetDB().First(integration, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Integration not found"})
	}

	if err := c.BodyParser(integration); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
	}

	if err := database.GetDB().Save(integration).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update integration"})
	}

	return c.JSON(fiber.Map{"success": true, "data": integration})
}

// DeleteIntegration deletes an integration
func DeleteIntegration(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := database.GetDB().Delete(&models.Integration{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete integration"})
	}
	return c.JSON(fiber.Map{"success": true})
}

// TestIntegration sends a test payload
func TestIntegration(c *fiber.Ctx) error {
	id := c.Params("id")
	var integration models.Integration
	if err := database.GetDB().First(&integration, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Integration not found"})
	}

	if integration.Type == "webhook" {
		// Parse Config
		var config struct {
			URL string `json:"url"`
		}
		if err := json.Unmarshal([]byte(integration.Config), &config); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid config"})
		}

		// Send Test Payload with Retries (Simple Logic)
		payload := map[string]string{
			"event":     "test_ping",
			"message":   "This is a test from SmartAPD",
			"timestamp": time.Now().Format(time.RFC3339),
		}

		// Simple retry loop (3 times)
		var lastErr error
		for i := 0; i < 3; i++ {
			jsonPayload, _ := json.Marshal(payload)
			resp, err := http.Post(config.URL, "application/json", bytes.NewReader(jsonPayload))
			if err == nil {
				defer resp.Body.Close()
				if resp.StatusCode >= 200 && resp.StatusCode < 300 {
					return c.JSON(fiber.Map{"success": true, "message": "Webhook test successful"})
				}
				lastErr = fmt.Errorf("Status %d", resp.StatusCode)
			} else {
				lastErr = err
			}
			time.Sleep(1 * time.Second) // Backoff
		}

		return c.Status(502).JSON(fiber.Map{"error": fmt.Sprintf("Webhook delivery failed after retries: %v", lastErr)})

	} else if integration.Type == "slack" {
		// Mock Slack
		return c.JSON(fiber.Map{"success": true, "message": "Slack test successful (Mock)"})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Test triggered"})
}
