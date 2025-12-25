package models

import "time"

// TelegramChat stores registered Telegram chats
type TelegramChat struct {
	ChatID     int64      `gorm:"primaryKey" json:"chat_id"`
	Title      string     `json:"title"`
	ChatType   string     `json:"chat_type"` // private, group, supergroup, channel
	Username   string     `json:"username,omitempty"`
	IsActive   bool       `gorm:"default:true" json:"is_active"`
	MutedUntil *time.Time `json:"muted_until,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

// TableName specifies the table name
func (TelegramChat) TableName() string {
	return "telegram_chats"
}
