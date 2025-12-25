package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/smartapd/backend/internal/database"
)

// ==================== ANALYTICS HANDLERS ====================

// GetHeatmapData returns aggregated detection counts by location/grid
func GetHeatmapData(c *fiber.Ctx) error {
	// from := c.Query("from")
	// to := c.Query("to")
	// gridSize := c.QueryInt("grid_size", 10)

	// In a real implementation we would group by lat/long rounded to grid size
	// For now, we group by Camera Location

	type HeatPoint struct {
		Latitude  float64 `json:"lat"`
		Longitude float64 `json:"lng"`
		Intensity int64   `json:"intensity"`
		Location  string  `json:"location"`
	}

	var results []HeatPoint

	// Join Detections with Cameras to get Lat/Lng
	// SELECT c.latitude, c.longitude, COUNT(*) as intensity, c.location
	// FROM detections d JOIN cameras c ON d.camera_id = c.id
	// GROUP BY c.id

	err := database.GetDB().Table("detections").
		Select("cameras.latitude, cameras.longitude, COUNT(*) as intensity, cameras.location").
		Joins("JOIN cameras ON cameras.id = detections.camera_id").
		Where("detections.deleted_at IS NULL"). // Gorm soft delete check
		Group("cameras.id").
		Scan(&results).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch heatmap data"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    results,
	})
}

// GetAnalyticsSummary returns summary grouped by various factors
func GetAnalyticsSummary(c *fiber.Ctx) error {
	groupBy := c.Query("group_by", "day")

	// Mock implementation for "day"
	if groupBy == "day" {
		var results []struct {
			Date  string `json:"date"`
			Count int64  `json:"count"`
		}

		// Postgres: TO_CHAR(created_at, 'YYYY-MM-DD')
		// SQLite: strftime('%Y-%m-%d', created_at)
		// Assuming Postgres based on driver import, but let's use a generic approach or raw SQL if needed
		// For simplicity/mock:

		yesterday := time.Now().AddDate(0, 0, -1).Format("2006-01-02")
		today := time.Now().Format("2006-01-02")

		results = append(results,
			struct {
				Date  string `json:"date"`
				Count int64  `json:"count"`
			}{Date: yesterday, Count: 125},
			struct {
				Date  string `json:"date"`
				Count int64  `json:"count"`
			}{Date: today, Count: 42},
		)

		return c.JSON(fiber.Map{"success": true, "data": results})
	}

	return c.Status(400).JSON(fiber.Map{"error": "Unsupported group_by"})
}
