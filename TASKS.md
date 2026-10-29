# Phase 1 checklist

- [x] Read the RADIX brief and lock the shared JSON contract.
- [x] Support supplied PDF and DOCX inputs.
- [x] Implement JD extraction and RADIX skill categories.
- [x] Implement resume parsing with explicit/missing information handling.
- [x] Generate and persist candidate profiles from parsed resumes.
- [x] Connect upload, status, errors, source inspection, and saved data in React.
- [x] Keep ranking and hiring recommendations out of scope.
- [x] Verify all supplied PDF/DOCX JDs and resumes produce extractable text and structured output.
- [x] Verify FastAPI serving, JD upload, persistence, and retrieval with an end-to-end smoke test.
- [x] Convert the UI to a conventional Vite React application with separated pages, components, hooks, services, and styles.
- [x] Verify `npm run build`, Vite startup, FastAPI proxying, and upload through the React dev server.
- [x] Add a candidate profile page and an explicit profile-to-JD readiness flow.
- [x] Seed the supplied JD library automatically and keep new JD upload behind library-management controls.
- [x] Show transparent matched skills, missing skills, and score explanations instead of opaque AI output.
- [x] Add an editable Profile Builder with the brief's profile fields.
- [x] Add Talent Check with readiness score and all 12 RADIX skillset gaps.
- [x] Integrate the specified local Ollama model for structured JD and resume extraction.
- [x] Validate Ollama extraction against supplied JD and resume documents.
- [ ] Configure and verify a Supabase project, table, and RLS policy with the adapter.
- [ ] Add an LLM provider only if the team supplies credentials and a reviewed structured-output prompt.

The Supabase item is configuration-dependent and was not claimed as executed because no project URL, key, schema, or RLS policy was supplied.
