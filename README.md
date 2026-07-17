# udi-etl-web

React + TypeScript wizard UI for the [udi-etl-app](../udi-etl-app) API. This is a standalone frontend project — it talks to the backend purely over HTTP via `VITE_API_BASE_URL`, no shared tooling or code.

Flow:

1. **Connector** — pick a source type (`postgresql`, `mongodb`, `sql`, `file_upload`), fill in connection details, test & save it (or reuse a saved connection).
2. **Schema** — pick which tables (SQL/Postgres) or collections (MongoDB) to migrate.
3. **Target** — configure the destination (currently `s3`: bucket, region, file format, compression).
4. **Run** — kick off the migration and watch it poll to completion, with per-table row counts and errors.

## Setup

```bash
npm install
cp .env.example .env   # adjust VITE_API_BASE_URL if the API isn't on localhost:8000
npm run dev
```

The backend API must be running separately (see the `udi-etl-app` repo):

```bash
uv run uvicorn api.main:app --reload --port 8000
```

The API's CORS config allows `http://localhost:5173` (Vite's default dev port).

## Build

```bash
npm run build
```
