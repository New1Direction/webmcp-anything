var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// adapters/shopify.js
var shopify_exports = {};
__export(shopify_exports, {
  ID: () => ID,
  actions: () => actions,
  detect: () => detect,
  extract: () => extract
});
var ID = "shopify";
var URL_RE = /\/products\/([a-z0-9][a-z0-9\-_]*)(?:\?|$|\/)/i;
function detect({ url, html }) {
  if (!URL_RE.test(url)) return null;
  const handle = url.match(URL_RE)[1];
  const u = new URL(url);
  return {
    adapter: ID,
    handle,
    origin: u.origin,
    productJsonUrl: `${u.origin}/products/${handle}.json`
  };
}
var CHROME_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36";
async function extract(ctx) {
  const res = await fetch(ctx.productJsonUrl, {
    headers: {
      accept: "application/json",
      "user-agent": CHROME_UA,
      "accept-language": "en-US,en;q=0.9"
    },
    credentials: "omit"
  });
  if (!res.ok) throw new Error(`Shopify ${res.status} ${ctx.productJsonUrl}`);
  const { product } = await res.json();
  if (!product) throw new Error("No product in Shopify response");
  const variants = (product.variants || []).map((v) => ({
    id: String(v.id),
    title: v.title,
    sku: v.sku || "",
    price: v.price,
    available: v.available !== false
  }));
  const variantTitles = variants.map((v) => v.title);
  return {
    product: {
      id: String(product.id),
      title: product.title,
      vendor: product.vendor,
      handle: product.handle,
      url: `${ctx.origin}/products/${product.handle}`,
      image: product.image?.src || product.images?.[0]?.src || null,
      price: product.variants?.[0]?.price || null,
      currency: "USD"
      // Shopify .json doesn't include currency; resolve later if needed
    },
    variants,
    tools: buildTools({ product, variants, variantTitles, origin: ctx.origin })
  };
}
function buildTools({ product, variants, variantTitles, origin }) {
  const variantEnum = variantTitles.length ? variantTitles : void 0;
  return [
    {
      name: "get_product",
      description: `Get full product info for "${product.title}" (vendor: ${product.vendor}).`,
      inputSchema: { type: "object", properties: {}, required: [] },
      result: {
        title: product.title,
        vendor: product.vendor,
        handle: product.handle,
        url: `${origin}/products/${product.handle}`,
        price: product.variants?.[0]?.price,
        image: product.image?.src
      }
    },
    {
      name: "get_price",
      description: `Get current price for "${product.title}". Optionally specify a variant.`,
      inputSchema: {
        type: "object",
        properties: {
          variant: { type: "string", description: "Variant title (e.g. size/color)", ...variantEnum ? { enum: variantEnum } : {} }
        },
        required: []
      },
      // Server-fillable: client calls back to background to re-fetch fresh price
      action: { kind: "shopify_price", handle: product.handle, origin }
    },
    {
      name: "check_stock",
      description: `Check whether "${product.title}" (or a specific variant) is in stock.`,
      inputSchema: {
        type: "object",
        properties: {
          variant: { type: "string", description: "Variant title to check", ...variantEnum ? { enum: variantEnum } : {} }
        },
        required: []
      },
      action: { kind: "shopify_stock", handle: product.handle, origin }
    },
    {
      name: "list_variants",
      description: `List all available variants (sizes, colors, etc.) for "${product.title}".`,
      inputSchema: { type: "object", properties: {}, required: [] },
      result: variants.map((v) => ({ title: v.title, price: v.price, available: v.available }))
    },
    {
      name: "add_to_cart",
      description: `Add "${product.title}" to the Shopify cart and return a checkout URL.`,
      inputSchema: {
        type: "object",
        properties: {
          variant: { type: "string", description: "Variant title", ...variantEnum ? { enum: variantEnum } : {} },
          quantity: { type: "integer", minimum: 1, default: 1 }
        },
        required: []
      },
      action: { kind: "shopify_add_to_cart", handle: product.handle, origin, variants }
    }
  ];
}
var actions = {
  async shopify_price({ handle, origin, args }) {
    const data = await fetchProduct(origin, handle);
    const v = pickVariant(data.product.variants, args?.variant);
    return { price: v.price, variant: v.title, available: v.available };
  },
  async shopify_stock({ handle, origin, args }) {
    const data = await fetchProduct(origin, handle);
    if (args?.variant) {
      const v = pickVariant(data.product.variants, args.variant);
      return { in_stock: !!v.available, variant: v.title };
    }
    const inStock = data.product.variants.some((v) => v.available);
    return { in_stock: inStock, variants_in_stock: data.product.variants.filter((v) => v.available).map((v) => v.title) };
  },
  async shopify_add_to_cart({ origin, args, variants }) {
    const variantTitle = args?.variant || variants[0]?.title;
    const variant = variants.find((v) => v.title === variantTitle) || variants[0];
    if (!variant) throw new Error("No variant available");
    const qty = args?.quantity || 1;
    const checkoutUrl = `${origin}/cart/${variant.id}:${qty}`;
    return { checkout_url: checkoutUrl, variant: variant.title, quantity: qty };
  }
};
async function fetchProduct(origin, handle) {
  const res = await fetch(`${origin}/products/${handle}.json`, {
    headers: { accept: "application/json", "user-agent": CHROME_UA, "accept-language": "en-US,en;q=0.9" },
    credentials: "omit"
  });
  if (!res.ok) throw new Error(`Shopify ${res.status}`);
  return res.json();
}
function pickVariant(variants, title) {
  if (!title) return variants[0];
  return variants.find((v) => v.title === title) || variants[0];
}

// adapters/jsonld.js
var jsonld_exports = {};
__export(jsonld_exports, {
  ID: () => ID2,
  actions: () => actions2,
  detect: () => detect2,
  extract: () => extract2
});
var ID2 = "jsonld";
function detect2({ jsonld, meta, url, title }) {
  if (Array.isArray(jsonld) && jsonld.length) {
    const product = findProduct(jsonld);
    if (product) return { kind: "jsonld", product, meta: meta || {}, url, title };
    const typed = findTyped(jsonld);
    if (typed) {
      return { kind: "entity", entity: typed.entity, category: typed.category, meta: meta || {}, url, title };
    }
  }
  if (meta?.["og:type"] === "product" || meta?.["product:price:amount"]) {
    return { kind: "meta", meta, url, title };
  }
  return null;
}
var ARTICLE = /* @__PURE__ */ new Set([
  "Article",
  "NewsArticle",
  "BlogPosting",
  "Report",
  "ScholarlyArticle",
  "TechArticle",
  "MedicalScholarlyArticle",
  "LiveBlogPosting"
]);
var CATEGORY_PRIORITY = ["recipe", "job", "event", "movie", "business", "article", "org", "person"];
var MOVIE = /* @__PURE__ */ new Set(["Movie", "TVSeries", "TVEpisode", "Episode", "VideoObject", "CreativeWork", "Book", "MusicRecording", "MusicAlbum", "PodcastEpisode"]);
var ORG = /* @__PURE__ */ new Set(["Organization", "Corporation", "NewsMediaOrganization", "EducationalOrganization", "GovernmentOrganization", "NGO", "Airline"]);
function classify(type) {
  const types = Array.isArray(type) ? type : [type];
  for (const raw of types) {
    if (typeof raw !== "string") continue;
    const t = raw.replace(/^https?:\/\/schema\.org\//, "");
    if (t === "Recipe") return "recipe";
    if (t === "JobPosting") return "job";
    if (t === "Person") return "person";
    if (/Event$/.test(t)) return "event";
    if (ARTICLE.has(t)) return "article";
    if (MOVIE.has(t)) return "movie";
    if (ORG.has(t)) return "org";
  }
  return null;
}
function findTyped(items) {
  const flat = flatten(items);
  const byCat = /* @__PURE__ */ new Map();
  for (const item of flat) {
    const cat = classify(item["@type"]);
    if (cat && !byCat.has(cat)) byCat.set(cat, item);
  }
  for (const cat of CATEGORY_PRIORITY) {
    if (byCat.has(cat)) return { entity: byCat.get(cat), category: cat };
  }
  for (const item of flat) {
    if (item.address || item.openingHours || item.telephone) return { entity: item, category: "business" };
  }
  for (const item of flat) {
    if (item.name || item.headline || item.title) return { entity: item, category: "generic" };
  }
  return null;
}
function flatten(items) {
  const out = [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    out.push(item);
    if (Array.isArray(item["@graph"])) out.push(...item["@graph"].filter((x) => x && typeof x === "object"));
    if (item.mainEntity && typeof item.mainEntity === "object") out.push(item.mainEntity);
  }
  return out;
}
function findProduct(items) {
  const isProductType = (t) => t === "Product" || t === "ProductGroup" || // Allbirds, IKEA, Lululemon
  t === "IndividualProduct" || // some catalogs
  Array.isArray(t) && t.some((x) => isProductType(x));
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    if (isProductType(item["@type"])) return item;
  }
  for (const item of items) {
    if (item?.mainEntity && isProductType(item.mainEntity["@type"])) return item.mainEntity;
  }
  return null;
}
async function extract2(ctx) {
  if (ctx.kind === "entity") return extractEntity(ctx);
  if (ctx.kind === "meta") return extractProduct(ctx);
  return extractProduct(ctx);
}
function extractEntity(ctx) {
  const e = ctx.entity;
  const host = safeHost(ctx.url);
  const nm = text(e.name || e.headline || e.title) || ctx.title || host;
  const view = {
    name: "view_page",
    description: `Return a direct link to "${nm}" on ${host}.`,
    inputSchema: { type: "object", properties: {}, required: [] },
    result: { url: ctx.url, name: nm }
  };
  const tools = [view];
  let info;
  switch (ctx.category) {
    case "article": {
      info = {
        headline: text(e.headline || e.name),
        author: names(e.author),
        publisher: text(e.publisher?.name || e.publisher),
        date_published: e.datePublished || e.dateCreated || null,
        section: e.articleSection || null,
        description: clip(text(e.description || e.abstract)),
        body: clip(text(e.articleBody), 4e3),
        url: ctx.url
      };
      tools.unshift(tool("get_article", `Get the article "${clip(nm, 80)}".`, info));
      break;
    }
    case "recipe": {
      info = {
        name: nm,
        author: names(e.author),
        total_time: e.totalTime || null,
        yield: e.recipeYield || null,
        ingredients: arr(e.recipeIngredient).map(text),
        instructions: recipeSteps(e.recipeInstructions),
        nutrition: e.nutrition?.calories || null,
        rating: rating(e.aggregateRating),
        url: ctx.url
      };
      tools.unshift(tool("get_recipe", `Get the recipe "${clip(nm, 80)}" (ingredients + steps).`, info));
      break;
    }
    case "movie": {
      info = {
        name: nm,
        type: typeStr(e["@type"]),
        year: (e.datePublished || "").toString().slice(0, 4) || null,
        genre: arr(e.genre).map(text),
        director: names(e.director),
        cast: names(e.actor).slice(0, 12),
        rating: rating(e.aggregateRating),
        content_rating: e.contentRating || null,
        description: clip(text(e.description)),
        url: ctx.url
      };
      tools.unshift(tool("get_title", `Get details for "${clip(nm, 80)}".`, info));
      break;
    }
    case "job": {
      info = {
        title: nm,
        company: text(e.hiringOrganization?.name || e.hiringOrganization),
        location: jobLocation(e.jobLocation) || (e.jobLocationType || null),
        salary: salary(e.baseSalary),
        employment_type: e.employmentType || null,
        date_posted: e.datePosted || null,
        valid_through: e.validThrough || null,
        description: clip(text(e.description), 4e3),
        url: ctx.url
      };
      tools.unshift(tool("get_job", `Get the job posting "${clip(nm, 80)}".`, info));
      break;
    }
    case "event": {
      info = {
        name: nm,
        start_date: e.startDate || null,
        end_date: e.endDate || null,
        location: place(e.location),
        performer: names(e.performer),
        offers: eventOffers(e.offers),
        description: clip(text(e.description)),
        url: ctx.url
      };
      tools.unshift(tool("get_event", `Get event details for "${clip(nm, 80)}".`, info));
      break;
    }
    case "business": {
      info = {
        name: nm,
        type: typeStr(e["@type"]),
        address: place({ address: e.address, name: nm }),
        telephone: e.telephone || null,
        opening_hours: arr(e.openingHours).map(text),
        price_range: e.priceRange || null,
        cuisine: arr(e.servesCuisine).map(text),
        rating: rating(e.aggregateRating),
        url: e.url || ctx.url
      };
      tools.unshift(tool("get_business", `Get business info for "${clip(nm, 80)}".`, info));
      break;
    }
    case "org": {
      info = {
        name: nm,
        url: e.url || ctx.url,
        logo: pickImage(e.logo),
        same_as: arr(e.sameAs),
        description: clip(text(e.description))
      };
      tools.unshift(tool("get_organization", `Get info about "${clip(nm, 80)}".`, info));
      break;
    }
    case "person": {
      info = {
        name: nm,
        job_title: text(e.jobTitle),
        works_for: text(e.worksFor?.name || e.worksFor),
        same_as: arr(e.sameAs),
        url: e.url || ctx.url,
        description: clip(text(e.description))
      };
      tools.unshift(tool("get_person", `Get info about "${clip(nm, 80)}".`, info));
      break;
    }
    default: {
      info = {
        type: typeStr(e["@type"]),
        name: nm,
        description: clip(text(e.description || ctx.meta?.["og:description"])),
        url: ctx.url
      };
      tools.unshift(tool("get_info", `Get structured info from this ${host} page.`, info));
    }
  }
  return { product: info, variants: [], tools };
}
function extractProduct(ctx) {
  let product, offers, sku, brand, image, currency, availability, price;
  if (ctx.kind === "jsonld") {
    product = ctx.product;
    offers = normalizeOffers(product.offers);
    sku = product.sku || product.mpn || product.productID || offers[0]?.sku;
    brand = typeof product.brand === "object" ? product.brand.name || product.brand["@id"] : product.brand;
    image = pickImage(product.image);
    currency = offers[0]?.priceCurrency || ctx.meta["og:price:currency"] || "USD";
    price = offers[0]?.price || ctx.meta["product:price:amount"] || null;
    availability = offers[0]?.availability || null;
  } else {
    product = { name: ctx.meta["og:title"] || ctx.title || "Product" };
    image = ctx.meta["og:image"];
    price = ctx.meta["product:price:amount"];
    currency = ctx.meta["product:price:currency"] || ctx.meta["og:price:currency"] || "USD";
    availability = ctx.meta["product:availability"] || null;
    offers = [];
    brand = ctx.meta["product:brand"] || ctx.meta["og:site_name"];
  }
  const name = product.name || product.title || "this product";
  const inStock = isInStock(availability);
  const productInfo = {
    name,
    brand,
    sku,
    price,
    currency,
    image,
    url: ctx.url,
    in_stock: inStock,
    description: product.description || ctx.meta?.["og:description"]
  };
  const variantTitles = collectVariants(product);
  const tools = [
    {
      name: "get_product",
      description: `Get full product info for "${name}"${brand ? ` by ${brand}` : ""}.`,
      inputSchema: { type: "object", properties: {}, required: [] },
      result: productInfo
    },
    {
      name: "get_price",
      description: `Get the price of "${name}".`,
      inputSchema: { type: "object", properties: {}, required: [] },
      result: price !== null && price !== void 0 ? { price: String(price), currency } : { error: "Price not found in page metadata" }
    },
    {
      name: "check_stock",
      description: `Check whether "${name}" is in stock (snapshot from page schema).`,
      inputSchema: { type: "object", properties: {}, required: [] },
      result: { in_stock: inStock, availability_raw: availability || "unknown" }
    },
    {
      name: "view_product",
      description: `Return a direct link to "${name}" on ${safeHost(ctx.url)}.`,
      inputSchema: { type: "object", properties: {}, required: [] },
      result: { url: ctx.url, name }
    }
  ];
  if (variantTitles.length) {
    tools.push({
      name: "list_variants",
      description: `List available variants for "${name}".`,
      inputSchema: { type: "object", properties: {}, required: [] },
      result: variantTitles
    });
  }
  return { product: productInfo, variants: variantTitles, tools };
}
function tool(name, description, result) {
  return { name, description, inputSchema: { type: "object", properties: {}, required: [] }, result };
}
function text(v) {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return text(v[0]);
  if (typeof v === "object") return v.name || v["@value"] || v.text || null;
  return null;
}
function clip(s, n = 1500) {
  if (!s) return s ?? null;
  const str = String(s).replace(/\s+/g, " ").trim();
  return str.length > n ? str.slice(0, n) + "\u2026" : str;
}
function arr(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}
function names(v) {
  return arr(v).map((x) => typeof x === "string" ? x : x?.name).filter(Boolean);
}
function typeStr(t) {
  return (Array.isArray(t) ? t.find((x) => typeof x === "string") : t) || null;
}
function rating(r) {
  if (!r || typeof r !== "object") return null;
  const value = r.ratingValue ?? r.value;
  if (value == null) return null;
  return { value: String(value), count: r.ratingCount || r.reviewCount || null, best: r.bestRating || null };
}
function salary(b) {
  if (!b || typeof b !== "object") return text(b);
  const v = b.value || {};
  const amt = v.value || v.minValue || b.amount || null;
  if (amt == null) return null;
  return { amount: String(amt), currency: b.currency || v.currency || "USD", unit: v.unitText || null };
}
function jobLocation(loc) {
  const first = arr(loc)[0];
  if (!first) return null;
  return place(first);
}
function place(p) {
  if (!p) return null;
  if (typeof p === "string") return p;
  const a = p.address || p;
  if (typeof a === "string") return a;
  if (typeof a !== "object") return null;
  const parts = [a.streetAddress, a.addressLocality, a.addressRegion, a.postalCode, a.addressCountry].map((x) => typeof x === "object" ? x?.name : x).filter(Boolean);
  const s = parts.join(", ");
  return s || p.name || null;
}
function eventOffers(o) {
  return normalizeOffers(o).map((x) => ({
    price: x.price ?? x.lowPrice ?? null,
    currency: x.priceCurrency || "USD",
    url: x.url || null,
    availability: x.availability || null
  })).filter((x) => x.price != null || x.url);
}
function recipeSteps(ins) {
  return arr(ins).flatMap((step) => {
    if (typeof step === "string") return [step];
    if (step?.["@type"] === "HowToSection") return arr(step.itemListElement).map((s) => text(s));
    return [text(step)];
  }).filter(Boolean).map((s) => clip(s, 400));
}
function normalizeOffers(o) {
  if (!o) return [];
  if (Array.isArray(o)) return o.flatMap(normalizeOffers);
  if (o["@type"] === "AggregateOffer") {
    return [{ price: o.lowPrice || o.price, priceCurrency: o.priceCurrency, availability: o.availability, sku: o.sku, url: o.url }];
  }
  return [o];
}
function pickImage(img) {
  if (!img) return null;
  if (typeof img === "string") return img;
  if (Array.isArray(img)) return typeof img[0] === "string" ? img[0] : img[0]?.url || null;
  return img.url || img["@id"] || null;
}
function isInStock(availability) {
  if (!availability) return null;
  const s = String(availability).toLowerCase();
  if (s.includes("instock") || s === "in stock") return true;
  if (s.includes("outofstock") || s.includes("soldout") || s === "out of stock") return false;
  if (s.includes("preorder") || s.includes("backorder")) return true;
  return null;
}
function collectVariants(product) {
  const variants = [];
  if (Array.isArray(product.hasVariant)) {
    for (const v of product.hasVariant) {
      const name = v.name || v.sku;
      if (name) variants.push({ name, price: v.offers?.price, sku: v.sku });
    }
  }
  if (Array.isArray(product.color)) variants.push(...product.color.map((c) => ({ name: c })));
  if (typeof product.color === "string") variants.push({ name: product.color });
  if (Array.isArray(product.size)) variants.push(...product.size.map((s) => ({ name: s })));
  return variants;
}
function safeHost(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "this site";
  }
}
var actions2 = {};

// extension/background.js
var ADAPTERS = [shopify_exports, jsonld_exports];
var ACTION_HANDLERS = Object.assign({}, ...ADAPTERS.map((a) => a.actions || {}));
var cache = /* @__PURE__ */ new Map();
var CACHE_TTL = 60 * 1e3;
var tabTools = /* @__PURE__ */ new Map();
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      if (msg?.type === "EXTRACT_TOOLS") {
        const out = await extractTools({
          url: msg.url,
          html: msg.html,
          jsonld: msg.jsonld,
          meta: msg.meta,
          title: msg.title
        });
        sendResponse({ ok: true, tools: out.tools || [], adapter: out.adapter || null });
        return;
      }
      if (msg?.type === "EXECUTE_TOOL") {
        const handler = ACTION_HANDLERS[msg.action?.kind];
        if (!handler) throw new Error(`No handler for action ${msg.action?.kind}`);
        const value = await handler({ ...msg.action, args: msg.args });
        sendResponse({ ok: true, value });
        return;
      }
      if (msg?.type === "CACHE_TOOLS_FOR_TAB") {
        if (sender.tab?.id != null) {
          tabTools.set(sender.tab.id, { url: msg.url, tools: msg.tools });
        }
        sendResponse({ ok: true });
        return;
      }
      if (msg?.type === "GET_TAB_TOOLS") {
        const entry = tabTools.get(msg.tabId);
        sendResponse({ ok: true, ...entry || { url: null, tools: [] } });
        return;
      }
      if (msg?.type === "RESTOCK_DETECTED") {
        try {
          chrome.notifications?.create("qc-" + Date.now(), {
            type: "basic",
            iconUrl: chrome.runtime.getURL("icons/icon128.png"),
            title: "QuickCatch \u2014 back in stock!",
            message: (msg.title ? String(msg.title).slice(0, 80) : "Your watched item") + " just restocked. Added to your cart \u2014 go check out.",
            priority: 2
          });
        } catch (e) {
        }
        if (sender.tab?.id != null) {
          try {
            chrome.tabs.update(sender.tab.id, { active: true });
          } catch (e) {
          }
          if (sender.tab.windowId != null) {
            try {
              chrome.windows.update(sender.tab.windowId, { focused: true });
            } catch (e) {
            }
          }
        }
        sendResponse({ ok: true });
        return;
      }
      sendResponse({ ok: false, error: "unknown message" });
    } catch (err) {
      console.error("[WebMCP Anything bg]", err);
      sendResponse({ ok: false, error: String(err?.message || err) });
    }
  })();
  return true;
});
chrome.tabs.onRemoved.addListener((tabId) => tabTools.delete(tabId));
async function extractTools(ctx) {
  const { url } = ctx;
  const now = Date.now();
  const hit = cache.get(url);
  if (hit && now - hit.ts < CACHE_TTL) return hit.payload;
  for (const adapter of ADAPTERS) {
    const detected = adapter.detect(ctx);
    if (!detected) continue;
    try {
      const data = await adapter.extract(detected);
      const payload = { adapter: adapter.ID, tools: data.tools, meta: data.product };
      cache.set(url, { payload, ts: now });
      pushToWorker(url, payload).catch(() => {
      });
      return payload;
    } catch (err) {
      console.warn(`[WebMCP Anything] ${adapter.ID} extract failed:`, err);
    }
  }
  return { adapter: null, tools: [] };
}
async function pushToWorker(url, payload) {
  const { pushToCache, endpoint, apiKey } = await chrome.storage.local.get([
    "pushToCache",
    "endpoint",
    "apiKey"
  ]);
  if (!pushToCache || !endpoint) return;
  const headers = { "content-type": "application/json" };
  if (apiKey) headers["authorization"] = `Bearer ${apiKey}`;
  try {
    await fetch(`${endpoint.replace(/\/$/, "")}/api/v1/cache`, {
      method: "POST",
      headers,
      body: JSON.stringify({ url, payload }),
      keepalive: true
    });
  } catch (err) {
    console.debug("[WebMCP Anything] push failed:", err);
  }
}
