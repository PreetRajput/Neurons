import json
import os
import urllib.error
import urllib.request
from typing import Any

from pydantic import BaseModel, Field

from ..models import CategoryCode, Skill

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:1.5b-instruct-q5_K_M")


class OllamaExtractionError(RuntimeError):
    """Raised when the configured local model cannot produce valid extraction."""


class JDExtraction(BaseModel):
    company: str | None = None
    role: str | None = None
    skills: list[Skill] = Field(default_factory=list)


class ResumeExtraction(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    education: list[str] = Field(default_factory=list)
    experience: list[str] = Field(default_factory=list)
    projects: list[str] = Field(default_factory=list)
    hackathons: list[str] = Field(default_factory=list)
    internships: list[str] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    preferred_roles: list[str] = Field(default_factory=list)
    skills: list[Skill] = Field(default_factory=list)


def _skill_schema() -> dict[str, Any]:
    return {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "skill_name": {"type": "string"},
            "category_code": {"type": "string", "enum": list(CategoryCode.__args__)},
            "evidence": {"type": "string"},
            "confidence": {"type": "string", "enum": ["high", "medium", "low"]},
        },
        "required": ["skill_name", "category_code", "evidence", "confidence"],
    }


def _schema(model: type[BaseModel]) -> dict[str, Any]:
    schema = model.model_json_schema()
    schema["additionalProperties"] = False
    if "properties" in schema and "skills" in schema["properties"]:
        schema["properties"]["skills"] = {"type": "array", "items": _skill_schema()}
    return schema


def _chat(instruction: str, text: str, model: type[BaseModel]) -> BaseModel:
    payload = {
        "model": OLLAMA_MODEL,
        "stream": False,
        "format": _schema(model),
        "options": {"temperature": 0},
        "messages": [
            {
                "role": "system",
                "content": (
                    "You extract evidence from documents for the RADIX Talent Match tool. "
                    "Return only the requested JSON object. Never invent facts. "
                    "Use confidence high only when explicitly supported by the document. "
                    "Every skill must use exactly one RADIX category code. "
                    "Category guide: COD=programming languages, DSA=data structures and algorithms, "
                    "OOD=object-oriented design and patterns, COMM=communication/collaboration, "
                    "AI=machine learning/AI, CLOUD=cloud platforms and deployment, SQL=databases/querying, "
                    "SWE=software engineering/testing/APIs/version control, SYSD=system design/distributed systems, "
                    "NETW=networking/protocols, OS=operating systems/Linux, APTI=aptitude/problem solving. "
                    "Do not use CLOUD as a default; choose the category supported by the skill name and evidence."
                ),
            },
            {"role": "user", "content": f"{instruction}\nDo not return section headings such as Projects, Education, Skills, or Certifications as skills.\n\nDOCUMENT TEXT:\n{text}"},
        ],
    }
    request = urllib.request.Request(
        f"{OLLAMA_BASE_URL}/api/chat",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            response_data = json.loads(response.read().decode("utf-8"))
    except urllib.error.URLError as exc:
        raise OllamaExtractionError(
            f"Ollama is unavailable at {OLLAMA_BASE_URL}. Start Ollama and verify model "
            f"'{OLLAMA_MODEL}' is installed."
        ) from exc
    except (TimeoutError, json.JSONDecodeError) as exc:
        raise OllamaExtractionError("Ollama returned an unreadable extraction response.") from exc

    if response_data.get("error"):
        raise OllamaExtractionError(f"Ollama extraction failed: {response_data['error']}")
    try:
        content = response_data["message"]["content"]
        if not isinstance(content, str) or not content.strip():
            raise ValueError("empty response")
        cleaned = content.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned
            cleaned = cleaned.rsplit("```", 1)[0].strip()
        try:
            parsed = json.loads(cleaned)
        except json.JSONDecodeError:
            start, end = cleaned.find("{"), cleaned.rfind("}")
            if start < 0 or end <= start:
                raise
            parsed = json.loads(cleaned[start:end + 1])
        return model.model_validate(parsed)
    except (KeyError, TypeError, json.JSONDecodeError, ValueError) as exc:
        raise OllamaExtractionError("Ollama returned JSON that did not match the RADIX schema.") from exc


def extract_jd(text: str) -> JDExtraction:
    return _chat(
        "Extract the company, role, and every explicitly required or named skill/technology "
        "from this job description. Include a short verbatim evidence phrase for each skill.",
        text,
        JDExtraction,
    )


def extract_resume(text: str) -> ResumeExtraction:
    return _chat(
        "Extract the candidate details and sections that are explicitly present in this resume. "
        "For education, experience, projects, hackathons, internships, certifications, and preferred_roles, "
        "copy the relevant lines or bullets from the document into the matching array; do not summarize "
        "away the evidence and do not leave a section empty when the heading has content below it. "
        "Extract only real technologies or competencies as skills, never section headings. "
        "Extract technologies and skills with short evidence phrases. Use empty arrays or null only when "
        "the information is genuinely absent.",
        text,
        ResumeExtraction,
    )
