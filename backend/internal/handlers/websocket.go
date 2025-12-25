package handlers

import (
	"log"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"

	"github.com/smartapd/backend/internal/middleware"
)

// ==================== WEBSOCKET HANDLER ====================

var (
	clients   = make(map[*websocket.Conn]bool)
	clientsMu sync.RWMutex
)

// WebSocketHandler handles WebSocket connections for real-time updates
func WebSocketHandler(c *fiber.Ctx) error {
	// Check auth token from query param "token"
	tokenString := c.Query("token")

	if tokenString == "" {
		// Also allow strict mode where we don't proceed without token
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Missing auth token",
		})
	}

	// Verify token
	token, err := middleware.ValidateToken(tokenString)

	if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid token",
		})
	}

	// Check if it's a WebSocket upgrade request
	if websocket.IsWebSocketUpgrade(c) {
		return websocket.New(handleWebSocket)(c)
	}
	return fiber.ErrUpgradeRequired
}

func handleWebSocket(c *websocket.Conn) {
	// Register client
	clientsMu.Lock()
	clients[c] = true
	clientsMu.Unlock()

	log.Printf("🔌 WebSocket client connected. Total: %d", len(clients))

	defer func() {
		// Unregister client
		clientsMu.Lock()
		delete(clients, c)
		clientsMu.Unlock()
		c.Close()
		log.Printf("🔌 WebSocket client disconnected. Total: %d", len(clients))
	}()

	// Send welcome message
	c.WriteJSON(fiber.Map{
		"type":    "connection",
		"message": "Connected to SmartAPD real-time feed",
		"time":    time.Now(),
	})

	// Listen for messages
	for {
		var msg map[string]interface{}
		if err := c.ReadJSON(&msg); err != nil {
			if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
				break
			}
			log.Printf("WebSocket read error: %v", err)
			break
		}

		// Handle incoming messages (e.g., subscribe to specific events)
		msgType, ok := msg["type"].(string)
		if ok {
			switch msgType {
			case "ping":
				c.WriteJSON(fiber.Map{"type": "pong", "timestamp": msg["timestamp"]})
			case "subscribe":
				c.WriteJSON(fiber.Map{"type": "subscribed", "channel": msg["channel"]})
			}
		}
	}
}

// BroadcastMessage sends a message to all connected WebSocket clients
func BroadcastMessage(messageType string, data interface{}) {
	clientsMu.RLock()
	defer clientsMu.RUnlock()

	message := fiber.Map{
		"type": messageType,
		"data": data,
	}

	for client := range clients {
		if err := client.WriteJSON(message); err != nil {
			log.Printf("WebSocket broadcast error: %v", err)
		}
	}
}

// BroadcastAlert sends an alert to all connected clients
func BroadcastAlert(alert interface{}) {
	BroadcastMessage("alert", alert)
}

// BroadcastDetection sends a detection event to all connected clients
func BroadcastDetection(detection interface{}) {
	BroadcastMessage("detection", detection)
}
