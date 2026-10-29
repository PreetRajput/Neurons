export function SourceDetails({ data }) {
  return (
    <details className="source-details">
      <summary>Inspect extracted source</summary>
      <pre>{data.raw_text}</pre>
      {data.missing_fields?.length > 0 && (
        <p className="field-warning">Missing: {data.missing_fields.join(", ")}</p>
      )}
      {data.warnings?.map((warning) => <p className="field-warning" key={warning}>{warning}</p>)}
    </details>
  );
}
