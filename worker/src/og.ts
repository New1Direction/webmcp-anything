// OG card served at /og.svg — link-preview image for HN/Twitter/Substack.
//
// SVG is not officially supported as og:image on all platforms (Twitter wants
// PNG/JPG/WEBP) but Discord/LinkedIn/Substack/Slack render SVG fine. For
// strict Twitter unfurl, convert this SVG to PNG offline:
//   npx svg-to-png path/to/og.svg > og.png
// and serve it as a static asset. For v0, SVG covers ~80% of unfurls.

export function ogSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#07070d"/>
      <stop offset="100%" stop-color="#11111c"/>
    </linearGradient>
    <radialGradient id="glow1" cx="10%" cy="0%" r="60%">
      <stop offset="0%" stop-color="#ff9e2c" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#ff9e2c" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="95%" cy="20%" r="55%">
      <stop offset="0%" stop-color="#ffcf7a" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#ffcf7a" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="textGrad" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#ffcf7a"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="0.5">
      <stop offset="0%" stop-color="#ff9e2c"/>
      <stop offset="100%" stop-color="#ffb86b"/>
    </linearGradient>
    <linearGradient id="cubeFill" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff9e2c" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#ffcf7a" stop-opacity="0.06"/>
    </linearGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
  </defs>

  <!-- background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow1)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>

  <!-- wordmark -->
  <text x="72" y="96" font-family="-apple-system, system-ui, 'Segoe UI', sans-serif"
        font-weight="800" font-size="30" fill="#ececf5" letter-spacing="-0.5">
    wmcp<tspan fill="#ffcf7a">.sh</tspan>
  </text>

  <!-- badge -->
  <g transform="translate(72, 128)">
    <rect width="252" height="36" rx="18" fill="#16161f" stroke="#ff9e2c" stroke-opacity="0.4"/>
    <circle cx="22" cy="18" r="4" fill="#ffcf7a"/>
    <text x="38" y="24" font-family="system-ui" font-size="12" font-weight="700"
          letter-spacing="2" fill="#ececf5">LIVE · MCP-COMPATIBLE</text>
  </g>

  <!-- main headline -->
  <text x="72" y="270" font-family="-apple-system, system-ui, 'Segoe UI', sans-serif"
        font-weight="800" font-size="76" fill="url(#textGrad)" letter-spacing="-2">
    Turn any URL into
  </text>
  <text x="72" y="356" font-family="-apple-system, system-ui, 'Segoe UI', sans-serif"
        font-weight="800" font-size="76" fill="url(#accentGrad)" letter-spacing="-2">
    agent-callable tools.
  </text>

  <!-- sub line -->
  <text x="72" y="412" font-family="system-ui, sans-serif" font-size="24" fill="#8a8aa8">
    A hosted MCP server. Open-source adapters.
  </text>

  <!-- code snippet box -->
  <g transform="translate(72, 458)">
    <rect width="780" height="68" rx="12" fill="#16161f" stroke="#26263a" stroke-width="1"/>
    <text x="22" y="44" font-family="'SF Mono', 'Menlo', monospace" font-size="18">
      <tspan fill="#4ade80">curl </tspan>
      <tspan fill="#ffb86b">'https://wmcp.sh/api/v1/tools?url=...'</tspan>
    </text>
  </g>

  <!-- 3D cube on right (isometric, multi-layer) -->
  <g transform="translate(990, 285)">
    <!-- ambient glow behind cube -->
    <circle cx="0" cy="0" r="170" fill="#ff9e2c" fill-opacity="0.18" filter="url(#soft)"/>

    <!-- back face -->
    <rect x="-100" y="-100" width="200" height="200" rx="22"
          fill="url(#cubeFill)" stroke="#ff9e2c" stroke-opacity="0.35" stroke-width="2"
          transform="translate(-22, -22)"/>
    <!-- middle face -->
    <rect x="-100" y="-100" width="200" height="200" rx="22"
          fill="url(#cubeFill)" stroke="#ffcf7a" stroke-opacity="0.45" stroke-width="2"/>
    <!-- front face -->
    <rect x="-100" y="-100" width="200" height="200" rx="22"
          fill="#16161f" stroke="#ff9e2c" stroke-opacity="0.8" stroke-width="2"
          transform="translate(22, 22)"/>
    <!-- inner detail: URL → tools schematic -->
    <g transform="translate(22, 22)">
      <text x="0" y="-30" text-anchor="middle" font-family="'SF Mono', monospace"
            font-size="14" fill="#8a8aa8">URL</text>
      <line x1="-30" y1="-12" x2="30" y2="-12" stroke="#ff9e2c" stroke-width="2" stroke-linecap="round"/>
      <circle cx="-30" cy="-12" r="3" fill="#ff9e2c"/>
      <circle cx="30" cy="-12" r="3" fill="#ff9e2c"/>
      <!-- arrow down -->
      <path d="M 0 0 L 0 28 L -8 20 M 0 28 L 8 20" fill="none" stroke="#ffcf7a" stroke-width="2" stroke-linecap="round"/>
      <text x="0" y="55" text-anchor="middle" font-family="'SF Mono', monospace"
            font-size="14" fill="#ffcf7a" font-weight="700">tools[]</text>
    </g>
  </g>

  <!-- footer -->
  <text x="72" y="582" font-family="system-ui, sans-serif" font-size="18"
        font-weight="600" fill="#8a8aa8">
    Free tier · 100 reads/day · no signup
    <tspan fill="#26263a">  ·  </tspan>
    <tspan fill="#ffcf7a">github.com/New1Direction/webmcp-anything</tspan>
  </text>
</svg>`;
}
