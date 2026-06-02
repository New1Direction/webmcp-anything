// jsonld.js — generic adapter for any site that ships schema.org JSON-LD.
//
// Commerce (Product/ProductGroup) covers Pokemon Center, BestBuy, Target,
// Walmart, Etsy, IKEA, REI, Sephora — every retailer with proper SEO.
//
// Beyond commerce we also turn the OTHER common schema.org types into read
// tools, because that's what the big content/data sites ship: Article (news,
// blogs), Recipe (food sites), Movie/TVSeries (IMDb), JobPosting (job boards),
// Event (ticketing), LocalBusiness/Restaurant (Yelp, maps), Organization,
// Person. The WebMCP extension reads this JSON-LD from the *rendered* page in
// the user's own browser, so it works on sites a datacenter fetch can't reach.
//
// All tools are snapshots captured at detection time (no live re-fetch), same
// as the Product path.

export const ID = "jsonld";

export function detect({ jsonld, meta, url, title }) {
  if (Array.isArray(jsonld) && jsonld.length) {
    // Commerce first — keeps the established Product behavior unchanged.
    const product = findProduct(jsonld);
    if (product) return { kind: "jsonld", product, meta: meta || {}, url, title };
    // Any other recognized (or named) schema.org entity → entity path.
    const typed = findTyped(jsonld);
    if (typed) {
      return { kind: "entity", entity: typed.entity, category: typed.category, meta: meta || {}, url, title };
    }
  }
  // Meta-only fallback: og:type=product is a weak commerce signal.
  if (meta?.["og:type"] === "product" || meta?.["product:price:amount"]) {
    return { kind: "meta", meta, url, title };
  }
  return null;
}

// ---- type classification -------------------------------------------------

const ARTICLE = new Set([
  "Article", "NewsArticle", "BlogPosting", "Report", "ScholarlyArticle",
  "TechArticle", "MedicalScholarlyArticle", "LiveBlogPosting",
]);
// When a page ships several @types (Yoast et al. emit WebPage + Article +
// Recipe in one @graph), prefer the most specific/useful one.
const CATEGORY_PRIORITY = ["recipe", "job", "event", "movie", "business", "article", "org", "person"];
const MOVIE = new Set(["Movie", "TVSeries", "TVEpisode", "Episode", "VideoObject", "CreativeWork", "Book", "MusicRecording", "MusicAlbum", "PodcastEpisode"]);
const ORG = new Set(["Organization", "Corporation", "NewsMediaOrganization", "EducationalOrganization", "GovernmentOrganization", "NGO", "Airline"]);

// Categorize a schema.org @type (string or array) into the handler we use.
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
    // LocalBusiness and its many subtypes (Restaurant, Store, Hotel, Dentist…)
    // are hard to enumerate; treat "has an address" as the business signal below.
  }
  return null;
}

function findTyped(items) {
  const flat = flatten(items);
  // Classify every entity, then pick the highest-priority category present so a
  // Recipe/Job/Event wins over the generic WebPage/Article that SEO plugins also
  // emit on the same page.
  const byCat = new Map();
  for (const item of flat) {
    const cat = classify(item["@type"]);
    if (cat && !byCat.has(cat)) byCat.set(cat, item);
  }
  for (const cat of CATEGORY_PRIORITY) {
    if (byCat.has(cat)) return { entity: byCat.get(cat), category: cat };
  }
  // Address-bearing reads as a business/place even without a known @type.
  for (const item of flat) {
    if (item.address || item.openingHours || item.telephone) return { entity: item, category: "business" };
  }
  // Last resort: any object with a human name/headline → generic info tool.
  for (const item of flat) {
    if (item.name || item.headline || item.title) return { entity: item, category: "generic" };
  }
  return null;
}

// Walk one level into @graph / mainEntity / itemListElement so nested specs work.
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
  const isProductType = (t) =>
    t === "Product" ||
    t === "ProductGroup" ||           // Allbirds, IKEA, Lululemon
    t === "IndividualProduct" ||      // some catalogs
    (Array.isArray(t) && t.some((x) => isProductType(x)));

  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    if (isProductType(item["@type"])) return item;
  }
  for (const item of items) {
    if (item?.mainEntity && isProductType(item.mainEntity["@type"])) return item.mainEntity;
  }
  return null;
}

// ---- extraction ----------------------------------------------------------

export async function extract(ctx) {
  if (ctx.kind === "entity") return extractEntity(ctx);
  if (ctx.kind === "meta") return extractProduct(ctx);
  return extractProduct(ctx);
}

// Non-commerce schema.org entity → type-appropriate read tools.
function extractEntity(ctx) {
  const e = ctx.entity;
  const host = safeHost(ctx.url);
  const nm = text(e.name || e.headline || e.title) || ctx.title || host;
  const view = {
    name: "view_page",
    description: `Return a direct link to "${nm}" on ${host}.`,
    inputSchema: { type: "object", properties: {}, required: [] },
    result: { url: ctx.url, name: nm },
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
        body: clip(text(e.articleBody), 4000),
        url: ctx.url,
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
        url: ctx.url,
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
        url: ctx.url,
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
        description: clip(text(e.description), 4000),
        url: ctx.url,
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
        url: ctx.url,
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
        url: e.url || ctx.url,
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
        description: clip(text(e.description)),
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
        description: clip(text(e.description)),
      };
      tools.unshift(tool("get_person", `Get info about "${clip(nm, 80)}".`, info));
      break;
    }
    default: {
      info = {
        type: typeStr(e["@type"]),
        name: nm,
        description: clip(text(e.description || ctx.meta?.["og:description"])),
        url: ctx.url,
      };
      tools.unshift(tool("get_info", `Get structured info from this ${host} page.`, info));
    }
  }

  return { product: info, variants: [], tools };
}

// Commerce path — unchanged behavior from the Product-only adapter.
function extractProduct(ctx) {
  let product, offers, sku, brand, image, currency, availability, price;

  if (ctx.kind === "jsonld") {
    product = ctx.product;
    offers = normalizeOffers(product.offers);
    sku = product.sku || product.mpn || product.productID || (offers[0]?.sku);
    brand = typeof product.brand === "object" ? (product.brand.name || product.brand["@id"]) : product.brand;
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
    description: product.description || ctx.meta?.["og:description"],
  };

  const variantTitles = collectVariants(product);

  const tools = [
    {
      name: "get_product",
      description: `Get full product info for "${name}"${brand ? ` by ${brand}` : ""}.`,
      inputSchema: { type: "object", properties: {}, required: [] },
      result: productInfo,
    },
    {
      name: "get_price",
      description: `Get the price of "${name}".`,
      inputSchema: { type: "object", properties: {}, required: [] },
      result: price !== null && price !== undefined
        ? { price: String(price), currency }
        : { error: "Price not found in page metadata" },
    },
    {
      name: "check_stock",
      description: `Check whether "${name}" is in stock (snapshot from page schema).`,
      inputSchema: { type: "object", properties: {}, required: [] },
      result: { in_stock: inStock, availability_raw: availability || "unknown" },
    },
    {
      name: "view_product",
      description: `Return a direct link to "${name}" on ${safeHost(ctx.url)}.`,
      inputSchema: { type: "object", properties: {}, required: [] },
      result: { url: ctx.url, name },
    },
  ];

  if (variantTitles.length) {
    tools.push({
      name: "list_variants",
      description: `List available variants for "${name}".`,
      inputSchema: { type: "object", properties: {}, required: [] },
      result: variantTitles,
    });
  }

  return { product: productInfo, variants: variantTitles, tools };
}

// ---- small helpers -------------------------------------------------------

function tool(name, description, result) {
  return { name, description, inputSchema: { type: "object", properties: {}, required: [] }, result };
}

// schema.org values are often strings, {@value}, or {name}. Coerce to a string.
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
  return str.length > n ? str.slice(0, n) + "…" : str;
}

function arr(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

// People/orgs: schema.org Person|Organization|string → array of names.
function names(v) {
  return arr(v).map((x) => (typeof x === "string" ? x : x?.name)).filter(Boolean);
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

// Render a PostalAddress / Place into a flat string.
function place(p) {
  if (!p) return null;
  if (typeof p === "string") return p;
  const a = p.address || p;
  if (typeof a === "string") return a;
  if (typeof a !== "object") return null;
  const parts = [a.streetAddress, a.addressLocality, a.addressRegion, a.postalCode, a.addressCountry]
    .map((x) => (typeof x === "object" ? x?.name : x))
    .filter(Boolean);
  const s = parts.join(", ");
  return s || p.name || null;
}

function eventOffers(o) {
  return normalizeOffers(o).map((x) => ({
    price: x.price ?? x.lowPrice ?? null,
    currency: x.priceCurrency || "USD",
    url: x.url || null,
    availability: x.availability || null,
  })).filter((x) => x.price != null || x.url);
}

function recipeSteps(ins) {
  return arr(ins)
    .flatMap((step) => {
      if (typeof step === "string") return [step];
      if (step?.["@type"] === "HowToSection") return arr(step.itemListElement).map((s) => text(s));
      return [text(step)];
    })
    .filter(Boolean)
    .map((s) => clip(s, 400));
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
  if (Array.isArray(img)) return typeof img[0] === "string" ? img[0] : (img[0]?.url || null);
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
  try { return new URL(url).hostname; } catch { return "this site"; }
}

// No live actions — all data is captured at detection time.
export const actions = {};
