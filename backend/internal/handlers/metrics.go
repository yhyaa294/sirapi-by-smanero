package handlers

import (
	"context"
	"fmt"
	"runtime"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/smartapd/backend/internal/database"
	"github.com/smartapd/backend/internal/models"
)

// MetricsSummary returns JSON metrics for frontend widgets
func MetricsSummary(c *fiber.Ctx) error {
	db := database.GetDB()

	// Get counts
	var cameraTotal, cameraOnline int64
	db.Model(&models.Camera{}).Count(&cameraTotal)
	db.Model(&models.Camera{}).Where("status = ?", "online").Count(&cameraOnline)

	var detectionTotal, violationTotal int64
	db.Model(&models.Detection{}).Count(&detectionTotal)
	db.Model(&models.Detection{}).Where("is_violation = ?", true).Count(&violationTotal)

	today := time.Now().Truncate(24 * time.Hour)
	var detectionsToday, violationsToday int64
	db.Model(&models.Detection{}).Where("detected_at >= ?", today).Count(&detectionsToday)
	db.Model(&models.Detection{}).Where("is_violation = ? AND detected_at >= ?", true, today).Count(&violationsToday)

	// Review queue
	var pendingReviews int64
	db.Model(&models.Detection{}).Where("review_status = ?", "pending").Count(&pendingReviews)

	// Memory stats
	var memStats runtime.MemStats
	runtime.ReadMemStats(&memStats)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"cameras": fiber.Map{
				"total":  cameraTotal,
				"online": cameraOnline,
			},
			"detections": fiber.Map{
				"total":            detectionTotal,
				"violations":       violationTotal,
				"today":            detectionsToday,
				"violations_today": violationsToday,
			},
			"review_queue": fiber.Map{
				"pending": pendingReviews,
			},
			"system": fiber.Map{
				"uptime_seconds": time.Since(startTime).Seconds(),
				"memory_mb":      memStats.Alloc / 1024 / 1024,
				"goroutines":     runtime.NumGoroutine(),
			},
			"timestamp": time.Now().Format(time.RFC3339),
		},
	})
}

var startTime = time.Now()

// PrometheusMetrics returns Prometheus-format metrics
func PrometheusMetrics(c *fiber.Ctx) error {
	db := database.GetDB()

	var cameraTotal, cameraOnline int64
	db.Model(&models.Camera{}).Count(&cameraTotal)
	db.Model(&models.Camera{}).Where("status = ?", "online").Count(&cameraOnline)

	var detectionTotal, violationTotal int64
	db.Model(&models.Detection{}).Count(&detectionTotal)
	db.Model(&models.Detection{}).Where("is_violation = ?", true).Count(&violationTotal)

	var pendingReviews int64
	db.Model(&models.Detection{}).Where("review_status = ?", "pending").Count(&pendingReviews)

	var memStats runtime.MemStats
	runtime.ReadMemStats(&memStats)

	metrics := `# HELP smartapd_cameras_total Total number of cameras
# TYPE smartapd_cameras_total gauge
smartapd_cameras_total ` + formatInt(cameraTotal) + `
# HELP smartapd_cameras_online Number of online cameras
# TYPE smartapd_cameras_online gauge
smartapd_cameras_online ` + formatInt(cameraOnline) + `
# HELP smartapd_detections_total Total number of detections
# TYPE smartapd_detections_total counter
smartapd_detections_total ` + formatInt(detectionTotal) + `
# HELP smartapd_violations_total Total number of violations
# TYPE smartapd_violations_total counter
smartapd_violations_total ` + formatInt(violationTotal) + `
# HELP smartapd_review_queue_pending Pending items in review queue
# TYPE smartapd_review_queue_pending gauge
smartapd_review_queue_pending ` + formatInt(pendingReviews) + `
# HELP smartapd_uptime_seconds Uptime in seconds
# TYPE smartapd_uptime_seconds gauge
smartapd_uptime_seconds ` + formatFloat(time.Since(startTime).Seconds()) + `
# HELP smartapd_memory_bytes Memory usage in bytes
# TYPE smartapd_memory_bytes gauge
smartapd_memory_bytes ` + formatUint(memStats.Alloc) + `
# HELP smartapd_goroutines Number of goroutines
# TYPE smartapd_goroutines gauge
smartapd_goroutines ` + formatInt(int64(runtime.NumGoroutine())) + `
`
	c.Set("Content-Type", "text/plain; version=0.0.4; charset=utf-8")
	return c.SendString(metrics)
}

func formatInt(v int64) string {
	return fmt.Sprintf("%d", v)
}

func formatUint(v uint64) string {
	return fmt.Sprintf("%d", v)
}

func formatFloat(v float64) string {
	return fmt.Sprintf("%.2f", v)
}

// HealthCheck returns health status
func HealthCheck(c *fiber.Ctx) error {
	db := database.GetDB()
	sqlDB, _ := db.DB()

	dbOK := true
	if err := sqlDB.PingContext(context.Background()); err != nil {
		dbOK = false
	}

	status := "healthy"
	if !dbOK {
		status = "degraded"
	}

	return c.JSON(fiber.Map{
		"status": status,
		"checks": fiber.Map{
			"database": dbOK,
		},
		"timestamp": time.Now().Format(time.RFC3339),
	})
}
