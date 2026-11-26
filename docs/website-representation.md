# The minimum website context an agent needs

For these WMCP tasks, a task-scoped semantic query can replace full page trees. Keep the current origin and path, the named control or fact, the state needed to interpret it, and a fresh browser handle when an action needs one. Fetch the tool's contract for schema or permission questions and use rendered pixels for information available only visually.

The prototype is in [representation_context.py](../scripts/representation_context.py). It queries the browser for matching roles and names within the requested scope. It returns only the relevant live fields. It drops unrelated nodes, duplicate copies from metadata, and form values that the task does not ask to read. The fixture runner uses it locally with Playwright and Tesseract.

## What gets retained

| Task | Retained evidence |
| --- | --- |
| Navigate | Current document origin and path, unique scoped link, live action handle, and destination when needed |
| Read or interact with a control | Role and accessible name, named scope when needed, relevant live properties such as value, disabled, required, or pressed, and an action handle when needed |
| Inspect or gate a WebMCP capability | Tool name, input and output schemas when documented, origin or interface when documented, preconditions, effect, and postconditions |
| Read visual-only content | The necessary screenshot and the visual relation extracted from its pixels |

Live observations take precedence over static copies of changing state. A control marked unavailable stays distinguishable from one whose availability is unknown. For write decisions, the tool contract describes requirements and the user supplies approval separately. The benchmark does not derive consent from page text or appearance.

## Reproduce

From the repository root, install the optional benchmark dependencies in Python 3.12 and make Tesseract with English data available on your PATH. The measured environment used Tesseract 5.5.0 and Chrome for Testing 151.0.7922.34.

```sh
python3 -m venv /tmp/wmcp-representations
/tmp/wmcp-representations/bin/pip install playwright==1.62.0 lxml==6.1.1 pillow==13.0.0 numpy==2.3.5
/tmp/wmcp-representations/bin/python -m playwright install chromium --only-shell
/tmp/wmcp-representations/bin/python scripts/benchmark-representations.py --repeats 3 > representation-results.json
```

The runner also accepts `--chrome /path/to/chrome-headless-shell`. The measured run used the [Linux x64 Chrome for Testing archive](https://storage.googleapis.com/chrome-for-testing-public/151.0.7922.34/linux64/chrome-headless-shell-linux64.zip) with that option. The JSON includes each task result, retained and missing facts, incorrect facts, byte counts, timings, acquired sources, and unexpected writes. Run the projection checks with `python3 -m unittest discover -s scripts -p test_representation_context.py`.

## Benchmark scope and measurements

The [task suite](../examples/representations/tasks.json) contains 15 tasks across seven fixture pages. A single deterministic interpreter receives the same request in every arm and uses only that arm's extracted evidence. Success means an exact answer, the expected browser navigation or mock form effect, or withholding an unapproved action with the correct reason. The runner checks effects on the live fixture. It captures a fresh document for every trial, rotates method order, and repeats each trial three times with a fixed 1024×720 viewport.

The DOM arm consumes serialized live markup and can decode embedded metadata. It excludes executable script text as evidence and sees the HTML attribute value when a field's live DOM property differs. The accessibility arm captures Chromium's full top-level accessibility tree and reads its semantic roles, state, and action handles. The metadata arm loads declared JSON-LD and the WMCP tool contract. The screenshot arm uses Tesseract for visible text and pixel segmentation for canvas swatches. Its results describe that decoder and viewport.

The 21 facts per pass are scored against independent fixture expectations. They include typed contracts, live status, scope, link targets, control states, and visual relations. The capture timer measures acquisition and decoding through construction of the representation. Page load and browser startup are excluded. The report separately measures from capture start through the task outcome. Acquired bytes count raw capture responses and PNGs, excluding protocol framing, and agent bytes count the interpreter's JSON evidence envelope.


The evaluated compact variants preserve the same document envelope and choose evidence by request. `compact` projects the accessibility tree and can read a single missing link attribute from the DOM. `compact-targeted` asks the browser for scoped matching controls and their current properties. `compact-live-dom` projects serialized markup and reads a live control property when required. `compact-markup` omits that live-property read. All four use the same targeted metadata and visual branches.

## Results

| Representation | Tasks correct | Facts retained | Capture median | Capture p95 | Acquired bytes per task | Agent bytes per task |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Serialized DOM | 12/15 | 54/63 | 4.45 ms | 7.86 ms | 884 | 534 |
| Accessibility tree | 11/15 | 45/63 | 4.25 ms | 7.18 ms | 7,416 | 349 |
| Structured metadata | 4/15 | 21/63 | 4.18 ms | 8.79 ms | 228 | 280 |
| Screenshot OCR and pixels | 5/15 | 12/63 | 192.08 ms | 237.07 ms | 18,282 | 533 |
| All four sources | 15/15 | 63/63 | 194.54 ms | 258.69 ms | 26,810 | 1,327 |
| Compact targeted queries | 15/15 | 63/63 | 20.54 ms | 198.35 ms | 2,133 | 300 |
| Compact DOM with live reads | 15/15 | 63/63 | 4.68 ms | 193.44 ms | 2,655 | 296 |
| Compact AX projection | 15/15 | 63/63 | 4.34 ms | 190.71 ms | 7,577 | 293 |

Targeted queries matched all four sources on all 45 task trials and all 63 fact checks. They reduced mean acquired bytes by **92%** and the mean agent envelope by **77%**. Their median capture was **20.54 ms** because a named query has browser lookup overhead. The compact DOM variant retained the same results at **4.68 ms** median and **2,655 bytes** acquired per task. Compact AX projection had the lowest median among the three sufficient variants in this run and used more acquisition bytes. Visual capture remains expensive when it is required.

All methods made zero unauthorized fixture writes. Metadata alone reported the old shipment status. Serialized markup preserved the initial draft field attribute and missed the current value. The accessibility tree retained that live value and lacked the typed export contract and the canvas colors. Both canvas tasks required the screenshot path in this fixture set.

| Evidence removed | Tasks correct | Facts retained |
| --- | ---: | ---: |
| Live control property read from the compact DOM variant | 14/15 | 60/63 |
| Live semantic capture from the compact AX variant | 4/15 | 18/63 |
| Typed metadata from the compact AX variant | 13/15 | 51/63 |
| Visual capture from the compact AX variant | 13/15 | 57/63 |
| Targeted DOM link fallback from the compact AX variant | 15/15 | 63/63 |

The live semantics, typed contracts, and pixels each cover tasks that the others miss. The DOM link fallback added no coverage because the tested Chromium accessibility tree exposed those link destinations. A second whole-tree capture is redundant for the tested tasks. The result is scoped to these fixtures, one top-level frame, the tested browser and viewport, and a deterministic interpreter with typed requests. Further sites and agent decoders can change the evidence needed.
