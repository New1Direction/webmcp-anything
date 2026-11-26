import unittest

from representation_context import ax_view, dom_view, enrich, lookup, project


class RepresentationTests(unittest.TestCase):
    def test_dom_only_omits_embedded_json_sources(self):
        markup = (
            '<a href="/orders.html">Orders</a>'
            '<script type="application/ld+json">{"@context":"https://schema.org",'
            '"additionalProperty":[{"@type":"PropertyValue","name":"Status","value":"Pending"}]}</script>'
            '<script id="wmcp-context" type="application/json">{"schemaVersion":"wmcp-capabilities/v1",'
            '"tools":[{"name":"export","effect":"write"}]}</script>'
        )
        dom, metadata = dom_view(markup)
        self.assertEqual(dom["nodes"][0]["href"], "/orders.html")
        self.assertEqual(metadata["nodes"], [{"name": "Status", "value": "Pending"}])
        self.assertEqual(metadata["tools"], [{"name": "export", "effect": "write"}])
        self.assertEqual(dom_view(markup, include_metadata=False), [dom])

    def test_projection_keeps_scoped_live_state_and_drops_unneeded_values(self):
        live = {"nodes": [
            {"role": "textbox", "name": "Note", "scope": "Private", "value": "Private text", "ref": {"id": "private"}},
            {"role": "textbox", "name": "Note", "scope": "Work", "value": "Old text", "required": True, "ref": {"id": "work"}},
        ]}
        target = {"role": "textbox", "name": "Note", "scope": "Work"}
        enrich(live, {"nodes": [{**target, "value": "New text", "ref": {"id": "work"}}]})
        read = {"kind": "node", "target": target, "field": "value", "intent": "answer"}
        self.assertEqual(lookup([project(live, read)], read), "New text")
        write = {"intent": "submit", "target": target}
        nodes = project(live, write)["nodes"]
        self.assertEqual(len(nodes), 1)
        self.assertNotIn("value", nodes[0])
        self.assertTrue(nodes[0]["required"])
        self.assertEqual(nodes[0]["ref"], {"id": "work"})

    def test_live_status_precedes_stale_metadata_and_hidden_dom_is_omitted(self):
        markup = ('<figure><p role="status" aria-label="Status">Status: Ready</p>'
                  '<p role="status" aria-label="Status" hidden>Status: Hidden</p></figure>'
                  '<script type="application/ld+json">{"@context":"https://schema.org",'
                  '"additionalProperty":[{"@type":"PropertyValue","name":"Status","value":"Pending"}]}</script>')
        dom, metadata = dom_view(markup)
        request = {"kind": "node", "target": {"name": "Status", "role": "status"}, "field": "value"}
        self.assertEqual(lookup([dom, metadata], request), "Ready")
        self.assertEqual(lookup([metadata], request), "Pending")

    def test_ax_retains_runtime_value_and_ancestor_scope(self):
        raw = {"nodes": [
            {"nodeId": "1", "role": {"value": "region"}, "name": {"value": "Workspace"}},
            {"nodeId": "2", "parentId": "1", "role": {"value": "textbox"}, "name": {"value": "Note"},
             "value": {"value": "Runtime"}, "backendDOMNodeId": 10},
        ]}
        node = ax_view(raw)["nodes"][0]
        self.assertEqual((node["value"], node["scope"], node["ref"]), ("Runtime", "Workspace", {"ax": 10}))

    def test_ax_preserves_cross_origin_and_same_origin_fragments(self):
        raw = {"nodes": [
            {"nodeId": "1", "role": {"value": "link"}, "name": {"value": "Local"},
             "properties": [{"name": "url", "value": {"value": "https://site.example/docs?q=one#start"}}]},
            {"nodeId": "2", "role": {"value": "link"}, "name": {"value": "External"},
             "properties": [{"name": "url", "value": {"value": "https://other.example/docs"}}]},
        ]}
        nodes = ax_view(raw, "https://site.example")["nodes"]
        self.assertEqual([node["href"] for node in nodes], ["/docs?q=one#start", "https://other.example/docs"])

    def test_projection_preserves_write_contract_without_cosmetic_description(self):
        view = {"tools": [
            {"name": "export", "description": "Marketing copy", "effect": "write",
             "inputSchema": {"type": "object"}, "preconditions": [{"kind": "user-authorization"}],
             "postconditions": [{"kind": "result-schema"}]},
            {"name": "other", "effect": "read"},
        ]}
        tools = project(view, {"intent": "guard", "tool": "export"})["tools"]
        self.assertEqual(len(tools), 1)
        self.assertEqual(set(tools[0]), {"name", "effect", "inputSchema", "preconditions", "postconditions"})


if __name__ == "__main__":
    unittest.main()
