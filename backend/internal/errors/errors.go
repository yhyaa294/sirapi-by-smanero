package errors

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
)

// AppError represents a custom application error
type AppError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Details any    `json:"details,omitempty"`
}

func (e *AppError) Error() string {
	return e.Message
}

// New creates a new AppError
func New(code int, message string) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
	}
}

// Common errors
var (
	ErrBadRequest          = New(http.StatusBadRequest, "Bad Request")
	ErrUnauthorized        = New(http.StatusUnauthorized, "Unauthorized")
	ErrForbidden           = New(http.StatusForbidden, "Forbidden")
	ErrNotFound            = New(http.StatusNotFound, "Resource Not Found")
	ErrInternalServerError = New(http.StatusInternalServerError, "Internal Server Error")
)

// ErrorHandler is the custom Fiber error handler
func ErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	message := "Internal Server Error"
	var details any

	// Check if it's our AppError
	if e, ok := err.(*AppError); ok {
		code = e.Code
		message = e.Message
		details = e.Details
	} else if e, ok := err.(*fiber.Error); ok {
		// Check if it's a Fiber error
		code = e.Code
		message = e.Message
	} else {
		// Standard error, keep internal 500 but log it (handled by logger middleware)
		message = err.Error()
	}

	return c.Status(code).JSON(fiber.Map{
		"success": false,
		"error":   message,
		"code":    code,
		"details": details,
	})
}
