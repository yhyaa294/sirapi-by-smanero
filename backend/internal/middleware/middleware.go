package middleware

import (
	"log"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func getJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return []byte("smartapd-secret-key-2024")
	}
	return []byte(secret)
}

// JWTAuth validates JWT token for protected routes
func JWTAuth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Skip auth routes
		if c.Path() == "/api/v1/auth/login" || c.Path() == "/api/v1/auth/refresh" || c.Path() == "/api/v1/auth/register" || c.Path() == "/health" {
			return c.Next()
		}

		// Get token from header
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(401).JSON(fiber.Map{
				"success": false,
				"error":   "Missing authorization header",
			})
		}

		// Extract token (Bearer <token>)
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			return c.Status(401).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid token format",
			})
		}

		// Parse and validate token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return getJWTSecret(), nil
		})

		if err != nil || !token.Valid {
			return c.Status(401).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid or expired token",
			})
		}

		// Extract claims
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			c.Locals("user_id", uint(claims["user_id"].(float64)))
			// Safely assert email and role, handling potential missing values
			if email, ok := claims["email"].(string); ok {
				c.Locals("user_email", email)
			}
			if role, ok := claims["role"].(string); ok {
				c.Locals("user_role", role)
			}
		}

		return c.Next()
	}
}

// Logger logs all HTTP requests with timing
func Logger() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()

		// Process request
		err := c.Next()

		// Calculate duration
		duration := time.Since(start)

		// Log format: [TIME] STATUS METHOD PATH (DURATION)
		log.Printf("[%s] %d %s %s (%v)",
			time.Now().Format("15:04:05"),
			c.Response().StatusCode(),
			c.Method(),
			c.Path(),
			duration,
		)

		return err
	}
}

// RateLimiter implements basic rate limiting per IP
func RateLimiter(maxRequests int, window time.Duration) fiber.Handler {
	type client struct {
		count    int
		lastSeen time.Time
	}

	clients := make(map[string]*client)

	return func(c *fiber.Ctx) error {
		ip := c.IP()

		now := time.Now()
		if cl, exists := clients[ip]; exists {
			// Reset if window passed
			if now.Sub(cl.lastSeen) > window {
				cl.count = 1
				cl.lastSeen = now
			} else {
				cl.count++
				if cl.count > maxRequests {
					return c.Status(429).JSON(fiber.Map{
						"error":       "Too many requests",
						"retry_after": int(window.Seconds()),
					})
				}
			}
		} else {
			clients[ip] = &client{count: 1, lastSeen: now}
		}

		return c.Next()
	}
}

// APIKeyAuth middleware for API key authentication
func APIKeyAuth(validAPIKey string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Skip for health check
		if c.Path() == "/health" {
			return c.Next()
		}

		// Skip if no API key configured
		if validAPIKey == "" {
			return c.Next()
		}

		// Get API key from header
		apiKey := c.Get("X-API-Key")
		if apiKey == "" {
			apiKey = c.Query("api_key")
		}

		if apiKey != validAPIKey {
			return c.Status(401).JSON(fiber.Map{
				"error": "Invalid or missing API key",
			})
		}

		return c.Next()
	}
}

// CORS middleware for cross-origin requests
func CORS() fiber.Handler {
	return func(c *fiber.Ctx) error {
		c.Set("Access-Control-Allow-Origin", "*")
		c.Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-API-Key")

		if c.Method() == "OPTIONS" {
			return c.SendStatus(204)
		}

		return c.Next()
	}
}

// RequestID adds unique request ID to each request
func RequestID() fiber.Handler {
	return func(c *fiber.Ctx) error {
		requestID := c.Get("X-Request-ID")
		if requestID == "" {
			requestID = generateID()
		}

		c.Set("X-Request-ID", requestID)
		c.Locals("requestID", requestID)

		return c.Next()
	}
}

// generateID generates a simple unique ID
func generateID() string {
	return time.Now().Format("20060102150405.000000")
}
