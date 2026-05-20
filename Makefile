.PHONY: up down build rebuild migrate seed logs clean

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build --no-cache

rebuild:
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

migrate:
	docker-compose exec -T backend npm run migration:run

seed:
	docker-compose exec -T backend npm run seed

logs:
	docker-compose logs -f

clean:
	docker-compose down -v
