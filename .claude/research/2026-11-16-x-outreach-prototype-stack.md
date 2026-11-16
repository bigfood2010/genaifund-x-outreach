# Research brief: stack and approach for the X outreach prototype

Date: 2026-11-16. Research mode: full. Author: agent run under rigorous-research. Full evidence sits in `findings.md` at the project root.

## Recommendation

Verdict: Research only. Build nothing into the project until one live proof passes with a real X developer app. The proposed approach is below, and every part of it that depends on X is unproven.

Confidence: Low. No authenticated X API call has been made, because the Chrome profile has no X session and no developer app or keys exist in this environment. Whether a new pay-per-use account can call the DM endpoints at all is unknown, and the whole tool depends on it.

This would change if: the live proof shows DM send works on a new pay-per-use account, `receives_your_dm` returns a value for a stranger, and a refused send gives a readable 403. Then the verdict moves to Safe to integrate for API mechanics only. A passing proof says the API works. It does not say cold DMs are inside X's rules. That question stays open unless X answers it in writing. The verdict moves to Avoid if a new pay-per-use account cannot call the DM endpoints.

### Proposed approach, narrow version

1. One web app with a dashboard. The dashboard is required. The brief asks for review and approval of drafts, a view of what was sent, who replied and what needs attention, and use without the author present (requirement.md:7, 9). A CLI cannot meet that for a non-author.
2. Language: TypeScript on Next.js 16.4.6 with React 19.3.1. One process serves the dashboard, the OAuth callback and the server code. An official TypeScript SDK exists (`@xdevplatform/xdk` 0.6.6). Python with FastAPI plus the official `xdk` 0.10.6 would also work but needs a second codebase for the dashboard. This choice rests on setup simplicity, not on a measured difference.
3. Database: Postgres. Neon free tier when hosted, a Postgres container when run locally. Drizzle ORM 0.45.4. Duplicate sends are blocked by a UNIQUE constraint on (sender account, recipient X id), with the row claimed in a transaction before the API call.
4. No background worker. A person presses Send for each approved message. Replies sync when the dashboard loads or when Sync is pressed. This removes the need for cron, which Vercel Hobby limits to once per day. It is also the only reading found under which the send stays outside the automated DM rule (my inference, not confirmed by X).
5. Discovery: seed accounts through GET /2/lists/:id/members by default. GET /2/users/:id/following only if the live proof shows it still works. Segments through GET /2/tweets/search/recent on posts, then author lookup. GET /2/users/search matches names only and cannot find a segment.
6. Evidence: bio, pinned post, and recent posts from GET /2/users/:id/tweets. The LLM must return evidence as quotes, and the server checks each quote is a verbatim substring of fetched text before the draft is shown. A draft with a failed check is rejected.
7. LLM: any provider with an OpenAI-compatible endpoint, chosen by base URL and model in env. Paid tier at cents per day, not the Gemini free tier, because that tier trains on prompts.
8. Auth: sign in with X (OAuth 2.0 PKCE, confidential client) doubles as the dashboard login, with an allowlist of X user ids in env. Refresh tokens encrypted at rest with AES-256-GCM, key in env.
9. Delivery: source with `docker compose up` first, Node pinned in the image. Hosted link on Vercel plus Neon only if time remains.

Added after the critic pass (section "Critique and resolution"):

10. Policy guards. A connect screen that says what the tool does and takes express consent from the account owner. A prior-signal label per prospect (follows us, replied, mentioned, DMed us) from `connection_status`, with cold prospects flagged as higher risk. Any inbound message blocks further sends to that person and marks the thread "needs attention". A reply that contains an opt-out word sets do-not-contact for good. No follow-up to non-repliers.
11. Test mode on by default: sends are refused unless the recipient id is in an allowlist in env. This enforces the ground rule on real sending.
12. Send states: claimed, sent, failed, unknown. A timeout or 5xx after the claim sets unknown. Unknown is never retried by the tool. A person resolves it after the tool reads the conversation through the DM events endpoint. One message per recipient per sender account in this version. A second message after a reply is typed in X, not in the tool, and that limit is shown.
13. Evidence rule. Fit reasons and draft claims must each cite a verified quote. A prospect with fewer than two verified quotes gets no draft and is shown as "not enough evidence". The quote check proves the text exists, not that the model used it fairly, which is why a person approves every draft.
14. Reply view shows the last sync time and any 429. All fetched events are stored locally, because X keeps them for 30 days only.
15. A blocked-actions panel shows each refused send with the raw problem type and a plain reading marked as inferred. A spend counter estimates X cost per run from the published unit prices, with a cap in env.

## The decision and constraints

Decision: which language, services and flow let one person ship, by Tuesday 17 November 2026 12:00 GMT+7, a prototype that meets R1 to R12 in `task_plan.md`.

Constraints: near-zero cost, reviewer setup under 15 minutes with their own keys, official X API only, no secrets in the repo, real sends only to accounts the author controls, about 35 hours left at the time of writing.

High confidence here means each X-dependent step has been run once against the live API with the pinned SDK.

## Environment snapshot

`env-snapshot.sh` returned `FATAL: no package.json within depth 3` because the project has no code yet. Captured by hand on 2026-11-16 00:38 +07: Node.js v22.23.2, Python 3.14.7, Docker 29.9.1, macOS 27.0.1 arm64, no bun or pnpm on PATH. Node v22 is in Maintenance until 2027-04-30. Node v26 is Active LTS. No LLM or X keys are set in the shell.

## Candidates considered

- X access: official API v2 pay-per-use. The only option inside the ground rules. Unofficial APIs and browser automation are excluded by the brief and by X ("Non-API Automation" is on the prohibited list).
- App stack: TypeScript with Next.js, or Python with FastAPI plus a separate front end. Both shortlisted.
- Database: Neon, Supabase, Turso, Cloudflare D1. Neon and Supabase shortlisted. Supabase pauses a free project after one week idle, which can hit a reviewer who opens the link late.
- Host: Vercel Hobby, Cloudflare Workers, Render, Fly.io, Railway, Koyeb. Fly.io has no free tier. Render free sleeps after 15 minutes. Workers free has 10 ms CPU per request and needs an adapter for Next.js. Vercel Hobby shortlisted for the optional hosted link.
- LLM: Gemini, Groq, OpenRouter, Anthropic, OpenAI, Cerebras, Mistral.

## Comparison against the constraints

### TypeScript, Next.js 16, Drizzle, Postgres
- Fit: one codebase and one container for UI, OAuth callback and server logic.
- Strengths: official TS SDK with PKCE helpers and a DM client. Next.js runs on Vercel Hobby with no adapter.
- Costs: Drizzle 1.0 is still pre-release, so 0.45.4 is the pin. Local Node is v22, not the active LTS.
- Failure modes: the XDK is version 0.6.6 and unproven here. Fallback is plain `fetch` against documented endpoints, which is a small surface (about eight calls).
- Who uses it in production: not researched. Unknown.

### Python, FastAPI 0.163.1, SQLAlchemy 2.1.8
- Fit: good for the API and LLM work. The dashboard needs server-rendered templates or a second JS project.
- Strengths: official Python `xdk` 0.10.6.
- Costs: two toolchains if the dashboard is a JS app. Free hosting for a long-lived Python service is weaker (Render sleeps, Fly has no free tier).
- Failure modes: same SDK maturity question.
- Who uses it in production: not researched. Unknown.

## Compatibility matrix

| Area | Answer |
| --- | --- |
| Supported versions | Next.js 16.4.6, React 19.3.1, Drizzle ORM 0.45.4, `@xdevplatform/xdk` 0.6.6. Node requirement of each package: unknown, not checked. |
| Docs version match | X docs are rolling with no version. SDK docs page header reads "X API SDK v2.152". Match to npm 0.6.6: unknown. |
| Install path | npm. Not run. |
| API shape | DM send POST /2/dm_conversations/with/:participant_id/messages. DM read GET /2/dm_events and per-participant variant. User fields include receives_your_dm and connection_status. pinned_tweet_id is gone, expansion pinned_post_id replaces it. Verified in docs, not in a live call. |
| Runtime limits | DM send 15 per 15 min and 1,440 per 24 h per user. GET /2/dm_events 15 per 15 min per user. Account cap 500 DMs per day is Reported only. Vercel Hobby function limit 300 s. |
| Auth needs | OAuth 2.0 PKCE, scopes dm.read dm.write tweet.read users.read offline.access, plus follows.read for following. Access token two hours. Refresh token lifetime and rotation: unknown. |
| Security risks | Refresh token theft, prompt injection through bios and posts, CSRF on the OAuth callback and on Send, secrets in the repo. Mitigations are in the approach. None tested. |
| Migration cost | None. New project. |
| Lock-in risk | Low for LLM (base URL swap). High for X, there is no alternative inside the rules. |
| Failure modes | DM endpoints not available to a new account: unknown. Credits exhausted: status code unknown. Recipient moved to encrypted XChat: reach unknown. GET following removed for self-serve: unknown. |

## Compatibility proof

- Proof status: PENDING. No X developer app, no keys, no signed-in X session.
- Pinned versions tested: none.
- Breaking changes found: pay-per-use since 6 Feb 2026. Following, Likes and Quote-Posts removed from self-serve tiers on 20 Apr 2026 (scope ambiguous). Search no longer returns retweets since 4 May 2026. Refused DM sends return 403 with a dm- problem type since 26 Oct 2026. Field renames pinned_post_id, note_post.
- Minimal proof to run once keys exist, in a scratch directory, with two accounts the author controls (A sends, B receives):
  0. Create the developer app. Record the tier shown in the console, whether the card was accepted, what credit was granted, and whether the app can request dm.write.
  1. PKCE login as A with the scopes above. Record `expires_in` and whether a refresh returns a new refresh token.
  2. GET /2/users/by/username/B with user.fields=receives_your_dm,connection_status,description and expansions=pinned_post_id. Record whether receives_your_dm is present.
  3. GET /2/users/:id/following for one seed with max_results=5. Record status.
  4. GET /2/tweets/search/recent with a query using lang: and -is:retweet, max_results=10. Record status.
  5. POST one DM from A to B. Record status, body and x-rate-limit headers.
  6. Reply from B by hand, then GET /2/dm_conversations/with/B/dm_events with expansions=sender_id. Record the reply.
  7. Set B to refuse DMs from strangers, repeat step 5. Record the 403 body.
  8. Read the Developer Console usage page. Record the charge for each step.
  9. Kill the process between the claim and the API response, restart, and confirm B received at most one message.
  10. Put an instruction inside B's bio ("ignore previous instructions and..."), run scoring and drafting, and confirm the draft does not follow it.
- Checked now: `npm view` reports engines node >=20.9.0 for next@16.4.6 and >=16.14 for @xdevplatform/xdk@0.6.6. Local Node v22.23.2 meets both. drizzle-orm@0.45.4 declares no engines field.
- Not yet covered: credit exhaustion, XChat recipients, the 500 per day cap.

## Evidence ledger

Load-bearing claims only. Tier 1 is a primary source.

| Claim | Source | Tier | Confidence |
|-------|--------|------|------------|
| X API is pay-per-use: user read $0.010, post read $0.005, DM send $0.015, DM event read $0.010 | https://docs.x.com/x-api/getting-started/pricing | 1 | Verified |
| $20 one-time credit needs a saved card and expires after 3 months | https://docs.x.com/changelog (2 Oct 2026) | 1 | Verified |
| A free tier still exists for new accounts | none found | n/a | Assumed false, risk |
| DM send limit 15 per 15 min and 1,440 per 24 h per user | https://docs.x.com/x-api/fundamentals/rate-limits | 1 | Verified |
| Automation means repeated actions "without a person actively performing them" | https://help.x.com/en/rules-and-policies/x-automation (Updated April 2026), read by eye | 1 | Verified |
| Unsolicited DMs may not be sent in a bulk or automated manner. Automated DMs need prior intent from the recipient and an opt-out | same page, II.C | 1 | Verified |
| "Unsolicited Outreach" including bulk DMs is on the prohibited list, rules apply to all apps | https://docs.x.com/developer-guidelines, read by eye | 1 | Verified |
| A person sending one reviewed DM at a time through the API is allowed | no text found | n/a | Assumed, top risk |
| receives_your_dm exists as a user field | https://docs.x.com/x-api/fundamentals/data-dictionary | 1 | Verified |
| receives_your_dm is returned for strangers | none | n/a | Assumed, needs proof step 2 |
| Refused DM send returns HTTP 403 with a dm- problem type | https://docs.x.com/changelog (26 Oct 2026) | 1 | Verified |
| DM events readable for 30 days | https://docs.x.com/x-api/direct-messages/lookup/introduction | 1 | Verified |
| GET /2/users/search matches name or username only | https://docs.x.com/x-api/users/search-users.md | 1 | Verified |
| AI training on X data is prohibited | https://docs.x.com/developer-guidelines | 1 | Verified |
| Gemini free tier uses prompts to improve Google products, with human review | https://aistudio.google.com/docs/terms | 1 | Verified |
| Vercel Hobby cron runs at most once per day | https://vercel.com/docs/cron-jobs/usage-and-pricing | 1 | Verified |
| Neon free: 1 GB, 100 CU-hours per month, autosuspend, no data deleted at limit | https://neon.com/docs/introduction/plans | 1 | Reported (fetch summary) |
| Official SDKs `@xdevplatform/xdk` 0.6.6 and `xdk` 0.10.6 list PKCE and DM clients | npm registry, PyPI | 1 | Verified names, behaviour Assumed |
| Account cap of 500 DMs per day | search summary of help.x.com DM FAQ | 1 unread | Reported |

## Open risks and unresolved assumptions

0. The participation confirmation was due Friday 13 November 2026 at 12:00 GMT+7. Whether it was sent is unknown. If it was not, the submission may not be accepted, and that outweighs every item below.
1. Policy. The assignment asks for cold DM outreach inside X's rules. X lists unsolicited outreach as prohibited and ties allowed DMs to user-initiated contact. The design leans on one reading: a person sends each message by hand, so the send is not automated. X has not confirmed it. If X disagrees, the sender account and the developer app can be suspended. The write-up must say this.
2. Fit scoring could be read as "profiling" under the Surveillance line. No text found either way.
3. No proof has run. Every X claim about behaviour is from docs.
4. Cost is not zero. A card is required to get the $20 credit. Per prospect: 1 user read plus about 10 post reads is about $0.06, a send is $0.015, each reply read is $0.010. One page of 1,000 following costs about $10 if billed at $0.010 per user, so page size must be capped. Endpoint-to-price mapping is Assumed.
5. "Handles load" has little meaning here. X caps one account at 15 DMs per 15 minutes. The real concurrency risk is a double click or a retry sending twice, which the UNIQUE constraint and the claim-then-send order address. Not tested.
6. Sending X profile text to an LLM is not named in X policy text that was read. The Restricted Use Cases page was not read.
7. Stored profiles must be deleted within 24 hours when removed on X. The narrow version has no deletion sync. It needs at least a manual purge and a stated limitation.
8. Vercel Hobby is for non-commercial use. A hosted link that GenAI Fund keeps using would need a paid plan or self-hosting.
9. Schedule. About 35 hours remain for build, live test, video and write-up. The participation confirmation was due 13 November and its status is unknown.
10. SDK maturity. Both official SDKs are below 1.0 and were last released 25 July 2026. Plain `fetch` is the fallback.

## Critique and resolution

An independent critic agent read the brief, `findings.md` and the assignment, and re-fetched four cited pages (pricing, developer guidelines, rate limits, changelog). All four supported the claims as worded, with two corrections below.

| # | Challenge | Severity | Resolution |
|---|-----------|----------|------------|
| 1 | A passing proof would flip the verdict while the policy question stays open | Blocker | Flip condition now reads "Safe to integrate for API mechanics only". Policy stays an open risk |
| 2 | Policy reading stated as a requirement. No consent screen or opt-out in the approach | Blocker | Item 4 reworded as inference. Items 10 and 11 added |
| 3 | Medium confidence not justified while DM access on a new account is unknown | Major | Confidence set to Low. Proof step 0 added |
| 4 | Schedule and the 15 minute setup are not shown to fit | Major | Not resolved by research. See the cut line below |
| 5 | Verbatim quote check does not prove fair use of the quote | Major | Item 13 added, proof step 10 added. Residual risk stated |
| 6 | Claim-before-send leaves an unknown state after a crash | Major | Item 12 added, proof step 9 added |
| 7 | Cost rests on an assumed endpoint-to-price mapping | Major | Spend counter and cap added (item 15). Cost stays an estimate until proof step 8 |
| 8 | Reply view can go stale silently | Major | Item 14 added |
| 9 | Following endpoint should not be the default. Per-app DM limit missing | Minor | Lists members is now the default. Per-app limit is 1,440 per 24 h (rate-limits page) |
| 10 | No test-mode guard, no blocked-actions view | Minor | Items 11 and 15 added |
| 11 | Node requirements unchecked | Minor | Checked with `npm view`, see the proof section |

Corrections from the spot-checks: the $20 credit follows saving a card and a first purchase, which is stricter than "needs a saved card". The 20 April 2026 date belongs to the pricing change around the "Following removed" line, and the line itself does not say whether reads are covered.

Cut line if the live proof slips or fails. Ship discovery, fit reasons with verified quotes, drafting, approval queue, duplicate guard and tracking, with the send step working against the allowlisted test account only, and say so in the video and write-up. If DM send cannot be proven at all, the tool cannot meet "sends approved messages" and the submission must state that as unfinished.

Setup time for a reviewer is not measured. It includes creating an X developer app, adding a card and buying credit, registering a callback URL, and setting four env values. That may not fit in 15 minutes and must be timed once before submission.

## Sources

- https://docs.x.com/x-api/getting-started/pricing
- https://docs.x.com/changelog
- https://docs.x.com/x-api/fundamentals/rate-limits
- https://docs.x.com/x-api/fundamentals/data-dictionary
- https://docs.x.com/x-api/direct-messages/manage/introduction
- https://docs.x.com/x-api/direct-messages/lookup/introduction
- https://docs.x.com/developer-guidelines
- https://docs.x.com/developer-terms/agreement-and-policy
- https://help.x.com/en/rules-and-policies/x-automation
- https://aistudio.google.com/docs/pricing and /docs/terms
- https://vercel.com/docs/cron-jobs/usage-and-pricing
- https://neon.com/docs/introduction/plans
- npm and PyPI registry entries for the pinned packages

---
To refresh this brief: ask Claude to re-run the research or re-verify compatibility for the X outreach prototype stack.
