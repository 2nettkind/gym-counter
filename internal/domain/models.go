package domain

import "time"

type User struct {
	TelegramID   int64     `json:"telegram_id"`
	LanguageCode string    `json:"language_code"`
	CreatedAt    time.Time `json:"created_at"`
}

type Exercise struct {
	ID           int    `json:"id"`
	TargetMuscle string `json:"target_muscle"`
	NameEn       string `json:"name_en"`
	NameRu       string `json:"name_ru"`
	IsBodyweight bool   `json:"is_bodyweight"`
}

type CreateSetDTO struct {
	TelegramID int64   `json:"-"`
	ExerciseID int     `json:"exercise_id"`
	Weight     float64 `json:"weight"`
	Reps       int     `json:"reps"`
}
