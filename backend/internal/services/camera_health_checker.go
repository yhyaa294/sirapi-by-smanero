package services

import (
	"log"
	"net"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/smartapd/backend/internal/database"
	"github.com/smartapd/backend/internal/models"
)

// BroadcastFunc is a function type for broadcasting messages
type BroadcastFunc func(messageType string, data interface{})

// CameraHealthChecker monitors camera health
type CameraHealthChecker struct {
	Interval         time.Duration
	OfflineThreshold time.Duration
	PingTimeout      time.Duration
	stopChan         chan struct{}
	Broadcast        BroadcastFunc
}

// NewCameraHealthChecker creates a new health checker
func NewCameraHealthChecker() *CameraHealthChecker {
	interval := getEnvDuration("CAMERA_HEALTH_INTERVAL", 60*time.Second)
	threshold := getEnvDuration("CAMERA_OFFLINE_THRESHOLD_MIN", 5*time.Minute)
	timeout := getEnvDuration("CAMERA_PING_TIMEOUT", 5*time.Second)

	return &CameraHealthChecker{
		Interval:         interval,
		OfflineThreshold: threshold,
		PingTimeout:      timeout,
		stopChan:         make(chan struct{}),
		Broadcast:        nil, // Set via SetBroadcastFunc
	}
}

// SetBroadcastFunc sets the broadcast function (to avoid import cycle)
func (c *CameraHealthChecker) SetBroadcastFunc(fn BroadcastFunc) {
	c.Broadcast = fn
}

func getEnvDuration(key string, defaultVal time.Duration) time.Duration {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	sec, err := strconv.Atoi(val)
	if err != nil {
		return defaultVal
	}
	return time.Duration(sec) * time.Second
}

// Start begins the health checking loop
func (c *CameraHealthChecker) Start() {
	log.Printf("📹 Camera Health Checker started (interval: %v)", c.Interval)

	go func() {
		// Initial check
		c.CheckAllCameras()

		ticker := time.NewTicker(c.Interval)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				c.CheckAllCameras()
			case <-c.stopChan:
				log.Println("📹 Camera Health Checker stopped")
				return
			}
		}
	}()
}

// Stop stops the health checker
func (c *CameraHealthChecker) Stop() {
	close(c.stopChan)
}

// CheckAllCameras checks all active cameras
func (c *CameraHealthChecker) CheckAllCameras() {
	var cameras []models.Camera
	if err := database.GetDB().Where("is_active = ?", true).Find(&cameras).Error; err != nil {
		log.Printf("⚠️ Health Checker: Failed to fetch cameras: %v", err)
		return
	}

	for _, camera := range cameras {
		go c.CheckCamera(&camera)
	}
}

// CheckCamera checks a single camera's health
func (c *CameraHealthChecker) CheckCamera(camera *models.Camera) {
	startTime := time.Now()
	var status string
	var lastError string
	var latency int

	// Try to ping the camera
	online := c.pingCamera(camera.RTSPUrl)
	latency = int(time.Since(startTime).Milliseconds())

	if online {
		status = "online"
		lastError = ""
	} else {
		status = "offline"
		lastError = "Failed to connect"
	}

	// Check if status changed
	statusChanged := camera.Status != status
	now := time.Now()

	// Update database
	updates := map[string]interface{}{
		"status":     status,
		"last_seen":  now,
		"latency":    latency,
		"last_error": lastError,
	}

	if err := database.GetDB().Model(camera).Updates(updates).Error; err != nil {
		log.Printf("⚠️ Health Checker: Failed to update camera %s: %v", camera.Name, err)
		return
	}

	// Broadcast status change via WebSocket
	if statusChanged && c.Broadcast != nil {
		log.Printf("📹 Camera %s status: %s -> %s", camera.Name, camera.Status, status)
		c.Broadcast("camera_health", map[string]interface{}{
			"camera_id": camera.ID,
			"name":      camera.Name,
			"status":    status,
			"latency":   latency,
			"last_seen": now,
		})

		// If went offline, check threshold for notification
		if status == "offline" && camera.LastSeen != nil {
			if time.Since(*camera.LastSeen) > c.OfflineThreshold {
				c.createOfflineNotification(camera)
			}
		}
	}
}

// pingCamera attempts to connect to the camera
func (c *CameraHealthChecker) pingCamera(rtspURL string) bool {
	if rtspURL == "" {
		return false
	}

	// Extract host:port from RTSP URL
	url := strings.TrimPrefix(rtspURL, "rtsp://")
	url = strings.TrimPrefix(url, "rtsps://")

	// Remove credentials if present
	if idx := strings.Index(url, "@"); idx != -1 {
		url = url[idx+1:]
	}

	// Extract host:port
	if idx := strings.Index(url, "/"); idx != -1 {
		url = url[:idx]
	}

	// If no port specified, use default RTSP port
	if !strings.Contains(url, ":") {
		url = url + ":554"
	}

	// Try TCP connection
	conn, err := net.DialTimeout("tcp", url, c.PingTimeout)
	if err != nil {
		// Fallback: Try HTTP if it's an IP camera with HTTP snapshot
		return c.pingHTTP(rtspURL)
	}
	conn.Close()
	return true
}

// pingHTTP tries HTTP ping for cameras with HTTP endpoints
func (c *CameraHealthChecker) pingHTTP(url string) bool {
	httpURL := strings.Replace(url, "rtsp://", "http://", 1)
	httpURL = strings.Replace(httpURL, "rtsps://", "https://", 1)

	client := &http.Client{Timeout: c.PingTimeout}
	resp, err := client.Get(httpURL)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	return resp.StatusCode > 0
}

// createOfflineNotification creates a notification for offline camera
func (c *CameraHealthChecker) createOfflineNotification(camera *models.Camera) {
	log.Printf("⚠️ Camera %s has been offline for more than %v", camera.Name, c.OfflineThreshold)

	// Broadcast alert
	if c.Broadcast != nil {
		c.Broadcast("alert", map[string]interface{}{
			"type":    "camera_offline",
			"camera":  camera.Name,
			"message": "Camera has been offline for extended period",
		})
	}
}

// CheckSingleCamera performs an immediate check on a specific camera
func (c *CameraHealthChecker) CheckSingleCamera(cameraID uint) (bool, error) {
	var camera models.Camera
	if err := database.GetDB().First(&camera, cameraID).Error; err != nil {
		return false, err
	}

	startTime := time.Now()
	online := c.pingCamera(camera.RTSPUrl)
	latency := int(time.Since(startTime).Milliseconds())

	status := "offline"
	if online {
		status = "online"
	}

	now := time.Now()
	database.GetDB().Model(&camera).Updates(map[string]interface{}{
		"status":     status,
		"last_seen":  now,
		"latency":    latency,
		"last_error": "",
	})

	// Broadcast update
	if c.Broadcast != nil {
		c.Broadcast("camera_health", map[string]interface{}{
			"camera_id": camera.ID,
			"name":      camera.Name,
			"status":    status,
			"latency":   latency,
			"last_seen": now,
		})
	}

	return online, nil
}
