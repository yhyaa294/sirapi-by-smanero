package validator

import (
	"fmt"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/sirapi/backend/internal/errors"
)

// XValidator wraps the validator instance
type XValidator struct {
	validator *validator.Validate
}

var validate = validator.New()

// New creates a new validator instance
func New() *XValidator {
	// Register function to get json tag name
	validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})

	return &XValidator{
		validator: validate,
	}
}

// Validate validates a struct and returns an AppError if invalid
func (v *XValidator) Validate(data any) *errors.AppError {
	err := v.validator.Struct(data)
	if err == nil {
		return nil
	}

	validationErrors := make(map[string]string)

	for _, err := range err.(validator.ValidationErrors) {
		field := err.Field()
		tag := err.Tag()
		param := err.Param()

		message := fmt.Sprintf("Field %s failed validation on tag %s", field, tag)

		// Custom messages
		switch tag {
		case "required":
			message = "Field ini wajib diisi"
		case "email":
			message = "Format email tidak valid"
		case "min":
			message = fmt.Sprintf("Minimal %s karakter", param)
		case "max":
			message = fmt.Sprintf("Maksimal %s karakter", param)
		}

		validationErrors[field] = message
	}

	return &errors.AppError{
		Code:    400,
		Message: "Validation Failed",
		Details: validationErrors,
	}
}

// Global instance
var GlobalValidator = New()
