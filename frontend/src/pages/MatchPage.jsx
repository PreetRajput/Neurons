import { useState } from "react";
import { MatchResultCard } from "../components/MatchResultCard";
import { SkillList } from "../components/SkillList";
import { StatusBanner } from "../components/StatusBanner";
import { useMatch } from "../hooks/useMatch";

export function MatchPage({ profiles, jds, selectedProfileId }) {
  const [profileId, setProfileId] = useState(selectedProfileId || profiles[0]?.id || "");
  const [jdId, setJdId] = useState(jds[0]?.id || "");
  const { result, loading, error, run } = useMatch();
  const selectedJd = jds.find((jd) => jd.id === jdId);
  const selectedProfile = profiles.find((profile) => profile.id === profileId);

  return <section className="page-section">
    <div className="page-intro"><p className="eyebrow">Step 02 · Explore roles</p><h1>See where you stand.</h1><p>Pick your profile and one of the roles already in the RADIX library. The result shows evidence found and the skills to build next.</p></div>
    {!profiles.length && <StatusBanner tone="error">Create a profile first from the Profile page.</StatusBanner>}
    {!jds.length && <StatusBanner tone="error">The job library is empty. Add a JD from the Job library page.</StatusBanner>}
    {profiles.length > 0 && jds.length > 0 && <div className="match-builder">
      <div className="selector-block"><label>Your profile<select value={profileId} onChange={(event) => setProfileId(event.target.value)}>{profiles.map((profile) => <option value={profile.id} key={profile.id}>{profile.name}</option>)}</select></label><div className="selector-preview">{selectedProfile && <><strong>{selectedProfile.name}</strong><SkillList skills={selectedProfile.skills} compact /></>}</div></div>
      <div className="selector-arrow">+</div>
      <div className="selector-block"><label>Role from the library<select value={jdId} onChange={(event) => setJdId(event.target.value)}>{jds.map((jd) => <option value={jd.id} key={jd.id}>{jd.company} · {jd.role}</option>)}</select></label><div className="selector-preview">{selectedJd && <><strong>{selectedJd.company} · {selectedJd.role}</strong><SkillList skills={selectedJd.skills} compact /></>}</div></div>
      <button className="primary-button match-button" disabled={loading} onClick={() => run(profileId, jdId)}>{loading ? "Comparing evidence..." : "Start readiness check"}</button>
    </div>}
    {error && <StatusBanner tone="error">{error}</StatusBanner>}
    {result && <MatchResultCard result={result} />}
  </section>;
}
