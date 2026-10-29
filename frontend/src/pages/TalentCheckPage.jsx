import { useState } from "react";
import { StatusBanner } from "../components/StatusBanner";
import { useTalentCheck } from "../hooks/useTalentCheck";

const companyNames = ["Google LLC", "Microsoft", "Oracle"];
const labels = { COD: "Coding", DSA: "Data structures", OOD: "Object-oriented design", APTI: "Aptitude", COMM: "Communication", AI: "AI & ML", CLOUD: "Cloud", SQL: "SQL & databases", SWE: "Software engineering", SYSD: "System design", NETW: "Networking", OS: "Operating systems" };

export function TalentCheckPage({ profile }) {
  const [company, setCompany] = useState(companyNames[0]);
  const { result, loading, error, run } = useTalentCheck();
  return <section className="page-section"><div className="page-intro"><p className="eyebrow">Step 03 · Talent check</p><h1>Know your starting point.</h1><p>Compare your saved profile with a company’s expected bar across the 12 RADIX skillsets.</p></div>
    {!profile && <StatusBanner tone="error">Build and save a profile first.</StatusBanner>}
    {profile && <div className="check-builder"><label className="form-field"><span>Company</span><select value={company} onChange={(event) => setCompany(event.target.value)}>{companyNames.map((name) => <option key={name}>{name}</option>)}</select></label><button className="primary-button" disabled={loading} onClick={() => run(profile.id, company)}>{loading ? "Checking..." : "Run talent check"}</button></div>}
    {error && <StatusBanner tone="error">{error}</StatusBanner>}
    {result && <article className="talent-result"><div className="talent-score"><span>Readiness score</span><strong>{result.readiness_score}</strong><small>/ 100</small></div><div className="gap-list">{result.skillset_gap.map((gap) => <div className="gap-row" key={gap.category_code}><span>{labels[gap.category_code]}</span><div className="gap-track"><i style={{ width: `${gap.candidate_level / gap.required_level * 100}%` }} /></div><small>{gap.candidate_level}/{gap.required_level}</small><b className={gap.gap ? "gap-bad" : "gap-good"}>{gap.gap ? "Build" : "On track"}</b></div>)}</div></article>}
  </section>;
}
