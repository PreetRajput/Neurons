async function request(path, options) {
  const response = await fetch(path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "The server could not complete this request.");
  }
  return data;
}

export const api = {
  getJds: () => request("/api/jds"),
  getResumes: () => request("/api/resumes"),
  getProfiles: () => request("/api/profiles"),
  getMatch: (profileId, jdId) => request(`/api/matches/${profileId}/${jdId}`),
  deleteResume: (resumeId) => request(`/api/resumes/${resumeId}`, { method: "DELETE" }),
  updateProfile: (profile) => request(`/api/profiles/${profile.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) }),
  getTalentCheck: (profileId, company) => request(`/api/talent-check/${profileId}/${encodeURIComponent(company)}`),
  upload: (kind, file) => {
    const body = new FormData();
    body.append("file", file);
    return request(`/api/${kind}`, { method: "POST", body });
  },
};
