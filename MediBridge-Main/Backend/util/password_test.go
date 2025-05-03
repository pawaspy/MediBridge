package util

import (
	"testing"

	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

func TestPassword(t *testing.T) {
	pass := RandomString(6)

	hashPass, err := HashPassword(pass)
	require.NoError(t, err)
	require.NotEmpty(t, hashPass)
	
	err = CheckPassword(pass, hashPass)
	require.NoError(t, err)

	wrongPass := RandomString(6)
	err = CheckPassword(wrongPass, hashPass)
	require.NotEqual(t, pass, wrongPass)
	require.EqualError(t, err, bcrypt.ErrMismatchedHashAndPassword.Error())
}
