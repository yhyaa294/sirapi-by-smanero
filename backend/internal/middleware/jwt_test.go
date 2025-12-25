package middleware

import (
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
)

func TestProtectedMiddleware(t *testing.T) {
	// Setup
	os.Setenv("JWT_SECRET", "test_secret")
	app := fiber.New()
	app.Get("/protected", Protected(), func(c *fiber.Ctx) error {
		return c.SendString("Success")
	})

	// Generate valid token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": 1,
		"exp":     time.Now().Add(time.Hour).Unix(),
	})
	validToken, _ := token.SignedString([]byte("test_secret"))

	// Tests
	tests := []struct {
		name         string
		token        string
		expectedCode int
	}{
		{
			name:         "No Token",
			token:        "",
			expectedCode: 401,
		},
		{
			name:         "Invalid Token",
			token:        "Bearer invalid_token_string",
			expectedCode: 401,
		},
		{
			name:         "Valid Token",
			token:        "Bearer " + validToken,
			expectedCode: 200,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/protected", nil)
			if tt.token != "" {
				req.Header.Set("Authorization", tt.token)
			}
			resp, _ := app.Test(req)
			assert.Equal(t, tt.expectedCode, resp.StatusCode)
		})
	}
}
