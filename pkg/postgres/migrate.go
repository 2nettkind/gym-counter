package postgres

import (
	"errors"
	"log"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func RunMigrations(dbUrl string) error {
	log.Println("Запуск миграций базы данных...")

	m, err := migrate.New("file://migrations", dbUrl)
	if err != nil {
		return err
	}
	defer m.Close()

	if err := m.Up(); err != nil {
		if errors.Is(err, migrate.ErrNoChange) {
			log.Println("Миграции не требуются, база данных актуальна.")
			return nil
		}
		return err
	}

	log.Println("Миграции успешно применены!")
	return nil
}
