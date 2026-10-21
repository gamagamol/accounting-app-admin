.PHONY: run test check fmt clippy docker-up docker-down

run:
	cargo run --bin admin-accounting-backend

test:
	cargo test

check:
	cargo check

fmt:
	cargo fmt

clippy:
	cargo clippy --all-targets -- -D warnings

docker-up:
	docker compose up -d

docker-down:
	docker compose down
