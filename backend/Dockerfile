# Backend Dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache gcc musl-dev

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o smartapd-backend ./cmd/server/

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/

# Copy binary
COPY --from=builder /app/smartapd-backend .

# Create data directory
RUN mkdir -p /root/data

# Expose port
EXPOSE 8080

# Environment variables
ENV PORT=8080
ENV DATABASE_URL=/root/data/detections.db

# Run
CMD ["./smartapd-backend"]
