package handlers

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jung-kurt/gofpdf"
	"github.com/sirapi/backend/internal/database"
	"github.com/sirapi/backend/internal/models"
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

// ExportReport exports report data
func ExportReport(c *fiber.Ctx) error {
	format := c.Params("format")
	db := database.GetDB()

	// Get last 7 days data
	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -7)
	var detections []models.Detection
	db.Where("detected_at >= ? AND is_violation = ?", startDate, true).Order("detected_at DESC").Find(&detections)

	if format == "excel" || format == "csv" {
		// Generate CSV content
		csvContent := "Time,Type,Location,Confidence\n"
		for _, d := range detections {
			csvContent += fmt.Sprintf("%s,%s,%s,%.2f\n",
				d.DetectedAt.Format("2006-01-02 15:04:05"),
				d.ViolationType,
				d.Location,
				d.Confidence,
			)
		}

		c.Set("Content-Type", "text/csv")
		c.Set("Content-Disposition", "attachment; filename=report_pelanggaran.csv")
		return c.SendString(csvContent)

	} else if format == "pdf" {
		pdf := gofpdf.New("P", "mm", "A4", "")
		pdf.AddPage()

		// 1. Header & Title
		pdf.SetFont("Helvetica", "B", 20)
		pdf.CellFormat(190, 15, "Laporan Pelanggaran K3 - SiRapi", "", 1, "C", false, 0, "")

		pdf.SetFont("Helvetica", "I", 10)
		pdf.CellFormat(190, 8, fmt.Sprintf("Periode: %s s/d %s", startDate.Format("02 Jan 2006"), endDate.Format("02 Jan 2006")), "B", 1, "C", false, 0, "")
		pdf.Ln(5)

		// 2. Statistics Summary
		pdf.SetFont("Helvetica", "B", 12)
		pdf.Cell(0, 10, "Ringkasan Statistik")
		pdf.Ln(8)

		pdf.SetFont("Helvetica", "", 10)
		pdf.CellFormat(90, 8, fmt.Sprintf("Total Pelanggaran: %d", len(detections)), "", 0, "", false, 0, "")
		pdf.CellFormat(90, 8, fmt.Sprintf("Dicetak Pada: %s", time.Now().Format("02 Jan 2006 15:04")), "", 1, "", false, 0, "")
		pdf.Ln(10)

		// 3. Violation List Loop
		pdf.SetFont("Helvetica", "B", 12)
		pdf.Cell(0, 10, "Daftar Insiden Terperinci")
		pdf.Ln(10)

		pdf.SetFont("Helvetica", "", 10)

		// Define Base Path for Images (Assuming backend is running in 'backend' dir and ai-engine is sibling)
		// Need to adjust this based on actual deployment.
		// For verification: 'd:/PROJECT PROJECT KU/sirapi/ai-engine'
		// We can try to use relative path first.
		basePath := "../ai-engine"

		for i, d := range detections {
			// Card Container
			yStart := pdf.GetY()

			// Check page break
			if yStart > 240 {
				pdf.AddPage()
				yStart = pdf.GetY()
			}

			// A. Text Details (Left Side - 60%)
			pdf.SetFont("Helvetica", "B", 10)
			pdf.CellFormat(110, 6, fmt.Sprintf("#%d - %s", i+1, d.ViolationType), "", 1, "", false, 0, "")

			pdf.SetFont("Helvetica", "", 9)
			pdf.CellFormat(30, 6, "Waktu", "", 0, "", false, 0, "")
			pdf.CellFormat(80, 6, ": "+d.DetectedAt.Format("Monday, 02 Jan 2006 15:04:05"), "", 1, "", false, 0, "")

			pdf.CellFormat(30, 6, "Lokasi", "", 0, "", false, 0, "")
			pdf.CellFormat(80, 6, ": "+d.Location, "", 1, "", false, 0, "")

			pdf.CellFormat(30, 6, "Akurasi AI", "", 0, "", false, 0, "")
			pdf.CellFormat(80, 6, fmt.Sprintf(": %.1f%%", d.Confidence*100), "", 1, "", false, 0, "")

			// B. Image Evidence (Right Side - 40%)
			if d.ImagePath != "" {
				// Clean path: /data/screenshots/x.jpg -> data/screenshots/x.jpg
				cleanPath := d.ImagePath
				if cleanPath[0] == '/' || cleanPath[0] == '\\' {
					cleanPath = cleanPath[1:]
				}

				fullPath := fmt.Sprintf("%s/%s", basePath, cleanPath)

				// Try to add image
				// x=130 (left margin 10 + 120), y=yStart, w=60, h=45 (4:3 aspect)
				// We use ImageOptions to fail gracefully if not found
				opt := gofpdf.ImageOptions{
					ImageType: "JPG",
					ReadDpi:   true,
				}
				pdf.ImageOptions(fullPath, 130, yStart, 60, 0, false, opt, 0, "")
			} else {
				// No Image Placeholder
				pdf.Rect(130, yStart, 60, 40, "D")
				pdf.Text(145, yStart+20, "No Image Evidence")
			}

			// Separator Line
			pdf.SetDrawColor(200, 200, 200)
			pdf.Line(10, yStart+45, 200, yStart+45)
			pdf.SetDrawColor(0, 0, 0) // Reset

			// Move cursor for next item
			pdf.SetY(yStart + 50)
		}

		c.Set("Content-Type", "application/pdf")
		c.Set("Content-Disposition", "attachment; filename=report_pelanggaran_k3.pdf")

		return pdf.Output(c.Response().BodyWriter())
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": fmt.Sprintf("Format %s not supported", format),
	})
}
