# Build Stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git tzdata

# Copy modules
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build binary
# -ldflags="-w -s" reduces binary size
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o smartapd-backend ./cmd/server

# Final Stage
FROM alpine:3.19

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata

# Create non-root user
RUN addgroup -S smartapd && adduser -S smartapd -G smartapd

# Copy binary and config
COPY --from=builder /app/smartapd-backend .
# Note: In production you might use environment variables instead of .env file
# COPY --from=builder /app/.env . 

# Set permissions
RUN chown -R smartapd:smartapd /app

# Switch to non-root user
USER smartapd

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run
CMD ["./smartapd-backend"]
