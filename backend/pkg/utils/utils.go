package utils

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

// GenerateID generates a random hex ID
func GenerateID(length int) string {
	bytes := make([]byte, length/2)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

// FormatTimestamp formats time to Indonesian format
func FormatTimestamp(t time.Time) string {
	return t.Format("15:04:05 02-01-2006")
}

// FormatDate formats date to Indonesian format
func FormatDate(t time.Time) string {
	months := []string{
		"", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
		"Juli", "Agustus", "September", "Oktober", "November", "Desember",
	}
	return fmt.Sprintf("%d %s %d", t.Day(), months[t.Month()], t.Year())
}

// SanitizeFilename removes invalid characters from filename
func SanitizeFilename(name string) string {
	reg := regexp.MustCompile(`[^a-zA-Z0-9_\-.]`)
	return reg.ReplaceAllString(name, "_")
}

// EnsureDir creates directory if it doesn't exist
func EnsureDir(path string) error {
	return os.MkdirAll(path, 0755)
}

// FileExists checks if file exists
func FileExists(path string) bool {
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}

// GetFileExtension returns file extension in lowercase
func GetFileExtension(path string) string {
	return strings.ToLower(filepath.Ext(path))
}

// ToJSON converts any value to JSON string
func ToJSON(v interface{}) string {
	bytes, err := json.Marshal(v)
	if err != nil {
		return "{}"
	}
	return string(bytes)
}

// ToPrettyJSON converts any value to formatted JSON string
func ToPrettyJSON(v interface{}) string {
	bytes, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return "{}"
	}
	return string(bytes)
}

// ClampFloat clamps float to min/max range
func ClampFloat(value, min, max float64) float64 {
	if value < min {
		return min
	}
	if value > max {
		return max
	}
	return value
}

// CalculatePercentage calculates percentage safely
func CalculatePercentage(part, total int64) float64 {
	if total == 0 {
		return 0
	}
	return float64(part) / float64(total) * 100
}

// MapViolationType maps violation type to human readable name
func MapViolationType(violationType string) string {
	mapping := map[string]string{
		"no_topi": "Tidak Pakai Helm",
		"no_dasi":   "Tidak Pakai Rompi",
		"no_sabuk": "Tidak Pakai Sarung Tangan",
		"no_sepatu":  "Tidak Pakai Sepatu Safety",
		"topi":    "Pakai Helm",
		"dasi":      "Pakai Rompi",
		"sabuk":    "Pakai Sarung Tangan",
		"sepatu":     "Pakai Sepatu Safety",
	}

	if name, ok := mapping[violationType]; ok {
		return name
	}
	return violationType
}

// MapSeverity maps severity to color/icon
func MapSeverity(severity string) (string, string) {
	switch severity {
	case "critical":
		return "🔴", "#ef4444"
	case "high":
		return "🟠", "#f97316"
	case "medium":
		return "🟡", "#eab308"
	case "low":
		return "🟢", "#22c55e"
	default:
		return "⚪", "#94a3b8"
	}
}

// StartOfDay returns start of day for given time
func StartOfDay(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, t.Location())
}

// EndOfDay returns end of day for given time
func EndOfDay(t time.Time) time.Time {
	return StartOfDay(t).Add(24*time.Hour - time.Nanosecond)
}

// StartOfWeek returns start of week (Monday) for given time
func StartOfWeek(t time.Time) time.Time {
	weekday := int(t.Weekday())
	if weekday == 0 {
		weekday = 7 // Sunday
	}
	return StartOfDay(t.AddDate(0, 0, -(weekday - 1)))
}

// StartOfMonth returns start of month for given time
func StartOfMonth(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), 1, 0, 0, 0, 0, t.Location())
}
