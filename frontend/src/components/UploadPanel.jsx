import { useRef, useState } from "react";
import { useUpload } from "../hooks/useUpload";

export function UploadPanel({ kind, label, onComplete }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const { status, error, submit } = useUpload(kind, onComplete);
  const busy = status === "uploading";

  function handleSubmit(event) {
    event.preventDefault();
    submit(file);
  }

  return (
    <form className="upload-panel" onSubmit={handleSubmit}>
      <button className="file-picker" type="button" onClick={() => inputRef.current?.click()}>
        <span className="file-picker__icon">↑</span>
        <span>
          <strong>{file ? file.name : `Choose ${label}`}</strong>
          <small>PDF or DOCX · click to browse</small>
        </span>
      </button>
      <input ref={inputRef} type="file" accept=".pdf,.docx" hidden onChange={(event) => setFile(event.target.files?.[0] || null)} />
      <button className="primary-button" disabled={busy} type="submit">
        {busy ? "Processing..." : "Process file"}
      </button>
      {status === "success" && <span className="success-copy">Saved to workspace</span>}
      {error && <span className="inline-error">{error}</span>}
    </form>
  );
}
