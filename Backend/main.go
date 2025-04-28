package main

import (
	"context"
	"fmt"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pawaspy/MediBridge/api"
	db "github.com/pawaspy/MediBridge/db/sqlc"
	"github.com/pawaspy/MediBridge/util"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	gin.SetMode(gin.ReleaseMode)
	fmt.Println("Server is running at port 3000")

	config, err := util.LoadConfig(".")

	if err != nil {
		log.Info().Msg("Cannot open the config file")
	}

	if config.Environment == "development" {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	}

	connPool, err := pgxpool.New(context.Background(), config.DBSource)
	if err != nil {
		log.Info().Msg("Cannot connect to db")
	}

	store := db.NewStore(connPool)

	runGinServer(config, store)
}

func runGinServer(config util.Config, store db.Store) {
	server, err := api.NewServer(config, store)

	if err != nil {
		log.Info().Msg("cannot start the server")
	}

	err = server.Start(config.HTTPAddress)
	if err != nil {
		log.Info().Msg("Cannot start the server")
	}
}
