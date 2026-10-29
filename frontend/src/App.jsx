import { BrandMark } from "./components/BrandMark";
import { StatusBanner } from "./components/StatusBanner";
import { WorkspacePage } from "./pages/WorkspacePage";
import { ProfilePage } from "./pages/ProfilePage";
import { MatchPage } from "./pages/MatchPage";
import { ProfileBuilderPage } from "./pages/ProfileBuilderPage";
import { TalentCheckPage } from "./pages/TalentCheckPage";
import { useWorkspaceData } from "./hooks/useWorkspaceData";
import { useEffect, useState } from "react";
import { LandingPage } from "./pages/LandingPage";

export default function App() {
  const workspace = useWorkspaceData();
  const [page, setPage] = useState("home");
  const [selectedProfileId, setSelectedProfileId] = useState("");
  useEffect(() => {
    const navigate = (event) => setPage(event.detail);
    window.addEventListener("navigate", navigate);
    return () => window.removeEventListener("navigate", navigate);
  }, []);
  function navigate(nextPage, profileId = "") {
    setSelectedProfileId(profileId);
    setPage(nextPage);
  }
  return (
    <div className="app-shell">
      <header className="topbar"><button className="brand-button" onClick={() => navigate("home")}><BrandMark /></button><span className="topbar__label">Talent Match / Phase 01</span><nav><button className={page === "profile" || page === "builder" ? "nav-link nav-link--active" : "nav-link"} onClick={() => navigate("profile")}>My profile</button><button className={page === "talent" ? "nav-link nav-link--active" : "nav-link"} onClick={() => navigate("talent")}>Talent check</button><button className={page === "match" ? "nav-link nav-link--active" : "nav-link"} onClick={() => navigate("match")}>Skill match</button><button className={page === "library" ? "nav-link nav-link--active" : "nav-link"} onClick={() => navigate("library")}>Job library</button></nav><span className="topbar__status"><i /> Local workspace</span></header>
      <main className="page-container">
        {workspace.error && <StatusBanner tone="error" onDismiss={() => window.location.reload()}>{workspace.error} Start the FastAPI backend on port 8000 and refresh.</StatusBanner>}
        {workspace.loading && !workspace.jds.length && !workspace.resumes.length ? <div className="loading-state"><div className="loader" />Loading workspace...</div> : page === "profile" ? <ProfilePage profiles={workspace.profiles} onRefresh={workspace.refresh} onStartMatch={(id) => navigate("match", id)} onEdit={(id) => navigate("builder", id)} /> : page === "builder" ? <ProfileBuilderPage profile={workspace.profiles.find((item) => item.id === selectedProfileId) || workspace.profiles[0]} onSaved={workspace.refresh} /> : page === "talent" ? <TalentCheckPage profile={workspace.profiles.find((item) => item.id === selectedProfileId) || workspace.profiles[0]} /> : page === "match" ? <MatchPage profiles={workspace.profiles} jds={workspace.jds} selectedProfileId={selectedProfileId} /> : page === "library" ? <WorkspacePage data={workspace} onRefresh={workspace.refresh} /> : <LandingPage profiles={workspace.profiles} onUploaded={() => { workspace.refresh(); navigate("profile"); }} onContinue={() => navigate("profile")} />}
      </main>
      <footer className="footer"><span>RADIX Talent Match</span><span>Evidence first · Phase 1</span></footer>
    </div>
  );
}
