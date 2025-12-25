package middleware

import (
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

func TestRateLimit(t *testing.T) {
	os.Setenv("RATE_LIMIT_DEFAULT", "2")
	defer os.Unsetenv("RATE_LIMIT_DEFAULT")

	app := fiber.New()
	app.Use(RateLimit())
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello")
	})

	// 1st Request - OK
	req := httptest.NewRequest("GET", "/", nil)
	resp, _ := app.Test(req)
	assert.Equal(t, 200, resp.StatusCode)

	// 2nd Request - OK
	req = httptest.NewRequest("GET", "/", nil)
	resp, _ = app.Test(req)
	assert.Equal(t, 200, resp.StatusCode)

	// 3rd Request - Limited
	req = httptest.NewRequest("GET", "/", nil)
	resp, _ = app.Test(req)
	assert.Equal(t, 429, resp.StatusCode)
}

func TestAuthRateLimit(t *testing.T) {
	os.Setenv("RATE_LIMIT_AUTH", "1")
	defer os.Unsetenv("RATE_LIMIT_AUTH")

	app := fiber.New()
	app.Post("/login", AuthRateLimit(), func(c *fiber.Ctx) error {
		return c.SendString("Login")
	})

	// 1st Request - OK
	req := httptest.NewRequest("POST", "/login", nil)
	resp, _ := app.Test(req)
	assert.Equal(t, 200, resp.StatusCode)

	// 2nd Request - Limited
	req = httptest.NewRequest("POST", "/login", nil)
	resp, _ = app.Test(req)
	assert.Equal(t, 429, resp.StatusCode)
}
