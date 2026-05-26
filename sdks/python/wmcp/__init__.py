"""wmcp — Python SDK for wmcp.sh.

Quick start:

    from wmcp import WmcpClient

    client = WmcpClient(api_key="webmcp_live_…")
    tools = client.tools("https://www.allbirds.com/products/mens-wool-runners")

Framework adapters:

    # Anthropic
    from wmcp.anthropic import to_anthropic_tools
    anthropic_tools = to_anthropic_tools(tools)

    # OpenAI
    from wmcp.openai import to_openai_tools
    openai_tools = to_openai_tools(tools)

    # LangChain
    from wmcp.langchain import WmcpToolkit
    toolkit = WmcpToolkit("https://…", client=client)
    lc_tools = toolkit.get_tools()
"""

from .client import WmcpClient, WmcpError, Tool

__all__ = ["WmcpClient", "WmcpError", "Tool"]
__version__ = "0.1.0"
