import { categoryLabels } from "../types";

export function SkillList({ skills = [], compact = false }) {
  if (!skills.length) return <p className="empty-copy">No explicit skills detected.</p>;
  return (
    <div className={`skill-list ${compact ? "skill-list--compact" : ""}`}>
      {skills.map((skill, index) => (
        <span className="skill-chip" key={`${skill.skill_name}-${index}`}>
          <span>{skill.skill_name}</span>
          {!compact && <small>{categoryLabels[skill.category_code] || skill.category_code}</small>}
        </span>
      ))}
    </div>
  );
}
