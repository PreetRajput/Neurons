import re

from .models import CandidateProfile, ExtractedDocument, MatchResult, Skill


def _key(value: str) -> str:
    return re.sub(r"[^a-z0-9+#]", "", value.lower())


def _match_skills(candidate: list[Skill], required: list[Skill]) -> tuple[list[Skill], list[Skill]]:
    candidate_names = {_key(skill.skill_name): skill for skill in candidate}
    candidate_categories: dict[str, Skill] = {}
    for skill in candidate:
        candidate_categories.setdefault(skill.category_code, skill)

    matched: list[Skill] = []
    missing: list[Skill] = []
    for requirement in required:
        if _key(requirement.skill_name) in candidate_names:
            matched.append(requirement)
        elif requirement.category_code in candidate_categories and requirement.category_code != "OTHER":
            matched.append(requirement)
        else:
            missing.append(requirement)
    return matched, missing


def build_match(profile: CandidateProfile, jd: ExtractedDocument) -> MatchResult:
    matched, missing = _match_skills(profile.skills, jd.skills)
    total = len(jd.skills)
    score = round((len(matched) / total) * 100) if total else 0
    readiness = "strong" if score >= 75 else "promising" if score >= 50 else "developing"
    explanation = [
        f"{len(matched)} of {total} listed JD skills are represented in the resume.",
        "A skill is considered matched when its name or RADIX category appears in the resume.",
        "This is an evidence summary, not a hiring recommendation.",
    ]
    return MatchResult(
        profile_id=profile.id, jd_id=jd.id, candidate_name=profile.name,
        company=jd.company, role=jd.role, score=score, readiness=readiness,
        matched_skills=matched, missing_skills=missing, explanation=explanation,
    )
