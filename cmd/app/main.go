package main

import (
	"context"
	"log"
	"os"
	"time"

	"gymtracker/internal/api"
	"gymtracker/internal/bot"
	"gymtracker/internal/config"
	"gymtracker/internal/repo"
	"gymtracker/internal/service"
	"gymtracker/pkg/postgres"

	"github.com/gin-gonic/gin"
	tele "gopkg.in/telebot.v3"
)

func main() {
	cfg := config.Load()
	ctx := context.Background()

	if err := postgres.RunMigrations(cfg.DBUrl); err != nil {
		log.Fatalf("Не удалось применить миграции: %v", err)
	}

	dbPool, err := postgres.NewPool(ctx, cfg.DBUrl)
	if err != nil {
		log.Fatalf("Ошибка подключения к БД: %v", err)
	}
	defer dbPool.Close()

	workoutRepo := repo.NewWorkoutRepo(dbPool)
	workoutService := service.NewWorkoutService(workoutRepo)
	botHandler := bot.NewHandler(workoutService)

	token := os.Getenv("BOT_TOKEN")
	b, err := tele.NewBot(tele.Settings{
		Token:  token,
		Poller: &tele.LongPoller{Timeout: 10 * time.Second},
	})
	if err != nil {
		log.Fatalf("Ошибка создания бота: %v", err)
	}
	b.Handle("/start", botHandler.StartCmd)

	if os.Getenv("RENDER") == "true" {
		gin.SetMode(gin.ReleaseMode)
	}
	router := gin.Default()

	apiHandler := api.NewHandler(workoutService, token)
	apiHandler.InitRoutes(router)

	router.Static("/", "./web/dist")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	go func() {
		log.Printf("API сервер запущен на порту %s", port)
		if err := router.Run(":" + port); err != nil {
			log.Fatalf("Ошибка HTTP-сервера: %v", err)
		}
	}()

	log.Println("Бот запущен!")
	b.Start()
}
