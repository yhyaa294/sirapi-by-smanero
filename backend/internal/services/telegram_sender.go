package services

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/sirapi/backend/internal/database"
	"github.com/sirapi/backend/internal/models"
	"github.com/sirapi/backend/internal/utils"
)

// TelegramSender handles sending notifications via Telegram
type TelegramSender struct {
	botToken       string
	queue          *NotificationQueue
	cooldowns      map[string]time.Time // key: "chatID:cameraID"
	mu             sync.Mutex
	cooldownSecs   int
	rateLimitDelay time.Duration
	running        bool
	stopCh         chan struct{}
}

// NewTelegramSender creates a new sender instance
func NewTelegramSender() *TelegramSender {
	cooldownSecs := 60
	if val := os.Getenv("COOLDOWN_SECONDS"); val != "" {
		if v, err := strconv.Atoi(val); err == nil {
			cooldownSecs = v
		}
	}

	rateLimit := 40 // ms between messages (25 msg/sec)
	if val := os.Getenv("TELEGRAM_SENDER_RATE_LIMIT"); val != "" {
		if v, err := strconv.Atoi(val); err == nil {
			rateLimit = v
		}
	}

	return &TelegramSender{
		botToken:       os.Getenv("TELEGRAM_BOT_TOKEN"),
		queue:          GetNotificationQueue(),
		cooldowns:      make(map[string]time.Time),
		cooldownSecs:   cooldownSecs,
		rateLimitDelay: time.Duration(rateLimit) * time.Millisecond,
		stopCh:         make(chan struct{}),
	}
}

// Start begins consuming from the queue and sending messages
func (s *TelegramSender) Start() {
	if s.botToken == "" {
		log.Println("⚠️ Telegram Sender disabled (TELEGRAM_BOT_TOKEN not set)")
		return
	}

	s.mu.Lock()
	if s.running {
		s.mu.Unlock()
		return
	}
	s.running = true
	s.mu.Unlock()

	log.Printf("📤 Telegram Sender started (cooldown: %ds)", s.cooldownSecs)

	go func() {
		for {
			select {
			case <-s.stopCh:
				log.Println("🛑 Telegram Sender stopped")
				return
			case task := <-s.queue.Consume():
				s.processTask(task)
				time.Sleep(s.rateLimitDelay) // Rate limiting
			}
		}
	}()
}

// Stop stops the sender
func (s *TelegramSender) Stop() {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.running {
		close(s.stopCh)
		s.running = false
	}
}

// processTask sends notification to all target chats
func (s *TelegramSender) processTask(task NotificationTask) {
	db := database.GetDB()

	// Get target chats
	var chats []models.TelegramChat
	if len(task.TargetChats) > 0 {
		db.Where("chat_id IN ? AND is_active = ?", task.TargetChats, true).Find(&chats)
	} else {
		db.Where("is_active = ? AND (muted_until IS NULL OR muted_until < ?)", true, time.Now()).Find(&chats)
	}

	if len(chats) == 0 {
		log.Println("📭 No active chats to send notification")
		return
	}

	for _, chat := range chats {
		// Check cooldown
		cooldownKey := fmt.Sprintf("%d:%d", chat.ChatID, task.CameraID)
		s.mu.Lock()
		if lastSent, ok := s.cooldowns[cooldownKey]; ok {
			if time.Since(lastSent) < time.Duration(s.cooldownSecs)*time.Second {
				s.mu.Unlock()
				s.logMessage(chat.ChatID, 0, &task.DetectionID, task.ToJSON(), "skipped", "cooldown")
				continue
			}
		}
		s.cooldowns[cooldownKey] = time.Now()
		s.mu.Unlock()

		// Build message
		msgID, err := s.sendViolationAlert(chat.ChatID, task)
		if err != nil {
			log.Printf("❌ Failed to send to chat %d: %v", chat.ChatID, err)
			s.logMessage(chat.ChatID, 0, &task.DetectionID, task.ToJSON(), "failed", err.Error())
			continue
		}

		s.logMessage(chat.ChatID, msgID, &task.DetectionID, task.ToJSON(), "sent", "")
		log.Printf("✅ Sent notification to chat %d (msg_id: %d)", chat.ChatID, msgID)
	}
}

// sendViolationAlert sends an alert with inline buttons
func (s *TelegramSender) sendViolationAlert(chatID int64, task NotificationTask) (int64, error) {
	// Build message text
	severityEmoji := map[string]string{
		"critical": "🔴",
		"high":     "🟠",
		"medium":   "🟡",
		"low":      "🟢",
	}
	emoji := severityEmoji[task.Severity]
	if emoji == "" {
		emoji = "⚠️"
	}

	text := fmt.Sprintf(`%s <b>PELANGGARAN SERAGAM TERDETEKSI</b>

📍 <b>Lokasi:</b> %s
🚨 <b>Jenis:</b> %s
📊 <b>Confidence:</b> %.1f%%
🕐 <b>Waktu:</b> %s

⚠️ Segera lakukan tindakan!`,
		emoji,
		task.Location,
		formatViolationType(task.ViolationType),
		task.Confidence*100,
		task.Timestamp.Format("15:04:05 02-01-2006"),
	)

	// Build inline keyboard with signed tokens
	ackToken := utils.CreateAckToken(task.DetectionID, chatID)
	fpToken := utils.CreateFPToken(task.DetectionID, chatID)

	reportURL := os.Getenv("REPORT_BASE_URL")
	if reportURL == "" {
		reportURL = "http://localhost:3000"
	}
	detailURL := fmt.Sprintf("%s/dashboard/alerts?id=%d", reportURL, task.DetectionID)

	keyboard := map[string]interface{}{
		"inline_keyboard": [][]map[string]string{
			{
				{"text": "✅ Acknowledge", "callback_data": ackToken},
				{"text": "🔗 View Details", "url": detailURL},
			},
			{
				{"text": "❌ Mark False Positive", "callback_data": fpToken},
			},
		},
	}
	keyboardJSON, _ := json.Marshal(keyboard)

	// Send message
	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", s.botToken)

	data := url.Values{}
	data.Set("chat_id", strconv.FormatInt(chatID, 10))
	data.Set("text", text)
	data.Set("parse_mode", "HTML")
	data.Set("reply_markup", string(keyboardJSON))

	resp, err := http.PostForm(apiURL, data)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	var result struct {
		OK     bool `json:"ok"`
		Result struct {
			MessageID int64 `json:"message_id"`
		} `json:"result"`
	}
	json.NewDecoder(resp.Body).Decode(&result)

	if !result.OK {
		return 0, fmt.Errorf("telegram API error")
	}

	return result.Result.MessageID, nil
}

// logMessage logs a sent message to the database
func (s *TelegramSender) logMessage(chatID int64, msgID int64, detectionID *uint, payload, status, errorText string) {
	db := database.GetDB()
	log := models.SentMessageLog{
		ChatID:        chatID,
		TelegramMsgID: msgID,
		DetectionID:   detectionID,
		MessageType:   "alert",
		Payload:       payload,
		Status:        status,
		ErrorText:     errorText,
		SentAt:        time.Now(),
	}
	db.Create(&log)
}

// formatViolationType formats violation type for display
func formatViolationType(vt string) string {
	types := map[string]string{
		"no_topi":   "Tidak Pakai Helm",
		"no_dasi":   "Tidak Pakai Rompi",
		"no_sabuk":  "Tidak Pakai Sarung Tangan",
		"no_sepatu": "Tidak Pakai Sepatu Safety",
	}
	if formatted, ok := types[vt]; ok {
		return formatted
	}
	return vt
}
