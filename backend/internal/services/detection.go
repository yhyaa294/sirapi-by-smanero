package services

import (
	"sync"
	"time"

	"github.com/smartapd/backend/internal/database"
	"github.com/smartapd/backend/internal/models"
)

// DetectionService handles detection business logic
type DetectionService struct {
	telegram *TelegramService
	mu       sync.RWMutex
	stats    *DetectionStats
}

// DetectionStats holds real-time statistics
type DetectionStats struct {
	TotalToday      int64
	ViolationsToday int64
	LastUpdated     time.Time
}

// NewDetectionService creates a new detection service
func NewDetectionService(telegram *TelegramService) *DetectionService {
	service := &DetectionService{
		telegram: telegram,
		stats: &DetectionStats{
			LastUpdated: time.Now(),
		},
	}

	// Start background stats updater
	go service.updateStatsLoop()

	return service
}

// updateStatsLoop updates stats every minute
func (s *DetectionService) updateStatsLoop() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		s.refreshStats()
	}
}

// refreshStats refreshes statistics from database
func (s *DetectionService) refreshStats() {
	s.mu.Lock()
	defer s.mu.Unlock()

	db := database.GetDB()
	startOfDay := time.Now().Truncate(24 * time.Hour)

	var total, violations int64
	db.Model(&models.Detection{}).
		Where("created_at >= ?", startOfDay).
		Count(&total)
	db.Model(&models.Detection{}).
		Where("created_at >= ? AND is_violation = ?", startOfDay, true).
		Count(&violations)

	s.stats.TotalToday = total
	s.stats.ViolationsToday = violations
	s.stats.LastUpdated = time.Now()
}

// GetTodayStats returns today's statistics
func (s *DetectionService) GetTodayStats() DetectionStats {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return *s.stats
}

// ProcessNewDetection processes a new detection and triggers alerts if needed
func (s *DetectionService) ProcessNewDetection(detection *models.Detection) error {
	// Save to database
	db := database.GetDB()
	if err := db.Create(detection).Error; err != nil {
		return err
	}

	// Update stats
	s.mu.Lock()
	s.stats.TotalToday++
	if detection.IsViolation {
		s.stats.ViolationsToday++
	}
	s.mu.Unlock()

	// Send Telegram alert for violations
	// NOTE: Disabled to prevent double notifications (AI Engine already sends alerts with photos)
	/*
		if detection.IsViolation && s.telegram != nil {
			go func() {
				err := s.telegram.SendViolationAlert(
					detection.ViolationType,
					detection.Location,
					detection.Confidence,
					detection.ImagePath,
				)
				if err != nil {
					log.Printf("Failed to send Telegram alert: %v", err)
				}
			}()
		}
	*/

	// Create alert record
	if detection.IsViolation {
		severity := s.calculateSeverity(detection.ViolationType, detection.Confidence)
		alert := &models.Alert{
			DetectionID: detection.ID,
			Severity:    severity,
			Message:     s.formatAlertMessage(detection),
			Status:      "pending",
		}
		db.Create(alert)
	}

	return nil
}

// calculateSeverity determines alert severity based on violation type
func (s *DetectionService) calculateSeverity(violationType string, confidence float64) string {
	// Higher severity for head protection
	if violationType == "no_helmet" {
		if confidence > 0.8 {
			return "critical"
		}
		return "high"
	}

	// Medium for visibility
	if violationType == "no_vest" {
		return "medium"
	}

	// Lower for other
	return "low"
}

// formatAlertMessage creates a human-readable alert message
func (s *DetectionService) formatAlertMessage(detection *models.Detection) string {
	messages := map[string]string{
		"no_helmet": "Pekerja terdeteksi tidak menggunakan helm safety",
		"no_vest":   "Pekerja terdeteksi tidak menggunakan rompi safety",
		"no_gloves": "Pekerja terdeteksi tidak menggunakan sarung tangan",
		"no_boots":  "Pekerja terdeteksi tidak menggunakan sepatu safety",
	}

	msg := messages[detection.ViolationType]
	if msg == "" {
		msg = "Pelanggaran APD terdeteksi: " + detection.ViolationType
	}

	return msg
}

// GetComplianceRate calculates today's compliance rate
func (s *DetectionService) GetComplianceRate() float64 {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if s.stats.TotalToday == 0 {
		return 100.0
	}

	return float64(s.stats.TotalToday-s.stats.ViolationsToday) / float64(s.stats.TotalToday) * 100
}

// SendDailyReport sends the daily summary via Telegram
func (s *DetectionService) SendDailyReport() error {
	if s.telegram == nil {
		return nil
	}

	stats := s.GetTodayStats()
	rate := s.GetComplianceRate()

	return s.telegram.SendDailySummary(
		int(stats.TotalToday),
		int(stats.ViolationsToday),
		rate,
	)
}
