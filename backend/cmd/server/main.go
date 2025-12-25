package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"

	"github.com/smartapd/backend/internal/cache"
	"github.com/smartapd/backend/internal/config"
	"github.com/smartapd/backend/internal/database"
	"github.com/smartapd/backend/internal/errors"
	"github.com/smartapd/backend/internal/handlers"
	"github.com/smartapd/backend/internal/middleware"
	"github.com/smartapd/backend/internal/scheduler"
	"github.com/smartapd/backend/internal/services"
)

func main() {
	middleware.InitLogger()

	log.Println("╔═══════════════════════════════════════╗")
	log.Println("║     SMARTAPD BACKEND - Starting...    ║")
	log.Println("╚═══════════════════════════════════════╝")

	// Load .env file
	if err := godotenv.Load("../../.env"); err != nil {
		log.Println("⚠️  No .env file found, using environment variables")
	}

	// Initialize config
	cfg := config.Load()

	// Initialize database
	if err := database.Connect(cfg.DatabaseURL); err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}

	// Initialize cache
	cache.Init()
	log.Println("✅ Cache initialized")

	// Initialize services
	telegramService := services.NewTelegramService(cfg.TelegramToken, cfg.TelegramChatID)

	// Initialize Telegram Bot (interactive commands)
	telegramBot := services.NewTelegramBot(telegramService)
	telegramBot.StartPolling()

	// Email Service (requires SMTP settings from env)
	emailSettings := services.EmailSettings{
		SMTPHost:  cfg.SMTPHost,
		SMTPPort:  cfg.SMTPPort,
		SMTPUser:  cfg.SMTPUser,
		SMTPPass:  cfg.SMTPPass,
		FromEmail: cfg.SMTPFromEmail,
		FromName:  "SmartAPD",
		Enabled:   cfg.SMTPUser != "" && cfg.SMTPPass != "",
	}
	emailService := services.NewEmailService(emailSettings)

	detectionService := services.NewDetectionService(telegramService)
	sched := scheduler.NewScheduler(telegramService, emailService)
	cleanupService := services.NewCleanupService()
	cameraHealthChecker := services.NewCameraHealthChecker()
	cameraHealthChecker.SetBroadcastFunc(handlers.BroadcastMessage)
	triageWorker := services.NewTriageWorker()
	triageWorker.SetBroadcastFunc(handlers.BroadcastMessage)
	queueConsumer := services.NewQueueConsumer()
	queueConsumer.SetBroadcastFunc(handlers.BroadcastMessage)
	telegramSender := services.NewTelegramSender()

	// Start services
	sched.Start()
	cleanupService.Start()
	cameraHealthChecker.Start()
	triageWorker.Start()
	queueConsumer.Start()
	telegramSender.Start()

	// Send startup notification
	telegramService.SendSystemStatus("started", "SmartAPD Backend berhasil dijalankan")

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "SmartAPD Backend v1.0.0",
		ServerHeader: "SmartAPD",
		ErrorHandler: errors.ErrorHandler,
	})

	// Middleware
	app.Use(recover.New())
	app.Use(middleware.RequestID())
	app.Use(middleware.RedactedLogger()) // Replaced EnhancedLogger with RedactedLogger
	app.Use(middleware.RateLimit())
	app.Use(cors.New(cors.Config{
		AllowOrigins: os.Getenv("FRONTEND_URL"), // e.g. "http://localhost:3000,https://smartapd.id"
		AllowHeaders: "Origin, Content-Type, Accept, Authorization, X-API-Key",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	if os.Getenv("FRONTEND_URL") == "" {
		log.Println("⚠️  FRONTEND_URL not set, defaulting CORS to allow * (INSECURE for production)")
		app.Use(cors.New(cors.Config{
			AllowOrigins: "*",
		}))
	}

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		stats := detectionService.GetTodayStats()
		return c.JSON(fiber.Map{
			"status":  "healthy",
			"service": "SmartAPD Backend",
			"version": "1.0.0",
			"uptime":  "ok",
			"today_stats": fiber.Map{
				"detections": stats.TotalToday,
				"violations": stats.ViolationsToday,
			},
		})
	})

	// API Routes
	api := app.Group("/api/v1")

	// Detection routes
	detectionHandler := handlers.NewDetectionHandler(detectionService)
	detections := api.Group("/detections")
	detections.Get("/", detectionHandler.GetDetections)
	detections.Get("/stats", detectionHandler.GetDetectionStats)
	detections.Get("/:id", detectionHandler.GetDetection)
	detections.Post("/", detectionHandler.CreateDetection)

	// Alert routes
	alerts := api.Group("/alerts")
	alerts.Get("/", handlers.GetAlerts)
	alerts.Post("/", handlers.CreateAlert)
	alerts.Put("/:id/acknowledge", handlers.AcknowledgeAlert)

	// Camera routes
	cameras := api.Group("/cameras")
	cameras.Get("/", handlers.GetCameras)
	cameras.Get("/:id", handlers.GetCamera)
	cameras.Post("/", handlers.CreateCamera)
	cameras.Put("/:id", handlers.UpdateCamera)
	cameras.Delete("/:id", handlers.DeleteCamera)
	cameras.Post("/:id/reconnect", handlers.ReconnectCamera)

	// Report routes
	reports := api.Group("/reports")
	reports.Get("/daily", handlers.GetDailyReport)
	reports.Get("/weekly", handlers.GetWeeklyReport)
	reports.Get("/export", handlers.ExportReport)

	// Auth routes
	auth := api.Group("/auth")
	auth.Post("/login", middleware.AuthRateLimit(), handlers.Login)
	auth.Post("/refresh", handlers.Refresh)
	auth.Post("/logout", handlers.Logout)
	// auth.Post("/register", handlers.Register) // Admin only in production
	auth.Get("/me", middleware.Protected(), handlers.GetMe)

	// Settings routes (for Telegram configuration from website)
	settings := api.Group("/settings")
	settings.Get("/telegram", handlers.GetTelegramSettings)
	settings.Put("/telegram", handlers.UpdateTelegramSettings)
	settings.Post("/telegram/test", handlers.TestTelegramConnection)

	// Notifications routes
	notifications := api.Group("/notifications")
	notifications.Post("/telegram", handlers.SendTelegramNotification)
	notifications.Post("/email", handlers.SendEmailNotification)

	// Alert Rules routes
	rules := api.Group("/rules")
	rules.Get("/", handlers.GetAlertRules)
	rules.Post("/", handlers.CreateAlertRule)
	rules.Delete("/:id", handlers.DeleteAlertRule)
	rules.Post("/simulate", handlers.SimulateRule)

	// Image routes
	images := api.Group("/images")
	images.Get("/:id/blur", handlers.GetBlurredImage)

	// Analytics routes
	analytics := api.Group("/analytics")
	analytics.Get("/heatmap", handlers.GetHeatmapData)
	analytics.Get("/summary", handlers.GetAnalyticsSummary)

	// Dashboard routes
	dashboards := api.Group("/dashboards")
	dashboards.Get("/", handlers.GetDashboards)
	dashboards.Post("/", handlers.CreateDashboard)
	dashboards.Get("/:id", handlers.GetDashboard)
	dashboards.Post("/schedule", handlers.ScheduleReport)

	// Integration routes
	integrations := api.Group("/integrations")
	integrations.Get("/", handlers.GetIntegrations)
	integrations.Post("/", handlers.CreateIntegration)
	integrations.Put("/:id", handlers.UpdateIntegration)
	integrations.Delete("/:id", handlers.DeleteIntegration)
	integrations.Post("/test/:id", handlers.TestIntegration)

	// Telegram API routes (Central Bot)
	telegram := api.Group("/telegram")
	telegram.Get("/status", handlers.GetTelegramStatus)
	telegram.Post("/registrations/create", handlers.CreateRegistration)
	telegram.Post("/chats/manual-add", handlers.ManualAddChat)
	telegram.Get("/chats", handlers.ListTelegramChats)
	telegram.Post("/chats/:chat_id/test", handlers.TestTelegramChat)
	telegram.Delete("/chats/:chat_id", handlers.RemoveTelegramChat)

	// Telegram Webhook (receives updates from Telegram)
	app.Post("/api/telegram/webhook", handlers.TelegramWebhook)

	// Test notify endpoint
	api.Post("/test/notify", handlers.TestNotify)

	// Review Queue routes
	review := api.Group("/review-queue")
	review.Get("/", handlers.GetReviewQueue)
	review.Post("/:id/action", handlers.ReviewAction)
	review.Post("/bulk", handlers.BulkReviewAction)
	review.Get("/:id/events", handlers.GetDetectionEvents)

	// Triage Rules routes
	triage := api.Group("/triage-rules")
	triage.Get("/", handlers.GetTriageRules)
	triage.Post("/", handlers.CreateTriageRule)
	triage.Put("/:id", handlers.UpdateTriageRule)
	triage.Delete("/:id", handlers.DeleteTriageRule)
	triage.Post("/:id/simulate", handlers.SimulateTriageRule)

	// Annotation / ML Feedback routes
	annotations := api.Group("/annotations")
	annotations.Get("/backlog", handlers.GetAnnotationBacklog)
	annotations.Get("/stats", handlers.GetAnnotationStats)
	annotations.Post("/export", handlers.ExportAnnotations)
	annotations.Put("/:id/assign", handlers.AssignAnnotation)
	api.Post("/detections/:id/feedback", handlers.SubmitFeedback)

	// Metrics & Observability routes
	internal := app.Group("/internal")
	internal.Get("/metrics-summary", handlers.MetricsSummary)
	internal.Get("/health", handlers.HealthCheck)
	app.Get("/metrics", handlers.PrometheusMetrics)
	app.Get("/health", handlers.HealthCheck)

	// Zones routes
	zones := api.Group("/zones")
	zones.Get("/", handlers.GetZones)
	zones.Get("/:id", handlers.GetZone)
	zones.Post("/", handlers.CreateZone)
	zones.Put("/:id", handlers.UpdateZone)
	zones.Delete("/:id", handlers.DeleteZone)

	// Security routes
	security := api.Group("/security")
	security.Get("/login-activity", handlers.GetLoginActivity)
	security.Get("/audit-log", handlers.GetAuditLog)
	security.Get("/sessions", handlers.GetActiveSessions)
	security.Delete("/sessions/:id", handlers.RevokeSession)
	security.Delete("/sessions", handlers.RevokeAllSessions)
	security.Get("/settings", handlers.GetSecuritySettings)
	security.Put("/settings", handlers.UpdateSecuritySettings)

	// Email settings routes
	email := api.Group("/email")
	email.Get("/settings", handlers.GetEmailSettings)
	email.Put("/settings", handlers.UpdateEmailSettings)
	email.Post("/test", handlers.TestEmailConnection)
	email.Get("/help", handlers.GetEmailHelp)

	// WebSocket for real-time updates
	app.Get("/ws", handlers.WebSocketHandler)

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		log.Println("\n🛑 Shutting down gracefully...")
		sched.Stop()
		telegramService.SendSystemStatus("stopped", "SmartAPD Backend dihentikan")
		app.Shutdown()
	}()

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 SmartAPD Backend running on http://localhost:%s", port)
	log.Printf("📡 WebSocket available at ws://localhost:%s/ws", port)
	log.Printf("📊 Health check: http://localhost:%s/health", port)

	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("❌ Server error: %v", err)
	}
}
