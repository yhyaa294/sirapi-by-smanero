package middleware

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

// RateLimit middleware
func RateLimit() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        100,             // 100 requests
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
	return limiter.New(limiter.Config{
		Max:        10,              // 10 requests (login attempts)
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
