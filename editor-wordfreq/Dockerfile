# Build Stage
FROM golang:1.23.3 AS builder

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy go.mod and go.sum files for dependency resolution
COPY go.mod ./

# Download dependencies (cached if go.mod and go.sum are unchanged)
RUN go mod download

# Copy the source code into the container
COPY . .

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Runtime Stage
FROM alpine:latest

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /app/main .

# Expose the application port
EXPOSE 80

# Command to run the application
CMD ["./main"]
