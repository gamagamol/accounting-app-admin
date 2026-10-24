# syntax=docker/dockerfile:1

FROM rust:1.98-slim AS builder

WORKDIR /src

COPY Cargo.toml Cargo.lock ./
COPY cmd ./cmd
COPY src ./src
COPY migrations ./migrations

RUN cargo build --release --locked --bin admin-accounting-backend

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl tzdata \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --system --create-home --shell /usr/sbin/nologin app

ENV TZ=Asia/Jakarta
ENV RUST_LOG=info

WORKDIR /app
COPY --from=builder /src/target/release/admin-accounting-backend /app/server

USER app

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=5 \
    CMD curl -fsS http://127.0.0.1:8080/health || exit 1

ENTRYPOINT ["/app/server"]
