import { UploadPanel } from "../components/UploadPanel";

export function LandingPage({ profiles, onUploaded, onContinue }) {
  return (
    <section className="landing-page">
      <div className="landing-accent landing-accent--one" />
      <div className="landing-accent landing-accent--two" />
      <p className="eyebrow landing-eyebrow">RADIX · candidate workspace</p>
      <h1>Find the work<br /><em>that fits you.</em></h1>
      <p className="landing-copy">Start with your resume. We will build a clear profile from what you have actually done, then help you explore roles that need those skills.</p>
      <div className="landing-upload">
        <div className="landing-upload__heading"><span className="step-number">01</span><div><h2>Upload your resume</h2><p>PDF or DOCX · takes less than a minute</p></div></div>
        <UploadPanel kind="resumes" label="your resume" onComplete={onUploaded} />
      </div>
      {profiles.length > 0 && <button className="continue-link" onClick={onContinue}>Return to my profile <span>→</span></button>}
      <div className="landing-trust"><span>Private workspace</span><span className="trust-dot" /><span>No invented qualifications</span><span className="trust-dot" /><span>Evidence from your resume</span></div>
    </section>
  );
}
