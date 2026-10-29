import hashlib
import threading
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from .extractors import extract_text, parse_jd, parse_resume
from .ai.ollama import OllamaExtractionError
from .matching import build_match
from .models import CandidateProfile, ExtractedDocument, MatchResult, TalentCheckResult
from .talent_check import build_talent_check
from .storage import repository_for

ROOT = Path(__file__).resolve().parent.parent
UPLOADS = ROOT / "data" / "uploads"
UPLOADS.mkdir(parents=True, exist_ok=True)
repository = repository_for(ROOT)
app = FastAPI(title="RADIX Talent Match - Phase 1")


def _seed_supplied_jds() -> None:
    jd_directory = ROOT.parent / "Talent Match Hackathon" / "JDs" / "PDF"
    if not jd_directory.exists():
        return
    for path in jd_directory.glob("*.pdf"):
        content = path.read_bytes()
        identifier = _id_for(content, path.name)
        existing = repository.get("jds", identifier)
        if existing and existing.get("extraction_method") == "ollama":
            continue
        try:
            result = parse_jd(path.name, extract_text(path), identifier)
        except (ValueError, OllamaExtractionError):
            continue
        repository.put("jds", identifier, result.model_dump())


def _id_for(content: bytes, filename: str) -> str:
    return hashlib.sha256(filename.encode() + content).hexdigest()[:16]


threading.Thread(target=_seed_supplied_jds, name="ollama-jd-seeding", daemon=True).start()


async def _save_upload(upload: UploadFile) -> tuple[str, Path, bytes]:
    if not upload.filename or Path(upload.filename).suffix.lower() not in {".pdf", ".docx"}:
        raise HTTPException(400, "Only PDF and DOCX files are supported.")
    content = await upload.read()
    if not content:
        raise HTTPException(400, "The uploaded file is empty.")
    identifier = _id_for(content, upload.filename)
    path = UPLOADS / f"{identifier}{Path(upload.filename).suffix.lower()}"
    path.write_bytes(content)
    return identifier, path, content


@app.get("/")
def service_info() -> JSONResponse:
    return JSONResponse({
        "service": "RADIX Talent Match API",
        "phase": 1,
        "frontend": "Run the Vite app in frontend/ on http://localhost:5173",
        "docs": "/docs",
    })


@app.get("/api/jds", response_model=list[ExtractedDocument])
def list_jds() -> list[dict]:
    return repository.list("jds")


@app.post("/api/jds", response_model=ExtractedDocument)
async def upload_jd(file: UploadFile = File(...)) -> ExtractedDocument:
    identifier, path, _ = await _save_upload(file)
    try:
        result = parse_jd(file.filename or path.name, extract_text(path), identifier)
    except (ValueError, OllamaExtractionError) as exc:
        raise HTTPException(422, str(exc)) from exc
    repository.put("jds", identifier, result.model_dump())
    return result


@app.get("/api/resumes", response_model=list[ExtractedDocument])
def list_resumes() -> list[dict]:
    return repository.list("resumes")


@app.post("/api/resumes", response_model=ExtractedDocument)
async def upload_resume(file: UploadFile = File(...)) -> ExtractedDocument:
    identifier, path, _ = await _save_upload(file)
    try:
        extracted, profile = parse_resume(file.filename or path.name, extract_text(path), identifier)
    except (ValueError, OllamaExtractionError) as exc:
        raise HTTPException(422, str(exc)) from exc
    repository.put("resumes", identifier, extracted.model_dump())
    repository.put("profiles", profile.id, profile.model_dump())
    return extracted


@app.get("/api/profiles", response_model=list[CandidateProfile])
def list_profiles() -> list[dict]:
    return repository.list("profiles")


@app.get("/api/profiles/{profile_id}", response_model=CandidateProfile)
def get_profile(profile_id: str) -> dict:
    profile = repository.get("profiles", profile_id)
    if not profile:
        raise HTTPException(404, "Profile not found.")
    return profile


@app.put("/api/profiles/{profile_id}", response_model=CandidateProfile)
def update_profile(profile_id: str, profile: CandidateProfile) -> CandidateProfile:
    if profile.id != profile_id:
        raise HTTPException(400, "Profile ID does not match the requested resource.")
    if not repository.get("profiles", profile_id):
        raise HTTPException(404, "Profile not found.")
    repository.put("profiles", profile_id, profile.model_dump())
    return profile


@app.delete("/api/resumes/{resume_id}")
def delete_resume(resume_id: str) -> JSONResponse:
    resume = repository.get("resumes", resume_id)
    if not resume:
        raise HTTPException(404, "Resume not found.")
    repository.delete("resumes", resume_id)
    repository.delete("profiles", f"profile-{resume_id}")
    for upload in UPLOADS.glob(f"{resume_id}.*"):
        upload.unlink(missing_ok=True)
    return JSONResponse({"deleted": True, "resume_id": resume_id})


@app.get("/api/matches/{profile_id}/{jd_id}", response_model=MatchResult)
def match_profile_to_jd(profile_id: str, jd_id: str) -> MatchResult:
    profile_data = repository.get("profiles", profile_id)
    jd_data = repository.get("jds", jd_id)
    if not profile_data:
        raise HTTPException(404, "Candidate profile not found.")
    if not jd_data:
        raise HTTPException(404, "Job description not found.")
    return build_match(CandidateProfile.model_validate(profile_data), ExtractedDocument.model_validate(jd_data))


@app.get("/api/talent-check/{profile_id}/{company}", response_model=TalentCheckResult)
def talent_check(profile_id: str, company: str) -> TalentCheckResult:
    profile_data = repository.get("profiles", profile_id)
    if not profile_data:
        raise HTTPException(404, "Candidate profile not found.")
    jds = [ExtractedDocument.model_validate(item) for item in repository.list("jds") if item.get("company") == company]
    required = [skill for jd in jds for skill in jd.skills]
    return build_talent_check(CandidateProfile.model_validate(profile_data), company, required)
