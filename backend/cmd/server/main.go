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

	"github.com/smartapd/backend/internal/config"
	"github.com/smartapd/backend/internal/database"
	"github.com/smartapd/backend/internal/handlers"
	"github.com/smartapd/backend/internal/middleware"
	"github.com/smartapd/backend/internal/services"
)

func main() {
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

	// Initialize services
	telegramService := services.NewTelegramService(cfg.TelegramToken, cfg.TelegramChatID)
	detectionService := services.NewDetectionService(telegramService)
	scheduler := services.NewScheduler(detectionService, telegramService)

	// Start scheduler
	scheduler.Start()

	// Send startup notification
	telegramService.SendSystemStatus("started", "SmartAPD Backend berhasil dijalankan")

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "SmartAPD Backend v1.0.0",
		ServerHeader: "SmartAPD",
		ErrorHandler: customErrorHandler,
	})

	// Middleware
	app.Use(recover.New())
	app.Use(middleware.RequestID())
	app.Use(middleware.Logger())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization, X-API-Key",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

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
	detections := api.Group("/detections")
	detections.Get("/", handlers.GetDetections)
	detections.Get("/stats", handlers.GetDetectionStats)
	detections.Get("/:id", handlers.GetDetection)
	detections.Post("/", handlers.CreateDetection)

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

	// Report routes
	reports := api.Group("/reports")
	reports.Get("/daily", handlers.GetDailyReport)
	reports.Get("/weekly", handlers.GetWeeklyReport)
	reports.Get("/export", handlers.ExportReport)

	// Auth routes
	auth := api.Group("/auth")
	auth.Post("/login", handlers.Login)
	auth.Post("/register", handlers.Register)
	auth.Get("/me", middleware.JWTAuth(), handlers.GetMe)

	// WebSocket for real-time updates
	app.Get("/ws", handlers.WebSocketHandler)

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		log.Println("\n🛑 Shutting down gracefully...")
		scheduler.Stop()
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

// customErrorHandler handles errors globally
func customErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
	}

	return c.Status(code).JSON(fiber.Map{
		"success": false,
		"error":   err.Error(),
		"code":    code,
	})
}
