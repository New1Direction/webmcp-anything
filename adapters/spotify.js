export const ID = "spotify";

const URL_RE = /^https?:\/\/open\.spotify\.com\/track\/([A-Za-z0-9]{22})/;

const CHROME_UA =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36";

export function detect({ url, jsonld, meta }) {
    const m = url.match(URL_RE);
    if (!m) return null;
    const id = m[1];
    return {
        adapter: ID,
        kind: "track",
        id,
        url,
        meta: meta || {},
        jsonld: jsonld || [],
    };
}

export async function extract(ctx) {
    const tools = [];
    const product = { type: "track", id: ctx.id, url: ctx.url };

    const ogTitle = ctx.meta["og:title"] || "";
    const ogDescription = ctx.meta["og:description"] || "";
    const ogImage = ctx.meta["og:image"] || null;
    const ogAudio = ctx.meta["og:audio"] || null;
    const musicDuration = ctx.meta["music:duration"] || null;
    const musicMusician = ctx.meta["music:musician"] || null;

    let trackName = ogTitle;
    let artists = [];
    if (ogTitle.includes(" - ")) {
        const parts = ogTitle.split(" - ");
        trackName = parts[0].trim();
        artists = parts.slice(1).map((a) => a.trim());
    } else if (ogTitle.includes(" · ")) {
        const parts = ogTitle.split(" · ");
        trackName = parts[0].trim();
        artists = parts.slice(1).map((a) => a.trim());
    }

    if (musicMusician) {
        const musicianNames = Array.isArray(musicMusician) ? musicMusician : [musicMusician];
        for (const m of musicianNames) {
            const name = typeof m === "string" ? m : m?.name;
            if (name && !artists.includes(name)) artists.push(name);
        }
    }

    const trackInfo = {
        name: trackName || null,
        artists: artists.length ? artists : null,
        album: ogDescription ? ogDescription.replace(/^from the album /i, "").replace(/\.$/, "") : null,
        duration_seconds: musicDuration ? Number(musicDuration) : null,
        preview_url: ogAudio || null,
        image: ogImage,
        spotify_url: ctx.url,
    };
    product.name = trackInfo.name;
    product.artists = trackInfo.artists;

    tools.push({
        name: "get_track",
        description: `Get track details for "${trackInfo.name || ctx.id}"${trackInfo.artists ? ` by ${trackInfo.artists.join(", ")}` : ""}.`,
        inputSchema: { type: "object", properties: {}, required: [] },
        result: trackInfo,
    });

    if (ogAudio) {
        tools.push({
            name: "get_preview",
            description: `Get the 30-second preview URL for "${trackInfo.name || ctx.id}".`,
            inputSchema: { type: "object", properties: {}, required: [] },
            result: { preview_url: ogAudio, track: trackInfo.name },
        });
    }

    tools.push({
        name: "view_track",
        description: `Return a direct link to "${trackInfo.name || ctx.id}" on Spotify.`,
        inputSchema: { type: "object", properties: {}, required: [] },
        result: { url: ctx.url, name: trackInfo.name },
    });

    return { product, variants: [], tools };
}

export const actions = {};
