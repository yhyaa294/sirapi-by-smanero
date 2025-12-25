package models

import "time"

// SentMessageLog logs sent Telegram messages for dedup and tracking
type SentMessageLog struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	ChatID        int64     `gorm:"index" json:"chat_id"`
	TelegramMsgID int64     `json:"telegram_msg_id"`
	DetectionID   *uint     `gorm:"index" json:"detection_id,omitempty"`
	MessageType   string    `json:"message_type"`                 // alert, summary, status
	Payload       string    `gorm:"type:text" json:"payload"`     // JSON payload
	Status        string    `gorm:"default:'sent'" json:"status"` // sent, failed, skipped
	ErrorText     string    `json:"error_text,omitempty"`
	SentAt        time.Time `gorm:"autoCreateTime" json:"sent_at"`
}

// TableName specifies the table name
func (SentMessageLog) TableName() string {
	return "sent_messages_log"
}

// TelegramSubscription tracks what each chat subscribes to
type TelegramSubscription struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ChatID    int64     `gorm:"index" json:"chat_id"`
	Filter    string    `json:"filter"` // all, camera:CAM-01, zone:Gudang
	IsActive  bool      `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
}

// TableName specifies the table name
func (TelegramSubscription) TableName() string {
	return "telegram_subscriptions"
}
