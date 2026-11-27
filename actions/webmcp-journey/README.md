# WebMCP Journey for GitHub Actions

Run a configured browser journey on a pull request. It opens Chrome, checks the starting page state, invokes one WebMCP tool, optionally approves the request, and checks the visible result. A failed assertion fails the step and appears in the job summary.

Copy the [example configuration](../../examples/browser-demo/journey.json) into your repository and adapt the tool name, arguments, selectors, and expected text to your app. For a static app in `public/`, this is a complete workflow:

```yaml
name: WebMCP journey
on: pull_request
permissions:
  contents: read
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: New1Direction/webmcp-anything/actions/webmcp-journey@main
        with:
          config: .github/journeys/complete-task.json
          site-dir: public
```

For reproducible CI, pin the journey action to a reviewed full commit SHA. Run any build step your app needs before the journey. For an already running app, replace `site-dir` with `url`, for example `http://127.0.0.1:3000/tasks`. Ensure the app is ready before this step. The action invokes the tool and clicks any configured approval button, so target a test app with repeatable data.

Paths resolve from the calling checkout. The action uses Linux and an installed WebMCP-capable Chrome, sets up Python, and installs Playwright in a temporary environment. To test a specific Chrome executable, supply `chrome`. To exercise a fallback, supply a local `polyfill` bundle. See the [journey configuration and local command](../../examples/browser-demo/README.md#check-your-own-app).
