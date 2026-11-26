# An affordance language for people and agents

Use the same words for the same operation at every entry point. A person should be able to read a label aloud, find it by keyboard or assistive technology, and refer to it in an agent request.

| Interface decision | Visible and accessible form | Structured action |
| --- | --- | --- |
| Read an existing collection | Name the section and list **Tasks**. | Use **Tasks** as the title of `list_tasks`, with a description of the records it reads. |
| Create an item | Label the required field **Task name** and use a native **Add task** submit button. The visible constraint is also the field description. | Title `add_task` **Add task**. Describe its `text` field as **Task name** and declare its length and single-line rules. |
| Act on a particular item | Show **Mark complete** beside the item. The accessible name starts with that exact label, then adds the item's name and ID. | Title `complete_task` **Mark complete**. Take the visible **Task ID** and describe the open-item precondition. |
| Show state | Display **Open** or **Completed** as text. A completed item leaves the completion action out of its row. | Return `done` on the task record and reject a completion request for a completed task. |
| Ask permission | Review the exact request in a named modal. The action keeps its original label and **Cancel** receives initial focus. | Declare user authorization for writes and wait for a decision before changing the taskboard. Approval covers the displayed request. |
| Report the result | Keep a dedicated status region for success and a field-linked alert for invalid input. | Return the updated record and describe the verified result in the capability contract. |

## Use the pattern on other controls

- Use verb–object labels for available actions, nouns for read surfaces, and state words for the state itself. Keep navigation links and action buttons native. Use a stable label for a toggle and expose its state separately.
- Derive accessible names from visible text. Add target context for repeated controls, such as the row name and ID, after their visible label. Pair fields with visible labels and attach constraints and error messages programmatically.
- Keep visible focus on the current control. When activating a control removes it, move focus to the next relevant action, then to the previous one if needed, and finally to an available starting control. Update only the affected row so unrelated focus survives.
- Keep machine identifiers stable. Use the same canonical label in the structured title and at the beginning of the description so a client that surfaces descriptions still presents the shared vocabulary. Describe the effect, applicable state, input, and observable result. Bind consent to the specific operation and target.

The [taskboard](../examples/browser-demo/index.html) implements these patterns, and its [site contract](../examples/browser-demo/capabilities.json) carries the same title, request schema, and outcome. This follows W3C guidance on label-in-name, visible focus, and status messages. [Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html) · [Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible) · [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)

## Discoverability checks

| Path | Browser check |
| --- | --- |
| Keyboard | Starts at the visibly named field, reaches the add and complete buttons in order, activates them with Enter and Space, and preserves visible focus after a row action disappears. Blank input produces linked feedback. At 360 CSS pixels a 120-character task stays within the viewport. |
| Screen-reader interface | Chromium's accessibility tree exposes the named regions, required field and description, native list, row-specific button names, validation alert, and polite success status. |
| Authorized agent | Chrome's native WebMCP registration exposes all three capabilities and their schemas. The runner finds tools by the shared signifier, reads the list, rejects synthetic approval, cancels one write without changing the board, and separately approves add and complete. It checks the actual returned task and visible outcome. |

The automated screen-reader check exercises the browser's accessibility tree. The local sandbox blocked the Unix socket needed for a desktop screen-reader session, so spoken announcements and reading order in Orca, NVDA, and VoiceOver remain unverified. On a desktop with a screen reader, check the heading and landmark list, tab through **Task name** and the two task controls, submit an empty name, and listen for the validation and success announcements. On a WebMCP-enabled browser, also check the modal's name, request description, initial **Cancel** focus, and focus restoration on Escape.

Chromium 151 exposed the descriptions and input schemas through the native registry and omitted the titles from its DevTools event. The runner verified the shared label through the description prefix on that browser. The declared title is also preserved in the compiled contract. The dialog is the in-page review for this local demo's specific tool routes. Site authentication and browser or agent authorization remain separate from the dialog. [WebMCP draft](https://webmachinelearning.github.io/webmcp/)

## Reproduce

From the repository root, with Playwright Python installed and a Chrome build that exposes the WebMCP testing API:

```sh
cargo build --locked --manifest-path tools/wmcp-stats/Cargo.toml
node --test cli/*.test.mjs actions/mcp-doctor/*.test.mjs
python3 scripts/test-taskboard-affordances.py --chrome /path/to/chrome-headless-shell
```

The browser runner serves the demo on loopback and uses a fresh page for each path. The agent cases use Chrome for Testing 151.0.7922.34 and simulate the operator's explicit keyboard decisions.
