package service

import (
	"context"
	"errors"
	"gymtracker/internal/domain"
	"gymtracker/internal/repo"
)

var (
	ErrInvalidWeight = errors.New("weight must be zero or positive")
	ErrInvalidReps   = errors.New("reps must be greater than zero")
	ErrNoExercise    = errors.New("exercise ID is required")
)

type WorkoutService struct {
	repo *repo.WorkoutRepo
}

func NewWorkoutService(r *repo.WorkoutRepo) *WorkoutService {
	return &WorkoutService{repo: r}
}

func (s *WorkoutService) LogSet(ctx context.Context, dto domain.CreateSetDTO) error {
	if dto.Weight < 0 {
		return ErrInvalidWeight
	}
	if dto.Reps <= 0 {
		return ErrInvalidReps
	}
	if dto.ExerciseID <= 0 {
		return ErrNoExercise
	}

	return s.repo.LogSet(ctx, dto)
}
