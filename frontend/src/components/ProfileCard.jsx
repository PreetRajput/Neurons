import { SkillList } from "./SkillList";

function ProfileField({ label, values }) {
  if (!values?.length) return null;
  return <div className="profile-field"><span>{label}</span><p>{values.join(" · ")}</p></div>;
}

export function ProfileCard({ profile }) {
  const warnings = [...(profile.missing_fields || []), ...(profile.warnings || [])];
  return (
    <article className="profile-card">
      <div className="profile-avatar">{profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
      <div className="profile-card__intro">
        <p className="card-kicker">Candidate profile</p>
        <h3>{profile.name}</h3>
        <p>{profile.email || "Email not found"}{profile.phone && ` · ${profile.phone}`}</p>
      </div>
      <div className="profile-fields">
        <ProfileField label="Education" values={profile.education} />
        <ProfileField label="Experience" values={profile.experience} />
        <ProfileField label="Projects" values={profile.projects} />
        <ProfileField label="Certifications" values={profile.certifications} />
      </div>
      <SkillList skills={profile.skills} compact />
      {warnings.length > 0 && <p className="field-warning">Review: {warnings.join("; ")}</p>}
    </article>
  );
}
