"""Anthropic SDK adapter — turn wmcp Tools into the shape `anthropic.messages.create(tools=…)` wants."""

from __future__ import annotations

from typing import Any, Dict, List

from .client import Tool


def to_anthropic_tools(tools: List[Tool]) -> List[Dict[str, Any]]:
    """Convert wmcp tools to Anthropic's tool_use schema.

    Usage:

        from anthropic import Anthropic
        from wmcp import WmcpClient
        from wmcp.anthropic import to_anthropic_tools

        client = WmcpClient()
        wmcp_tools = client.tools("https://www.allbirds.com/products/mens-wool-runners")

        anthropic = Anthropic()
        msg = anthropic.messages.create(
            model="claude-opus-4-7",
            max_tokens=1024,
            tools=to_anthropic_tools(wmcp_tools),
            messages=[{"role": "user", "content": "Add size 10 to my cart."}],
        )
    """
    out: List[Dict[str, Any]] = []
    for t in tools:
        out.append(
            {
                "name": t.name,
                "description": t.description,
                "input_schema": t.input_schema,
            }
        )
    return out


def execute_tool_use(client, url: str, tool_use: Dict[str, Any]) -> Dict[str, Any]:
    """Convenience: take an Anthropic `tool_use` content block, run it via wmcp."""
    return client.execute(url=url, tool=tool_use["name"], args=tool_use.get("input", {}))
