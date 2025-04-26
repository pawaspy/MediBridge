DB_URL = postgresql://root:secret@localhost:5432/medibridge?sslmode=disable

postgres:
	docker run --name postgres -p 5432:5432 -e POSTGRES_USER=root -e POSTGRES_PASSWORD=secret -d postgres:12-alpine

createdb:
	docker exec -it postgres createdb --username=root --owner=root medibridge

migration:
	migrate create -ext sql -dir db/migration -seq $(name)

migrateup:
	migrate -path db/migration -database "$(DB_URL)" -verbose up

migratedown:
	migrate -path db/migration -database "$(DB_URL)" -verbose 
	
sqlc:
	sqlc generate

server:
	go run main.go

.PHONY: postgres createdb migration migrateup migratedown sqlc server