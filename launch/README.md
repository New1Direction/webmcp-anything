# launch/

Launch-day assets for the public release of WebMCP Anything. All editable, version-tracked alongside the code.

## Files

| File | Purpose |
|---|---|
| [`show-hn.md`](./show-hn.md) | Show HN title + body. The single most important piece of copy. |
| [`twitter-thread.md`](./twitter-thread.md) | 4-tweet thread for X / LinkedIn. |
| [`demo-script.md`](./demo-script.md) | 45-second screen-recording script (beat-by-beat). |
| [`substack.md`](./substack.md) | ~1100-word launch post. |

## Launch-day sequence (~30 min window)

Do all of these on the same morning, in this order, with `wrangler tail` running in another terminal so you can watch traffic in real time:

1. **Flip repo to public.**
   ```bash
   gh repo edit New1Direction/webmcp-anything --visibility public --accept-visibility-change-consequences
   ```
2. **Post Show HN** with the copy from `show-hn.md`. Note the URL of your submission — you'll need it.
3. **Post the Twitter thread** with the copy from `twitter-thread.md`. Attach the demo video to the first tweet.
4. **Publish the Substack** with the copy from `substack.md`. Embed the demo video at the top.
5. **Be there for the next 2 hours.** Reply to every HN comment within ~10 min. Early comment velocity drives HN ranking more than any other signal.

## Timing rules

- **Day of the week:** Tuesday or Wednesday.
- **Time of day:** 8–10am US Pacific = 11am–1pm Eastern.
- **Never:** Friday after 2pm PT, weekends, US holidays.
- **Don't pre-announce.** Don't tweet "launching tomorrow" — it leaks the surprise and dilutes the moment.

## Pre-launch checklist

- [ ] Demo video recorded and uploaded (YouTube unlisted + Twitter native upload)
- [ ] `sk_live_` rotated in Stripe (the one leaked earlier in chat)
- [ ] Worker tail open in another terminal during the launch
- [ ] At least 3 friends warned to upvote within first 30 min (HN allows family/friends upvotes; mods care about *vote rings*, not enthusiasm)
- [ ] Stripe payments flowing — do one real test charge yourself + refund
- [ ] `/dashboard` flow tested end-to-end with the live `sk_live_`
- [ ] `/directory` has ≥ 20 entries so it doesn't look empty
- [ ] At least one adapter PR template ready in case someone offers
