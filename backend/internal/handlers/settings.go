package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/gofiber/fiber/v2"
)

// TelegramSettings holds the Telegram configuration
type TelegramSettings struct {
	BotToken string `json:"bot_token"`
	ChatID   string `json:"chat_id"`
}

// In-memory storage for Telegram settings (can be upgraded to database)
var currentTelegramSettings = TelegramSettings{}

// GetTelegramSettings returns current Telegram settings
func GetTelegramSettings(c *fiber.Ctx) error {
	// Don't return the token for security, just indicate if it's set
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"bot_token_set": currentTelegramSettings.BotToken != "",
			"chat_id":       currentTelegramSettings.ChatID,
		},
	})
}

// UpdateTelegramSettings updates Telegram configuration
func UpdateTelegramSettings(c *fiber.Ctx) error {
	var settings TelegramSettings
	if err := c.BodyParser(&settings); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	if settings.BotToken == "" || settings.ChatID == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Bot token and chat ID are required",
		})
	}

	currentTelegramSettings = settings

	// Also update environment variables for the service to use
	os.Setenv("TELEGRAM_BOT_TOKEN", settings.BotToken)
	os.Setenv("TELEGRAM_CHAT_ID", settings.ChatID)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Telegram settings updated successfully",
	})
}

// TestTelegramConnection tests the Telegram bot connection
func TestTelegramConnection(c *fiber.Ctx) error {
	var settings TelegramSettings
	if err := c.BodyParser(&settings); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	if settings.BotToken == "" || settings.ChatID == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Bot token and chat ID are required",
		})
	}

	// Test 1: Verify bot token with getMe
	getMeURL := fmt.Sprintf("https://api.telegram.org/bot%s/getMe", settings.BotToken)
	resp, err := http.Get(getMeURL)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to connect to Telegram API",
		})
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Invalid bot token",
		})
	}

	// Parse bot info
	body, _ := io.ReadAll(resp.Body)
	var getMeResult struct {
		OK     bool `json:"ok"`
		Result struct {
			Username string `json:"username"`
		} `json:"result"`
	}
	json.Unmarshal(body, &getMeResult)

	// Test 2: Send test message
	sendMessageURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", settings.BotToken)
	message := fmt.Sprintf(`
✅ <b>SmartAPD - Koneksi Berhasil!</b>

Bot @%s terkoneksi dengan sistem SmartAPD.
Anda akan menerima notifikasi pelanggaran APD melalui chat ini.

🕐 Waktu Tes: %s
`, getMeResult.Result.Username, c.Context().Time().Format("15:04:05"))

	payload := map[string]interface{}{
		"chat_id":    settings.ChatID,
		"text":       message,
		"parse_mode": "HTML",
	}

	jsonPayload, _ := json.Marshal(payload)
	testResp, err := http.Post(sendMessageURL, "application/json",
		io.NopCloser(bytes.NewReader(jsonPayload)))

	if err != nil || testResp.StatusCode != 200 {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Bot connected but failed to send message. Check chat ID.",
		})
	}
	defer testResp.Body.Close()

	return c.JSON(fiber.Map{
		"success": true,
		"message": fmt.Sprintf("Connected! Bot @%s is ready.", getMeResult.Result.Username),
	})
}

// SendTelegramNotification sends a notification via Telegram
func SendTelegramNotification(c *fiber.Ctx) error {
	var request struct {
		Type string                 `json:"type"`
		Data map[string]interface{} `json:"data"`
	}

	if err := c.BodyParser(&request); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	if currentTelegramSettings.BotToken == "" || currentTelegramSettings.ChatID == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Telegram not configured",
		})
	}

	var message string
	switch request.Type {
	case "violation":
		violationType := request.Data["violation_type"]
		location := request.Data["location"]
		confidence := request.Data["confidence"]

		message = fmt.Sprintf(`
🚨 <b>PELANGGARAN APD TERDETEKSI</b>

⚠️ %v
📍 <b>Lokasi:</b> %v
📊 <b>Confidence:</b> %.1f%%
🕐 <b>Waktu:</b> %s

Segera lakukan tindakan!
`, violationType, location, confidence, c.Context().Time().Format("15:04:05"))

	case "daily_summary":
		detections := request.Data["total_detections"]
		violations := request.Data["total_violations"]
		compliance := request.Data["compliance_rate"]

		message = fmt.Sprintf(`
📊 <b>LAPORAN HARIAN SMARTAPD</b>
━━━━━━━━━━━━━━━━━━━━━

📈 <b>Statistik:</b>
• Total Deteksi: %v
• Total Pelanggaran: %v
• Tingkat Kepatuhan: %.1f%%

━━━━━━━━━━━━━━━━━━━━━
<i>SmartAPD - AI Safety Monitoring</i>
`, detections, violations, compliance)

	case "system":
		status := request.Data["status"]
		msg := request.Data["message"]
		message = fmt.Sprintf("ℹ️ <b>SmartAPD System</b>\n\nStatus: %v\n%v", status, msg)

	default:
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Unknown notification type",
		})
	}

	// Send message
	sendURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", currentTelegramSettings.BotToken)
	payload := map[string]interface{}{
		"chat_id":    currentTelegramSettings.ChatID,
		"text":       message,
		"parse_mode": "HTML",
	}

	jsonPayload, _ := json.Marshal(payload)
	resp, err := http.Post(sendURL, "application/json",
		io.NopCloser(bytes.NewReader(jsonPayload)))

	if err != nil || resp.StatusCode != 200 {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to send Telegram message",
		})
	}
	defer resp.Body.Close()

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Notification sent",
	})
}
