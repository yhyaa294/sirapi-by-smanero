package handlers

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/sirapi/backend/internal/database"
	"github.com/sirapi/backend/internal/models"
)

// ==================== DASHBOARD HANDLERS ====================

// GetDashboards returns user's dashboards
func GetDashboards(c *fiber.Ctx) error {
	var dashboards []models.Dashboard
	// In real auth, filter by owner_id. Here return all for demo.
	if err := database.GetDB().Find(&dashboards).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch dashboards"})
	}
	return c.JSON(fiber.Map{"success": true, "data": dashboards})
}

// GetDashboard returns a specific dashboard
func GetDashboard(c *fiber.Ctx) error {
	id := c.Params("id")
	var dashboard models.Dashboard
	if err := database.GetDB().First(&dashboard, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Dashboard not found"})
	}
	return c.JSON(fiber.Map{"success": true, "data": dashboard})
}

// CreateDashboard creates a new dashboard
func CreateDashboard(c *fiber.Ctx) error {
	dashboard := new(models.Dashboard)
	if err := c.BodyParser(dashboard); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
	}

	// Set default owner 1 for now
	dashboard.OwnerID = 1

	if err := database.GetDB().Create(dashboard).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save dashboard"})
	}

	return c.Status(201).JSON(fiber.Map{"success": true, "data": dashboard})
}

// ==================== REPORT SCHEDULE HANDLERS ====================

// ScheduleReport creates a job to run reports
func ScheduleReport(c *fiber.Ctx) error {
	schedule := new(models.ReportSchedule)
	if err := c.BodyParser(schedule); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
	}

	if err := database.GetDB().Create(schedule).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to schedule report"})
	}

	// Trigger worker logic (Stub)
	go func() {
		log.Printf("📅 New Report Schedule Created: ID %d, Cron: %s", schedule.ID, schedule.CronExpression)
		// Here we would add to a Cron runner (robfig/cron)
	}()

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Report scheduled successfully",
		"data":    schedule,
	})
}
