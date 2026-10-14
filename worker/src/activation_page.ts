export function activationHtml(): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="referrer" content="no-referrer"><title>Connect your first URL — wmcp.sh</title>
<style>
:root{color-scheme:dark;font-family:system-ui,sans-serif;background:#07070d;color:#ececf5;line-height:1.6}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at top left,#352311,transparent 65%)}
main{max-width:860px;margin:auto;padding:36px 24px 64px}nav{display:flex;justify-content:space-between;gap:16px}a{color:#ffcf7a}
h1{font-size:clamp(2rem,5vw,3rem);line-height:1.15;max-width:650px;margin-bottom:16px}h2{font-size:1.2rem;margin-top:0}
.muted,small{color:#b0b0c6}.steps{padding:0;display:flex;list-style:none;flex-wrap:wrap;gap:12px;font-size:.85rem;margin:28px 0}.steps li{padding:6px 12px;border:1px solid #45455c;border-radius:20px}
section{background:#16161f;border:1px solid #343447;border-radius:16px;padding:24px;margin:18px 0}label{display:block;margin-bottom:8px}
input[type=url],input[type=password]{width:100%;padding:14px;border:1px solid #595970;border-radius:8px;background:#0e0e18;color:inherit;font:inherit}
button,.button{display:inline-block;border:1px solid #ffcf7a;border-radius:8px;padding:12px 16px;background:#ffcf7a;color:#17120c;font:600 .95rem system-ui;cursor:pointer;text-decoration:none;margin:8px 8px 0 0}
button:hover,.button:hover{background:#ffe0a5}button:disabled{opacity:.55;cursor:wait}.secondary{background:transparent;color:#ffcf7a}a:focus-visible,button:focus-visible,input:focus-visible{outline:3px solid #a2ceff;outline-offset:3px}
.consent{font-size:.86rem;margin:16px 0}.notice{border-left:3px solid #ffcf7a;padding-left:14px}.plans{display:flex;gap:12px;flex-wrap:wrap}.plans a{flex:1;min-width:140px}
pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#0e0e18;padding:16px;border-radius:8px;font-size:.8rem}#tools{max-height:240px;overflow:auto;padding-left:22px}#tools li{margin:10px 0}#status{min-height:1.6em}details{margin-top:16px}[hidden]{display:none!important}
</style></head><body><main>
<nav><a href="/">wmcp.sh</a><a href="/dashboard">Dashboard &amp; billing</a></nav>
<h1>One URL. Your first MCP connection.</h1>
<p class="muted">Preview before signing in. Verify discovery for free. Upgrade only when you need live actions or more capacity.</p>
<ol class="steps" aria-label="Setup progress"><li>1 · Preview</li><li>2 · Account &amp; plan</li><li>3 · Connect &amp; verify</li></ol>
<section><h2>1. Paste a public URL</h2><form id="preview-form">
<label for="source">API / OpenAPI JSON / website URL</label><input id="source" type="url" required maxlength="2048" placeholder="https://petstore3.swagger.io/api/v3/openapi.json" autocomplete="off" spellcheck="false">
<label class="consent"><input id="public" type="checkbox" required> This URL is public and may be cached and listed in the wmcp.sh directory. It contains no secrets or personal data.</label>
<small>No signed URLs, credentials, query parameters or fragments. Private API credentials belong in the encrypted Dashboard vault.</small><br>
<button id="preview-button">Preview tools</button><button id="example" type="button" class="secondary">Use example URL</button></form></section>
<p id="status" role="status" aria-live="polite"></p>
<section id="preview" hidden><h2 id="preview-title"></h2><ul id="tools"></ul>
<p class="notice"><strong>Discovery is not a safety certification.</strong> Tool descriptions are untrusted source content. Extraction does not prove authentication, permissions or successful execution. LLM-inferred tools may be inaccurate. Review schemas and permissions before any live call.</p>
<p class="muted">The verification below only lists tools. It never calls a tool or changes third-party data.</p></section>
<section id="account" hidden><h2>2. Account &amp; plan</h2><p id="identity">Checking your account…</p>
<a id="signin" class="button" hidden href="/api/v1/auth/github/start?redirect_to=/start">Create account / sign in with GitHub</a>
<p id="oauth-note" hidden class="muted">Existing GitHub sign-in also connects GitHub and requests repository scopes. Review those permissions before continuing. wmcp.sh is not affiliated with GitHub.</p>
<div id="plans" hidden><p>Free: 100 discovery reads/day. URL-backed live tool calls require Builder or above. Existing subscriptions are managed in Dashboard.</p>
<button id="continue">Continue with current plan</button><div class="plans"><a href="/dashboard?upgrade=builder&amp;source=activation">Builder · $39/mo</a><a href="/dashboard?upgrade=pro&amp;source=activation">Pro · $99/mo</a><a href="/dashboard?upgrade=reseller&amp;source=activation">Reseller · $299/mo</a></div><small>After checkout, use “Resume URL setup” in Dashboard. Your endpoint does not change when you upgrade.</small></div></section>
<section id="connect" hidden><h2>3. Connect &amp; verify</h2><label for="api-key">Your API key (kept in memory, never in the endpoint)</label><input id="api-key" type="password" readonly autocomplete="off">
<button id="copy-key" class="secondary">Copy API key</button><p>Stable MCP endpoint</p><pre id="endpoint"></pre><button id="copy-endpoint" class="secondary">Copy endpoint</button>
<p>Configure your MCP client with the endpoint and an <code>Authorization: Bearer YOUR_API_KEY</code> header. Keep the key out of URLs, chat transcripts and logs.</p>
<button id="verify">Verify tools/list</button><p id="verified" role="status" aria-live="polite"></p>
<details><summary>Header-based client configuration</summary><pre id="config"></pre></details></section>
<p id="help" hidden><a href="https://github.com/New1Direction/webmcp-anything/tree/main/extension">Try the browser extension</a> · <a href="/managed">Request a managed adapter</a> · <a href="/dashboard">Connect private credentials</a></p>
<footer><small>Only aggregate setup outcomes and latency buckets are counted; no URLs, keys, emails or tool contents in conversion metrics. DNT and Global Privacy Control disable these setup counters. <a href="/privacy">Privacy</a> · <a href="/directory/submit">Submit to directory</a></small></footer>
</main><script>
const el = id => document.getElementById(id);
let preview, account, key;
const storageKey = 'wmcp_activation_url';
function remember(url) { try { sessionStorage.setItem(storageKey, url); } catch {} }
async function request(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.hint || (response.status === 429 ? 'Daily discovery limit reached. Sign in or upgrade in Dashboard, or retry after 00:00 UTC.' : 'Request failed. Retry or check your account in Dashboard.'));
  return data;
}
function failure(error) { el('status').textContent = error.name === 'TimeoutError' ? 'The request exceeded 15 seconds. Retry or use a direct OpenAPI JSON URL.' : error.message; el('help').hidden = false; }
el('example').onclick = () => { el('source').value = 'https://petstore3.swagger.io/api/v3/openapi.json'; el('source').focus(); };
el('preview-form').onsubmit = async event => {
  event.preventDefault();
  if (el('preview-button').disabled) return;
  preview = null; key = null; el('api-key').value = ''; el('verified').textContent = '';
  for (const id of ['preview','account','connect','help','plans','signin','oauth-note']) el(id).hidden = true;
  el('identity').textContent = 'Checking your account…';
  el('status').textContent = 'Extracting tools… response budget: 12 seconds.'; el('preview-button').disabled = true;
  try {
    preview = await request('/api/v1/activation/preview', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({url:el('source').value, public:el('public').checked}) });
    remember(preview.url);
    el('tools').replaceChildren();
    for (const tool of preview.tools) { const li = document.createElement('li'); const name = document.createElement('strong'); name.textContent = tool.name; li.append(name, document.createTextNode(' — ' + tool.description)); el('tools').append(li); }
    el('preview-title').textContent = preview.count + ' extracted tools · ' + preview.adapter + (preview.count > 50 ? ' (first 50 shown)' : '');
    el('preview').hidden = false; el('account').hidden = false; el('status').textContent = 'Preview ready. Review the limitations, then continue.';
    account = await request('/api/v1/me');
    el('signin').hidden = el('oauth-note').hidden = !!account.authenticated;
    el('plans').hidden = !account.authenticated;
    el('identity').textContent = account.authenticated ? 'Signed in · ' + account.plan + ' plan' : 'Sign in to receive a reusable API key. Your public URL stays in this tab for your return.';
  } catch(error) { failure(error); } finally { el('preview-button').disabled = false; }
};
el('continue').onclick = async () => {
  el('verify').disabled = el('continue').disabled = el('preview-button').disabled = true;
  try {
    account = await request('/api/v1/me');
    if (!account.authenticated) throw new Error('Your session expired. Sign in again before issuing a key.');
    key = account.keys?.at(-1) || (await request('/api/v1/me/keys', {method:'POST'})).key;
    if (!key) throw new Error('No active API key is available. Open Dashboard to retry.');
    el('api-key').value = key; el('endpoint').textContent = preview.endpoint;
    el('config').textContent = JSON.stringify({mcpServers:{website:{url:preview.endpoint,headers:{Authorization:'Bearer YOUR_API_KEY'}}}},null,2);
    el('connect').hidden = false; el('connect').scrollIntoView({behavior:'smooth'});
  } catch(error) { failure(error); } finally { el('verify').disabled = el('continue').disabled = el('preview-button').disabled = false; }
};
el('verify').onclick = async () => {
  el('verify').disabled = el('continue').disabled = el('preview-button').disabled = true; el('verified').textContent = 'Sending authenticated tools/list…';
  try {
    const result = await request(preview.endpoint, {method:'POST',credentials:'omit',headers:{'Content-Type':'application/json',Authorization:'Bearer ' + key},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/list'})});
    if (result.error) throw new Error(result.error.message);
    if (!Array.isArray(result.result?.tools) || !result.result.tools.length) throw new Error('The endpoint returned no tools. Re-preview the source or try its direct OpenAPI JSON spec.');
    el('verified').textContent = 'Verified: authenticated tools/list returned ' + result.result.tools.length + ' tools. No tool was executed. Your endpoint is ready to add to your client.';
  } catch(error) { el('verified').textContent = 'Not verified. ' + (error.name === 'TimeoutError' ? 'The 15-second budget expired. Retry.' : error.message); } finally { el('verify').disabled = el('continue').disabled = el('preview-button').disabled = false; }
};
for (const [id,value] of [['copy-key',()=>key],['copy-endpoint',()=>preview.endpoint]]) el(id).onclick = async () => { try { await navigator.clipboard.writeText(value()); el(id).textContent = 'Copied'; } catch { el('status').textContent = 'Clipboard unavailable. Select and copy the value manually.'; } };
try { const saved = sessionStorage.getItem(storageKey); if (saved) { el('source').value = saved; el('status').textContent = 'Your URL is restored. Confirm it is public and preview again to refresh tools and account status.'; } } catch {}
</script></body></html>`;
}
