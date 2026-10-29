from .models import CandidateProfile, Skill, TalentCheckGap, TalentCheckResult

CATEGORIES = ("COD", "DSA", "OOD", "APTI", "COMM", "AI", "CLOUD", "SQL", "SWE", "SYSD", "NETW", "OS")


def _level(skills: list[Skill], category: str) -> int:
    count = sum(skill.category_code == category for skill in skills)
    return min(10, max(1, count * 2)) if count else 1


def build_talent_check(profile: CandidateProfile, company: str, required_skills: list[Skill]) -> TalentCheckResult:
    required_by_category = {category: 1 for category in CATEGORIES}
    for skill in required_skills:
        if skill.category_code in required_by_category:
            required_by_category[skill.category_code] = min(10, required_by_category[skill.category_code] + 2)
    gaps = [
        TalentCheckGap(
            category_code=category,
            required_level=required_by_category[category],
            candidate_level=_level(profile.skills, category),
            gap=_level(profile.skills, category) < required_by_category[category],
        )
        for category in CATEGORIES
    ]
    score = round(sum(min(1, gap.candidate_level / gap.required_level) for gap in gaps) / len(gaps) * 100)
    return TalentCheckResult(profile_id=profile.id, company=company, readiness_score=score, skillset_gap=gaps)
