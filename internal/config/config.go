package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBUrl string
}

func Load() *Config {
	_ = godotenv.Load()

	url := os.Getenv("DB_URL")
	if url == "" {
		log.Fatal("DB_URL is not set in environment")
	}

	return &Config{
		DBUrl: url,
	}
}
