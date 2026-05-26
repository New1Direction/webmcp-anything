"""LangChain adapter — expose wmcp tools as LangChain `StructuredTool` objects.

This module only imports langchain lazily so wmcp stays installable
without it (LangChain is a heavy dep).
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from .client import Tool, WmcpClient


class WmcpToolkit:
    """LangChain-compatible toolkit backed by wmcp.sh.

    Usage:

        from langchain.agents import AgentExecutor, create_react_agent
        from wmcp import WmcpClient
        from wmcp.langchain import WmcpToolkit

        client = WmcpClient(api_key="webmcp_live_…")
        toolkit = WmcpToolkit("https://allbirds.com/products/mens-wool-runners", client=client)
        tools = toolkit.get_tools()

        agent = create_react_agent(llm=..., tools=tools, ...)
    """

    def __init__(
        self,
        url: str,
        *,
        client: Optional[WmcpClient] = None,
        fresh: bool = False,
    ):
        self.url = url
        self.client = client or WmcpClient()
        self._wmcp_tools: Optional[List[Tool]] = None
        self._fresh = fresh

    def _load(self) -> List[Tool]:
        if self._wmcp_tools is None:
            self._wmcp_tools = self.client.tools(self.url, fresh=self._fresh)
        return self._wmcp_tools

    def get_tools(self) -> List[Any]:
        """Return a list of LangChain `StructuredTool` objects."""
        try:
            from langchain_core.tools import StructuredTool
        except ImportError as e:
            raise ImportError(
                "WmcpToolkit.get_tools() requires langchain-core. "
                "Install with: pip install langchain-core"
            ) from e

        out: List[Any] = []
        for t in self._load():
            out.append(
                StructuredTool.from_function(
                    func=self._make_runner(t),
                    name=t.name,
                    description=t.description,
                    # LangChain wraps the input_schema into args_schema if it's pydantic;
                    # otherwise it falls back to the function signature, which is fine
                    # for our generic kwargs runner.
                )
            )
        return out

    def _make_runner(self, tool: Tool):
        """Closure that executes a specific wmcp tool by name."""
        url = self.url
        client = self.client
        tool_name = tool.name

        def _run(**kwargs: Any) -> Dict[str, Any]:
            return client.execute(url=url, tool=tool_name, args=kwargs)

        # LangChain inspects the docstring for tool descriptions
        _run.__doc__ = tool.description
        _run.__name__ = tool_name
        return _run
