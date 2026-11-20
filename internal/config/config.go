package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBUrl string
}

func Load() *Config {
	_ = godotenv.Load()

	return &Config{
		DBUrl: os.Getenv("DB_URL"),
	}
}
