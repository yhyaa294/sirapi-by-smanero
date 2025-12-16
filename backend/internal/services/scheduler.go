package services

import (
	"log"
	"time"
)

// Scheduler handles scheduled tasks
type Scheduler struct {
	detectionService *DetectionService
	telegramService  *TelegramService
	stopChan         chan struct{}
}

// NewScheduler creates a new scheduler
func NewScheduler(detection *DetectionService, telegram *TelegramService) *Scheduler {
	return &Scheduler{
		detectionService: detection,
		telegramService:  telegram,
		stopChan:         make(chan struct{}),
	}
}

// Start begins the scheduler
func (s *Scheduler) Start() {
	log.Println("📅 Scheduler started")

	go s.dailyReportScheduler()
	go s.hourlyStatsCheck()
}

// Stop stops the scheduler
func (s *Scheduler) Stop() {
	close(s.stopChan)
	log.Println("📅 Scheduler stopped")
}

// dailyReportScheduler sends daily report at 18:00
func (s *Scheduler) dailyReportScheduler() {
	for {
		select {
		case <-s.stopChan:
			return
		default:
			now := time.Now()
			// Schedule for 18:00 (6 PM)
			next := time.Date(now.Year(), now.Month(), now.Day(), 18, 0, 0, 0, now.Location())

			// If already passed today, schedule for tomorrow
			if now.After(next) {
				next = next.Add(24 * time.Hour)
			}

			duration := next.Sub(now)
			log.Printf("📊 Next daily report scheduled in: %v", duration.Round(time.Minute))

			timer := time.NewTimer(duration)
			select {
			case <-timer.C:
				s.sendDailyReport()
			case <-s.stopChan:
				timer.Stop()
				return
			}
		}
	}
}

// hourlyStatsCheck runs every hour to check violation rates
func (s *Scheduler) hourlyStatsCheck() {
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			s.checkHourlyStats()
		case <-s.stopChan:
			return
		}
	}
}

// sendDailyReport sends the daily summary
func (s *Scheduler) sendDailyReport() {
	log.Println("📊 Sending daily report...")

	if s.detectionService != nil {
		if err := s.detectionService.SendDailyReport(); err != nil {
			log.Printf("❌ Failed to send daily report: %v", err)
		} else {
			log.Println("✅ Daily report sent")
		}
	}
}

// checkHourlyStats checks if violation rate is too high
func (s *Scheduler) checkHourlyStats() {
	if s.detectionService == nil || s.telegramService == nil {
		return
	}

	rate := s.detectionService.GetComplianceRate()

	// Alert if compliance drops below 70%
	if rate < 70 {
		log.Printf("⚠️ Low compliance rate detected: %.1f%%", rate)
		s.telegramService.SendSystemStatus("warning",
			"Tingkat kepatuhan APD turun di bawah 70%. Segera lakukan inspeksi!")
	}
}
