package services

import (
	"encoding/json"
	"log"
	"os"
	"sync"
	"time"
)

// NotificationTask represents a task to send a notification
type NotificationTask struct {
	ID            string    `json:"id"`
	DetectionID   uint      `json:"detection_id"`
	CameraID      uint      `json:"camera_id"`
	ViolationType string    `json:"violation_type"`
	Location      string    `json:"location"`
	Confidence    float64   `json:"confidence"`
	ImagePath     string    `json:"image_path"`
	Severity      string    `json:"severity"` // low, medium, high, critical
	Timestamp     time.Time `json:"timestamp"`
	TargetChats   []int64   `json:"target_chats,omitempty"` // If empty, send to all active chats
}

// NotificationQueue provides queue abstraction
type NotificationQueue struct {
	channel  chan NotificationTask
	redisURL string
	mu       sync.Mutex
}

var (
	notificationQueue *NotificationQueue
	queueOnce         sync.Once
)

// GetNotificationQueue returns singleton queue instance
func GetNotificationQueue() *NotificationQueue {
	queueOnce.Do(func() {
		redisURL := os.Getenv("REDIS_URL")
		notificationQueue = &NotificationQueue{
			channel:  make(chan NotificationTask, 1000),
			redisURL: redisURL,
		}

		if redisURL != "" {
			log.Println("📬 Notification Queue: Redis mode (", redisURL, ")")
		} else {
			log.Println("📬 Notification Queue: In-memory mode (set REDIS_URL for production)")
		}
	})
	return notificationQueue
}

// Enqueue adds a task to the queue
func (q *NotificationQueue) Enqueue(task NotificationTask) error {
	if task.ID == "" {
		task.ID = generateTaskID()
	}
	if task.Timestamp.IsZero() {
		task.Timestamp = time.Now()
	}

	// In-memory implementation
	select {
	case q.channel <- task:
		log.Printf("📬 Queued notification for detection #%d", task.DetectionID)
		return nil
	default:
		log.Printf("⚠️ Queue full, dropping notification for detection #%d", task.DetectionID)
		return nil
	}
}

// Consume returns channel to receive tasks
func (q *NotificationQueue) Consume() <-chan NotificationTask {
	return q.channel
}

// EnqueueFromDetection creates a notification task from a detection
func (q *NotificationQueue) EnqueueFromDetection(detectionID uint, cameraID uint, violationType, location string, confidence float64, imagePath string) error {
	severity := "medium"
	if confidence > 0.9 {
		severity = "critical"
	} else if confidence > 0.8 {
		severity = "high"
	}

	task := NotificationTask{
		DetectionID:   detectionID,
		CameraID:      cameraID,
		ViolationType: violationType,
		Location:      location,
		Confidence:    confidence,
		ImagePath:     imagePath,
		Severity:      severity,
		Timestamp:     time.Now(),
	}

	return q.Enqueue(task)
}

// ToJSON converts task to JSON
func (t NotificationTask) ToJSON() string {
	data, _ := json.Marshal(t)
	return string(data)
}

// generateTaskID generates a unique task ID
func generateTaskID() string {
	return time.Now().Format("20060102-150405.000")
}
