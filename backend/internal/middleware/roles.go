package middleware

import (
	"github.com/gofiber/fiber/v2"
)

// RequireRole creates a middleware that checks if the user has the required role
func RequireRole(allowedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole := c.Locals("role")
		if userRole == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Authentication required",
			})
		}

		role, ok := userRole.(string)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid role in token",
			})
		}

		// Check if user's role is in allowed roles
		for _, allowed := range allowedRoles {
			if role == allowed {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Insufficient permissions",
		})
	}
}

// RequireAdmin is a shorthand for RequireRole("admin")
func RequireAdmin() fiber.Handler {
	return RequireRole("admin")
}

// RequireSupervisorOrAdmin allows admin or supervisor roles
func RequireSupervisorOrAdmin() fiber.Handler {
	return RequireRole("admin", "supervisor")
}
