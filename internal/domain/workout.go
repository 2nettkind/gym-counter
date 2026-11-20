package domain

import "context"

type WorkoutSet struct {
	UserID     int64
	ExerciseID int
	WeightKG   float64
	Reps       int
	Volume     float64
}

type WorkoutRepository interface {
	Create(ctx context.Context, set WorkoutSet) error
}
