# syntax=docker/dockerfile:1

FROM rust:1.98-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl tzdata \
    && rm -rf /var/lib/apt/lists/*

ENV TZ=Asia/Jakarta
ENV RUST_LOG=info

# Source code di-mount ke /app lewat docker-compose (tidak di-COPY ke image)
WORKDIR /app

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=600s --retries=5 \
    CMD curl -fsS http://127.0.0.1:8080/health || exit 1

# Saat start: build release (incremental, cache di volume target), lalu jalankan.
# "exec" supaya server menerima SIGTERM dengan benar saat container di-stop/restart.
CMD ["sh", "-c", "cargo build --release --locked --bin admin-accounting-backend && exec ./target/release/admin-accounting-backend"]