# Cloudflare setup

Use the maintained [self-hosting guide](../docs/SELF_HOSTING.md) for local development, Cloudflare KV bindings, secrets, deployment, and optional integrations.

The checked-in `wrangler.toml` contains existing namespace IDs. Create and configure your own namespaces before deploying a fork. The legacy `deploy.sh` checks for placeholder IDs and does not replace the populated IDs in the current configuration, so it is not a safe automatic setup for a separate deployment.
