# syntax=docker/dockerfile:1

FROM rust:1.98-slim AS builder

WORKDIR /src

COPY Cargo.toml Cargo.lock ./
COPY cmd ./cmd
COPY src ./src
COPY migrations ./migrations

RUN cargo build --release --bin admin-accounting-backend

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates tzdata \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --system --create-home --shell /usr/sbin/nologin app

ENV TZ=Asia/Jakarta

WORKDIR /app
COPY --from=builder /src/target/release/admin-accounting-backend /app/server

USER app

EXPOSE 8080

ENTRYPOINT ["/app/server"]
