import { useState } from "react";
import { DocumentCard } from "../components/DocumentCard";
import { UploadPanel } from "../components/UploadPanel";

function SectionHeader({ eyebrow, title, description, count }) {
  return <div className="section-header"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{description}</p></div><span className="count-badge">{count}</span></div>;
}

export function WorkspacePage({ data, onRefresh }) {
  const [showLibraryTools, setShowLibraryTools] = useState(false);
  return (
    <>
      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow hero-eyebrow">Candidate intelligence workspace</p>
          <h1>Turn documents into <em>clear signals.</em></h1>
          <p>Extract the evidence behind a role, understand what a resume says, and shape it into a profile your team can trust.</p>
        </div>
        <div className="hero__metric"><strong>{data.jds.length + data.resumes.length}</strong><span>documents processed</span></div>
      </section>
      <div className="workflow-note"><span className="workflow-note__number">01</span><div><strong>Phase 1 workspace</strong><p>Extraction and profile building only. Every signal below is traceable to its source document.</p></div></div>
      <section className="section-grid">
        <div className="workspace-section">
          <SectionHeader eyebrow="Role intelligence" title="Job descriptions" description="Map the language of a role to the RADIX skill framework." count={data.jds.length} />
          <button className="secondary-button library-tools-toggle" onClick={() => setShowLibraryTools((visible) => !visible)}>{showLibraryTools ? "Hide library tools" : "Manage library"}</button>
          {showLibraryTools && <div className="library-tools"><p>Add a role only if you are managing the shared job library. Candidates should use the roles already listed here.</p><UploadPanel kind="jds" label="a job description" onComplete={onRefresh} /></div>}
          {data.jds.length ? data.jds.map((document) => <DocumentCard key={document.id} document={document} type="jd" />) : <div className="empty-state">No job descriptions yet. Add one to start the workspace.</div>}
        </div>
        <div className="workspace-section">
          <SectionHeader eyebrow="Candidate flow" title="Resume parsing" description="Candidate uploads live on the Profile page, then continue to readiness." count={data.resumes.length} />
          <div className="handoff-card"><strong>Candidate-first workflow</strong><p>Upload a resume on the Profile page. Once a profile exists, use Explore roles to compare it with this library.</p><button className="secondary-button" onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "profile" }))}>Go to profile →</button></div>
          {data.resumes.length ? data.resumes.map((document) => <DocumentCard key={document.id} document={document} type="resume" />) : <div className="empty-state">No resumes yet. Add a candidate document to begin.</div>}
        </div>
      </section>
      <section className="library-note"><strong>Why are JDs already here?</strong><p>These are the supplied RADIX test roles. They are the job library candidates explore; adding a new JD is an optional library action, not part of the candidate upload flow.</p></section>
    </>
  );
}
