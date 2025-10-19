# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

- Setup (local)
  ```bash
  python -m venv .venv
  source .venv/bin/activate
  pip install -r requirements.txt
  ```
- Run dev server (Flask builtin)
  ```bash
  python app.py
  ```
- Run locally in production mode (Gunicorn)
  ```bash
  ./run_production.sh
  ```
- Docker (build and run)
  ```bash
  docker build -t flask-compliments .
  docker run -p 8080:8080 flask-compliments
  ```
- Docker Compose
  ```bash
  docker-compose up
  ```
- Heroku (Procfile present)
  ```bash
  git push heroku main
  ```

Notes
- App listens on port 8080 by default; override with `PORT`.
- `./run_production.sh` expects `.env.production` in the repo root to export env vars (e.g., `PORT`).

Tooling status
- Linting: not configured in this repo.
- Tests: no test suite present.

## Architecture and structure

High level
- Single Flask application in `app.py` serving both API and static frontend (`/static`).
- In-memory data store for compliments (list of objects with `id`, `text`, `created_at`). No external DB; data resets on process restart.
- Static UI (`static/index.html`, `static/app.js`, `static/styles.css`) calls JSON endpoints on the same origin.
- Production entrypoint via Gunicorn (`app:app`) in `Dockerfile`, `docker-compose.yml`, and `Procfile`.

Core flow
- HTTP
  - `GET /` serves `static/index.html`.
  - API endpoints under `/api/*`:
    - `GET /api/stats` → `{ count }`.
    - `GET /api/compliments?limit=N` → list of `{ id, text }` (most recent first, capped 1–100, default 10).
    - `GET /api/compliments/random` → single `{ id, text }` or 204 when empty.
    - `POST /api/compliments` with JSON `{ text }` → 201 on success; validates 1–140 chars and de-duplicates (case/whitespace-insensitive normalization).
    - `DELETE /api/compliments/<id>` → 204 or 404.
- State
  - IDs auto-increment from process start; `_seed` adds initial compliments at boot.
  - Normalization helper ensures uniqueness across casing/spacing.
- Configuration
  - Environment loaded via `python-dotenv` (`.env*` files) and standard env vars (`PORT`, `FLASK_DEBUG`, `FLASK_ENV`).
- Logging
  - Basic structured logging configured at INFO level in `app.py`.

Deployment surfaces
- Docker image: Python 3.11 slim, non-root user, Gunicorn binding `0.0.0.0:8080`.
- `docker-compose.yml`: maps `./static` as read-only volume, sets `FLASK_ENV`, `FLASK_DEBUG`, `PORT`.
- Heroku: `Procfile` runs Gunicorn (`web: gunicorn ... app:app`).
