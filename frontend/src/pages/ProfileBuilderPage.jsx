import { useState } from "react";
import { api } from "../services/api";
import { SkillList } from "../components/SkillList";
import { StatusBanner } from "../components/StatusBanner";

function ListEditor({ label, values, onChange, placeholder }) {
  return <label className="form-field"><span>{label}</span><textarea value={values.join("\n")} placeholder={placeholder} onChange={(event) => onChange(event.target.value.split("\n").filter(Boolean))} /></label>;
}

export function ProfileBuilderPage({ profile, onSaved }) {
  const [form, setForm] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  if (!profile) return <div className="empty-state">Upload a resume first to create your profile.</div>;
  async function save(event) {
    event.preventDefault(); setSaving(true); setMessage("");
    try { const saved = await api.updateProfile(form); setForm(saved); setMessage("Profile saved."); onSaved(saved); }
    catch (error) { setMessage(error.message); }
    finally { setSaving(false); }
  }
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  return <section className="page-section">
    <div className="page-intro"><p className="eyebrow">Step 02 · Profile builder</p><h1>Make the profile yours.</h1><p>Review what was found in your resume, add context, and save the profile before checking your readiness for a role.</p></div>
    {message && <StatusBanner tone={message === "Profile saved." ? "success" : "error"}>{message}</StatusBanner>}
    <form className="builder-form" onSubmit={save}>
      <div className="builder-header"><div className="profile-avatar">{form.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><div><p className="eyebrow">Parsed from {form.cv_file}</p><h2>{form.name}</h2><p>Fields are editable. Keep claims grounded in your experience.</p></div></div>
      <div className="form-grid"><label className="form-field"><span>Name</span><input value={form.name} onChange={(event) => set("name", event.target.value)} /></label><label className="form-field"><span>Email</span><input value={form.email || ""} onChange={(event) => set("email", event.target.value || null)} /></label><label className="form-field"><span>Phone</span><input value={form.phone || ""} onChange={(event) => set("phone", event.target.value || null)} /></label><ListEditor label="Preferred roles" values={form.preferred_roles} onChange={(value) => set("preferred_roles", value)} placeholder="One role per line" /></div>
      <div className="form-grid form-grid--wide"><ListEditor label="Education" values={form.education} onChange={(value) => set("education", value)} placeholder="Degree, institution, year" /><ListEditor label="Experience" values={form.experience} onChange={(value) => set("experience", value)} placeholder="Role, company, dates" /><ListEditor label="Projects" values={form.projects} onChange={(value) => set("projects", value)} placeholder="Project and what you built" /><ListEditor label="Certifications" values={form.certifications} onChange={(value) => set("certifications", value)} placeholder="One certification per line" /><ListEditor label="Hackathons" values={form.hackathons} onChange={(value) => set("hackathons", value)} placeholder="One hackathon per line" /><ListEditor label="Internships" values={form.internships} onChange={(value) => set("internships", value)} placeholder="One internship per line" /></div>
      <div className="builder-skills"><span className="form-label">Extracted skills</span><SkillList skills={form.skills} /></div>
      <button className="primary-button save-profile" disabled={saving}>{saving ? "Saving..." : "Save profile and continue →"}</button>
    </form>
  </section>;
}
