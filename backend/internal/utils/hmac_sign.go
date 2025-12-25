package utils

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

// CallbackData represents decoded callback data
type CallbackData struct {
	Action      string
	DetectionID uint
	ChatID      int64
	ExpiryUnix  int64
}

// getSecretKey gets the secret key from environment
func getSecretKey() []byte {
	key := os.Getenv("SECRET_KEY")
	if key == "" {
		key = "default-secret-key-change-in-production"
	}
	return []byte(key)
}

// SignCallbackData creates an HMAC-signed callback token
// Format: action:detection_id:chat_id:expiry|signature (base64url encoded)
func SignCallbackData(action string, detectionID uint, chatID int64, ttlSeconds int) string {
	expiryUnix := time.Now().Add(time.Duration(ttlSeconds) * time.Second).Unix()

	// Create data string
	data := fmt.Sprintf("%s:%d:%d:%d", action, detectionID, chatID, expiryUnix)

	// Sign with HMAC-SHA256
	h := hmac.New(sha256.New, getSecretKey())
	h.Write([]byte(data))
	signature := h.Sum(nil)

	// Combine and encode
	combined := fmt.Sprintf("%s|%s", data, base64.RawURLEncoding.EncodeToString(signature))
	return base64.RawURLEncoding.EncodeToString([]byte(combined))
}

// VerifyCallbackData verifies and decodes an HMAC-signed callback token
func VerifyCallbackData(token string) (CallbackData, bool) {
	var result CallbackData

	// Decode base64
	decoded, err := base64.RawURLEncoding.DecodeString(token)
	if err != nil {
		return result, false
	}

	// Split data and signature
	parts := strings.Split(string(decoded), "|")
	if len(parts) != 2 {
		return result, false
	}

	data := parts[0]
	signatureEncoded := parts[1]

	// Decode signature
	signature, err := base64.RawURLEncoding.DecodeString(signatureEncoded)
	if err != nil {
		return result, false
	}

	// Verify HMAC
	h := hmac.New(sha256.New, getSecretKey())
	h.Write([]byte(data))
	expectedSig := h.Sum(nil)

	if !hmac.Equal(signature, expectedSig) {
		return result, false
	}

	// Parse data
	dataParts := strings.Split(data, ":")
	if len(dataParts) != 4 {
		return result, false
	}

	result.Action = dataParts[0]

	detID, err := strconv.ParseUint(dataParts[1], 10, 32)
	if err != nil {
		return result, false
	}
	result.DetectionID = uint(detID)

	chatID, err := strconv.ParseInt(dataParts[2], 10, 64)
	if err != nil {
		return result, false
	}
	result.ChatID = chatID

	expiryUnix, err := strconv.ParseInt(dataParts[3], 10, 64)
	if err != nil {
		return result, false
	}
	result.ExpiryUnix = expiryUnix

	// Check expiry
	if time.Now().Unix() > result.ExpiryUnix {
		return result, false
	}

	return result, true
}

// CreateAckToken creates a signed acknowledge token
func CreateAckToken(detectionID uint, chatID int64) string {
	return SignCallbackData("ack", detectionID, chatID, 86400) // 24h TTL
}

// CreateFPToken creates a signed false-positive token
func CreateFPToken(detectionID uint, chatID int64) string {
	return SignCallbackData("fp", detectionID, chatID, 86400)
}

// CreateAssignToken creates a signed assign token
func CreateAssignToken(detectionID uint, chatID int64) string {
	return SignCallbackData("assign", detectionID, chatID, 86400)
}
