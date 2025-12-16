package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

// TelegramService handles Telegram bot notifications
type TelegramService struct {
	BotToken    string
	ChatID      string
	Enabled     bool
	RateLimiter map[string]time.Time
	Cooldown    time.Duration
}

// NewTelegramService creates a new Telegram service instance
func NewTelegramService(botToken, chatID string) *TelegramService {
	service := &TelegramService{
		BotToken:    botToken,
		ChatID:      chatID,
		Enabled:     botToken != "" && chatID != "",
		RateLimiter: make(map[string]time.Time),
		Cooldown:    30 * time.Second,
	}

	if service.Enabled {
		log.Println("✅ Telegram service initialized")
		go service.testConnection()
	} else {
		log.Println("⚠️ Telegram service disabled (missing token or chat ID)")
	}

	return service
}

// testConnection tests the Telegram bot connection
func (t *TelegramService) testConnection() {
	url := fmt.Sprintf("https://api.telegram.org/bot%s/getMe", t.BotToken)

	resp, err := http.Get(url)
	if err != nil {
		log.Printf("❌ Telegram connection failed: %v", err)
		t.Enabled = false
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		log.Println("✅ Telegram bot connected successfully")
	} else {
		log.Printf("❌ Telegram connection failed with status: %d", resp.StatusCode)
		t.Enabled = false
	}
}

// canSend checks if we can send a message (rate limiting)
func (t *TelegramService) canSend(key string) bool {
	if lastSent, exists := t.RateLimiter[key]; exists {
		if time.Since(lastSent) < t.Cooldown {
			return false
		}
	}
	t.RateLimiter[key] = time.Now()
	return true
}

// SendMessage sends a text message via Telegram
func (t *TelegramService) SendMessage(message string) error {
	if !t.Enabled {
		return fmt.Errorf("telegram service disabled")
	}

	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", t.BotToken)

	payload := map[string]interface{}{
		"chat_id":    t.ChatID,
		"text":       message,
		"parse_mode": "HTML",
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("telegram error: %s", string(body))
	}

	return nil
}

// SendPhoto sends a photo with caption via Telegram
func (t *TelegramService) SendPhoto(imagePath, caption string) error {
	if !t.Enabled {
		return fmt.Errorf("telegram service disabled")
	}

	// Check if file exists
	if _, err := os.Stat(imagePath); os.IsNotExist(err) {
		return fmt.Errorf("image file not found: %s", imagePath)
	}

	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendPhoto", t.BotToken)

	// Create multipart form
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Add chat_id
	writer.WriteField("chat_id", t.ChatID)
	writer.WriteField("caption", caption)
	writer.WriteField("parse_mode", "HTML")

	// Add photo
	file, err := os.Open(imagePath)
	if err != nil {
		return err
	}
	defer file.Close()

	part, err := writer.CreateFormFile("photo", filepath.Base(imagePath))
	if err != nil {
		return err
	}
	io.Copy(part, file)
	writer.Close()

	// Send request
	resp, err := http.Post(url, writer.FormDataContentType(), body)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("telegram error: %s", string(respBody))
	}

	return nil
}

// SendViolationAlert sends a PPE violation alert
func (t *TelegramService) SendViolationAlert(violationType, location string, confidence float64, imagePath string) error {
	if !t.Enabled {
		return fmt.Errorf("telegram service disabled")
	}

	// Rate limiting per violation type
	if !t.canSend(violationType) {
		log.Printf("Rate limited: %s", violationType)
		return nil
	}

	// Format violation type for display
	violationDisplay := map[string]string{
		"no_helmet": "🔴 TIDAK PAKAI HELM",
		"no_vest":   "🟠 TIDAK PAKAI ROMPI",
		"no_gloves": "🟡 TIDAK PAKAI SARUNG TANGAN",
		"no_boots":  "🟤 TIDAK PAKAI SEPATU SAFETY",
	}

	display := violationDisplay[violationType]
	if display == "" {
		display = violationType
	}

	// Build message
	message := fmt.Sprintf(`
🚨 <b>PELANGGARAN APD TERDETEKSI</b>

%s

📍 <b>Lokasi:</b> %s
📊 <b>Confidence:</b> %.1f%%
🕐 <b>Waktu:</b> %s

⚠️ Segera lakukan tindakan!
`, display, location, confidence*100, time.Now().Format("15:04:05 02-01-2006"))

	// Send with or without photo
	if imagePath != "" {
		return t.SendPhoto(imagePath, message)
	}
	return t.SendMessage(message)
}

// SendDailySummary sends daily summary report
func (t *TelegramService) SendDailySummary(totalDetections, totalViolations int, complianceRate float64) error {
	if !t.Enabled {
		return fmt.Errorf("telegram service disabled")
	}

	status := "🟢 BAIK"
	if complianceRate < 90 {
		status = "🟡 PERLU PERHATIAN"
	}
	if complianceRate < 70 {
		status = "🔴 KRITIS"
	}

	message := fmt.Sprintf(`
📊 <b>LAPORAN HARIAN SMARTAPD</b>
━━━━━━━━━━━━━━━━━━━━━

📅 Tanggal: %s

📈 <b>Statistik:</b>
• Total Deteksi: %d
• Total Pelanggaran: %d
• Tingkat Kepatuhan: %.1f%%

🎯 <b>Status:</b> %s

━━━━━━━━━━━━━━━━━━━━━
<i>SmartAPD - AI Safety Monitoring</i>
`, time.Now().Format("02 January 2006"), totalDetections, totalViolations, complianceRate, status)

	return t.SendMessage(message)
}

// SendSystemStatus sends system status notification
func (t *TelegramService) SendSystemStatus(status, message string) error {
	if !t.Enabled {
		return fmt.Errorf("telegram service disabled")
	}

	emoji := "ℹ️"
	switch status {
	case "started":
		emoji = "🟢"
	case "stopped":
		emoji = "🔴"
	case "error":
		emoji = "⚠️"
	case "warning":
		emoji = "🟡"
	}

	msg := fmt.Sprintf(`
%s <b>SMARTAPD SYSTEM</b>

Status: <code>%s</code>
%s

🕐 %s
`, emoji, status, message, time.Now().Format("15:04:05"))

	return t.SendMessage(msg)
}
