import { useState } from "react";
import { api } from "../services/api";

export function useTalentCheck() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function run(profileId, company) {
    setLoading(true); setError("");
    try { setResult(await api.getTalentCheck(profileId, company)); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }
  return { result, loading, error, run };
}
