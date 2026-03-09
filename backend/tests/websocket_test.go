package tests

import (
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/sirapi/backend/internal/handlers"
	"github.com/stretchr/testify/assert"
)

// Mock middleware methods if needed, or stick to simple token gen

func generateTestToken() string {
	secretKey := "test_secret"
	os.Setenv("JWT_SECRET", secretKey)

	claims := jwt.MapClaims{
		"user_id": 1,
		"exp":     time.Now().Add(time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, _ := token.SignedString([]byte(secretKey))
	return t
}

func TestWebSocketAuth(t *testing.T) {
	app := fiber.New()
	app.Get("/ws", handlers.WebSocketHandler)

	t.Run("Missing Token", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/ws", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 401, resp.StatusCode)
	})

	t.Run("Invalid Token", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/ws?token=invalid123", nil)
		resp, _ := app.Test(req)
		assert.Equal(t, 401, resp.StatusCode)
	})

	t.Run("Valid Token but Upgrade Required", func(t *testing.T) {
		// Note: We can't easily fully test WS upgrade with simple httptest.NewRequest
		// without a real WS client, but we can verify it accepted the auth
		// and failed on "Method Not Allowed" or Upgrade header missing (426)
		// logic: If code reaches "IsWebSocketUpgrade", it means auth passed.

		token := generateTestToken()
		req := httptest.NewRequest("GET", "/ws?token="+token, nil)
		req.Header.Set("Connection", "upgrade")
		req.Header.Set("Upgrade", "websocket")
		req.Header.Set("Sec-WebSocket-Version", "13")

		resp, _ := app.Test(req)

		// If auth passed, it tries to upgrade.
		// Since we didn't fully mock the WS handshake, fiber might return 426 or 400 depending on exact internals
		// But definitely NOT 401
		assert.NotEqual(t, 401, resp.StatusCode)
	})
}
