package services

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/sirapi/backend/internal/database"
	"github.com/sirapi/backend/internal/models"
)

// DetectionMessage is the message format from AI Engine
type DetectionMessage struct {
	DetectionID   string    `json:"detection_id"`
	CameraID      uint      `json:"camera_id"`
	Timestamp     time.Time `json:"timestamp"`
	Classes       []string  `json:"classes"`
	Boxes         [][]int   `json:"boxes"`
	Confidence    []float64 `json:"confidence"`
	ImagePath     string    `json:"image_path"`
	ModelVersion  string    `json:"model_version"`
	IsViolation   bool      `json:"is_violation"`
	ViolationType string    `json:"violation_type"`
	Location      string    `json:"location"`
}

// QueueConsumer handles consuming messages from Redis Stream
type QueueConsumer struct {
	client       *redis.Client
	streamName   string
	consumerName string
	groupName    string
	running      bool
	stopChan     chan struct{}
	Broadcast    BroadcastFunc

	// In-memory fallback
	inMemoryQueue []DetectionMessage
	mu            sync.Mutex
}

// NewQueueConsumer creates a new queue consumer
func NewQueueConsumer() *QueueConsumer {
	redisURL := os.Getenv("REDIS_URL")

	qc := &QueueConsumer{
		streamName:    "detections:stream",
		consumerName:  "backend-consumer-1",
		groupName:     "backend-consumers",
		stopChan:      make(chan struct{}),
		inMemoryQueue: make([]DetectionMessage, 0),
	}

	if redisURL != "" {
		opt, err := redis.ParseURL(redisURL)
		if err != nil {
			log.Printf("⚠️ Invalid REDIS_URL, falling back to in-memory: %v", err)
		} else {
			qc.client = redis.NewClient(opt)
			ctx := context.Background()
			if _, err := qc.client.Ping(ctx).Result(); err != nil {
				log.Printf("⚠️ Redis connection failed, falling back to in-memory: %v", err)
				qc.client = nil
			} else {
				log.Println("✅ Redis connected for queue consumer")
				// Create consumer group if not exists
				qc.client.XGroupCreateMkStream(ctx, qc.streamName, qc.groupName, "0").Err()
			}
		}
	}

	if qc.client == nil {
		log.Println("📬 Queue Consumer using in-memory fallback (set REDIS_URL for production)")
	}

	return qc
}

// SetBroadcastFunc sets the WebSocket broadcast function
func (qc *QueueConsumer) SetBroadcastFunc(fn BroadcastFunc) {
	qc.Broadcast = fn
}

// Start begins consuming messages
func (qc *QueueConsumer) Start() {
	qc.running = true
	log.Println("📬 Queue Consumer started")

	if qc.client != nil {
		go qc.consumeRedis()
	} else {
		go qc.consumeInMemory()
	}
}

// Stop stops the consumer
func (qc *QueueConsumer) Stop() {
	qc.running = false
	close(qc.stopChan)
	if qc.client != nil {
		qc.client.Close()
	}
	log.Println("📬 Queue Consumer stopped")
}

// consumeRedis consumes from Redis Stream
func (qc *QueueConsumer) consumeRedis() {
	ctx := context.Background()

	for qc.running {
		select {
		case <-qc.stopChan:
			return
		default:
			// Read from stream with block
			result, err := qc.client.XReadGroup(ctx, &redis.XReadGroupArgs{
				Group:    qc.groupName,
				Consumer: qc.consumerName,
				Streams:  []string{qc.streamName, ">"},
				Count:    10,
				Block:    5 * time.Second,
			}).Result()

			if err == redis.Nil {
				continue
			}
			if err != nil {
				log.Printf("⚠️ Redis read error: %v", err)
				time.Sleep(time.Second)
				continue
			}

			for _, stream := range result {
				for _, message := range stream.Messages {
					qc.processMessage(ctx, message)
				}
			}
		}
	}
}

// processMessage handles a single message
func (qc *QueueConsumer) processMessage(ctx context.Context, message redis.XMessage) {
	dataStr, ok := message.Values["data"].(string)
	if !ok {
		log.Printf("⚠️ Invalid message format: %v", message.ID)
		qc.ackMessage(ctx, message.ID)
		return
	}

	var dm DetectionMessage
	if err := json.Unmarshal([]byte(dataStr), &dm); err != nil {
		log.Printf("⚠️ Failed to parse detection message: %v", err)
		qc.ackMessage(ctx, message.ID)
		return
	}

	// Persist to database
	if err := qc.persistDetection(dm); err != nil {
		log.Printf("⚠️ Failed to persist detection: %v", err)
		// Requeue on transient failure (don't ack)
		return
	}

	// Acknowledge message
	qc.ackMessage(ctx, message.ID)
}

// ackMessage acknowledges a message
func (qc *QueueConsumer) ackMessage(ctx context.Context, messageID string) {
	if qc.client != nil {
		qc.client.XAck(ctx, qc.streamName, qc.groupName, messageID)
	}
}

// persistDetection saves detection to database
func (qc *QueueConsumer) persistDetection(dm DetectionMessage) error {
	db := database.GetDB()

	// Find best confidence violation
	var maxConf float64
	var violationType string
	for i, class := range dm.Classes {
		if i < len(dm.Confidence) && dm.Confidence[i] > maxConf {
			maxConf = dm.Confidence[i]
			violationType = class
		}
	}

	detection := models.Detection{
		CameraID:      dm.CameraID,
		ViolationType: dm.ViolationType,
		Confidence:    maxConf,
		ImagePath:     dm.ImagePath,
		Location:      dm.Location,
		DetectedAt:    dm.Timestamp,
		IsViolation:   dm.IsViolation,
		ReviewStatus:  "pending",
		Priority:      3,
	}

	if err := db.Create(&detection).Error; err != nil {
		return err
	}

	log.Printf("📬 Detection persisted: ID=%d, Type=%s, Confidence=%.2f", detection.ID, violationType, maxConf)

	// Broadcast via WebSocket
	if qc.Broadcast != nil {
		qc.Broadcast("detection", map[string]interface{}{
			"id":             detection.ID,
			"camera_id":      detection.CameraID,
			"violation_type": detection.ViolationType,
			"confidence":     detection.Confidence,
			"is_violation":   detection.IsViolation,
		})
	}

	return nil
}

// In-memory fallback functions

// consumeInMemory processes in-memory queue
func (qc *QueueConsumer) consumeInMemory() {
	ticker := time.NewTicker(100 * time.Millisecond)
	defer ticker.Stop()

	for qc.running {
		select {
		case <-qc.stopChan:
			return
		case <-ticker.C:
			qc.processInMemoryQueue()
		}
	}
}

func (qc *QueueConsumer) processInMemoryQueue() {
	qc.mu.Lock()
	if len(qc.inMemoryQueue) == 0 {
		qc.mu.Unlock()
		return
	}

	// Take first message
	dm := qc.inMemoryQueue[0]
	qc.inMemoryQueue = qc.inMemoryQueue[1:]
	qc.mu.Unlock()

	// Persist
	if err := qc.persistDetection(dm); err != nil {
		log.Printf("⚠️ Failed to persist in-memory detection: %v", err)
		// Re-add to queue
		qc.mu.Lock()
		qc.inMemoryQueue = append(qc.inMemoryQueue, dm)
		qc.mu.Unlock()
	}
}

// PushInMemory adds a detection to in-memory queue (for testing/fallback)
func (qc *QueueConsumer) PushInMemory(dm DetectionMessage) {
	qc.mu.Lock()
	defer qc.mu.Unlock()
	qc.inMemoryQueue = append(qc.inMemoryQueue, dm)
}

// GetQueueLength returns current queue length (for metrics)
func (qc *QueueConsumer) GetQueueLength(ctx context.Context) int64 {
	if qc.client != nil {
		info, err := qc.client.XLen(ctx, qc.streamName).Result()
		if err != nil {
			return 0
		}
		return info
	}
	qc.mu.Lock()
	defer qc.mu.Unlock()
	return int64(len(qc.inMemoryQueue))
}
