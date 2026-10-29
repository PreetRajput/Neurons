import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";

export function useWorkspaceData() {
  const [data, setData] = useState({ jds: [], resumes: [], profiles: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [jds, resumes, profiles] = await Promise.all([
        api.getJds(),
        api.getResumes(),
        api.getProfiles(),
      ]);
      setData({ jds, resumes, profiles });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...data, loading, error, refresh };
}
