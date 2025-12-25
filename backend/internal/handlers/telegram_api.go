package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/smartapd/backend/internal/database"
	"github.com/smartapd/backend/internal/models"
)

// CreateRegistration creates a new registration link
// POST /api/v1/telegram/registrations/create
func CreateRegistration(c *fiber.Ctx) error {
	// Get admin user from context (simplified - in production use auth middleware)
	adminID := uint(1) // TODO: Get from auth context

	// Generate token
	token := models.GenerateRegistrationToken()

	// Create registration with 10 minute expiry
	reg := models.TelegramRegistration{
		Token:     token,
		CreatedBy: adminID,
		ExpiresAt: time.Now().Add(10 * time.Minute),
		CreatedAt: time.Now(),
	}

	db := database.GetDB()
	if err := db.Create(&reg).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create registration",
		})
	}

	// Build deep link
	botUsername := os.Getenv("TELEGRAM_BOT_USERNAME")
	if botUsername == "" {
		botUsername = "SmartAPDbyAI_bot"
	}
	deepLink := fmt.Sprintf("https://t.me/%s?start=reg_%s", botUsername, token)

	return c.JSON(fiber.Map{
		"token":      token,
		"deep_link":  deepLink,
		"expires_at": reg.ExpiresAt,
		"instructions": map[string]string{
			"step1": "Klik link atau scan QR code",
			"step2": "Buka di Telegram (grup atau private)",
			"step3": "Tekan Start untuk mendaftarkan chat",
		},
	})
}

// ManualAddChat adds a chat by ID with validation
// POST /api/v1/telegram/chats/manual-add
func ManualAddChat(c *fiber.Ctx) error {
	var req struct {
		ChatID int64  `json:"chat_id"`
		Title  string `json:"title,omitempty"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.ChatID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "chat_id is required",
		})
	}

	// Validate chat_id via Telegram API
	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	if botToken == "" {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Bot token not configured",
		})
	}

	// Call getChat to validate
	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/getChat?chat_id=%d", botToken, req.ChatID)
	resp, err := http.Get(apiURL)
	if err != nil {
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{
			"error": "Failed to validate chat ID",
		})
	}
	defer resp.Body.Close()

	var result struct {
		OK     bool `json:"ok"`
		Result struct {
			ID       int64  `json:"id"`
			Type     string `json:"type"`
			Title    string `json:"title,omitempty"`
			Username string `json:"username,omitempty"`
		} `json:"result"`
		Description string `json:"description,omitempty"`
	}
	json.NewDecoder(resp.Body).Decode(&result)

	if !result.OK {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("Invalid chat ID: %s", result.Description),
		})
	}

	// Save chat
	title := req.Title
	if title == "" {
		title = result.Result.Title
		if title == "" {
			title = result.Result.Username
		}
	}

	adminID := uint(1) // TODO: Get from auth context

	chat := models.TelegramChat{
		ChatID:    result.Result.ID,
		Title:     title,
		ChatType:  result.Result.Type,
		Username:  result.Result.Username,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	db := database.GetDB()
	if err := db.Where("chat_id = ?", chat.ChatID).Assign(chat).FirstOrCreate(&chat).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to save chat",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Chat added successfully",
		"chat": fiber.Map{
			"chat_id":   chat.ChatID,
			"title":     chat.Title,
			"type":      chat.ChatType,
			"is_active": chat.IsActive,
		},
		"registered_by": adminID,
	})
}

// ListTelegramChats lists all registered chats
// GET /api/v1/telegram/chats
func ListTelegramChats(c *fiber.Ctx) error {
	db := database.GetDB()

	var chats []models.TelegramChat
	db.Order("created_at DESC").Find(&chats)

	return c.JSON(fiber.Map{
		"chats": chats,
		"total": len(chats),
	})
}

// TestTelegramChat sends a test message to a chat
// POST /api/v1/telegram/chats/:chat_id/test
func TestTelegramChat(c *fiber.Ctx) error {
	chatIDStr := c.Params("chat_id")
	chatID, err := strconv.ParseInt(chatIDStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid chat_id",
		})
	}

	// Verify chat exists
	db := database.GetDB()
	var chat models.TelegramChat
	if err := db.Where("chat_id = ?", chatID).First(&chat).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Chat not found",
		})
	}

	// Send test message
	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	if botToken == "" {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Bot token not configured",
		})
	}

	message := fmt.Sprintf(`🧪 <b>Test Connection</b>

✅ Chat ini terdaftar dengan SmartAPD.

📋 <b>Detail:</b>
• Chat ID: <code>%d</code>
• Title: %s
• Type: %s

🕐 %s`, chatID, chat.Title, chat.ChatType, time.Now().Format("15:04:05 02-01-2006"))

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", botToken)

	// Use url.Values for proper POST
	formData := fmt.Sprintf("chat_id=%d&text=%s&parse_mode=HTML", chatID, url.QueryEscape(message))

	resp, err := http.Post(apiURL, "application/x-www-form-urlencoded", strings.NewReader(formData))
	if err != nil {
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{
			"error": "Failed to send message",
		})
	}
	defer resp.Body.Close()

	var result struct {
		OK     bool `json:"ok"`
		Result struct {
			MessageID int64 `json:"message_id"`
		} `json:"result"`
	}
	json.NewDecoder(resp.Body).Decode(&result)

	// Log the message
	logEntry := models.SentMessageLog{
		ChatID:        chatID,
		TelegramMsgID: result.Result.MessageID,
		MessageType:   "test",
		Payload:       message,
		Status:        "sent",
		SentAt:        time.Now(),
	}
	if !result.OK {
		logEntry.Status = "failed"
	}
	db.Create(&logEntry)

	if result.OK {
		return c.JSON(fiber.Map{
			"message":             "Test message sent successfully",
			"telegram_message_id": result.Result.MessageID,
		})
	}

	return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{
		"error": "Failed to send test message",
	})
}

// RemoveTelegramChat removes a chat
// DELETE /api/v1/telegram/chats/:chat_id
func RemoveTelegramChat(c *fiber.Ctx) error {
	chatIDStr := c.Params("chat_id")
	chatID, err := strconv.ParseInt(chatIDStr, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid chat_id",
		})
	}

	db := database.GetDB()
	result := db.Where("chat_id = ?", chatID).Delete(&models.TelegramChat{})

	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Chat not found",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Chat removed successfully",
	})
}

// GetTelegramStatus returns the central bot status
// GET /api/v1/telegram/status
func GetTelegramStatus(c *fiber.Ctx) error {
	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	botUsername := os.Getenv("TELEGRAM_BOT_USERNAME")
	if botUsername == "" {
		botUsername = "SmartAPDbyAI_bot"
	}

	status := "inactive"
	botInfo := ""

	if botToken != "" {
		// Test connection
		apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/getMe", botToken)
		resp, err := http.Get(apiURL)
		if err == nil {
			defer resp.Body.Close()
			var result struct {
				OK     bool `json:"ok"`
				Result struct {
					Username string `json:"username"`
				} `json:"result"`
			}
			json.NewDecoder(resp.Body).Decode(&result)
			if result.OK {
				status = "active"
				botInfo = result.Result.Username
			}
		}
	}

	db := database.GetDB()
	var chatCount int64
	db.Model(&models.TelegramChat{}).Where("is_active = ?", true).Count(&chatCount)

	return c.JSON(fiber.Map{
		"status":           status,
		"bot_username":     botInfo,
		"registered_chats": chatCount,
		"mode":             "central_bot",
	})
}

// Helper function to escape JSON special characters
func escapeJSON(s string) string {
	// Basic escaping for JSON string
	result := ""
	for _, c := range s {
		switch c {
		case '"':
			result += `\"`
		case '\\':
			result += `\\`
		case '\n':
			result += `\n`
		case '\r':
			result += `\r`
		case '\t':
			result += `\t`
		default:
			result += string(c)
		}
	}
	return result
}
