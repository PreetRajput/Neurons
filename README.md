# RADIX Talent Match — Phase 1

This implements the RADIX document-to-readiness flow: JD extraction, Ollama-backed resume parsing, Profile Builder, Talent Check, and one-JD Skill Matching. It intentionally does not implement rankings or hiring recommendations.

## Setup

### Backend

From the `Neurons` directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Keep this terminal running. The API is available at `http://127.0.0.1:8000` and its interactive docs are at `http://127.0.0.1:8000/docs`.

### React frontend

Open a second terminal:

```powershell
cd "C:\Users\rajpu\Downloads\Talent Match Hackathon (1)\Neurons\frontend"
npm.cmd install
npm.cmd run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

The frontend is a conventional React/Vite app, not a CDN script. Its structure is split into `src/pages`, `src/components`, `src/hooks`, and `src/services`. The candidate flow is:

1. Open **My profile** and upload a resume.
2. The backend parses it and creates a saved candidate profile.
3. Choose **Explore roles**.
4. Select a role from the supplied JD library and click **Start readiness check**.
5. Review the transparent score, evidence found, and skills to build next.

The supplied six JD PDFs are automatically loaded into the library when the backend starts. Uploading a new JD is hidden under **Manage library** for a library administrator; it is not part of the candidate workflow. Vite proxies `/api` to the FastAPI server, so both terminals must be running.

The candidate flow follows the brief's hand-offs:

1. **Landing** — upload a resume.
2. **Profile Builder** — review and edit parsed details, including preferred roles, hackathons, internships, and certifications.
3. **Talent Check** — compare the saved profile with a company's 12-skillset bar and see per-category gaps.
4. **Skill Match** — compare the profile with one specific JD and see matched/missing skills.

## Ollama extraction

JD Analytics and Resume Parsing use the local Ollama model specified for this project:

```text
qwen2.5:1.5b-instruct-q5_K_M
```

Start Ollama before starting FastAPI:

```powershell
ollama serve
ollama list
```

The app calls `http://127.0.0.1:11434/api/chat` with a Pydantic-derived RADIX JSON schema. The model extracts natural-language evidence, skills, categories, confidence, and resume sections. Responses are validated before saving. If Ollama is unavailable or returns invalid JSON, the upload reports an error; it does not pretend keyword parsing is an LLM result.

For a production frontend build:

```powershell
npm.cmd run build
npm.cmd run preview
```

## Persistence

The brief specifies Supabase and JSON-shaped shared data. Set `SUPABASE_URL` and `SUPABASE_KEY` to use the implemented Supabase REST adapter; create the `phase1_records` table described in `ARCHITECTURE.md` first. For a credential-free local demonstration, records are persisted to `data/store.json` and uploads to `data/uploads/`. Do not commit credentials or expose them to the frontend.

## Verification

```powershell
python -c "from pathlib import Path; from app.extractors import extract_text, parse_jd, parse_resume; print(len(extract_text(Path(r'..\Talent Match Hackathon\JDs\PDF\Google LLC - Software Engineer.pdf')))); print(len(parse_jd('Google LLC - Software Engineer.pdf', extract_text(Path(r'..\Talent Match Hackathon\JDs\PDF\Google LLC - Software Engineer.pdf')), 'demo').skills))"
```

The extractor supports only text-bearing PDF and DOCX files. A scanned PDF is rejected with a clear OCR-required message rather than returning an empty or fabricated result.
