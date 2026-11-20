package api

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"

	"gymtracker/internal/domain"
	"gymtracker/internal/service"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	workoutService *service.WorkoutService
	botToken       string
}

func NewHandler(ws *service.WorkoutService, botToken string) *Handler {
	return &Handler{
		workoutService: ws,
		botToken:       botToken,
	}
}

func (h *Handler) InitRoutes(router *gin.Engine) {
	api := router.Group("/api")

	api.Use(TelegramAuthMiddleware(h.botToken))
	{
		api.POST("/sets", h.LogSet)
	}
}

type LogSetRequest struct {
	ExerciseID int     `json:"exercise_id" binding:"required"`
	Weight     float64 `json:"weight"`
	Reps       int     `json:"reps" binding:"required,gt=0"`
}

func (h *Handler) LogSet(c *gin.Context) {
	var req LogSetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	telegramID := c.GetInt64("telegram_id")

	dto := domain.CreateSetDTO{
		TelegramID: telegramID,
		ExerciseID: req.ExerciseID,
		Weight:     req.Weight,
		Reps:       req.Reps,
	}

	if err := h.workoutService.LogSet(c.Request.Context(), dto); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

func TelegramAuthMiddleware(botToken string) gin.HandlerFunc {
	return func(c *gin.Context) {
		initData := c.GetHeader("X-Telegram-Init-Data")
		if initData == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing init data"})
			c.Abort()
			return
		}

		parsed, err := url.ParseQuery(initData)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid init data format"})
			c.Abort()
			return
		}

		clientHash := parsed.Get("hash")
		if clientHash == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing hash"})
			c.Abort()
			return
		}
		parsed.Del("hash")

		var keys []string
		for k := range parsed {
			keys = append(keys, k)
		}
		sort.Strings(keys)

		var dataCheckArr []string
		for _, k := range keys {
			dataCheckArr = append(dataCheckArr, fmt.Sprintf("%s=%s", k, parsed.Get(k)))
		}
		dataCheckString := strings.Join(dataCheckArr, "\n")

		mac := hmac.New(sha256.New, []byte("WebAppData"))
		mac.Write([]byte(botToken))
		secretKey := mac.Sum(nil)

		mac = hmac.New(sha256.New, secretKey)
		mac.Write([]byte(dataCheckString))
		calculatedHash := hex.EncodeToString(mac.Sum(nil))

		if calculatedHash != clientHash {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid signature"})
			c.Abort()
			return
		}

		authDateStr := parsed.Get("auth_date")
		authDate, _ := strconv.ParseInt(authDateStr, 10, 64)
		if time.Now().Unix()-authDate > 86400 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Init data expired"})
			c.Abort()
			return
		}

		userStr := parsed.Get("user")
		var tgUser struct {
			ID           int64  `json:"id"`
			LanguageCode string `json:"language_code"`
		}

		if err := json.Unmarshal([]byte(userStr), &tgUser); err != nil || tgUser.ID == 0 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user data"})
			c.Abort()
			return
		}

		c.Set("telegram_id", tgUser.ID)
		c.Set("lang", tgUser.LanguageCode)

		c.Next()
	}
}
