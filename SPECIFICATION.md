# Phase 1 specification

## Requirements extracted from the brief

- Python throughout.
- React frontend matching the RADIX portal stack.
- Supabase is the specified storage technology; shared records use JSON-shaped contracts.
- PDF and Word (`.docx`) are the supplied JD and resume formats.
- JD Analytics and Resume Parsing hand off a shared `skills` list. Each skill has `skill_name`, one RADIX `category_code` (or `OTHER`), `evidence`, and `confidence` (`high|medium|low`).
- JD output: `source_type`, `source_file`, `company`, `role`, and `skills`.
- Resume output: the same skill list plus reliable education, projects, and experience fields.
- Profile Builder output: `name`, `email`, `education`, `skills`, `hackathons`, `internships`, `certifications`, `preferred_roles`, and `cv_file`.
- The integrated flow includes JD extraction, resume parsing, profile generation, Talent Check, and one-JD Skill Matching. Rankings and hiring recommendations remain excluded.

The brief recommends LangChain/LLM extraction for JD Analytics and Resume Parsing. This implementation uses the locally running Ollama model `qwen2.5:1.5b-instruct-q5_K_M` through structured JSON output. The response is validated against the shared Pydantic contract; there is no silent keyword-parser fallback.
