package models

import (
	"time"

	"gorm.io/gorm"
)

// Detection represents a PPE detection record
type Detection struct {
	gorm.Model
	CameraID      uint      `json:"camera_id" gorm:"index"`
	ViolationType string    `json:"violation_type"` // no_helmet, no_vest, no_gloves
	Confidence    float64   `json:"confidence"`
	ImagePath     string    `json:"image_path"`
	Location      string    `json:"location"`
	DetectedAt    time.Time `json:"detected_at"`
	IsViolation   bool      `json:"is_violation"`
}

// Alert represents a safety alert
type Alert struct {
	gorm.Model
	DetectionID    uint       `json:"detection_id" gorm:"index"`
	Severity       string     `json:"severity"` // low, medium, high, critical
	Message        string     `json:"message"`
	Status         string     `json:"status"` // pending, acknowledged, resolved
	AcknowledgedAt *time.Time `json:"acknowledged_at"`
	AcknowledgedBy string     `json:"acknowledged_by"`
	AssignedTo     string     `json:"assigned_to"` // User ID or Name
}

// Camera represents a CCTV camera
type Camera struct {
	gorm.Model
	Name       string     `json:"name"`
	Location   string     `json:"location"`
	RTSPUrl    string     `json:"rtsp_url"`
	Status     string     `json:"status"` // online, offline, error
	Resolution string     `json:"resolution"`
	IsActive   bool       `json:"is_active" gorm:"default:true"`
	LastSeen   *time.Time `json:"last_seen"`
	FPS        int        `json:"fps"`
	Latency    int        `json:"latency"` // in ms
	Latitude   float64    `json:"latitude"`
	Longitude  float64    `json:"longitude"`
}

// User represents a system user for authentication
type User struct {
	gorm.Model
	Email        string     `json:"email" gorm:"unique;not null"`
	PasswordHash string     `json:"-"` // Hidden from JSON
	Name         string     `json:"name"`
	Role         string     `json:"role"` // admin, supervisor, operator
	AvatarURL    string     `json:"avatar_url"`
	IsActive     bool       `json:"is_active" gorm:"default:true"`
	LastLoginAt  *time.Time `json:"last_login_at"`
}

// DetectionStats for API response
type DetectionStats struct {
	TotalDetections int64            `json:"total_detections"`
	TotalViolations int64            `json:"total_violations"`
	ComplianceRate  float64          `json:"compliance_rate"`
	ByViolationType map[string]int64 `json:"by_violation_type"`
}

// DailyReport for API response
type DailyReport struct {
	Date            string         `json:"date"`
	TotalDetections int            `json:"total_detections"`
	TotalViolations int            `json:"total_violations"`
	ComplianceRate  float64        `json:"compliance_rate"`
	HourlyBreakdown []HourlyData   `json:"hourly_breakdown"`
	TopLocations    []LocationData `json:"top_locations"`
}

type LocationData struct {
	Location   string `json:"location"`
	Violations int    `json:"violations"`
	RiskScore  int    `json:"risk_score"`
}

type HourlyData struct {
	Hour       int `json:"hour"`
	Detections int `json:"detections"`
	Violations int `json:"violations"`
}

// AlertRule represents a user-defined logic to trigger alerts
type AlertRule struct {
	gorm.Model
	Name            string   `json:"name"`
	CameraIDs       []string `json:"camera_ids" gorm:"serializer:json"`
	Condition       string   `json:"condition"` // e.g. "count_gt", "time_between"
	Threshold       int      `json:"threshold"`
	WindowMinutes   int      `json:"window_minutes"`
	Channels        []string `json:"channels" gorm:"serializer:json"` // telegram, email, webhook
	CooldownSeconds int      `json:"cooldown_seconds"`
	Enabled         bool     `json:"enabled"`
}

// Dashboard represents a user customizable dashboard
type Dashboard struct {
	gorm.Model
	Name     string `json:"name"`
	OwnerID  uint   `json:"owner_id"`                 // User ID
	Widgets  string `json:"widgets" gorm:"type:text"` // JSON string of widgets config
	IsShared bool   `json:"is_shared"`
}

// ReportSchedule represents a scheduled report job
type ReportSchedule struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	Name           string    `gorm:"size:100;not null" json:"name"`
	CronExpression string    `gorm:"size:50;not null" json:"cron_expression"`    // e.g. "0 8 * * *"
	TargetType     string    `gorm:"size:20;not null" json:"target_type"`        // "telegram" | "email"
	TargetValue    string    `gorm:"size:255;not null" json:"target_value"`      // Chat ID or Email Address
	ReportType     string    `gorm:"size:20;default:'daily'" json:"report_type"` // "daily" | "weekly"
	IsActive       bool      `gorm:"default:true" json:"is_active"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// ReportLog tracks execution history
type ReportLog struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	ScheduleID   uint      `json:"schedule_id"`
	ScheduleName string    `gorm:"size:100" json:"schedule_name"`
	Status       string    `gorm:"size:20" json:"status"` // "success" | "failed"
	ExecutedAt   time.Time `json:"executed_at"`
	ErrorMessage string    `gorm:"type:text" json:"error_message"`
}

// Integration represents external service connection
type Integration struct {
	gorm.Model
	Type    string `json:"type"` // webhook, slack, jira
	Name    string `json:"name"`
	Config  string `json:"config" gorm:"type:text"` // JSON config
	Enabled bool   `json:"enabled" gorm:"default:true"`
}
