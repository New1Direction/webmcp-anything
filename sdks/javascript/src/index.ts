// @wmcp/sdk — core client
//
// Zero runtime deps. Works in Node 18+, Cloudflare Workers, Deno, browsers
// (CORS-permitted endpoints), Bun, anywhere with fetch.

export interface Tool {
  name: string;
  description: string;
  inputSchema?: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
  result?: any;
  action?: { kind: string; [k: string]: any };
}

export interface ToolsPayload {
  adapter: string;
  tools: Tool[];
  product?: { title?: string; name?: string; description?: string; version?: string };
  variants?: any[];
  from?: "cache" | "live" | "llm";
}

export interface ExecuteResponse {
  ok?: boolean;
  value?: any;
  error?: string;
}

export interface DirectoryEntry {
  url: string;
  adapter: string;
  ts: number;
  title?: string | null;
}

export interface WmcpClientOptions {
  apiKey?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export class WmcpError extends Error {
  constructor(public status: number, public body: any) {
    super(`wmcp.sh returned HTTP ${status}: ${typeof body === "string" ? body : JSON.stringify(body)}`);
  }
}

const DEFAULT_BASE = "https://wmcp.sh";

export class WmcpClient {
  private apiKey?: string;
  private baseUrl: string;
  private fetchImpl: typeof fetch;

  constructor(opts: WmcpClientOptions = {}) {
    this.apiKey = opts.apiKey;
    this.baseUrl = (opts.baseUrl || DEFAULT_BASE).replace(/\/$/, "");
    this.fetchImpl = opts.fetchImpl || fetch.bind(globalThis);
  }

  /** Fetch the MCP tool list for a URL. */
  async tools(url: string, opts: { fresh?: boolean } = {}): Promise<Tool[]> {
    const data = await this.toolsRaw(url, opts);
    return data.tools || [];
  }

  /** Same as `tools()` but returns the full payload (adapter, product, variants…). */
  async toolsRaw(url: string, opts: { fresh?: boolean } = {}): Promise<ToolsPayload> {
    const qs = new URLSearchParams({ url });
    if (opts.fresh) qs.set("fresh", "1");
    return this.request<ToolsPayload>("GET", `/api/v1/tools?${qs.toString()}`);
  }

  /** Execute a tool that has a live `action`. */
  async execute(url: string, tool: string, args: Record<string, any> = {}): Promise<ExecuteResponse> {
    return this.request<ExecuteResponse>("POST", "/api/v1/tools/execute", { url, tool, args });
  }

  /** List of every URL the community has indexed. */
  async directory(): Promise<DirectoryEntry[]> {
    const d = await this.request<{ entries: DirectoryEntry[] }>("GET", "/api/v1/directory");
    return d.entries || [];
  }

  /** Public stats — cached URL count, etc. */
  async stats(): Promise<{ cached_urls: number }> {
    return this.request("GET", "/api/v1/stats/public");
  }

  /** Current key's plan/limits. Requires apiKey. */
  async me(): Promise<{ plan: string; user_id: string; key?: string; anonymous: boolean }> {
    return this.request("GET", "/api/v1/keys/me");
  }

  private async request<T>(method: string, path: string, body?: any): Promise<T> {
    const headers: Record<string, string> = {
      accept: "application/json",
      "user-agent": "wmcp-js/0.1.0",
    };
    if (this.apiKey) headers.authorization = `Bearer ${this.apiKey}`;
    if (body !== undefined) headers["content-type"] = "application/json";

    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let parsed: any = text;
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      /* keep as string */
    }

    if (!res.ok) throw new WmcpError(res.status, parsed);
    return parsed as T;
  }
}
