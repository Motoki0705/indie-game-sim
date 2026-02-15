# indie-game-sim MVP

Python(FastAPI) backend + Node.js(React/Vite) frontend で、30歳〜35歳の周回ライフシムをローカル実行するMVPです。

## Directory Layout
- `backend/app/domain`: ゲームルールと状態遷移（純ロジック）
- `backend/app/services`: ユースケース（ラン開始・行動適用・月次進行・転生）
- `backend/app/repos`: 永続化（JSONストア）
- `backend/app/api`: FastAPIルーティング
- `frontend/src/api`: APIクライアント
- `frontend/src/components`: 画面コンポーネント
- `frontend/src/types`: 型定義

## 1. Backend setup (uv)
```bash
UV_CACHE_DIR=/tmp/.uv-cache uv sync --directory backend
```

## 2. Backend start
foreground:
```bash
npm run dev:backend
```

background (Python script):
```bash
npm run dev:backend:bg
```

stop background:
```bash
npm run stop:backend:bg
```

## 3. Frontend start (Node.js)
```bash
cd frontend
npm install
npm run dev
```

or from repository root:
```bash
npm run dev
```

Vite dev server: `http://localhost:5173`
Backend API: `http://127.0.0.1:8000`
