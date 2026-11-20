DB_USER ?= postgres
DB_PASSWORD ?= lafeeonwave32
DB_HOST ?= localhost
DB_PORT ?= 5432
DB_NAME ?= gymtracker
DB_URL := postgres://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)?sslmode=disable

.PHONY: help compose-up compose-down migrate-up migrate-down migrate-create run build

compose-up:
	docker compose up -d

compose-down:
	docker compose down

migrate-up:
	migrate -path migrations -database "$(DB_URL)" -verbose up

migrate-down:
	migrate -path migrations -database "$(DB_URL)" -verbose down

migrate-create:
	migrate create -ext sql -dir migrations -seq $(name)

run:
	go run cmd/app/main.go

build:
	go build -o bin/app cmd/app/main.go