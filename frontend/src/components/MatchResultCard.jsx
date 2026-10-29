import { SkillList } from "./SkillList";

export function MatchResultCard({ result }) {
  if (!result) return null;
  return (
    <article className="match-result">
      <div className="match-result__top">
        <div>
          <p className="eyebrow">Readiness summary</p>
          <h2>{result.company} <span>· {result.role}</span></h2>
          <p className="match-result__candidate">{result.candidate_name}</p>
        </div>
        <div className="score-ring"><strong>{result.score}</strong><span>/ 100</span></div>
      </div>
      <div className={`readiness-pill readiness-pill--${result.readiness}`}>{result.readiness} fit based on resume evidence</div>
      <div className="match-columns">
        <div><h3>Evidence found <span>{result.matched_skills.length}</span></h3><SkillList skills={result.matched_skills} compact /></div>
        <div><h3>Build next <span>{result.missing_skills.length}</span></h3><SkillList skills={result.missing_skills} compact /></div>
      </div>
      <div className="match-method"><strong>How this was calculated</strong>{result.explanation.map((line) => <p key={line}>· {line}</p>)}</div>
    </article>
  );
}
