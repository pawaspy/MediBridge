package api

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/pawaspy/MediBridge/token"
)

func (server *Server) authorizeUser(ctx *gin.Context, accessibleRoles []string) (*token.Payload, error) {
	authHeader := ctx.GetHeader(authorizatonHeaderKey)
	if len(authHeader) == 0 {
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authorization header missing"})
		return nil, errors.New("authorization header missing")
	}

	fields := strings.Fields(authHeader)
	if len(fields) < 2 {
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization header format"})
		return nil, errors.New("invalid authorization header format")
	}

	authType := strings.ToLower(fields[0])
	if authType != authorizationTypeBearer {
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unsupported authorization type"})
		return nil, errors.New("unsupported authorization type")
	}

	accessToken := fields[1]
	payload, err := server.tokenMaker.VerifyToken(accessToken)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
		return nil, errors.New("invalid or expired token")
	}

	if !hasPermission(payload.Role, accessibleRoles) {
		ctx.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "permission denied"})
		return nil, errors.New("permission denied")
	}

	return payload, nil
}

func hasPermission(userRole string, accessibleRoles []string) bool {
	for _, role := range accessibleRoles {
		if userRole == role {
			return true
		}
	}
	return false
}
