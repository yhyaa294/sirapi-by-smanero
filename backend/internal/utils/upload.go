package utils

import (
	"errors"
	"mime/multipart"
	"path/filepath"
	"strings"
)

var (
	ErrInvalidFileType = errors.New("invalid file type, allow: .jpg, .jpeg, .png")
	ErrFileTooLarge    = errors.New("file too large, max 5MB")
	ErrInvalidPath     = errors.New("invalid file path")
)

const MaxFileSize = 5 * 1024 * 1024 // 5MB

// ValidateFileUpload checks file size and extension
func ValidateFileUpload(file *multipart.FileHeader) error {
	// Check size
	if file.Size > MaxFileSize {
		return ErrFileTooLarge
	}

	// Check extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		return ErrInvalidFileType
	}

	return nil
}

// SanitizeFilename cleans the filename to prevent path traversal
func SanitizeFilename(filename string) string {
	// Get base name only
	name := filepath.Base(filename)

	// Remove dangerous characters
	name = strings.ReplaceAll(name, "..", "")
	name = strings.ReplaceAll(name, "/", "")
	name = strings.ReplaceAll(name, "\\", "")

	return name
}

// SanitizePath ensures the path is clean and doesn't traverse up
func SanitizePath(path string) (string, error) {
	cleanPath := filepath.Clean(path)
	if strings.Contains(cleanPath, "..") {
		return "", ErrInvalidPath
	}
	return cleanPath, nil
}
