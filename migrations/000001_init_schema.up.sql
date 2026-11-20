CREATE TABLE users (
    telegram_id BIGINT PRIMARY KEY,
    language_code VARCHAR(2) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    target_muscle VARCHAR(50),
    name_en VARCHAR(100) NOT NULL,
    name_ru VARCHAR(100) NOT NULL,
    is_bodyweight BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO exercises (target_muscle, name_en, name_ru, is_bodyweight) VALUES
('Chest', 'Bench Press', 'Жим лежа', FALSE),
('Back', 'Seated Cable Row', 'Тяга нижнего блока', FALSE),
('Back', 'Pull-ups', 'Подтягивания', TRUE),
('Legs', 'Leg Press', 'Жим ногами', FALSE);

CREATE TABLE custom_exercises (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workouts (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(telegram_id) ON DELETE CASCADE,
    name VARCHAR(100) DEFAULT 'FULL BODY',
    workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sets (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES exercises(id) ON DELETE SET NULL,
    custom_exercise_id INTEGER REFERENCES custom_exercises(id) ON DELETE SET NULL,
    weight NUMERIC(5, 2) NOT NULL DEFAULT 0,
    reps INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);