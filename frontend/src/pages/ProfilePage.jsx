import { ProfileCard } from "../components/ProfileCard";
import { UploadPanel } from "../components/UploadPanel";
import { api } from "../services/api";
import { useState } from "react";

export function ProfilePage({ profiles, onRefresh, onStartMatch, onEdit }) {
  const [deleting, setDeleting] = useState("");
  async function removeProfile(profile) {
    if (!window.confirm(`Delete ${profile.name}'s uploaded resume and profile?`)) return;
    setDeleting(profile.id);
    try { await api.deleteResume(profile.resume_id); await onRefresh(); } finally { setDeleting(""); }
  }
  return (
    <section className="page-section">
      <div className="page-intro"><p className="eyebrow">Step 01 · Your profile</p><h1>Start with your resume.</h1><p>Upload your resume once. We will turn the information it explicitly contains into a profile you can use to explore roles.</p></div>
      <div className="profile-start-card"><div><strong>Upload resume</strong><p>PDF or DOCX · we do not invent missing information.</p></div><UploadPanel kind="resumes" label="your resume" onComplete={onRefresh} /></div>
      {profiles.length > 0 && <><div className="page-subhead"><div><p className="eyebrow">Your saved profile</p><h2>Ready to explore</h2></div></div><div className="profiles-grid">{profiles.map((profile) => <div key={profile.id} className="profile-action-card"><ProfileCard profile={profile} /><div className="profile-actions"><button className="primary-button profile-action" onClick={() => onEdit(profile.id)}>Edit and save profile</button><button className="secondary-button profile-action" onClick={() => onStartMatch(profile.id)}>Skill match →</button><button className="delete-button" disabled={deleting === profile.id} onClick={() => removeProfile(profile)}>{deleting === profile.id ? "Deleting..." : "Delete resume"}</button></div></div>)}</div></>}
      {!profiles.length && <div className="empty-state page-empty">Your generated profile will appear here after upload.</div>}
    </section>
  );
}
