// jsonld.js — generic adapter for any site with schema.org Product JSON-LD.
// Covers Pokemon Center (Salesforce Commerce Cloud), BestBuy, Target, Walmart,
// Etsy, IKEA, REI, Sephora, and basically every retailer with proper SEO.
//
// Unlike the Shopify adapter we cannot re-fetch a clean .json endpoint, so
// values are extracted from the live DOM at scan time. Stock/price are
// "snapshot at the moment of detection."

export const ID = "jsonld";

export function detect({ jsonld, meta, url, title }) {
  if (!Array.isArray(jsonld) || !jsonld.length) {
    // Fallback: og:type=product is a weak signal
    if (meta?.["og:type"] === "product" || meta?.["product:price:amount"]) {
      return { kind: "meta", meta, url, title };
    }
    return null;
  }
  const product = findProduct(jsonld);
  if (!product) return null;
  return { kind: "jsonld", product, meta: meta || {}, url, title };
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
  // Search one level deep (some sites nest under mainEntity)
  for (const item of items) {
    if (item?.mainEntity && isProductType(item.mainEntity["@type"])) return item.mainEntity;
  }
  return null;
}

export async function extract(ctx) {
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
    // meta-only fallback (runs in both browser and Worker — no DOM refs)
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
      description: `Return a direct link to "${name}" on ${new URL(ctx.url).hostname}.`,
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

function normalizeOffers(o) {
  if (!o) return [];
  if (Array.isArray(o)) return o.flatMap(normalizeOffers);
  if (o["@type"] === "AggregateOffer") {
    return [{ price: o.lowPrice || o.price, priceCurrency: o.priceCurrency, availability: o.availability, sku: o.sku }];
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

// No live actions — all data is captured at detection time
export const actions = {};
