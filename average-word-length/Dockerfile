# Build Stage
FROM rust:1.75-slim as builder

WORKDIR /usr/src/app

# Copy manifests first
COPY Cargo.toml Cargo.lock ./

# Create a dummy lib.rs and main.rs to build dependencies
RUN mkdir src && \
    echo "pub mod analysis { pub async fn analyze_text() {} }" > src/lib.rs && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -rf src

# Now copy the real source code
COPY . .

# Build the application
RUN cargo build --release

# Runtime Stage
FROM debian:bookworm-slim

WORKDIR /usr/local/bin

# Copy only the built binary from builder
COPY --from=builder /usr/src/app/target/release/average-word-length .

# Expose the port the app runs on
EXPOSE 80

# Command to run the binary
CMD ["./average-word-length"]