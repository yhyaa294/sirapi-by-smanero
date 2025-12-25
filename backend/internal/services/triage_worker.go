package services

import (
	"encoding/json"
	"log"
	"time"

	"github.com/smartapd/backend/internal/database"
	"github.com/smartapd/backend/internal/models"
)

// TriageWorker evaluates triage rules against recent detections
type TriageWorker struct {
	Interval  time.Duration
	stopChan  chan struct{}
	Broadcast BroadcastFunc
}

// NewTriageWorker creates a new triage worker
func NewTriageWorker() *TriageWorker {
	return &TriageWorker{
		Interval: 30 * time.Second,
		stopChan: make(chan struct{}),
	}
}

// SetBroadcastFunc sets the WebSocket broadcast function
func (t *TriageWorker) SetBroadcastFunc(fn BroadcastFunc) {
	t.Broadcast = fn
}

// Start begins the triage evaluation loop
func (t *TriageWorker) Start() {
	log.Println("🎯 Triage Worker started (interval: 30s)")

	go func() {
		ticker := time.NewTicker(t.Interval)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				t.EvaluateRules()
			case <-t.stopChan:
				log.Println("🎯 Triage Worker stopped")
				return
			}
		}
	}()
}

// Stop stops the triage worker
func (t *TriageWorker) Stop() {
	close(t.stopChan)
}

// EvaluateRules processes all active rules against recent detections
func (t *TriageWorker) EvaluateRules() {
	db := database.GetDB()

	// Get active rules
	var rules []models.TriageRule
	if err := db.Where("enabled = ?", true).Find(&rules).Error; err != nil {
		log.Printf("⚠️ Triage Worker: Failed to fetch rules: %v", err)
		return
	}

	if len(rules) == 0 {
		return
	}

	// Get recent pending detections (last 5 minutes)
	since := time.Now().Add(-5 * time.Minute)
	var detections []models.Detection
	if err := db.Where("review_status = ? AND detected_at > ?", "pending", since).Find(&detections).Error; err != nil {
		log.Printf("⚠️ Triage Worker: Failed to fetch detections: %v", err)
		return
	}

	if len(detections) == 0 {
		return
	}

	promoted := 0
	for _, detection := range detections {
		for _, rule := range rules {
			if t.matchesRule(detection, rule) {
				// Promote detection
				detection.ReviewStatus = "in_review"
				detection.Priority = 1 // High priority
				if err := db.Save(&detection).Error; err != nil {
					log.Printf("⚠️ Triage Worker: Failed to promote detection %d: %v", detection.ID, err)
					continue
				}

				promoted++

				// Broadcast
				if t.Broadcast != nil {
					t.Broadcast("triage_promotion", map[string]interface{}{
						"detection_id": detection.ID,
						"rule_name":    rule.Name,
						"priority":     detection.Priority,
					})
				}

				break // Only apply first matching rule
			}
		}
	}

	if promoted > 0 {
		log.Printf("🎯 Triage Worker: Promoted %d detections to review queue", promoted)
	}
}

// matchesRule checks if a detection matches a triage rule's conditions
func (t *TriageWorker) matchesRule(detection models.Detection, rule models.TriageRule) bool {
	var conditions []map[string]interface{}
	if err := json.Unmarshal([]byte(rule.Conditions), &conditions); err != nil {
		return false
	}

	for _, cond := range conditions {
		condType, _ := cond["type"].(string)
		value := cond["value"]

		switch condType {
		case "confidence_lt":
			v, _ := value.(float64)
			if detection.Confidence >= v {
				return false
			}
		case "confidence_gt":
			v, _ := value.(float64)
			if detection.Confidence <= v {
				return false
			}
		case "violation_type":
			v, _ := value.(string)
			if detection.ViolationType != v {
				return false
			}
		case "camera_id":
			v, _ := value.(float64)
			if detection.CameraID != uint(v) {
				return false
			}
		case "location":
			v, _ := value.(string)
			if detection.Location != v {
				return false
			}
		}
	}

	return len(conditions) > 0
}
