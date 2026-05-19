.PHONY: help up down restart logs migrate seed clean build

help:
	@echo "Available commands:"
	@echo "  make up        - Start Docker Compose services"
	@echo "  make down      - Stop Docker Compose services"
	@echo "  make restart   - Restart Docker Compose services"
	@echo "  make logs      - View backend logs"
	@echo "  make migrate   - Run database migrations"
	@echo "  make seed      - Seed database with test data"
	@echo "  make build     - Rebuild Docker images"
	@echo "  make clean     - Remove containers and volumes"

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f backend

migrate:
	docker-compose exec -T backend npm run migration:run

seed:
	docker-compose exec -T backend npm run seed

build:
	docker-compose build --no-cache

clean:
	docker-compose down -v
