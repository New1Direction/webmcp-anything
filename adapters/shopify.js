// Shopify adapter: detect a Shopify product page and emit a WebMCP tool list.
//
// Detection: most Shopify stores expose <meta name="shopify-..."> tags,
// a Shopify-Stage / Shopify object on window, or a /products/{handle}.json endpoint.
// We rely on URL pattern + a fetch probe (cheap, cached).

export const ID = "shopify";

const URL_RE = /\/products\/([a-z0-9][a-z0-9\-_]*)(?:\?|$|\/)/i;

export function detect({ url, html }) {
  if (!URL_RE.test(url)) return null;
  // URL pattern alone is a strong-enough signal — we let the .json fetch
  // confirm or deny. Avoids missing stores at document_start when HTML is empty.
  const handle = url.match(URL_RE)[1];
  const u = new URL(url);
  return {
    adapter: ID,
    handle,
    origin: u.origin,
    productJsonUrl: `${u.origin}/products/${handle}.json`,
  };
}

// A realistic Chrome UA — required for Cloudflare Workers egress to retailers
// like Allbirds that 403 unfamiliar User-Agents. In the browser context the
// browser overrides this with its own UA, so adding it is safe in both.
const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36";

export async function extract(ctx) {
  const res = await fetch(ctx.productJsonUrl, {
    headers: {
      accept: "application/json",
      "user-agent": CHROME_UA,
      "accept-language": "en-US,en;q=0.9",
    },
    credentials: "omit",
  });
  if (!res.ok) throw new Error(`Shopify ${res.status} ${ctx.productJsonUrl}`);
  const { product } = await res.json();
  if (!product) throw new Error("No product in Shopify response");

  const variants = (product.variants || []).map((v) => ({
    id: String(v.id),
    title: v.title,
    sku: v.sku || "",
    price: v.price,
    available: v.available !== false,
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
      currency: "USD", // Shopify .json doesn't include currency; resolve later if needed
    },
    variants,
    tools: buildTools({ product, variants, variantTitles, origin: ctx.origin }),
  };
}

function buildTools({ product, variants, variantTitles, origin }) {
  const variantEnum = variantTitles.length ? variantTitles : undefined;

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
        image: product.image?.src,
      },
    },
    {
      name: "get_price",
      description: `Get current price for "${product.title}". Optionally specify a variant.`,
      inputSchema: {
        type: "object",
        properties: {
          variant: { type: "string", description: "Variant title (e.g. size/color)", ...(variantEnum ? { enum: variantEnum } : {}) },
        },
        required: [],
      },
      // Server-fillable: client calls back to background to re-fetch fresh price
      action: { kind: "shopify_price", handle: product.handle, origin },
    },
    {
      name: "check_stock",
      description: `Check whether "${product.title}" (or a specific variant) is in stock.`,
      inputSchema: {
        type: "object",
        properties: {
          variant: { type: "string", description: "Variant title to check", ...(variantEnum ? { enum: variantEnum } : {}) },
        },
        required: [],
      },
      action: { kind: "shopify_stock", handle: product.handle, origin },
    },
    {
      name: "list_variants",
      description: `List all available variants (sizes, colors, etc.) for "${product.title}".`,
      inputSchema: { type: "object", properties: {}, required: [] },
      result: variants.map((v) => ({ title: v.title, price: v.price, available: v.available })),
    },
    {
      name: "add_to_cart",
      description: `Add "${product.title}" to the Shopify cart and return a checkout URL.`,
      inputSchema: {
        type: "object",
        properties: {
          variant: { type: "string", description: "Variant title", ...(variantEnum ? { enum: variantEnum } : {}) },
          quantity: { type: "integer", minimum: 1, default: 1 },
        },
        required: [],
      },
      action: { kind: "shopify_add_to_cart", handle: product.handle, origin, variants },
    },
  ];
}

// Live action handlers — called from the background service worker
export const actions = {
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
  },
};

async function fetchProduct(origin, handle) {
  const res = await fetch(`${origin}/products/${handle}.json`, {
    headers: { accept: "application/json", "user-agent": CHROME_UA, "accept-language": "en-US,en;q=0.9" },
    credentials: "omit",
  });
  if (!res.ok) throw new Error(`Shopify ${res.status}`);
  return res.json();
}

function pickVariant(variants, title) {
  if (!title) return variants[0];
  return variants.find((v) => v.title === title) || variants[0];
}
