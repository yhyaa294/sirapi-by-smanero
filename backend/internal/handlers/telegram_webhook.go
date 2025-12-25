package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/smartapd/backend/internal/database"
	"github.com/smartapd/backend/internal/models"
	"github.com/smartapd/backend/internal/utils"
)

// TelegramUpdate represents an incoming Telegram update
type TelegramUpdate struct {
	UpdateID      int64          `json:"update_id"`
	Message       *TelegramMsg   `json:"message,omitempty"`
	CallbackQuery *CallbackQuery `json:"callback_query,omitempty"`
}

// TelegramMsg represents a Telegram message
type TelegramMsg struct {
	MessageID int64         `json:"message_id"`
	Chat      TelegramChat  `json:"chat"`
	Text      string        `json:"text"`
	From      *TelegramUser `json:"from,omitempty"`
}

// TelegramChat represents a Telegram chat
type TelegramChat struct {
	ID       int64  `json:"id"`
	Type     string `json:"type"`
	Title    string `json:"title,omitempty"`
	Username string `json:"username,omitempty"`
}

// TelegramUser represents a Telegram user
type TelegramUser struct {
	ID        int64  `json:"id"`
	FirstName string `json:"first_name"`
	Username  string `json:"username,omitempty"`
}

// CallbackQuery represents a callback from inline button
type CallbackQuery struct {
	ID      string        `json:"id"`
	From    *TelegramUser `json:"from"`
	Message *TelegramMsg  `json:"message,omitempty"`
	Data    string        `json:"data"`
}

// TelegramWebhook handles POST /api/telegram/webhook
func TelegramWebhook(c *fiber.Ctx) error {
	var update TelegramUpdate
	if err := c.BodyParser(&update); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid update"})
	}

	// Process callback queries (inline button clicks)
	if update.CallbackQuery != nil {
		handleCallbackQuery(update.CallbackQuery)
	}

	// Process commands
	if update.Message != nil && update.Message.Text != "" {
		handleBotCommand(update.Message)
	}

	return c.SendStatus(fiber.StatusOK)
}

// handleCallbackQuery processes callback queries from inline buttons
func handleCallbackQuery(cb *CallbackQuery) {
	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	if botToken == "" {
		return
	}

	// Verify HMAC-signed token
	callbackData, valid := utils.VerifyCallbackData(cb.Data)
	if !valid {
		answerCallback(botToken, cb.ID, "❌ Token tidak valid atau kadaluarsa")
		return
	}

	// Verify chat ID matches
	if cb.Message != nil && cb.Message.Chat.ID != callbackData.ChatID {
		answerCallback(botToken, cb.ID, "❌ Akses ditolak")
		return
	}

	db := database.GetDB()

	switch callbackData.Action {
	case "ack":
		// Acknowledge detection
		result := db.Model(&models.Detection{}).
			Where("id = ?", callbackData.DetectionID).
			Update("review_status", "accepted")

		if result.RowsAffected > 0 {
			// Log detection event
			logDetectionEvent(callbackData.DetectionID, cb.From, "acknowledge")

			// Edit message to show ACK
			username := "User"
			if cb.From != nil && cb.From.Username != "" {
				username = "@" + cb.From.Username
			} else if cb.From != nil {
				username = cb.From.FirstName
			}

			editMessageWithAck(botToken, cb.Message.Chat.ID, cb.Message.MessageID, username)
			answerCallback(botToken, cb.ID, "✅ Berhasil di-acknowledge!")
		} else {
			answerCallback(botToken, cb.ID, "⚠️ Detection tidak ditemukan")
		}

	case "fp":
		// Mark as false positive
		result := db.Model(&models.Detection{}).
			Where("id = ?", callbackData.DetectionID).
			Updates(map[string]interface{}{
				"review_status": "rejected",
				"review_notes":  "Marked as false positive via Telegram",
			})

		if result.RowsAffected > 0 {
			logDetectionEvent(callbackData.DetectionID, cb.From, "mark_false_positive")
			answerCallback(botToken, cb.ID, "✅ Ditandai sebagai False Positive")

			// Edit message
			editMessageWithFP(botToken, cb.Message.Chat.ID, cb.Message.MessageID)
		} else {
			answerCallback(botToken, cb.ID, "⚠️ Detection tidak ditemukan")
		}

	case "assign":
		// TODO: Implement assign flow
		answerCallback(botToken, cb.ID, "ℹ️ Fitur assign akan hadir segera")

	default:
		answerCallback(botToken, cb.ID, "❓ Aksi tidak dikenal")
	}
}

// handleBotCommand processes bot commands from webhook
func handleBotCommand(msg *TelegramMsg) {
	db := database.GetDB()

	// Store chat if /start command
	if msg.Text == "/start" {
		chat := models.TelegramChat{
			ChatID:    msg.Chat.ID,
			Title:     msg.Chat.Title,
			ChatType:  msg.Chat.Type,
			Username:  msg.Chat.Username,
			IsActive:  true,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		// Upsert
		db.Where("chat_id = ?", msg.Chat.ID).Assign(chat).FirstOrCreate(&chat)
		log.Printf("📱 Registered chat %d (%s)", msg.Chat.ID, msg.Chat.Title)
	}
}

// logDetectionEvent logs an action on a detection
func logDetectionEvent(detectionID uint, user *TelegramUser, action string) {
	db := database.GetDB()
	userID := uint(0)
	if user != nil {
		userID = uint(user.ID)
	}

	firstName := "Unknown"
	if user != nil {
		firstName = user.FirstName
	}

	event := models.DetectionEvent{
		DetectionID: detectionID,
		UserID:      userID,
		ActionType:  action,
		Notes:       fmt.Sprintf("Via Telegram by %s", firstName),
		CreatedAt:   time.Now(),
	}

	db.Create(&event)
}

// Helper functions for Telegram API calls

func answerCallback(botToken, callbackID, text string) {
	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/answerCallbackQuery", botToken)
	data := url.Values{}
	data.Set("callback_query_id", callbackID)
	data.Set("text", text)
	data.Set("show_alert", "false")
	http.PostForm(apiURL, data)
}

func editMessageWithAck(botToken string, chatID int64, messageID int64, username string) {
	text := fmt.Sprintf("✅ <b>ACKNOWLEDGED</b>\n\n<i>ACK oleh %s pada %s</i>",
		username, time.Now().Format("15:04:05 02-01-2006"))

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/editMessageText", botToken)

	data := url.Values{}
	data.Set("chat_id", strconv.FormatInt(chatID, 10))
	data.Set("message_id", strconv.FormatInt(messageID, 10))
	data.Set("text", text)
	data.Set("parse_mode", "HTML")

	http.PostForm(apiURL, data)
}

func editMessageWithFP(botToken string, chatID int64, messageID int64) {
	text := fmt.Sprintf("❌ <b>FALSE POSITIVE</b>\n\n<i>Ditandai pada %s</i>",
		time.Now().Format("15:04:05 02-01-2006"))

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/editMessageText", botToken)

	data := url.Values{}
	data.Set("chat_id", strconv.FormatInt(chatID, 10))
	data.Set("message_id", strconv.FormatInt(messageID, 10))
	data.Set("text", text)
	data.Set("parse_mode", "HTML")

	http.PostForm(apiURL, data)
}

// SetWebhook sets the Telegram webhook URL
func SetWebhook(c *fiber.Ctx) error {
	webhookURL := c.Query("url")
	if webhookURL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "url parameter required",
		})
	}

	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	if botToken == "" {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "TELEGRAM_BOT_TOKEN not set",
		})
	}

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/setWebhook", botToken)

	data := url.Values{}
	data.Set("url", webhookURL)

	resp, err := http.PostForm(apiURL, data)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	return c.JSON(result)
}
