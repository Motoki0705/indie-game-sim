# Backend (FastAPI + uv)

## Setup
```bash
UV_CACHE_DIR=/tmp/.uv-cache uv sync
```

## Run (foreground)
```bash
UV_CACHE_DIR=/tmp/.uv-cache uv run python -m app.main
```

## Run (background via Python)
```bash
UV_CACHE_DIR=/tmp/.uv-cache uv run python scripts/run_backend_bg.py
UV_CACHE_DIR=/tmp/.uv-cache uv run python scripts/stop_backend_bg.py
```

## Test
```bash
UV_CACHE_DIR=/tmp/.uv-cache uv run pytest
```
