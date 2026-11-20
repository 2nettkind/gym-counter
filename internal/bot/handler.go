package bot

import (
	"gymtracker/internal/service"

	tele "gopkg.in/telebot.v3"
)

type Handler struct {
	service *service.WorkoutService
}

func NewHandler(s *service.WorkoutService) *Handler {
	return &Handler{service: s}
}

func (h *Handler) StartCmd(c tele.Context) error {
	menu := &tele.ReplyMarkup{}

	btn := menu.WebApp("💪 Дневник тренировок", &tele.WebApp{
		URL: "https://gymtracker-kw69.onrender.com/",
	})

	menu.Inline(menu.Row(btn))

	return c.Send("Привет! Открой приложение для записи результатов:", menu)
}
