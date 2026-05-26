"""OpenAI SDK adapter — turn wmcp Tools into the function-calling format."""

from __future__ import annotations

from typing import Any, Dict, List

from .client import Tool


def to_openai_tools(tools: List[Tool]) -> List[Dict[str, Any]]:
    """Convert wmcp tools to OpenAI's chat.completions tool format.

    Usage:

        from openai import OpenAI
        from wmcp import WmcpClient
        from wmcp.openai import to_openai_tools

        client = WmcpClient()
        wmcp_tools = client.tools("https://www.allbirds.com/products/mens-wool-runners")

        openai = OpenAI()
        resp = openai.chat.completions.create(
            model="gpt-4o",
            tools=to_openai_tools(wmcp_tools),
            messages=[{"role": "user", "content": "Find the cheapest size."}],
        )
    """
    return [
        {
            "type": "function",
            "function": {
                "name": t.name,
                "description": t.description,
                "parameters": t.input_schema,
            },
        }
        for t in tools
    ]


def execute_function_call(client, url: str, function_call: Dict[str, Any]) -> Dict[str, Any]:
    """Run an OpenAI `function_call` (or `tool_calls[i].function`) via wmcp.

    `function_call` is the dict with {"name": "...", "arguments": json_str_or_dict}.
    """
    import json as _json

    args = function_call.get("arguments", {})
    if isinstance(args, str):
        try:
            args = _json.loads(args)
        except _json.JSONDecodeError:
            args = {}
    return client.execute(url=url, tool=function_call["name"], args=args)
