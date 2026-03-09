package handlers

import (
	"archive/zip"
	"encoding/csv"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/sirapi/backend/internal/database"
	"github.com/sirapi/backend/internal/models"
)

// ==================== ANNOTATION / FEEDBACK HANDLERS ====================

// SubmitFeedback saves operator feedback on a detection for ML training
func SubmitFeedback(c *fiber.Ctx) error {
	detectionID := c.Params("id")
	db := database.GetDB()

	var detection models.Detection
	if err := db.First(&detection, detectionID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Detection not found"})
	}

	var req struct {
		Label string `json:"label"` // tp, fp, uncertain
		Notes string `json:"notes"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Validate label
	validLabels := map[string]bool{"tp": true, "fp": true, "uncertain": true}
	if !validLabels[req.Label] {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid label. Use: tp, fp, uncertain"})
	}

	// Check if already in backlog
	var existing models.AnnotationBacklog
	if err := db.Where("detection_id = ?", detection.ID).First(&existing).Error; err == nil {
		// Update existing
		existing.Label = req.Label
		existing.Notes = req.Notes
		existing.Status = "labeled"
		db.Save(&existing)
		return c.JSON(fiber.Map{"success": true, "data": existing, "message": "Feedback updated"})
	}

	// Create new backlog entry
	backlog := models.AnnotationBacklog{
		DetectionID: detection.ID,
		ImagePath:   detection.ImagePath,
		Label:       req.Label,
		Status:      "labeled",
		Notes:       req.Notes,
		CreatedAt:   time.Now(),
	}

	if err := db.Create(&backlog).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save feedback"})
	}

	// Broadcast for real-time UI
	BroadcastMessage("feedback", fiber.Map{
		"detection_id": detection.ID,
		"label":        req.Label,
	})

	return c.Status(201).JSON(fiber.Map{"success": true, "data": backlog, "message": "Feedback saved"})
}

// GetAnnotationBacklog returns pending annotations
func GetAnnotationBacklog(c *fiber.Ctx) error {
	db := database.GetDB()

	status := c.Query("status", "")
	limitStr := c.Query("limit", "50")
	offsetStr := c.Query("offset", "0")

	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	query := db.Model(&models.AnnotationBacklog{})
	if status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Count(&total)

	var items []models.AnnotationBacklog
	query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&items)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    items,
		"total":   total,
		"limit":   limit,
		"offset":  offset,
	})
}

// ExportAnnotations creates a zip with images + CSV manifest
func ExportAnnotations(c *fiber.Ctx) error {
	db := database.GetDB()

	sinceStr := c.Query("since", "")
	limitStr := c.Query("limit", "1000")
	limit, _ := strconv.Atoi(limitStr)

	query := db.Model(&models.AnnotationBacklog{}).Where("status = ?", "labeled")
	if sinceStr != "" {
		since, err := time.Parse(time.RFC3339, sinceStr)
		if err == nil {
			query = query.Where("created_at > ?", since)
		}
	}

	var items []models.AnnotationBacklog
	query.Limit(limit).Find(&items)

	if len(items) == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "No labeled items to export"})
	}

	// Create temp zip file
	tempDir := os.TempDir()
	zipPath := filepath.Join(tempDir, fmt.Sprintf("annotations_%d.zip", time.Now().Unix()))
	zipFile, err := os.Create(zipPath)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create export file"})
	}
	defer zipFile.Close()

	zipWriter := zip.NewWriter(zipFile)

	// Create CSV manifest
	csvWriter, err := zipWriter.Create("manifest.csv")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create manifest"})
	}

	csv := csv.NewWriter(csvWriter)
	csv.Write([]string{"filename", "label", "notes", "detection_id", "created_at"})

	// Add images and update status
	now := time.Now()
	for i, item := range items {
		// Add image to zip if exists
		if item.ImagePath != "" {
			imgPath := item.ImagePath
			// Try different base paths
			basePaths := []string{"./screenshots", "../ai-engine/screenshots", "../../ai-engine/screenshots"}

			for _, base := range basePaths {
				fullPath := filepath.Join(base, filepath.Base(imgPath))
				if _, err := os.Stat(fullPath); err == nil {
					imgFile, err := os.Open(fullPath)
					if err == nil {
						imgWriter, _ := zipWriter.Create(fmt.Sprintf("images/%s", filepath.Base(imgPath)))
						io.Copy(imgWriter, imgFile)
						imgFile.Close()
					}
					break
				}
			}
		}

		// Add to CSV
		csv.Write([]string{
			filepath.Base(item.ImagePath),
			item.Label,
			item.Notes,
			fmt.Sprintf("%d", item.DetectionID),
			item.CreatedAt.Format(time.RFC3339),
		})

		// Update status to exported
		items[i].Status = "exported"
		items[i].ExportedAt = &now
		db.Save(&items[i])
	}

	csv.Flush()
	zipWriter.Close()

	// Return file
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=annotations_%d.zip", time.Now().Unix()))
	return c.SendFile(zipPath, true)
}

// AssignAnnotation assigns a backlog item to an annotator
func AssignAnnotation(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.GetDB()

	var item models.AnnotationBacklog
	if err := db.First(&item, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Annotation not found"})
	}

	var req struct {
		AssigneeID uint `json:"assignee_id"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	item.AssignedTo = &req.AssigneeID
	db.Save(&item)

	return c.JSON(fiber.Map{"success": true, "data": item})
}

// GetAnnotationStats returns annotation backlog statistics
func GetAnnotationStats(c *fiber.Ctx) error {
	db := database.GetDB()

	var pending, labeled, exported int64
	db.Model(&models.AnnotationBacklog{}).Where("status = ?", "pending").Count(&pending)
	db.Model(&models.AnnotationBacklog{}).Where("status = ?", "labeled").Count(&labeled)
	db.Model(&models.AnnotationBacklog{}).Where("status = ?", "exported").Count(&exported)

	var tpCount, fpCount, uncertainCount int64
	db.Model(&models.AnnotationBacklog{}).Where("label = ?", "tp").Count(&tpCount)
	db.Model(&models.AnnotationBacklog{}).Where("label = ?", "fp").Count(&fpCount)
	db.Model(&models.AnnotationBacklog{}).Where("label = ?", "uncertain").Count(&uncertainCount)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"by_status": fiber.Map{
				"pending":  pending,
				"labeled":  labeled,
				"exported": exported,
			},
			"by_label": fiber.Map{
				"tp":        tpCount,
				"fp":        fpCount,
				"uncertain": uncertainCount,
			},
			"total": pending + labeled + exported,
		},
	})
}
