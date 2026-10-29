import { SkillList } from "./SkillList";
import { SourceDetails } from "./SourceDetails";

export function DocumentCard({ document, type }) {
  const title = type === "jd" ? document.company || "Unknown company" : document.source_file;
  const subtitle = type === "jd" ? document.role : "Resume extraction";
  return (
    <article className="document-card">
      <div className="document-card__heading">
        <div>
          <p className="card-kicker">{type === "jd" ? "Job description" : "Parsed resume"}</p>
          <h3>{title}</h3>
          <p className="card-subtitle">{subtitle}</p>
        </div>
        <span className="record-dot" aria-label="Saved" />
      </div>
      <SkillList skills={document.skills} />
      <SourceDetails data={document} />
    </article>
  );
}
