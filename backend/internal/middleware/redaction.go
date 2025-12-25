package middleware

import (
	"encoding/json"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

// RedactedLogger is a middleware that logs requests but hides sensitive data
func RedactedLogger() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()

		// Allow body introspection
		var body []byte
		if c.Body() != nil {
			body = c.Body()
		}

		// Continue
		err := c.Next()
		duration := time.Since(start)

		// Sanitize Body for logging
		sanitizedBody := redactJSON(body)

		log.Printf("[%s] %d %s %s (%v) | Body: %s",
			time.Now().Format("15:04:05"),
			c.Response().StatusCode(),
			c.Method(),
			c.Path(),
			duration,
			sanitizedBody,
		)

		return err
	}
}

func redactJSON(body []byte) string {
	if len(body) == 0 {
		return ""
	}

	// Try parsing as map
	var data map[string]interface{}
	if err := json.Unmarshal(body, &data); err != nil {
		// Not JSON, return as string (maybe truncate)
		s := string(body)
		if len(s) > 100 {
			return s[:100] + "..."
		}
		return s
	}

	// Redact keys
	redactKeys(data)

	// Marshal back
	b, _ := json.Marshal(data)
	return string(b)
}

func redactKeys(data map[string]interface{}) {
	sensitiveKeys := []string{"password", "token", "secret", "authorization", "key"}

	for k, v := range data {
		// Check keys
		lowerK := strings.ToLower(k)
		for _, sens := range sensitiveKeys {
			if strings.Contains(lowerK, sens) {
				data[k] = "***REDACTED***"
				break
			}
		}

		// Recursion for nested objects
		if nested, ok := v.(map[string]interface{}); ok {
			redactKeys(nested)
		}
	}
}
