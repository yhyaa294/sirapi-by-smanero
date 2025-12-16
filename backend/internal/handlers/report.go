package handlers

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/smartapd/backend/internal/database"
	"github.com/smartapd/backend/internal/models"
)

// ==================== REPORT HANDLERS ====================

// GetDailyReport returns daily detection report
func GetDailyReport(c *fiber.Ctx) error {
	dateStr := c.Query("date", time.Now().Format("2006-01-02"))

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid date format. Use YYYY-MM-DD"})
	}

	db := database.GetDB()
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.Local)
	endOfDay := startOfDay.Add(24 * time.Hour)

	var totalDetections, totalViolations int64
	db.Model(&models.Detection{}).
		Where("detected_at >= ? AND detected_at < ?", startOfDay, endOfDay).
		Count(&totalDetections)
	db.Model(&models.Detection{}).
		Where("detected_at >= ? AND detected_at < ? AND is_violation = ?", startOfDay, endOfDay, true).
		Count(&totalViolations)

	complianceRate := float64(0)
	if totalDetections > 0 {
		complianceRate = float64(totalDetections-totalViolations) / float64(totalDetections) * 100
	}

	// Hourly breakdown
	var hourlyData []models.HourlyData
	for hour := 0; hour < 24; hour++ {
		hourStart := startOfDay.Add(time.Duration(hour) * time.Hour)
		hourEnd := hourStart.Add(time.Hour)

		var detections, violations int64
		db.Model(&models.Detection{}).
			Where("detected_at >= ? AND detected_at < ?", hourStart, hourEnd).
			Count(&detections)
		db.Model(&models.Detection{}).
			Where("detected_at >= ? AND detected_at < ? AND is_violation = ?", hourStart, hourEnd, true).
			Count(&violations)

		hourlyData = append(hourlyData, models.HourlyData{
			Hour:       hour,
			Detections: int(detections),
			Violations: int(violations),
		})
	}

	// Top violation locations
	var topLocations []models.LocationData
	var locationResults []struct {
		Location string
		Count    int64
	}
	db.Model(&models.Detection{}).
		Select("location, count(*) as count").
		Where("detected_at >= ? AND detected_at < ? AND is_violation = ?", startOfDay, endOfDay, true).
		Group("location").
		Order("count DESC").
		Limit(5).
		Scan(&locationResults)

	for _, loc := range locationResults {
		riskScore := int(loc.Count * 10) // Simple risk calculation
		if riskScore > 100 {
			riskScore = 100
		}
		topLocations = append(topLocations, models.LocationData{
			Location:   loc.Location,
			Violations: int(loc.Count),
			RiskScore:  riskScore,
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": models.DailyReport{
			Date:            dateStr,
			TotalDetections: int(totalDetections),
			TotalViolations: int(totalViolations),
			ComplianceRate:  complianceRate,
			HourlyBreakdown: hourlyData,
			TopLocations:    topLocations,
		},
	})
}

// GetWeeklyReport returns weekly detection report
func GetWeeklyReport(c *fiber.Ctx) error {
	db := database.GetDB()

	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -7)

	var totalDetections, totalViolations int64
	db.Model(&models.Detection{}).
		Where("detected_at >= ? AND detected_at <= ?", startDate, endDate).
		Count(&totalDetections)
	db.Model(&models.Detection{}).
		Where("detected_at >= ? AND detected_at <= ? AND is_violation = ?", startDate, endDate, true).
		Count(&totalViolations)

	complianceRate := float64(0)
	if totalDetections > 0 {
		complianceRate = float64(totalDetections-totalViolations) / float64(totalDetections) * 100
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"start_date":       startDate.Format("2006-01-02"),
			"end_date":         endDate.Format("2006-01-02"),
			"total_detections": totalDetections,
			"total_violations": totalViolations,
			"compliance_rate":  fmt.Sprintf("%.2f%%", complianceRate),
		},
	})
}

// ExportReport exports report data (placeholder)
func ExportReport(c *fiber.Ctx) error {
	format := c.Query("format", "json")

	// For now, just return JSON
	// TODO: Add CSV/PDF export
	return c.JSON(fiber.Map{
		"success": true,
		"message": fmt.Sprintf("Export in %s format - Coming soon", format),
	})
}
