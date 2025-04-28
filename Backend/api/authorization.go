package api

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/pawaspy/MediBridge/token"
)

func (server *Server) authorizeUser(ctx *gin.Context, accessibleRoles []string) *token.Payload {
	authHeader := ctx.GetHeader(authorizatonHeaderKey)
	if len(authHeader) == 0 {
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authorization header missing"})
		return nil
	}

	fields := strings.Fields(authHeader)
	if len(fields) < 2 {
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization header format"})
		return nil
	}

	authType := strings.ToLower(fields[0])
	if authType != authorizationTypeBearer {
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unsupported authorization type"})
		return nil
	}

	accessToken := fields[1]
	payload, err := server.tokenMaker.VerifyToken(accessToken)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
		return nil
	}

	if !hasPermission(payload.Role, accessibleRoles) {
		ctx.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "permission denied"})
		return nil
	}

	return payload
}

func hasPermission(userRole string, accessibleRoles []string) bool {
	for _, role := range accessibleRoles {
		if userRole == role {
			return true
		}
	}
	return false
}
