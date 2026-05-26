"""Basic smoke tests — no network, just shape checks."""

from wmcp import WmcpClient, Tool
from wmcp.anthropic import to_anthropic_tools
from wmcp.openai import to_openai_tools


def test_tool_from_api_static():
    t = Tool.from_api({
        "name": "get_price",
        "description": "Current price.",
        "result": "$110.00",
    })
    assert t.name == "get_price"
    assert t.result == "$110.00"
    assert t.action is None
    assert not t.is_live


def test_tool_from_api_live():
    t = Tool.from_api({
        "name": "add_to_cart",
        "description": "Add to cart.",
        "inputSchema": {"type": "object", "properties": {"variant": {"type": "string"}}},
        "action": {"kind": "shopify_add_to_cart", "handle": "x"},
    })
    assert t.action is not None
    assert t.is_live
    assert t.input_schema["properties"]["variant"]["type"] == "string"


def test_anthropic_conversion():
    tools = [
        Tool.from_api({
            "name": "get_price",
            "description": "Current price.",
            "inputSchema": {"type": "object", "properties": {}},
        })
    ]
    converted = to_anthropic_tools(tools)
    assert len(converted) == 1
    assert converted[0]["name"] == "get_price"
    assert "input_schema" in converted[0]
    assert converted[0]["input_schema"]["type"] == "object"


def test_openai_conversion():
    tools = [
        Tool.from_api({
            "name": "get_price",
            "description": "Current price.",
            "inputSchema": {"type": "object", "properties": {}},
        })
    ]
    converted = to_openai_tools(tools)
    assert len(converted) == 1
    assert converted[0]["type"] == "function"
    assert converted[0]["function"]["name"] == "get_price"


def test_client_init():
    c = WmcpClient(api_key="webmcp_live_test", base_url="https://wmcp.sh/")
    assert c.base_url == "https://wmcp.sh"  # trailing slash stripped
    assert c.api_key == "webmcp_live_test"


if __name__ == "__main__":
    # `python tests/test_basic.py` for quick smoke
    test_tool_from_api_static()
    test_tool_from_api_live()
    test_anthropic_conversion()
    test_openai_conversion()
    test_client_init()
    print("ok 5/5")
