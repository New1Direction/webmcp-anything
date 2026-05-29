// alerts.ts — best-effort, non-blocking notifications for high-intent events
// (managed leads, directory submissions, and future ownership claims).
//
// The codebase deliberately avoids external deps, so this is OPT-IN: if
// LEAD_ALERT_WEBHOOK is set (a Slack-compatible incoming-webhook URL), we POST
// a short {text} message; if unset it's a no-op. It must NEVER block or fail
// the originating request — always fire through waitUntil and swallow errors.
// Without this, high-ACV leads sit unread in KV until their 365-day TTL.

type AlertEnv = { LEAD_ALERT_WEBHOOK?: string };

export function fireAlert(
  env: AlertEnv,
  ctx: { waitUntil(p: Promise<unknown>): void },
  text: string
): void {
  const url = env.LEAD_ALERT_WEBHOOK;
  if (!url) return;
  try {
    ctx.waitUntil(
      fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      }).catch(() => {})
    );
  } catch {
    // alerting must never break a request
  }
}
