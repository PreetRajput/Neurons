# Architecture

The application is a FastAPI service and a standalone Vite React browser UI.

1. `app/main.py` handles uploads, HTTP validation, and API responses.
2. `app/extractors.py` ingests PDF/DOCX text and sends it to `app/ai/ollama.py`. Ollama returns structured natural-language extraction constrained by the RADIX Pydantic JSON schema. The result is validated before `app/extractors.py` builds the persisted contracts.
3. `app/storage.py` persists idempotently by content-derived document ID. With `SUPABASE_URL` and `SUPABASE_KEY`, it uses the Supabase REST API; without credentials, local JSON persistence keeps development runnable. Both adapters preserve the same API contracts.
4. `frontend/` is a Vite-managed React 18 application:
   - `src/pages/` contains screen-level composition.
   - `src/components/` contains reusable presentation and workflow components.
   - `src/hooks/` contains data-fetching and upload state.
   - `src/services/` contains the API client.
   - `src/types.js` contains shared frontend labels and contract helpers.
   - `src/styles.css` contains the responsive visual system.
   - `vite.config.js` proxies `/api` requests to FastAPI during development.

Profile generation is a direct transformation of validated resume output. Readiness is an explicit, explainable comparison between profile skills and a selected JD's extracted skills. It reports a percentage, matched evidence, and missing skills; it is not an opaque model output or hiring recommendation.

Ollama is configured with `OLLAMA_BASE_URL` and `OLLAMA_MODEL`; defaults are `http://127.0.0.1:11434` and `qwen2.5:1.5b-instruct-q5_K_M`. Extraction failures are surfaced to the API caller rather than hidden behind deterministic fallback logic.

The frontend uses separate views for landing/resume upload, Profile Builder, Talent Check, Skill Match, and the job library. Supplied JDs are seeded from the provided PDF pack at backend startup. New JD upload remains available only as a collapsed library-management action.

## Supabase table

Create the small JSON-record table below in Supabase before enabling the REST adapter:

```sql
create table phase1_records (
  collection text not null,
  key text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (collection, key)
);
alter table phase1_records enable row level security;
```

The service uses the project API key and REST upsert semantics. In production, use a server-only service role or narrowly scoped authenticated policies; never expose either key in the React bundle.
