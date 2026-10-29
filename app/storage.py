import json
import os
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from threading import Lock
from typing import Any


class JsonRepository:
    """Local development persistence; records use the shared JSON contract."""

    def __init__(self, path: Path) -> None:
        self.path = path
        self.lock = Lock()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if not self.path.exists():
            self.path.write_text(json.dumps({"jds": {}, "resumes": {}, "profiles": {}}), encoding="utf-8")

    def _read(self) -> dict[str, Any]:
        return json.loads(self.path.read_text(encoding="utf-8"))

    def _write(self, data: dict[str, Any]) -> None:
        temporary = self.path.with_suffix(".tmp")
        temporary.write_text(json.dumps(data, indent=2), encoding="utf-8")
        temporary.replace(self.path)

    def put(self, collection: str, key: str, value: dict[str, Any]) -> dict[str, Any]:
        with self.lock:
            data = self._read()
            data[collection][key] = value
            self._write(data)
        return value

    def list(self, collection: str) -> list[dict[str, Any]]:
        with self.lock:
            return list(self._read()[collection].values())

    def get(self, collection: str, key: str) -> dict[str, Any] | None:
        with self.lock:
            return self._read()[collection].get(key)

    def delete(self, collection: str, key: str) -> None:
        with self.lock:
            data = self._read()
            data[collection].pop(key, None)
            self._write(data)


class SupabaseRepository:
    def __init__(self, url: str, key: str) -> None:
        self.endpoint = url.rstrip("/") + "/rest/v1/phase1_records"
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        }

    def _request(self, method: str, url: str, payload: Any = None) -> Any:
        request = urllib.request.Request(
            url, method=method,
            headers={**self.headers, "Prefer": "return=representation,resolution=merge-duplicates"},
            data=json.dumps(payload).encode() if payload is not None else None,
        )
        try:
            with urllib.request.urlopen(request, timeout=15) as response:
                body = response.read().decode()
                return json.loads(body) if body else []
        except (urllib.error.HTTPError, urllib.error.URLError) as exc:
            raise RuntimeError(f"Supabase persistence failed: {exc}") from exc

    def put(self, collection: str, key: str, value: dict[str, Any]) -> dict[str, Any]:
        rows = self._request(
            "POST", f"{self.endpoint}?on_conflict=collection,key",
            {"collection": collection, "key": key, "payload": value},
        )
        return rows[0]["payload"] if rows else value

    def list(self, collection: str) -> list[dict[str, Any]]:
        query = urllib.parse.urlencode({"collection": f"eq.{collection}", "select": "payload"})
        return [row["payload"] for row in self._request("GET", f"{self.endpoint}?{query}")]

    def get(self, collection: str, key: str) -> dict[str, Any] | None:
        query = urllib.parse.urlencode({
            "collection": f"eq.{collection}", "key": f"eq.{key}", "select": "payload",
        })
        rows = self._request("GET", f"{self.endpoint}?{query}")
        return rows[0]["payload"] if rows else None

    def delete(self, collection: str, key: str) -> None:
        query = urllib.parse.urlencode({"collection": f"eq.{collection}", "key": f"eq.{key}"})
        self._request("DELETE", f"{self.endpoint}?{query}")


def repository_for(root: Path) -> JsonRepository | SupabaseRepository:
    url, key = os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY")
    if url and key:
        return SupabaseRepository(url, key)
    return JsonRepository(root / "data" / "store.json")
