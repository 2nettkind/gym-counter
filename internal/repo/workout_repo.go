package repo

import (
	"context"
	"fmt"
	"gymtracker/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type WorkoutRepo struct {
	db *pgxpool.Pool
}

func NewWorkoutRepo(db *pgxpool.Pool) *WorkoutRepo {
	return &WorkoutRepo{db: db}
}

func (r *WorkoutRepo) LogSet(ctx context.Context, dto domain.CreateSetDTO) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	var workoutID int
	err = tx.QueryRow(ctx, `SELECT id FROM workouts WHERE user_id = $1 AND workout_date = CURRENT_DATE LIMIT 1`, dto.TelegramID).Scan(&workoutID)
	if err != nil {
		err = tx.QueryRow(ctx, `INSERT INTO workouts (user_id, name, workout_date) VALUES ($1, 'FULL BODY', CURRENT_DATE) RETURNING id`, dto.TelegramID).Scan(&workoutID)
		if err != nil {
			return fmt.Errorf("failed to create workout: %w", err)
		}
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO sets (workout_id, exercise_id, weight, reps) 
		VALUES ($1, $2, $3, $4)`,
		workoutID, dto.ExerciseID, dto.Weight, dto.Reps)
	if err != nil {
		return fmt.Errorf("failed to insert set: %w", err)
	}

	return tx.Commit(ctx)
}
