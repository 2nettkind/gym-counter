CREATE TABLE workout_sets (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    exercise_name VARCHAR(100) NOT NULL,
    weight_kg DOUBLE PRECISION NOT NULL CHECK (weight_kg >= 0),
    reps INTEGER NOT NULL CHECK (reps > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workout_sets_user_id ON workout_sets(user_id);