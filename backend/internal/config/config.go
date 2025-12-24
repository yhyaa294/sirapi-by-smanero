package config

import "os"

type Config struct {
	DatabaseURL    string
	TelegramToken  string
	TelegramChatID string
	Port           string
	Environment    string
	JWTSecret      string
}

func Load() *Config {
	return &Config{
		DatabaseURL:    getEnv("DATABASE_URL", "./data/smartapd.db"),
		TelegramToken:  getEnv("TELEGRAM_BOT_TOKEN", ""),
		TelegramChatID: getEnv("TELEGRAM_CHAT_ID", ""),
		Port:           getEnv("PORT", "8080"),
		Environment:    getEnv("ENVIRONMENT", "development"),
		JWTSecret:      getEnv("JWT_SECRET", "smartapd-secret-key-2024"), // Default for dev, change in prod!
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
