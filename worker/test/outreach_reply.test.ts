// test/outreach_reply.test.ts — hands-off reply triage.
import { describe, it, expect } from "vitest";
import { kvMock, envMock, makeCtx } from "./helpers";
import { classifyReply, handleOutreachReply, outreachSuppression } from "../src/outreach_reply";

const noDashes = (s: string) => !/[—–]/.test(s);

describe("reply classifier", () => {
  const cases: Array<[string, string, string]> = [
    ["", "Please unsubscribe me from this list", "optout"],
    ["", "take me off your list", "optout"],
    ["Re: grade", "How much does the audit cost?", "hot"],
    ["", "interested, can you send the link?", "hot"],
    ["", "Not interested, we're good thanks", "cold"],   // must beat the 'interested' substring
    ["Automatic reply", "I'm out of office until Monday", "ooo"],
    ["Undeliverable", "Mailer-Daemon: delivery failure, address not found", "bounce"],
    ["", "asdf qwer", "unknown"],
  ];
  for (const [subj, text, want] of cases) {
    it(`'${text.slice(0, 28)}' -> ${want}`, () => {
      expect(classifyReply(subj, text).intent).toBe(want);
    });
  }
});

describe("triage actions (barely-touch automation)", () => {
  function ctx(body: any) {
    const env = envMock({ KEYS: kvMock(), ADMIN_TOKEN: "t" });
    return { env, c: makeCtx({ env, body, query: { token: "t" } }) };
  }

  it("opt-out auto-suppresses (added to the suppression list)", async () => {
    const { env, c } = ctx({ from: "No@Acme.com", subject: "", text: "unsubscribe me please" });
    const res = await handleOutreachReply(c);
    expect(res.body.action).toBe("suppressed");
    expect(env.KEYS.__keys("optout:no@acme.com").length).toBe(1); // lowercased
  });

  it("cold / ooo / bounce are logged, not surfaced", async () => {
    for (const text of ["not interested", "out of office until July", "delivery failure undeliverable"]) {
      const { c } = ctx({ from: "x@y.com", text });
      const res = await handleOutreachReply(c);
      expect(res.body.action).toBe("logged");
    }
  });

  it("hot reply is surfaced with a pre-drafted, dash-free reply", async () => {
    const { env, c } = ctx({ from: "cto@bitrise.io", subject: "Re: grade", text: "how do we fix this? what does it cost?" });
    const res = await handleOutreachReply(c);
    expect(res.body.action).toBe("notified");
    expect(res.body.intent).toBe("hot");
    expect(typeof res.body.draft).toBe("string");
    expect(noDashes(res.body.draft)).toBe(true);
    expect(env.KEYS.__keys("reply:").length).toBe(1); // logged
  });

  it("unauthorized without the token", async () => {
    const env = envMock({ KEYS: kvMock(), ADMIN_TOKEN: "t" });
    const res = await handleOutreachReply(makeCtx({ env, body: { from: "a@b.com", text: "hi" }, query: {} }));
    expect(res.status).toBe(401);
  });

  it("suppression list endpoint returns opted-out emails", async () => {
    const env = envMock({ KEYS: kvMock(), ADMIN_TOKEN: "t" });
    await env.KEYS.put("optout:a@b.com", "1");
    await env.KEYS.put("optout:c@d.com", "1");
    const res = await outreachSuppression(makeCtx({ env, query: { token: "t" } }));
    expect(res.body.count).toBe(2);
    expect(res.body.emails).toContain("a@b.com");
  });
});
