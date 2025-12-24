package services

import (
	"crypto/tls"
	"fmt"
	"log"
	"net/smtp"
	"strings"
	"time"
)

// EmailSettings holds the email configuration
type EmailSettings struct {
	SMTPHost   string   `json:"smtp_host"`
	SMTPPort   int      `json:"smtp_port"`
	SMTPUser   string   `json:"smtp_user"`
	SMTPPass   string   `json:"smtp_pass"`
	FromEmail  string   `json:"from_email"`
	FromName   string   `json:"from_name"`
	Enabled    bool     `json:"enabled"`
	Recipients []string `json:"recipients"`
}

// EmailService handles email notifications
type EmailService struct {
	Settings    EmailSettings
	Enabled     bool
	RateLimiter map[string]time.Time
	Cooldown    time.Duration
}

// NewEmailService creates a new email service instance
func NewEmailService(settings EmailSettings) *EmailService {
	service := &EmailService{
		Settings:    settings,
		Enabled:     settings.SMTPUser != "" && settings.SMTPPass != "",
		RateLimiter: make(map[string]time.Time),
		Cooldown:    5 * time.Minute, // 5 minute cooldown for emails
	}

	if service.Enabled {
		log.Println("✅ Email service initialized")
	} else {
		log.Println("⚠️ Email service disabled (missing SMTP configuration)")
	}

	return service
}

// canSend checks if we can send an email (rate limiting)
func (e *EmailService) canSend(key string) bool {
	if lastSent, exists := e.RateLimiter[key]; exists {
		if time.Since(lastSent) < e.Cooldown {
			return false
		}
	}
	e.RateLimiter[key] = time.Now()
	return true
}

// SendEmail sends an email with HTML content
func (e *EmailService) SendEmail(to, subject, body string) error {
	if !e.Enabled {
		return fmt.Errorf("email service disabled")
	}

	// Create HTML email
	htmlBody := e.wrapInTemplate(body)

	// Create message
	from := e.Settings.FromEmail
	if e.Settings.FromName != "" {
		from = fmt.Sprintf("%s <%s>", e.Settings.FromName, e.Settings.FromEmail)
	}

	msg := []byte(fmt.Sprintf("From: %s\r\n"+
		"To: %s\r\n"+
		"Subject: %s\r\n"+
		"MIME-Version: 1.0\r\n"+
		"Content-Type: text/html; charset=UTF-8\r\n"+
		"\r\n"+
		"%s", from, to, subject, htmlBody))

	// Connect to SMTP server
	addr := fmt.Sprintf("%s:%d", e.Settings.SMTPHost, e.Settings.SMTPPort)
	auth := smtp.PlainAuth("", e.Settings.SMTPUser, e.Settings.SMTPPass, e.Settings.SMTPHost)

	// Use TLS for Gmail
	if strings.Contains(e.Settings.SMTPHost, "gmail") {
		return e.sendWithTLS(addr, auth, e.Settings.FromEmail, []string{to}, msg)
	}

	return smtp.SendMail(addr, auth, e.Settings.FromEmail, []string{to}, msg)
}

// sendWithTLS sends email using TLS connection (for Gmail)
func (e *EmailService) sendWithTLS(addr string, auth smtp.Auth, from string, to []string, msg []byte) error {
	host := strings.Split(addr, ":")[0]

	tlsConfig := &tls.Config{
		InsecureSkipVerify: false,
		ServerName:         host,
	}

	conn, err := tls.Dial("tcp", addr, tlsConfig)
	if err != nil {
		return err
	}
	defer conn.Close()

	client, err := smtp.NewClient(conn, host)
	if err != nil {
		return err
	}
	defer client.Close()

	if err = client.Auth(auth); err != nil {
		return err
	}

	if err = client.Mail(from); err != nil {
		return err
	}

	for _, recipient := range to {
		if err = client.Rcpt(recipient); err != nil {
			return err
		}
	}

	w, err := client.Data()
	if err != nil {
		return err
	}

	_, err = w.Write(msg)
	if err != nil {
		return err
	}

	err = w.Close()
	if err != nil {
		return err
	}

	return client.Quit()
}

// wrapInTemplate wraps content in HTML email template
func (e *EmailService) wrapInTemplate(content string) string {
	return fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; margin: 0;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #f97316; margin: 0;">🛡️ SmartAPD</h1>
            <p style="color: #64748b; margin: 5px 0;">HSE Command Center</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <div style="color: #334155;">
            %s
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            Laporan ini dikirim otomatis oleh sistem SmartAPD.<br>
            Waktu: %s
        </p>
    </div>
</body>
</html>
`, content, time.Now().Format("02 January 2006, 15:04 WIB"))
}

// SendViolationAlert sends PPE violation alert via email
func (e *EmailService) SendViolationAlert(violationType, location string, confidence float64) error {
	if !e.Enabled {
		return fmt.Errorf("email service disabled")
	}

	// Rate limiting per violation type
	if !e.canSend(violationType) {
		log.Printf("Email rate limited: %s", violationType)
		return nil
	}

	subject := fmt.Sprintf("🚨 Pelanggaran APD: %s", violationType)

	body := fmt.Sprintf(`
		<h2 style="color: #dc2626;">🚨 PELANGGARAN APD TERDETEKSI</h2>
		<table style="width: 100%%; border-collapse: collapse; margin: 15px 0;">
			<tr>
				<td style="padding: 10px; background: #fef2f2; border-radius: 5px;">
					<strong>⚠️ Jenis Pelanggaran:</strong> %s
				</td>
			</tr>
			<tr>
				<td style="padding: 10px; background: #f8fafc; border-radius: 5px;">
					<strong>📍 Lokasi:</strong> %s
				</td>
			</tr>
			<tr>
				<td style="padding: 10px; background: #f8fafc; border-radius: 5px;">
					<strong>📊 Confidence:</strong> %.1f%%
				</td>
			</tr>
			<tr>
				<td style="padding: 10px; background: #f8fafc; border-radius: 5px;">
					<strong>🕐 Waktu:</strong> %s
				</td>
			</tr>
		</table>
		<p style="color: #dc2626; font-weight: bold;">⚠️ Segera lakukan tindakan!</p>
	`, violationType, location, confidence*100, time.Now().Format("15:04:05 02-01-2006"))

	for _, recipient := range e.Settings.Recipients {
		if err := e.SendEmail(recipient, subject, body); err != nil {
			log.Printf("Failed to send email to %s: %v", recipient, err)
		}
	}

	return nil
}

// SendDailySummary sends daily summary report via email
func (e *EmailService) SendDailySummary(totalDetections, totalViolations int, complianceRate float64) error {
	if !e.Enabled {
		return fmt.Errorf("email service disabled")
	}

	status := "🟢 BAIK"
	statusColor := "#22c55e"
	if complianceRate < 90 {
		status = "🟡 PERLU PERHATIAN"
		statusColor = "#eab308"
	}
	if complianceRate < 70 {
		status = "🔴 KRITIS"
		statusColor = "#dc2626"
	}

	subject := fmt.Sprintf("📊 Laporan Harian SmartAPD - %s", time.Now().Format("02 Jan 2006"))

	body := fmt.Sprintf(`
		<h2 style="color: #1e40af;">📊 LAPORAN HARIAN SMARTAPD</h2>
		<p style="color: #64748b;">%s</p>
		
		<table style="width: 100%%; border-collapse: collapse; margin: 20px 0;">
			<tr>
				<td style="padding: 15px; background: #f1f5f9; border-radius: 8px; text-align: center; width: 33%%;">
					<div style="font-size: 24px; font-weight: bold; color: #1e40af;">%d</div>
					<div style="color: #64748b; font-size: 14px;">Total Deteksi</div>
				</td>
				<td style="padding: 15px; background: #fef2f2; border-radius: 8px; text-align: center; width: 33%%;">
					<div style="font-size: 24px; font-weight: bold; color: #dc2626;">%d</div>
					<div style="color: #64748b; font-size: 14px;">Total Pelanggaran</div>
				</td>
				<td style="padding: 15px; background: #f0fdf4; border-radius: 8px; text-align: center; width: 33%%;">
					<div style="font-size: 24px; font-weight: bold; color: #22c55e;">%.1f%%</div>
					<div style="color: #64748b; font-size: 14px;">Tingkat Kepatuhan</div>
				</td>
			</tr>
		</table>
		
		<div style="padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid %s;">
			<strong>Status: %s</strong>
		</div>
	`, time.Now().Format("02 January 2006"), totalDetections, totalViolations, complianceRate, statusColor, status)

	for _, recipient := range e.Settings.Recipients {
		if err := e.SendEmail(recipient, subject, body); err != nil {
			log.Printf("Failed to send summary to %s: %v", recipient, err)
		}
	}

	return nil
}

// TestConnection tests the email connection
func (e *EmailService) TestConnection(to string) error {
	if !e.Enabled {
		return fmt.Errorf("email service disabled - configure SMTP settings first")
	}

	subject := "✅ SmartAPD - Test Connection"
	body := `
		<h2 style="color: #22c55e;">✅ Koneksi Email Berhasil!</h2>
		<p>Email ini mengkonfirmasi bahwa konfigurasi SMTP Anda sudah benar.</p>
		<p>Sistem SmartAPD siap mengirim notifikasi ke alamat email ini.</p>
	`

	return e.SendEmail(to, subject, body)
}
