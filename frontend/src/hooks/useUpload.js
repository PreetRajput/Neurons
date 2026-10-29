import { useState } from "react";
import { api } from "../services/api";

export function useUpload(kind, onComplete) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function submit(file) {
    if (!file) {
      setError("Choose a PDF or DOCX file first.");
      return;
    }
    setStatus("uploading");
    setError("");
    try {
      await api.upload(kind, file);
      setStatus("success");
      onComplete(await api.getProfiles());
    } catch (requestError) {
      setStatus("error");
      setError(requestError.message);
    }
  }

  return { status, error, submit };
}
