// {{ADAPTER_NAME}} adapter — turn {{SITE}} product pages into agent tools.
//
// Detection signal: {{WHAT URL PATTERN OR PAGE MARKER YOU LOOK FOR}}
// Extraction route: {{API ENDPOINT, EMBEDDED JSON, OR HTML PARSE}}
//
// Copy this file, rename to `<id>.js`, and fill in the TODOs. Read
// ../CONTRACT.md for the full interface spec.

export const ID = "TODO_id"; // short lowercase identifier, e.g. "etsy"

const URL_RE = /TODO/; // URL pattern that uniquely identifies this site's pages

const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36";

/**
 * Synchronous, side-effect-free. Return `null` if this adapter doesn't apply.
 * Return any object useful to extract() if it does.
 */
export function detect({ url, html, jsonld, meta, title }) {
  if (!URL_RE.test(url)) return null;
  // TODO: parse identifier(s) out of the URL or DOM hints.
  // const m = url.match(URL_RE);
  // return { adapter: ID, productId: m[1], apiUrl: `...` };
  return null;
}

/**
 * Network calls allowed here. Return shape: { product, variants?, tools }.
 */
export async function extract(ctx) {
  // TODO: hit the data source.
  // const res = await fetch(ctx.apiUrl, {
  //   headers: { "user-agent": CHROME_UA, accept: "application/json" },
  //   credentials: "omit",
  // });
  // if (!res.ok) throw new Error(`{{site}} fetch failed: ${res.status}`);
  // const data = await res.json();

  return {
    product: {
      // TODO: fill in real product fields
      title: "TODO",
    },
    variants: [
      // TODO: map source variants → { id, price?, available?, ... }
    ],
    tools: [
      {
        name: "get_price",
        description: "Current displayed price.",
        result: "$TODO",
      },
      // {
      //   name: "add_to_cart",
      //   description: "Add this product to the cart.",
      //   action: { kind: "TODO_id_add", productId: ctx.productId },
      // },
    ],
  };
}

/**
 * Optional. Handlers for any `action.kind` returned in tools above.
 * Remove this export entirely if your adapter is read-only.
 */
export const actions = {
  // TODO_id_add: async ({ productId, args }) => {
  //   const res = await fetch(`https://{{site}}/cart/add`, {
  //     method: "POST",
  //     headers: { "content-type": "application/json", "user-agent": CHROME_UA },
  //     body: JSON.stringify({ id: productId, quantity: args.quantity ?? 1 }),
  //   });
  //   return await res.json();
  // },
};
