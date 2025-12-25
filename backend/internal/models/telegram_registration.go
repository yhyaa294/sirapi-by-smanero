package models

import (
	"crypto/rand"
	"encoding/hex"
	"time"
)

// TelegramRegistration represents a one-time registration token
type TelegramRegistration struct {
	Token        string    `gorm:"primaryKey;size:64" json:"token"`
	CreatedBy    uint      `json:"created_by"` // Admin user ID
	ExpiresAt    time.Time `json:"expires_at"`
	Used         bool      `gorm:"default:false" json:"used"`
	UsedByChatID *int64    `json:"used_by_chat_id,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}

// TableName specifies the table name
func (TelegramRegistration) TableName() string {
	return "telegram_registrations"
}

// GenerateToken creates a cryptographically secure random token
func GenerateRegistrationToken() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

// IsExpired checks if the token is expired
func (r *TelegramRegistration) IsExpired() bool {
	return time.Now().After(r.ExpiresAt)
}

// IsValid checks if the token can be used
func (r *TelegramRegistration) IsValid() bool {
	return !r.Used && !r.IsExpired()
}
