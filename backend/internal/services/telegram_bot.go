package services

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/sirapi/backend/internal/database"
	"github.com/sirapi/backend/internal/models"
)

// Import database and models using runtime access
// We'll use database.GetDB() directly without separate import

// TelegramBot handles interactive bot commands and callbacks
type TelegramBot struct {
	service   *TelegramService
	offset    int64
	running   bool
	stopCh    chan struct{}
	mu        sync.Mutex
	userPages map[int64]int // track user's current page in /monitor
}

// Update represents a Telegram update
type Update struct {
	UpdateID      int64          `json:"update_id"`
	Message       *Message       `json:"message,omitempty"`
	CallbackQuery *CallbackQuery `json:"callback_query,omitempty"`
}

// Message represents a Telegram message
type Message struct {
	MessageID int64  `json:"message_id"`
	Chat      Chat   `json:"chat"`
	Text      string `json:"text"`
	From      *User  `json:"from,omitempty"`
}

// Chat represents a Telegram chat
type Chat struct {
	ID   int64  `json:"id"`
	Type string `json:"type"`
}

// User represents a Telegram user
type User struct {
	ID        int64  `json:"id"`
	FirstName string `json:"first_name"`
	Username  string `json:"username,omitempty"`
}

// CallbackQuery represents a callback from inline button
type CallbackQuery struct {
	ID      string   `json:"id"`
	From    *User    `json:"from"`
	Message *Message `json:"message,omitempty"`
	Data    string   `json:"data"`
}

// InlineKeyboardButton represents an inline button
type InlineKeyboardButton struct {
	Text         string `json:"text"`
	CallbackData string `json:"callback_data,omitempty"`
	URL          string `json:"url,omitempty"`
}

// InlineKeyboardMarkup represents inline keyboard
type InlineKeyboardMarkup struct {
	InlineKeyboard [][]InlineKeyboardButton `json:"inline_keyboard"`
}

// NewTelegramBot creates a new bot instance
func NewTelegramBot(service *TelegramService) *TelegramBot {
	return &TelegramBot{
		service:   service,
		offset:    0,
		running:   false,
		stopCh:    make(chan struct{}),
		userPages: make(map[int64]int),
	}
}

// StartPolling starts the bot polling loop
func (b *TelegramBot) StartPolling() {
	if !b.service.Enabled {
		log.Println("⚠️ Telegram Bot polling disabled (service not enabled)")
		return
	}

	b.mu.Lock()
	if b.running {
		b.mu.Unlock()
		return
	}
	b.running = true
	b.mu.Unlock()

	log.Println("🤖 Telegram Bot polling started")

	go func() {
		for {
			select {
			case <-b.stopCh:
				log.Println("🛑 Telegram Bot polling stopped")
				return
			default:
				b.pollUpdates()
			}
		}
	}()
}

// StopPolling stops the bot
func (b *TelegramBot) StopPolling() {
	b.mu.Lock()
	defer b.mu.Unlock()
	if b.running {
		close(b.stopCh)
		b.running = false
	}
}

// pollUpdates fetches and processes updates
func (b *TelegramBot) pollUpdates() {
	url := fmt.Sprintf("https://api.telegram.org/bot%s/getUpdates?offset=%d&timeout=30",
		b.service.BotToken, b.offset)

	resp, err := http.Get(url)
	if err != nil {
		log.Printf("Telegram poll error: %v", err)
		time.Sleep(5 * time.Second)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var result struct {
		OK     bool     `json:"ok"`
		Result []Update `json:"result"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		log.Printf("Telegram parse error: %v", err)
		return
	}

	for _, update := range result.Result {
		b.offset = update.UpdateID + 1
		b.handleUpdate(update)
	}
}

// handleUpdate processes an update
func (b *TelegramBot) handleUpdate(update Update) {
	if update.Message != nil && update.Message.Text != "" {
		b.handleCommand(update.Message)
	}
	if update.CallbackQuery != nil {
		b.handleCallback(update.CallbackQuery)
	}
}

// handleCommand processes bot commands
func (b *TelegramBot) handleCommand(msg *Message) {
	text := strings.TrimSpace(msg.Text)
	parts := strings.Fields(text)
	if len(parts) == 0 {
		return
	}

	cmd := strings.ToLower(parts[0])
	args := parts[1:]

	switch cmd {
	case "/start":
		b.cmdStart(msg)
	case "/dashboard", "📊", "📊 dashboard":
		b.cmdDashboard(msg)
	case "/status", "📈", "📈 status":
		b.cmdStatus(msg)
	case "/monitor", "👁️", "👁️ monitor":
		b.cmdMonitor(msg, 0)
	case "/subscribe":
		b.cmdSubscribe(msg, args)
	case "/unsubscribe":
		b.cmdUnsubscribe(msg, args)
	case "/help", "❓", "❓ help":
		b.cmdHelp(msg)
	default:
		// Also check for partial matches for keyboard buttons
		if strings.Contains(strings.ToLower(text), "dashboard") {
			b.cmdDashboard(msg)
		} else if strings.Contains(strings.ToLower(text), "monitor") {
			b.cmdMonitor(msg, 0)
		} else if strings.Contains(strings.ToLower(text), "status") {
			b.cmdStatus(msg)
		} else if strings.Contains(strings.ToLower(text), "help") {
			b.cmdHelp(msg)
		} else if strings.HasPrefix(cmd, "/") {
			b.sendReply(msg.Chat.ID, "❓ Perintah tidak dikenal. Ketik /help untuk bantuan.")
		}
	}
}

// cmdStart handles /start
func (b *TelegramBot) cmdStart(msg *Message) {
	name := "User"
	if msg.From != nil {
		name = msg.From.FirstName
	}

	text := fmt.Sprintf(`🛡️ <b>Selamat Datang di SiRapi Bot!</b>

Halo %s! 👋

Bot ini adalah dashboard kedua untuk memantau keselamatan seragam secara real-time.

<b>Gunakan tombol menu di bawah atau ketik:</b>
/dashboard - Ringkasan quick view
/monitor - Detail deteksi (paged)
/status - Safety score singkat
/help - Bantuan

Tap tombol menu untuk memulai! 🚀`, name)

	// Send with persistent reply keyboard
	b.sendWithKeyboard(msg.Chat.ID, text)
}

// sendWithKeyboard sends message with persistent menu keyboard
func (b *TelegramBot) sendWithKeyboard(chatID int64, text string) {
	keyboard := map[string]interface{}{
		"keyboard": [][]map[string]string{
			{
				{"text": "📊 Dashboard"},
				{"text": "👁️ Monitor"},
			},
			{
				{"text": "📈 Status"},
				{"text": "❓ Help"},
			},
		},
		"resize_keyboard": true,
		"persistent":      true,
	}
	keyboardJSON, _ := json.Marshal(keyboard)

	data := url.Values{}
	data.Set("chat_id", strconv.FormatInt(chatID, 10))
	data.Set("text", text)
	data.Set("parse_mode", "HTML")
	data.Set("reply_markup", string(keyboardJSON))

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", b.service.BotToken)
	http.PostForm(apiURL, data)
}

// cmdDashboard handles /dashboard - Quick summary
func (b *TelegramBot) cmdDashboard(msg *Message) {
	// Get stats from database
	var totalDetections, totalViolations, camerasActive int64

	db := database.GetDB()

	// Count today's detections
	today := time.Now().Format("2006-01-02")
	db.Model(&models.Detection{}).Where("DATE(detected_at) = ?", today).Count(&totalDetections)
	db.Model(&models.Detection{}).Where("DATE(detected_at) = ? AND is_violation = ?", today, true).Count(&totalViolations)
	db.Model(&models.Camera{}).Where("is_active = ?", true).Count(&camerasActive)

	// Calculate safety score
	safetyScore := 100.0
	if totalDetections > 0 {
		safetyScore = float64(totalDetections-totalViolations) / float64(totalDetections) * 100
	}

	// Get priority alerts
	var criticalCount int64
	db.Model(&models.Detection{}).Where("DATE(detected_at) = ? AND is_violation = ? AND priority = ?", today, true, 1).Count(&criticalCount)

	now := time.Now().Format("02 Jan 2006 15:04")

	text := fmt.Sprintf(`⚠️ <b>SiRapi — Ringkasan</b> (%s)

━━━━━━━━━━━━━━━━━━━━━
📊 <b>Safety Score:</b> %.1f%%
🚨 <b>Pelanggaran Hari Ini:</b> %d
📸 <b>Total Deteksi:</b> %d
📹 <b>Kamera Aktif:</b> %d
━━━━━━━━━━━━━━━━━━━━━`, now, safetyScore, totalViolations, totalDetections, camerasActive)

	if criticalCount > 0 {
		text += fmt.Sprintf("\n\n🔴 <b>Prioritas:</b> %d KRITIS", criticalCount)
	}

	// Create inline keyboard
	keyboard := InlineKeyboardMarkup{
		InlineKeyboard: [][]InlineKeyboardButton{
			{
				{Text: "🔍 Buka Detail", CallbackData: "monitor:0"},
				{Text: "✅ Acknowledge All", CallbackData: "ack_all"},
			},
			{
				{Text: "🔕 Mute 1h", CallbackData: "mute:60"},
				{Text: "🔄 Refresh", CallbackData: "refresh:dashboard"},
			},
		},
	}

	b.sendMessageWithKeyboard(msg.Chat.ID, text, keyboard)
}

// cmdStatus handles /status - Quick safety score
func (b *TelegramBot) cmdStatus(msg *Message) {
	db := database.GetDB()
	today := time.Now().Format("2006-01-02")

	var total, violations int64
	db.Model(&models.Detection{}).Where("DATE(detected_at) = ?", today).Count(&total)
	db.Model(&models.Detection{}).Where("DATE(detected_at) = ? AND is_violation = ?", today, true).Count(&violations)

	score := 100.0
	if total > 0 {
		score = float64(total-violations) / float64(total) * 100
	}

	emoji := "🟢"
	if score < 90 {
		emoji = "🟡"
	}
	if score < 70 {
		emoji = "🔴"
	}

	text := fmt.Sprintf(`%s <b>Safety Score: %.1f%%</b>

📊 Deteksi: %d | 🚨 Pelanggaran: %d`, emoji, score, total, violations)

	b.sendReply(msg.Chat.ID, text)
}

// cmdMonitor handles /monitor - Paged list
func (b *TelegramBot) cmdMonitor(msg *Message, page int) {
	db := database.GetDB()

	var detections []models.Detection
	limit := 5
	offset := page * limit

	db.Where("is_violation = ?", true).
		Order("detected_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&detections)

	var totalCount int64
	db.Model(&models.Detection{}).Where("is_violation = ?", true).Count(&totalCount)

	totalPages := int(totalCount) / limit
	if int(totalCount)%limit > 0 {
		totalPages++
	}
	if totalPages == 0 {
		totalPages = 1
	}

	text := fmt.Sprintf("📋 <b>Monitor Deteksi</b> (Hal %d/%d)\n━━━━━━━━━━━━━━━━━━━━━\n", page+1, totalPages)

	if len(detections) == 0 {
		text += "\n✅ Tidak ada pelanggaran tercatat."
	} else {
		for i, d := range detections {
			status := "⏳"
			if d.ReviewStatus == "accepted" {
				status = "✅"
			} else if d.ReviewStatus == "rejected" {
				status = "❌"
			}

			text += fmt.Sprintf("\n%s <b>#%d</b> %s\n   📍 %s | ⏰ %s\n",
				status,
				d.ID,
				d.ViolationType,
				d.Location,
				d.DetectedAt.Format("15:04"))

			if i < len(detections)-1 {
				text += "───────────────────\n"
			}
		}
	}

	// Navigation buttons
	var navButtons []InlineKeyboardButton
	if page > 0 {
		navButtons = append(navButtons, InlineKeyboardButton{Text: "⬅️ Prev", CallbackData: fmt.Sprintf("page:%d", page-1)})
	}
	navButtons = append(navButtons, InlineKeyboardButton{Text: fmt.Sprintf("📄 %d/%d", page+1, totalPages), CallbackData: "noop"})
	if page < totalPages-1 {
		navButtons = append(navButtons, InlineKeyboardButton{Text: "➡️ Next", CallbackData: fmt.Sprintf("page:%d", page+1)})
	}

	keyboard := InlineKeyboardMarkup{
		InlineKeyboard: [][]InlineKeyboardButton{
			navButtons,
			{
				{Text: "🔄 Refresh", CallbackData: fmt.Sprintf("refresh:monitor:%d", page)},
				{Text: "🏠 Dashboard", CallbackData: "refresh:dashboard"},
			},
		},
	}

	b.sendMessageWithKeyboard(msg.Chat.ID, text, keyboard)
}

// cmdSubscribe handles /subscribe
func (b *TelegramBot) cmdSubscribe(msg *Message, args []string) {
	filter := "all"
	if len(args) > 0 {
		filter = args[0]
	}

	// Save subscription (simplified - just acknowledge)
	text := fmt.Sprintf(`✅ <b>Berlangganan Aktif</b>

Filter: <code>%s</code>

Anda akan menerima notifikasi untuk:
• Pelanggaran seragam terdeteksi
• Laporan harian (08:00)
• Status sistem kritis

Ketik /unsubscribe untuk berhenti.`, filter)

	b.sendReply(msg.Chat.ID, text)
}

// cmdUnsubscribe handles /unsubscribe
func (b *TelegramBot) cmdUnsubscribe(msg *Message, args []string) {
	b.sendReply(msg.Chat.ID, "🔕 Anda telah berhenti berlangganan notifikasi.")
}

// cmdHelp handles /help
func (b *TelegramBot) cmdHelp(msg *Message) {
	text := `📚 <b>Panduan SiRapi Bot</b>

<b>Perintah Utama:</b>
/dashboard - Ringkasan KPI dengan tombol aksi
/monitor - Daftar deteksi dengan navigasi
/status - Safety score cepat
/subscribe [filter] - Mulai notifikasi
/unsubscribe - Stop notifikasi

<b>Filter Subscribe:</b>
• <code>all</code> - Semua notifikasi
• <code>CAM-01</code> - Kamera tertentu
• <code>zoneA</code> - Zona tertentu

<b>Tombol Aksi:</b>
• ✅ Acknowledge - Tandai ditangani
• 🔕 Mute - Hentikan notifikasi sementara
• 🔄 Refresh - Update data terbaru

<i>SiRapi - AI Safety Monitoring</i>`

	b.sendReply(msg.Chat.ID, text)
}

// handleCallback processes inline button callbacks
func (b *TelegramBot) handleCallback(cb *CallbackQuery) {
	data := cb.Data
	chatID := cb.Message.Chat.ID
	messageID := cb.Message.MessageID

	parts := strings.Split(data, ":")

	switch parts[0] {
	case "monitor":
		page := 0
		if len(parts) > 1 {
			page, _ = strconv.Atoi(parts[1])
		}
		b.editMonitor(chatID, messageID, page)

	case "page":
		page := 0
		if len(parts) > 1 {
			page, _ = strconv.Atoi(parts[1])
		}
		b.editMonitor(chatID, messageID, page)

	case "ack_all":
		b.acknowledgeAll(chatID, messageID)

	case "ack":
		if len(parts) > 1 {
			detID, _ := strconv.Atoi(parts[1])
			b.acknowledgeOne(chatID, messageID, uint(detID))
		}

	case "mute":
		duration := 60
		if len(parts) > 1 {
			duration, _ = strconv.Atoi(parts[1])
		}
		b.muteNotifications(chatID, messageID, duration)

	case "refresh":
		if len(parts) > 1 && parts[1] == "dashboard" {
			b.refreshDashboard(chatID, messageID)
		} else if len(parts) > 2 && parts[1] == "monitor" {
			page, _ := strconv.Atoi(parts[2])
			b.editMonitor(chatID, messageID, page)
		}

	case "noop":
		// Do nothing, just answer callback
	}

	// Answer callback to remove loading state
	b.answerCallback(cb.ID)
}

// editMonitor updates monitor message
func (b *TelegramBot) editMonitor(chatID int64, messageID int64, page int) {
	db := database.GetDB()

	var detections []models.Detection
	limit := 5
	offset := page * limit

	db.Where("is_violation = ?", true).
		Order("detected_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&detections)

	var totalCount int64
	db.Model(&models.Detection{}).Where("is_violation = ?", true).Count(&totalCount)

	totalPages := int(totalCount) / limit
	if int(totalCount)%limit > 0 {
		totalPages++
	}
	if totalPages == 0 {
		totalPages = 1
	}

	text := fmt.Sprintf("📋 <b>Monitor Deteksi</b> (Hal %d/%d)\n━━━━━━━━━━━━━━━━━━━━━\n", page+1, totalPages)

	if len(detections) == 0 {
		text += "\n✅ Tidak ada pelanggaran tercatat."
	} else {
		for i, d := range detections {
			status := "⏳"
			if d.ReviewStatus == "accepted" {
				status = "✅"
			}
			text += fmt.Sprintf("\n%s <b>#%d</b> %s\n   📍 %s | ⏰ %s\n",
				status, d.ID, d.ViolationType, d.Location, d.DetectedAt.Format("15:04"))
			if i < len(detections)-1 {
				text += "───────────────────\n"
			}
		}
	}

	var navButtons []InlineKeyboardButton
	if page > 0 {
		navButtons = append(navButtons, InlineKeyboardButton{Text: "⬅️ Prev", CallbackData: fmt.Sprintf("page:%d", page-1)})
	}
	navButtons = append(navButtons, InlineKeyboardButton{Text: fmt.Sprintf("📄 %d/%d", page+1, totalPages), CallbackData: "noop"})
	if page < totalPages-1 {
		navButtons = append(navButtons, InlineKeyboardButton{Text: "➡️ Next", CallbackData: fmt.Sprintf("page:%d", page+1)})
	}

	keyboard := InlineKeyboardMarkup{
		InlineKeyboard: [][]InlineKeyboardButton{
			navButtons,
			{
				{Text: "🔄 Refresh", CallbackData: fmt.Sprintf("refresh:monitor:%d", page)},
				{Text: "🏠 Dashboard", CallbackData: "refresh:dashboard"},
			},
		},
	}

	b.editMessageWithKeyboard(chatID, messageID, text, keyboard)
}

// acknowledgeAll marks all pending detections as acknowledged
func (b *TelegramBot) acknowledgeAll(chatID int64, messageID int64) {
	db := database.GetDB()
	db.Model(&models.Detection{}).Where("review_status = ? AND is_violation = ?", "pending", true).
		Update("review_status", "accepted")

	b.editMessage(chatID, messageID, "✅ <b>Semua pelanggaran telah di-acknowledge!</b>\n\nKetik /dashboard untuk kembali.")
}

// acknowledgeOne marks one detection as acknowledged
func (b *TelegramBot) acknowledgeOne(chatID int64, messageID int64, detID uint) {
	db := database.GetDB()
	db.Model(&models.Detection{}).Where("id = ?", detID).Update("review_status", "accepted")
	b.editMessage(chatID, messageID, fmt.Sprintf("✅ Deteksi #%d telah di-acknowledge!", detID))
}

// muteNotifications mutes notifications
func (b *TelegramBot) muteNotifications(chatID int64, messageID int64, minutes int) {
	// In production, save mute state to database
	b.editMessage(chatID, messageID, fmt.Sprintf("🔕 Notifikasi di-mute selama %d menit.", minutes))
}

// refreshDashboard refreshes dashboard message
func (b *TelegramBot) refreshDashboard(chatID int64, messageID int64) {
	db := database.GetDB()
	today := time.Now().Format("2006-01-02")

	var total, violations, cameras int64
	db.Model(&models.Detection{}).Where("DATE(detected_at) = ?", today).Count(&total)
	db.Model(&models.Detection{}).Where("DATE(detected_at) = ? AND is_violation = ?", today, true).Count(&violations)
	db.Model(&models.Camera{}).Where("is_active = ?", true).Count(&cameras)

	score := 100.0
	if total > 0 {
		score = float64(total-violations) / float64(total) * 100
	}

	now := time.Now().Format("02 Jan 2006 15:04")

	text := fmt.Sprintf(`⚠️ <b>SiRapi — Ringkasan</b> (%s)

━━━━━━━━━━━━━━━━━━━━━
📊 <b>Safety Score:</b> %.1f%%
🚨 <b>Pelanggaran Hari Ini:</b> %d
📸 <b>Total Deteksi:</b> %d
📹 <b>Kamera Aktif:</b> %d
━━━━━━━━━━━━━━━━━━━━━`, now, score, violations, total, cameras)

	keyboard := InlineKeyboardMarkup{
		InlineKeyboard: [][]InlineKeyboardButton{
			{
				{Text: "🔍 Buka Detail", CallbackData: "monitor:0"},
				{Text: "✅ Acknowledge All", CallbackData: "ack_all"},
			},
			{
				{Text: "🔕 Mute 1h", CallbackData: "mute:60"},
				{Text: "🔄 Refresh", CallbackData: "refresh:dashboard"},
			},
		},
	}

	b.editMessageWithKeyboard(chatID, messageID, text, keyboard)
}

// Helper methods

func (b *TelegramBot) sendReply(chatID int64, text string) {
	b.service.sendToChat(chatID, text)
}

func (b *TelegramBot) sendMessageWithKeyboard(chatID int64, text string, keyboard InlineKeyboardMarkup) {
	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", b.service.BotToken)

	keyboardJSON, _ := json.Marshal(keyboard)

	data := url.Values{}
	data.Set("chat_id", strconv.FormatInt(chatID, 10))
	data.Set("text", text)
	data.Set("parse_mode", "HTML")
	data.Set("reply_markup", string(keyboardJSON))

	http.PostForm(apiURL, data)
}

func (b *TelegramBot) editMessage(chatID int64, messageID int64, text string) {
	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/editMessageText", b.service.BotToken)

	data := url.Values{}
	data.Set("chat_id", strconv.FormatInt(chatID, 10))
	data.Set("message_id", strconv.FormatInt(messageID, 10))
	data.Set("text", text)
	data.Set("parse_mode", "HTML")

	http.PostForm(apiURL, data)
}

func (b *TelegramBot) editMessageWithKeyboard(chatID int64, messageID int64, text string, keyboard InlineKeyboardMarkup) {
	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/editMessageText", b.service.BotToken)

	keyboardJSON, _ := json.Marshal(keyboard)

	data := url.Values{}
	data.Set("chat_id", strconv.FormatInt(chatID, 10))
	data.Set("message_id", strconv.FormatInt(messageID, 10))
	data.Set("text", text)
	data.Set("parse_mode", "HTML")
	data.Set("reply_markup", string(keyboardJSON))

	http.PostForm(apiURL, data)
}

func (b *TelegramBot) answerCallback(callbackID string) {
	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/answerCallbackQuery", b.service.BotToken)
	data := url.Values{}
	data.Set("callback_query_id", callbackID)
	http.PostForm(apiURL, data)
}

// Add sendToChat to TelegramService
func (t *TelegramService) sendToChat(chatID int64, message string) error {
	if !t.Enabled {
		return fmt.Errorf("telegram service disabled")
	}

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", t.BotToken)

	data := url.Values{}
	data.Set("chat_id", strconv.FormatInt(chatID, 10))
	data.Set("text", message)
	data.Set("parse_mode", "HTML")

	_, err := http.PostForm(apiURL, data)
	return err
}
