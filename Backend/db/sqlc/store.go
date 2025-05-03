package db

import "github.com/jackc/pgx/v5/pgxpool"

type Store struct {
	*Queries
	connPool *pgxpool.Pool
}

func NewStore(connPool *pgxpool.Pool) Store {
	return Store{
		connPool: connPool,
		Queries: New(connPool),
	}
}