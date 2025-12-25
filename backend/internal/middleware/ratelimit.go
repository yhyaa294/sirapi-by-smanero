package middleware

import (
	"os"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

func getRateLimitConfig(envKey string, defaultMax int) int {
	val := os.Getenv(envKey)
	if val == "" {
		return defaultMax
	}
	limit, err := strconv.Atoi(val)
	if err != nil {
		return defaultMax
	}
	return limit
}

// RateLimit middleware
func RateLimit() fiber.Handler {
	maxDocs := getRateLimitConfig("RATE_LIMIT_DEFAULT", 100)

	return limiter.New(limiter.Config{
		Max:        maxDocs,         // Default: 100 requests
		Expiration: 1 * time.Minute, // per 1 minute
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP() // rate limit per IP
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"error":   "Too many requests. Please try again later.",
			})
		},
	})
}

// AuthRateLimit stricter rate limit for auth endpoints
func AuthRateLimit() fiber.Handler {
	maxDocs := getRateLimitConfig("RATE_LIMIT_AUTH", 10)

	return limiter.New(limiter.Config{
		Max:        maxDocs,         // Default: 10 requests (login attempts)
		Expiration: 1 * time.Minute, // per 1 minute
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"error":   "Too many login attempts. Please wait 1 minute.",
			})
		},
	})
}

// SensitiveRateLimit stricter rate limit for sensitive endpoints (detections, alerts)
func SensitiveRateLimit() fiber.Handler {
	maxDocs := getRateLimitConfig("RATE_LIMIT_SENSITIVE", 20)

	return limiter.New(limiter.Config{
		Max:        maxDocs,         // Default: 20 requests
		Expiration: 1 * time.Minute, // per 1 minute
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			c.Set("Retry-After", "60")
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"error":   "Rate limit exceeded. Please wait before retrying.",
			})
		},
	})
}
