import { useState } from "react";
import { api } from "../services/api";

export function useMatch() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run(profileId, jdId) {
    setLoading(true);
    setError("");
    try {
      setResult(await api.getMatch(profileId, jdId));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return { result, loading, error, run };
}
