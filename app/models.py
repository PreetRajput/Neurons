from typing import Literal

from pydantic import BaseModel, Field


CategoryCode = Literal[
    "COD", "DSA", "OOD", "APTI", "COMM", "AI", "CLOUD", "SQL",
    "SWE", "SYSD", "NETW", "OS", "OTHER",
]


class Skill(BaseModel):
    skill_name: str
    category_code: CategoryCode
    evidence: str
    confidence: Literal["high", "medium", "low"]


class ExtractedDocument(BaseModel):
    id: str
    source_type: Literal["jd", "resume"]
    source_file: str
    company: str | None = None
    role: str | None = None
    skills: list[Skill] = Field(default_factory=list)
    raw_text: str
    missing_fields: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    extraction_method: Literal["ollama"] = "ollama"


class CandidateProfile(BaseModel):
    id: str
    resume_id: str
    name: str
    email: str | None = None
    phone: str | None = None
    education: list[str] = Field(default_factory=list)
    skills: list[Skill] = Field(default_factory=list)
    experience: list[str] = Field(default_factory=list)
    projects: list[str] = Field(default_factory=list)
    hackathons: list[str] = Field(default_factory=list)
    internships: list[str] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    preferred_roles: list[str] = Field(default_factory=list)
    cv_file: str
    missing_fields: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class MatchResult(BaseModel):
    profile_id: str
    jd_id: str
    candidate_name: str
    company: str | None = None
    role: str | None = None
    score: int
    readiness: Literal["strong", "promising", "developing"]
    matched_skills: list[Skill] = Field(default_factory=list)
    missing_skills: list[Skill] = Field(default_factory=list)
    explanation: list[str] = Field(default_factory=list)


class TalentCheckGap(BaseModel):
    category_code: CategoryCode
    required_level: int = Field(ge=1, le=10)
    candidate_level: int = Field(ge=1, le=10)
    gap: bool


class TalentCheckResult(BaseModel):
    profile_id: str
    company: str
    readiness_score: int = Field(ge=0, le=100)
    skillset_gap: list[TalentCheckGap] = Field(default_factory=list)
