"""Core HTTP client for wmcp.sh.

Stays deliberately dependency-free — uses urllib so users can install
wmcp without dragging in requests/httpx. Async variant lives in `client_async.py`
once we ship it (not in v0).
"""

from __future__ import annotations

import json
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


DEFAULT_BASE = "https://wmcp.sh"


class WmcpError(Exception):
    """Raised on non-2xx responses from the wmcp.sh API."""

    def __init__(self, status: int, body: Any, *, message: Optional[str] = None):
        self.status = status
        self.body = body
        super().__init__(message or f"wmcp.sh returned HTTP {status}: {body}")


@dataclass
class Tool:
    """Normalized wmcp tool. Matches what the API returns plus a few helpers."""

    name: str
    description: str
    input_schema: Dict[str, Any] = field(default_factory=lambda: {"type": "object", "properties": {}})
    result: Any = None  # set if static
    action: Optional[Dict[str, Any]] = None  # set if live

    @property
    def is_live(self) -> bool:
        return self.action is not None

    @classmethod
    def from_api(cls, d: Dict[str, Any]) -> "Tool":
        return cls(
            name=d["name"],
            description=d.get("description", ""),
            input_schema=d.get("inputSchema") or {"type": "object", "properties": {}},
            result=d.get("result"),
            action=d.get("action"),
        )

    def to_dict(self) -> Dict[str, Any]:
        out: Dict[str, Any] = {
            "name": self.name,
            "description": self.description,
            "inputSchema": self.input_schema,
        }
        if self.result is not None:
            out["result"] = self.result
        if self.action is not None:
            out["action"] = self.action
        return out


class WmcpClient:
    """Synchronous HTTP client.

    Args:
        api_key: Bearer key (webmcp_live_…). Optional — anonymous works for
            the free-tier read endpoints.
        base_url: defaults to https://wmcp.sh. Override for self-hosted.
        timeout: seconds per request.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        *,
        base_url: str = DEFAULT_BASE,
        timeout: float = 30.0,
    ):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    # ---------- public API ----------

    def tools(self, url: str, *, fresh: bool = False) -> List[Tool]:
        """Fetch the MCP tool list for `url`."""
        params = {"url": url}
        if fresh:
            params["fresh"] = "1"
        data = self._get("/api/v1/tools", params=params)
        return [Tool.from_api(t) for t in data.get("tools", [])]

    def tools_raw(self, url: str, *, fresh: bool = False) -> Dict[str, Any]:
        """Same as `tools()` but returns the full payload (adapter, product, variants, …)."""
        params = {"url": url}
        if fresh:
            params["fresh"] = "1"
        return self._get("/api/v1/tools", params=params)

    def execute(
        self,
        url: str,
        tool: str,
        args: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Run a tool that has a live `action`. Returns the wrapped {ok, value}."""
        body = {"url": url, "tool": tool, "args": args or {}}
        return self._post("/api/v1/tools/execute", body)

    def directory(self) -> List[Dict[str, Any]]:
        """List of every URL the community has indexed."""
        return self._get("/api/v1/directory").get("entries", [])

    def stats(self) -> Dict[str, Any]:
        """Public stats — cached URL count, etc."""
        return self._get("/api/v1/stats/public")

    def me(self) -> Dict[str, Any]:
        """Current key's plan/limits. Requires api_key."""
        return self._get("/api/v1/keys/me")

    # ---------- low-level ----------

    def _get(self, path: str, *, params: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        qs = ""
        if params:
            qs = "?" + urllib.parse.urlencode(params)
        return self._request("GET", f"{self.base_url}{path}{qs}")

    def _post(self, path: str, body: Dict[str, Any]) -> Dict[str, Any]:
        return self._request(
            "POST",
            f"{self.base_url}{path}",
            data=json.dumps(body).encode("utf-8"),
            extra_headers={"content-type": "application/json"},
        )

    def _request(
        self,
        method: str,
        url: str,
        *,
        data: Optional[bytes] = None,
        extra_headers: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        headers = {"accept": "application/json", "user-agent": "wmcp-python/0.1.0"}
        if self.api_key:
            headers["authorization"] = f"Bearer {self.api_key}"
        if extra_headers:
            headers.update(extra_headers)

        req = urllib.request.Request(url, method=method, headers=headers, data=data)
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                body = resp.read().decode("utf-8")
                return json.loads(body) if body else {}
        except urllib.error.HTTPError as e:
            err_body: Any = e.read().decode("utf-8", errors="replace")
            try:
                err_body = json.loads(err_body)
            except json.JSONDecodeError:
                pass
            raise WmcpError(e.code, err_body) from None
