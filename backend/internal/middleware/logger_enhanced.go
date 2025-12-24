package middleware

import (
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

// InitLogger initializes the global logger
func InitLogger() {
	// Pretty print for development
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.RFC3339})

	// Set default level
	zerolog.SetGlobalLevel(zerolog.InfoLevel)
}

// EnhancedLogger middleware for structured logging
func EnhancedLogger() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()

		err := c.Next()

		stop := time.Now()
		duration := stop.Sub(start)

		event := log.Info()
		if err != nil {
			event = log.Error().Err(err)
		}

		event.
			Str("method", c.Method()).
			Str("path", c.Path()).
			Int("status", c.Response().StatusCode()).
			Str("ip", c.IP()).
			Dur("latency", duration).
			Msg("Request")

		return err
	}
}
