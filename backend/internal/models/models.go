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
}

// Camera represents a CCTV camera
type Camera struct {
	gorm.Model
	Name       string  `json:"name"`
	Location   string  `json:"location"`
	RTSPUrl    string  `json:"rtsp_url"`
	Status     string  `json:"status"` // online, offline, error
	Resolution string  `json:"resolution"`
	IsActive   bool    `json:"is_active" gorm:"default:true"`
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
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

type HourlyData struct {
	Hour       int `json:"hour"`
	Detections int `json:"detections"`
	Violations int `json:"violations"`
}

type LocationData struct {
	Location   string `json:"location"`
	Violations int    `json:"violations"`
	RiskScore  int    `json:"risk_score"`
}
