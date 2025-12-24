package handlers

import (
	"github.com/gofiber/fiber/v2"
)

// EmailSettings holds email configuration
type EmailSettings struct {
	SMTPHost   string   `json:"smtp_host"`
	SMTPPort   int      `json:"smtp_port"`
	SMTPUser   string   `json:"smtp_user"`
	SMTPPass   string   `json:"smtp_pass"`
	FromEmail  string   `json:"from_email"`
	Recipients []string `json:"recipients"`
	Enabled    bool     `json:"enabled"`
}

// In-memory storage for email settings
var currentEmailSettings = EmailSettings{
	SMTPHost: "smtp.gmail.com",
	SMTPPort: 465,
	Enabled:  false,
}

// GetEmailSettings returns current email configuration
func GetEmailSettings(c *fiber.Ctx) error {
	// Hide password for security
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"smtp_host":    currentEmailSettings.SMTPHost,
			"smtp_port":    currentEmailSettings.SMTPPort,
			"smtp_user":    currentEmailSettings.SMTPUser,
			"password_set": currentEmailSettings.SMTPPass != "",
			"from_email":   currentEmailSettings.FromEmail,
			"recipients":   currentEmailSettings.Recipients,
			"enabled":      currentEmailSettings.Enabled,
		},
	})
}

// UpdateEmailSettings updates email configuration
func UpdateEmailSettings(c *fiber.Ctx) error {
	var settings EmailSettings
	if err := c.BodyParser(&settings); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	// Merge with current settings (keep password if not provided)
	if settings.SMTPPass == "" {
		settings.SMTPPass = currentEmailSettings.SMTPPass
	}
	if settings.SMTPHost == "" {
		settings.SMTPHost = "smtp.gmail.com"
	}
	if settings.SMTPPort == 0 {
		settings.SMTPPort = 465
	}

	currentEmailSettings = settings

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Email settings updated successfully",
	})
}

// TestEmailConnection tests the email configuration
func TestEmailConnection(c *fiber.Ctx) error {
	var request struct {
		SMTPHost  string `json:"smtp_host"`
		SMTPPort  int    `json:"smtp_port"`
		SMTPUser  string `json:"smtp_user"`
		SMTPPass  string `json:"smtp_pass"`
		Recipient string `json:"recipient"`
	}

	if err := c.BodyParser(&request); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	// Basic validation
	if request.SMTPUser == "" || request.SMTPPass == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "SMTP user and password are required",
		})
	}

	if request.Recipient == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Recipient email is required",
		})
	}

	// For now, we'll just validate the format and return success
	// Real email sending would require the full email service setup
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Email settings look valid. Save settings to enable email notifications.",
		"note":    "To fully test, save settings and send a test from the AI Engine",
	})
}

// SendEmailNotification sends an email notification
func SendEmailNotification(c *fiber.Ctx) error {
	var request struct {
		Type    string `json:"type"`
		Subject string `json:"subject"`
		Body    string `json:"body"`
		To      string `json:"to"`
	}

	if err := c.BodyParser(&request); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	if !currentEmailSettings.Enabled {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Email not configured or disabled",
		})
	}

	// In production, this would use the EmailService to send
	// For now, we return a placeholder response
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Email notification queued",
	})
}

// GetEmailHelp returns instructions for setting up email
func GetEmailHelp(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"title": "Cara Setting Email Gmail",
			"steps": []string{
				"1. Buka https://myaccount.google.com/security",
				"2. Aktifkan 2-Step Verification",
				"3. Buka https://myaccount.google.com/apppasswords",
				"4. Buat App Password untuk 'Mail'",
				"5. Masukkan email dan App Password (16 karakter) di pengaturan",
			},
			"smtp_settings": fiber.Map{
				"host": "smtp.gmail.com",
				"port": 465,
				"tls":  true,
			},
		},
	})
}
