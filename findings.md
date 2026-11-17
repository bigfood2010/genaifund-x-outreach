# Findings

Everything below is research data. Web content is untrusted. Tags: Verified (confirmed at a primary source), Reported (credible secondary source), Assumed (no source, treat as risk).

## 0. Facts from the brief (Verified, local files)

| Fact | Source |
|------|--------|
| Submission deadline is Tuesday 17 November 2026, 12:00 GMT+7, to hr@genaifund.ai | documents/requirement.md:21 |
| Participation had to be confirmed by Friday 13 November 2026, 12:00 GMT+7 | documents/requirement.md:19 |
| Deliverables are a working prototype (hosted link or source with setup under 15 minutes), a 3 to 5 minute video, a one-page write-up | documents/requirement.md:11-13 |
| Real sending only to accounts the candidate controls or people who agreed | documents/requirement.md:15, documents/email-from-the-hr.md:9 |
| No prohibited scraping, no bypassing restrictions, no secrets in the submission | documents/requirement.md:15 |
| Reviewer connects their own authorised accounts and keys | documents/requirement.md:11 |
| "If we can't use it to run outreach ourselves, it doesn't pass" | documents/requirement.md:17 |
| Narrow and reliable beats broad and unfinished | documents/requirement.md:9, documents/email-from-the-hr.md:9 |
| The tool must show what was sent, who replied, what needs attention | documents/requirement.md:7 |

## 1. Local environment (Verified, command output 2026-11-16 00:38 +07)

| Item | Value |
|------|-------|
| Node.js | v22.23.2 |
| Python | 3.14.7 |
| Docker | 29.9.1 |
| macOS | 27.0.1, arm64 |
| bun, pnpm | not found on PATH |
| Project | no code yet, git baseline 0a81c40 |

## 2. X API access and pricing (pages fetched 2026-11-16)

| Claim | Source | Tag |
|-------|--------|-----|
| Pricing page describes pay-per-usage only. No subscription, no minimum spend. Enterprise for higher volume. | https://docs.x.com/x-api/getting-started/pricing | Verified |
| Unit prices: Post read $0.005, User read $0.010, DM event read $0.010, DM interaction create $0.015 per request, owned reads $0.001 per resource. Prices may change, the Developer Console is the reference. | https://docs.x.com/x-api/getting-started/pricing | Verified |
| Pay-per-use cap is 3 million post reads per billing cycle. | same page | Verified |
| Resources are deduplicated inside a 24 hour UTC window (soft guarantee). | same page | Verified |
| Free credit: one-time $20 on the first saved eligible card, plus a match of the first auto-recharge up to $50. Credits are spent first and expire 3 months after grant. A saved card is required. | https://docs.x.com/changelog (2 Oct 2026) and pricing page | Verified |
| Pay-per-use launched 6 Feb 2026. Changelog says Basic and Pro plans remain available. | https://docs.x.com/changelog (6 Feb 2026) | Verified |
| Free tier closed to new projects on 6 Feb 2026 and Basic closed to new signups on 1 Jun 2026. Blogs conflict with the changelog. | roboin.io article and other blogs | Reported |
| Effective 20 Apr 2026: "Following, Likes, and Quote-Posts via the API have been removed from all self-serve tiers." POST /2/tweets costs $0.015, a post with a URL $0.20. | https://docs.x.com/changelog (16 Apr 2026) | Verified |
| DM send (POST /2/dm_conversations/with/:participant_id/messages and POST /2/dm_conversations): per user 15 per 15 min and 1,440 per 24 h, per app 1,440 per 24 h. | https://docs.x.com/x-api/fundamentals/rate-limits | Verified |
| GET /2/dm_events user 15 per 15 min. GET /2/users/by app 300, user 900 per 15 min. GET /2/users/:id/tweets app 10,000, user 900 per 15 min. GET /2/tweets/search/recent app 450, user 300 per 15 min. GET /2/users/:id/following 300 per 15 min. Limits are not split by tier. | same page | Verified |
| DM endpoints with OAuth 2.0 PKCE need scopes dm.read, dm.write, tweet.read, users.read. No tier restriction is stated. | https://docs.x.com/x-api/direct-messages/manage/quickstart and /manage/introduction | Verified |
| DM lookup returns events up to 30 days back, user access token required. | https://docs.x.com/x-api/direct-messages/lookup/introduction | Verified |
| Since 26 Oct 2026 a refused Create DM request returns HTTP 403 with a problem type URI starting dm-, or about:blank. | https://docs.x.com/changelog (26 Oct 2026) | Verified |
| OAuth 2.0 access token lasts two hours. offline.access gives a refresh token, exchanged at https://api.x.com/2/oauth2/token. Confidential clients use a Basic auth header. | https://docs.x.com/fundamentals/authentication/oauth-2-0/authorization-code and /user-access-token | Verified |
| When credits run out, requests are blocked until credits are added. A spending limit blocks until the next cycle. | pricing page | Verified |
| Rate limit headers are x-rate-limit-limit, x-rate-limit-remaining, x-rate-limit-reset. | https://docs.x.com/x-api/fundamentals/response-codes-and-errors | Verified |

Unknowns:
- Whether pay-per-use is the default for a new developer account, and whether a Free tier still exists. Not stated officially.
- Whether DM endpoints work on a new pay-per-use account. Implied by the unit price, not stated. Assumed.
- Whether GET /2/users/:id/following still works on self-serve. The rate-limit table lists it, the April changelog says Following was removed. Conflict, unresolved.
- Refresh token lifetime and rotation. Not documented on fetched pages.
- HTTP status and body when credits are exhausted. Not documented.
- Minimum credit purchase. Not on fetched pages.
- Whether DM event read is billed per event or per request. "Per resource" suggests per event. Assumed.
- console.x.com and devcommunity staff posts were not read. Last 15,456 characters of the changelog were not read.

## 3. X DM policy and mechanics (pages fetched 2026-11-16)

Caveat: help.x.com pages returned HTTP 402 to the fetch tool. Automation rules, platform manipulation policy and the DM FAQ were not read directly. Quotes from docs.x.com passed through a summarising model and are not byte-verified. A manual browser read is still owed.

| Claim | Source | Tag |
|-------|--------|-----|
| Developer Guidelines list as prohibited "Unsolicited Outreach": "Auto-replies to random users, bulk DMs, uninvited @mentions." | https://docs.x.com/developer-guidelines | Verified (summary) |
| For automated accounts, DMs are allowed "Only after user DMs you first. Easy opt-out required." | same page | Verified (summary) |
| "If a user says 'stop,' stop." The example "App bulk-DMs users about a product launch" is marked spam. | same page | Verified (summary) |
| Automation rules: "You may not send automated posts or Direct Messages that are spam." | search summary of https://help.x.com/en/rules-and-policies/x-automation, page unread | Reported |
| Platform manipulation policy bans bulk unsolicited DMs and identical DMs. | search summary of https://help.x.com/rules-and-policies/platform-manipulation, page unread | Reported |
| No text read defines whether a human-approved, one-by-one cold DM sent through the API counts as "automated" or "bulk". | absence of evidence | Assumed, open risk |
| Account cap is 500 DMs sent per day. | search summary of https://help.x.com/en/using-x/direct-message-faqs, page unread | Reported |
| Classic 403 cause: recipient DM settings block unknown senders, or the recipient blocked the sender. | https://docs.x.com/x-api/direct-messages/manage/integrate | Verified |
| Problem types exist: dm-sender-not-verified, dm-sender-phone-required, message-request-not-supported, dm-sender-declined-dms, dm-recipient-blocks-sender. Names only, meanings inferred. | https://docs.x.com/x-api/direct-messages/create-dm-message-by-participant-id.md | Verified names, meanings Assumed |
| Refused send returns HTTP 403 with type https://api.x.com/2/problems/dm-recipient-not-accepting. | https://opentweet.io/answers/x-dm-api-403-refused (third party). Official changelog confirms 403 (section 2). | Reported |
| user.fields has receives_your_dm (boolean, "will receive the authenticated user's DM") and connection_status. Omitted when undeterminable. No tier gate stated. | https://docs.x.com/x-api/fundamentals/data-dictionary | Verified |
| A separate encrypted XChat API exists at /2/chat/conversations/{id}/messages. Legacy dm_conversations endpoints are still documented, no deprecation notice. | https://docs.x.com/xchat/introduction, https://docs.x.com/x-api/direct-messages/manage/migrate | Verified |
| Reply read endpoints: GET /2/dm_events, GET /2/dm_conversations/with/:participant_id/dm_events. 30 day retention. sender_id is an expansion, not a field. event_types include MessageCreate. max_results 1 to 100. | https://docs.x.com/x-api/direct-messages/lookup/introduction and get-dm-events-for-a-dm-conversation | Verified |
| 429 body is {"errors":[{"code":88,"message":"Rate limit exceeded"}]}. | https://docs.x.com/x-api/fundamentals/rate-limits | Verified |
| Webhooks: X Activity API delivers dm.received, dm.sent, dm.read, billed $0.010 per dm.received. Account Activity API is on Enterprise and Pay Per Use. | https://docs.x.com/x-api/activity/introduction, https://docs.x.com/x-api/account-activity/quickstart | Verified |

### 3a. Automation rules, read by eye in Chrome 2026-11-16 (page says "Updated April 2026")

Source: https://help.x.com/en/rules-and-policies/x-automation. All rows Verified by direct read. Paraphrased unless quoted.

| Claim | Section |
|-------|---------|
| Automation is defined as accounts or apps taking repeated actions "without a person actively performing them". | intro |
| Ground rule Don't: spam or bother users, or send them unsolicited messages. | I |
| Ground rule Don't: abuse the API or circumvent rate limits. Non-API automation such as scripting the website can bring permanent suspension. | I |
| Unsolicited DMs may not be sent in a bulk or automated manner. | II.C |
| Automated DMs are allowed only when the recipient asked for or clearly signalled intent to be contacted by DM beforehand, and an easy opt-out exists and is honoured. | II.C |
| A recipient being technically able to receive a DM (open DMs, follows you, existing thread) is not consent to automated DMs. | II.C |
| After a user-initiated interaction ends, no follow-up DMs without permission. | II.C |
| An OAuth grant alone is not consent to automated actions through that user's account. The app must describe the automated actions, get express consent, and honour opt-out. | II.A |
| No duplicative or substantially similar content across posts. Spam rules apply to DMs too. | I.A |
| AI reply bots (public replies) need prior written approval from X. The page states this for replies, not for DMs. | II.B.3 |
| Automated following in bulk and automated likes are not allowed. | II.D |

What this means for the design (my inference from the text above, the page does not rule on this exact case):
- A send that a person triggers one message at a time, after reading and approving that message, is not "without a person actively performing" it. That is the only reading under which cold DMs through the API stay outside II.C.
- A background queue that drips approved messages hours later moves toward "automated". A scheduled auto-follow-up to non-repliers is plainly automated and unsolicited, so it is out.
- The connect screen must describe what the tool does and take express consent from the account owner (II.A).
- The tool should prefer prospects with a prior signal (replied to us, mentioned us, DMed us, follows us) and label cold prospects as higher risk.
- X has not confirmed this reading. Risk stays open.

### 3b. Developer Guidelines, read by eye in Chrome 2026-11-16

Source: https://docs.x.com/developer-guidelines. All rows Verified by direct read of page text and two screenshots. The page shows no date.

| Claim | Where on page |
|-------|---------------|
| Scenario rules "apply to all apps", bots, web integrations, dashboards, "any other tool that uses the X API". | Common scenarios intro |
| DM scenarios allowed: app responds to DMs, support asks "How can I help?" after the user DMs. Reason given is user-initiated. | Direct Messages tab |
| DM scenarios not allowed: app auto-DMs new followers ("Unsolicited, even to followers"), app bulk-DMs users about a product launch ("Spam"). | Direct Messages tab |
| The tab has no scenario for a person sending one reviewed DM at a time to a stranger through an app. | Direct Messages tab |
| Prohibited list has "Unsolicited Outreach" with examples auto-replies to random users, bulk DMs, uninvited @mentions. Page says no exceptions. | Prohibited activities |
| Automated actions table, Send DMs: "Only after user DMs you first. Easy opt-out required." The section says it applies to automated accounts (bots). | Automation rules |
| Quick check asks "User Initiated?", "Easy Opt-Out?", "Official API Only?", "Within Limits?". A "no" means the app likely violates policy. | Quick check |
| Surveillance is prohibited: profiling, tracking or monitoring users without consent. | Prohibited activities |
| No inferring or storing health, financial, political, racial, religious, sexual, union or criminal attributes. | Sensitive data |
| Off-X matching without consent is limited to public X data and data the user gave. | Off-X matching |
| AI-generated replies need prior approval from X through the Policy Support form. The accordion speaks of replies and mentions, not DMs. | Gray areas |
| "Commercial use: Requires appropriate paid tier; free tier is non-commercial only". | Special use cases |
| X content must be deleted within 24 hours when deleted on X or on request, and within 10 business days after API access ends. | Content deletion |
| AI/ML training on X data is prohibited except for Grok. | Technical restrictions |

Highest policy risk, stated plainly: the assignment asks for cold DM outreach "within X's rules", while X's own pages list unsolicited outreach as prohibited and tie allowed DMs to user-initiated contact. The only compliant reading found is a tool where a person sends each message by hand and prospects with a prior signal come first. X has not confirmed that reading. "Profiling" could also be read to cover fit scoring. Both stay open risks and belong in the write-up.

Unknowns:
- Exact wording of the platform manipulation page and the DM FAQ (still unread).
- Whether X treats approved one-by-one cold DMs through the API as allowed. The closest official line ("Only after user DMs you first") points against it for automated accounts.
- Whether a non-Premium account can DM a non-follower.
- Whether receives_your_dm is populated for strangers. Needs a live call.
- Whether a legacy DM send reaches a recipient who moved to XChat.
- Developer Agreement at developer.x.com/en/developer-terms was not read (section 4 used docs.x.com/developer-terms/agreement-and-policy).

## 4. X discovery endpoints and SDKs (pages fetched 2026-11-16)

Caveat: fetch results are model summaries of the pages. "Page does not state" means the summary found nothing.

| Claim | Source | Tag |
|-------|--------|-----|
| Read prices per resource returned: Posts $0.005, Users $0.010, Following/Followers $0.010, Lists $0.005, Likes $0.001, owned reads $0.001. A spend cap per cycle can be set. | https://docs.x.com/x-api/getting-started/pricing | Verified |
| Rate limits per 15 min (app / user): following 300/300, followers 300/300, lists/:id/members 900/900, liking_users 75/75, retweeted_by 75/75, search/recent 450/300, users/search 300/900, users/:id/tweets 10,000/900. | https://docs.x.com/x-api/fundamentals/rate-limits | Verified |
| GET /2/users/:id/following and /followers: max_results 1 to 1000, bearer or user token, scope follows.read. No tier restriction on the page. | https://docs.x.com/x-api/users/get-following.md | Verified |
| GET /2/lists/:id/members: max_results 1 to 100, bearer accepted. | https://docs.x.com/x-api/lists/get-list-members.md | Verified |
| GET /2/tweets/search/recent: max_results 10 to 100, 7 day window, query length 512 chars self-serve (endpoint page says up to 4,096, conflict). | search-recent-posts.md, build-a-query.md | Verified, conflict noted |
| Operators lang:, is:retweet, has:links, place_country:, from:, context: are documented with no access label. | https://docs.x.com/x-api/posts/search/integrate/operators.md | Verified silent, tier UNKNOWN |
| Since 4 May 2026 keyword search no longer returns retweets. | https://docs.x.com/changelog | Verified |
| GET /2/users/search matches name or @username only, 1 to 50 chars. It is not a bio or keyword search. User token required, no bearer. | https://docs.x.com/x-api/users/search-users.md | Verified |
| user.fields has description, entities, location, url, public_metrics, verified, verified_type, protected, created_at, receives_your_dm, receives_your_chat, connection_status. pinned_tweet_id and most_recent_tweet_id are gone. Use expansions pinned_post_id and most_recent_post_id. | https://docs.x.com/x-api/users/get-user-by-username.md | Verified |
| post.fields has created_at, public_metrics, entities, context_annotations, lang, text, note_post (renamed from note_tweet). | search-recent-posts.md | Verified |
| GET /2/users/:id/tweets: max_results 5 to 100, exclude=replies,retweets, bearer accepted. | https://docs.x.com/x-api/users/get-posts.md | Verified |
| Official Python SDK `xdk` 0.10.6 (2026-07-25), has OAuth2PKCEAuth and DirectMessagesClient. | https://pypi.org/pypi/xdk/json, https://docs.x.com/xdks/python/llms.txt | Verified |
| Official TypeScript SDK `@xdevplatform/xdk` 0.6.6 (2026-07-25), PKCE helpers and DirectMessagesClient. | https://registry.npmjs.org/@xdevplatform/xdk | Verified |
| Community `twitter-api-v2` 1.31.0 (2026-10-25), has sendDmToParticipant, listDmEvents, listDmEventsWithParticipant. README says much API work "has been shelved". | GitHub releases and doc/v2.md of PLhery/node-twitter-api-v2 | Verified |
| Developer Policy: stored X content must be kept current. Deleted, private or suspended content must be removed within 24 h of a request. Location data may not be cached apart from a Post. Rate limits may not be circumvented. | https://docs.x.com/developer-terms/agreement-and-policy | Verified |
| Developer Guidelines: "Non-API automation (scraping, browser automation) results in permanent suspension". Storing X data to train AI models is prohibited. | https://docs.x.com/developer-guidelines.md | Verified |

Unknowns:
- Whether the April 2026 removal of "Following" covers GET /following or only the write. Ambiguous wording. Needs a live call.
- Which search operators work on pay-per-use.
- Which price applies to each endpoint. The pricing page lists resource types, not endpoints.
- Whether the SDKs work end to end for PKCE and DM. Only class and method names were read, no code was run.
- Whether storing profiles for outreach is a restricted use case. The Restricted Use Cases page was not read.

Read against our needs (my inference): users/search cannot find a segment, so segment discovery must go through search/recent on posts, then author lookup. Sending evidence text to a third-party LLM for drafting is inference, not training, but the "no AI training" rule means the LLM provider must not train on it.

## 5. LLM free tiers (pages fetched 2026-11-16)

| Claim | Source | Tag |
|-------|--------|-----|
| Gemini API has a free tier for Gemini 4 Hydrogen, 3.8 Flash, 3.6 Flash, 3.5 Flash-Lite, 3.1 Flash-Lite, 2.5 Flash, 2.5 Flash-Lite. New accounts start on the free tier. | https://aistudio.google.com/docs/pricing, /docs/billing | Verified |
| Gemini free tier data is "Used to improve our products", human reviewers may read it, and the terms say not to submit personal information. | https://aistudio.google.com/docs/pricing, /docs/terms | Verified |
| Gemini per-model free RPM and RPD are not in the public docs. They show only inside AI Studio after login. | https://aistudio.google.com/docs/rate-limits | Verified absent, numbers UNKNOWN |
| Vietnam and Singapore are supported regions for the Gemini API. | https://aistudio.google.com/docs/available-regions | Verified |
| Gemini supports JSON schema output and an OpenAI-compatible endpoint at https://generativelanguage.googleapis.com/v1beta/openai/. | /docs/structured-output, /docs/openai | Verified |
| Gemini paid prices per 1M tokens: 2.5 Flash-Lite $0.10 in, $0.40 out. 3.1 Flash-Lite $0.25, $1.50. | /docs/pricing | Verified |
| Groq table (labelled Developer plan base limits): openai/gpt-oss-120b and gpt-oss-20b 30 RPM, 1,000 RPD, 8,000 TPM, 200,000 TPD. Free plan values sit in the console only. | https://console.groq.com/docs/rate-limits | Verified table, free plan UNKNOWN |
| Groq supports strict json_schema on gpt-oss-20b and gpt-oss-120b. Base URL https://api.groq.com/openai/v1. | https://console.groq.com/docs/structured-outputs | Verified |
| OpenRouter `:free` models: 20 RPM, 50 requests per day below 10 credits bought, 1,000 per day at 10 credits or more. FAQ calls free models "usually not suitable for production use". | https://openrouter.ai/docs/api-reference/limits, /docs/faq | Verified |
| Anthropic: no signup credit found on fetched pages. Claude Haiku 5.5 "From $0.10" input and "From $0.50" output per MTok, Haiku 4.5 $1 and $5. Structured outputs are GA. | https://platform.claude.com/docs/en/models/overview, /build-with-claude/structured-outputs | Verified prices, credit UNKNOWN |
| OpenAI: minimum prepaid purchase $5, no general signup credit. gpt-5-nano $0.05 in, $0.40 out per 1M. Structured outputs supported. | https://developers.openai.com/api/docs/pricing. Minimum from a search snippet. | Verified prices, minimum Reported |
| Cerebras: $5 free trial credit that expires after 30 days. gpt-oss-120b 5 RPM, 1M tokens per day. JSON schema supported. Base URL https://api.cerebras.ai/v1. | https://inference-docs.cerebras.ai/support/rate-limits | Verified |
| Mistral has a free Experiment mode. Numeric limits are only in its console. | https://help.mistral.ai/en/articles/698531 | Verified existence, numbers UNKNOWN |

Unknowns:
- Gemini free RPM and RPD per model.
- Groq free plan limits and Groq data terms.
- Whether any provider's terms restrict prompts that contain X user content.
- Data terms of Groq, Cerebras, OpenRouter upstreams were not read.

Read against our needs (my inference): the Gemini free tier trains on prompts and has human review. X Developer Guidelines forbid storing X data to train AI models (section 4). Sending X profile text to the Gemini free tier is a conflict risk. A paid-tier key at cents per day avoids it. Demo cost at 200 calls per day of 4k input tokens on gpt-5-nano is about 200 x 4,000 / 1,000,000 x $0.05 = $0.04 per day input.

## 6. Hosting, database, jobs, auth, versions (pages fetched 2026-11-16)

"Reported" here means the number came through a fetch summary of the vendor page, not a direct read of the page body.

| Claim | Source | Tag |
|-------|--------|-----|
| Vercel Hobby function max duration 300 s. | https://vercel.com/docs/functions/configuring-functions/duration (2026-08-24) | Verified |
| Vercel Hobby cron runs at most once per day, precision within the hour. Sub-daily expressions fail the deploy. Cron Jobs are marked legacy, moving to "Schedules". | https://vercel.com/docs/cron-jobs/usage-and-pricing (2026-07-15) | Verified |
| Vercel ToS section 4: Hobby is for "personal or non-commercial use". Whether an internal outreach tool counts as commercial is not defined. | https://vercel.com/legal/terms | Verified quote, applicability Assumed |
| Vercel Hobby monthly: 1,000,000 invocations, 4 CPU hours, 100 GB transfer. | https://vercel.com/docs/plans/hobby (2026-11-12) | Verified |
| Vercel env vars have Config and Secret types. Encryption at rest is not stated on the page. | https://vercel.com/docs/environment-variables/sensitive-environment-variables | Verified types, encryption UNKNOWN |
| Cloudflare Workers Free: 100,000 requests per day, 10 ms CPU per request, 5 Cron Triggers per account. | https://developers.cloudflare.com/workers/platform/limits/ | Reported |
| Cloudflare D1 Free: 5,000,000 rows read and 100,000 rows written per day, 5 GB. Queues Free 10,000 operations per day. | https://developers.cloudflare.com/d1/platform/pricing/ | Reported |
| Next.js on Workers needs @opennextjs/cloudflare. Supports Next 16 and latest Next 15. Worker size cap 3 MiB gzip on Free. | https://opennext.js.org/cloudflare | Reported |
| Render Free web service spins down after 15 min idle, wake about 1 min, 750 hours per month. Free Postgres expires 30 days after creation. Cron job has a $1 monthly minimum. | https://render.com/docs/free, https://render.com/docs/cronjobs | Reported |
| Fly.io has no free tier. New accounts get $1 trial credit for 7 days. | https://docs.fly.io/about/pricing | Reported |
| Railway gives a one-time $5 trial credit, then $1 per month on Free. | https://docs.railway.com/reference/pricing/free-trial | Reported |
| Koyeb has one free web service (512 MB, 0.1 vCPU) and one free Postgres with 5 hours active time. Card required. | https://www.koyeb.com/docs/faqs/pricing | Reported |
| Neon Free: 1 GB per project, 100 CU-hours per project per month, autosuspend after 5 min, limits suspend compute and delete no data. | https://neon.com/docs/introduction/plans | Reported |
| Supabase Free: 500 MB database, 50,000 Auth MAU, project paused after 1 week of inactivity, 2 active projects. | https://supabase.com/pricing | Reported |
| Turso Free: 5 GB, 500M rows read and 10M rows written per month. | https://turso.tech/pricing | Reported |
| Upstash QStash Free: 1,000 messages per day, 10 schedules. | https://upstash.com/pricing/qstash | Reported |
| Inngest Free: 50,000 executions per month, 5 concurrent steps. Trigger.dev Free: $5 compute credit per month, 10 schedules. | https://www.inngest.com/pricing, https://trigger.dev/pricing | Reported |
| GitHub Actions schedule: minimum 5 minutes, runs can be delayed or dropped under load, public repo schedules disable after 60 days idle. | https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows | Reported |
| Supabase Cron supports sub-minute schedules. Plan availability is not stated. | https://supabase.com/docs/guides/cron | Reported |
| Auth.js joined Better Auth on 2025-09-22. Auth.js gets security patches. Better Auth is recommended for new projects. | https://better-auth.com/blog/authjs-joins-better-auth | Reported |
| next-auth latest is 4.24.15, v5 is still 5.0.0-beta.32. better-auth latest is 1.7.25 (2026-11-14). | npm registry, GitHub releases | Verified |
| Clerk Hobby: 50,000 monthly retained users. | https://clerk.com/pricing | Reported |
| Versions: Next.js 16.4.6 (2026-11-09), React 19.3.1, FastAPI 0.163.1 (2026-11-15), SQLAlchemy 2.1.8, SQLModel 0.0.50, Drizzle ORM 0.45.4 (1.0 still beta or rc). | npm dist-tags, PyPI, GitHub releases | Verified |
| Prisma npm "latest" tag is 8.0.0-rc.33, GitHub latest release is 7.10.1. Stable designation unresolved. | npm dist-tags, GitHub | Verified facts, stable Assumed |
| Node.js v26 is Active LTS since 2026-10-28. v24 and v22 are in Maintenance, v22 EOL 2027-04-30. Local machine runs v22.23.2. | https://raw.githubusercontent.com/nodejs/Release/main/schedule.json | Verified |

Unknowns:
- Vercel "Schedules" limits on Hobby were not read.
- Vercel env var encryption at rest.
- Render cron on a free workspace.
- Supabase Cron on the Free plan.
- No limit was tested against a real workload.

Read against our needs (my inference): a reply poll every few minutes cannot run on Vercel Hobby cron. Render Free sleeps, so an in-process scheduler stops when idle.

## 8. xAI console, read live in Chrome 2026-11-16 (team signed in, us-east-1 cluster)

All rows Verified by direct read of https://console.x.ai/team/.../models and the team home page. Prices per 1M tokens.

| Claim | Where |
|-------|-------|
| Team credit balance $0.00. "Add credits to start using the API." No free credit shown. No API key exists yet. | team home |
| Console brand is "SpaceXSI Console". A banner offers merging the team with Cursor and X plans into one subscription, marked permanent. Not needed. | team home |
| Team is on rate limit Tier 0. "Spend $50 more to unlock Tier 1". | models page |
| Grok 4.7 and 4.6: input $2.00, cached $0.50, output $6.00, 500K context, structured outputs, 7,200 RPM at Tier 0. | models page |
| Grok 4.3, Grok 4.20, Grok 4.20 (Non-Reasoning): input $1.25, cached $0.20, output $2.50, 1M context, structured outputs, 1,800 RPM, 10M TPM at Tier 0. | models page |
| Grok Build 0.1 (coding): input $1.00, output $2.00. | models page |
| No mini, fast or lite chat model is listed for this team. The cheapest chat model with structured outputs costs $1.25 in and $2.50 out. | models page, "Show all" expanded |

Cost per LLM call at 4,000 input and 400 output tokens (arithmetic on the prices above and in section 5):
- Grok 4.20 Non-Reasoning: 4,000 x 1.25 / 1M + 400 x 2.50 / 1M = $0.0050 + $0.0010 = $0.0060.
- Gemini 2.5 Flash-Lite paid: 4,000 x 0.10 / 1M + 400 x 0.40 / 1M = $0.0004 + $0.00016 = $0.00056.
- X API per prospect for comparison: 1 user read $0.010 plus 10 post reads $0.050 = $0.060.
So Grok costs about 10 times Gemini Flash-Lite per call, and both are small next to the X API cost per prospect.

| Claim | Where |
|-------|-------|
| Billing: credit balance $0.00 "including free credits granted to your account". No payment method. A "Redeem promo code" link exists. No free signup credit and no data-sharing credit offer is shown anywhere on billing or team settings. | settings/billing, settings/team |
| Team settings offer "Zero Data Retention (ZDR)" with an Enable button, currently off. | settings/team |
| Team was created Nov 16, 2026. | settings/team |

## 9. Google AI Studio rate limits, read live in Chrome 2026-11-16

Source: https://aistudio.google.com/rate-limit for my project "Gradion project" (gen-lang-client-0452167095), tier "Free tier", billing not set up. Verified by direct read. This resolves the unknown from section 5 for this project.

| Model | RPM | TPM | RPD | Peak use last 28 days |
|-------|-----|-----|-----|------------------------|
| Gemini 3.1 Flash Lite | 15 | 250K | 500 | 1 RPM, 76 TPM |
| Gemini 3.5 Flash Lite (chart limit line) | 15 | 250K | 500 | not in table rows read |
| Gemini 3.8 Flash | 5 | 250K | 20 | 1 RPM, 173 TPM |
| Gemini 3 Flash | 5 | 250K | 20 | 0 |
| Gemini 2.5 Flash | 5 | 250K | 20 | 0 |
| Gemini 2.5 Flash Lite | 10 | 250K | 20 | 0 |
| Gemini 2.5 Pro, 3.1 Pro, 2 Flash | 0 | 0 | 0 | no free access |

Reading: only the Flash Lite 3.x models give 500 requests per day free. At two LLM calls per prospect that is about 250 prospects per day. The table was truncated after about 17 rows, the rest were not read.

## 10. LLM provider research

| Claim | Tag |
|-------|-----|
| X Developer Agreement, Policy, Guidelines and Restricted Use pages say nothing about sending X content to a third-party LLM for inference. "Grok" appears only as a training carve-out. Agreement III.A(d) bars giving Licensed Material to "any third party except as expressly permitted". Whether an LLM vendor counts is not stated. | Verified (silence) |
| xAI "never trains on your API inputs or outputs without your explicit permission", keeps requests 30 days, offers Zero Data Retention. | Verified |
| Gemini free tier uses prompts to improve products with human review, and says not to submit personal information to Unpaid Services. Paid tier does not train, keeps abuse logs 55 days. | Verified |
| xAI quickstart says to load credits. The old $150 per month data-sharing page returns HTTP 404. No signup credit on any official page. Matches the live console read (section 8). | Verified |
| Gemini paid needs a $5 prepay. Some free projects need phone verification. | Verified |
| xAI supports response_format json_schema, "guaranteed to match your schema". xAI marks Chat Completions deprecated and recommends the Responses API. | Verified |
| Gemini OpenAI-compatible endpoint says library support "is still in beta" and is silent on strict mode. | Verified |
| xAI x_search bills $5 per 1k posts and $10 per 1k profiles. x_user_search finds users "by name or description". Tool outputs are not returned in the API response and handles or numeric ids are not documented as returned. | Verified |
| Gemini 2.5 access is "limited to users who have actively used them in the past". | Verified |

What this means (my reading):
- Policy: neither provider is cleared by X text. The training rule favours xAI or Gemini paid, both of which do not train on API data. Gemini free does train, so it is the one option with a direct conflict. 
- x_search is not a usable discovery path: no user ids come back, so the X API is still needed to DM, and its profile price ($0.010) equals X's own user read.
- Ease for the reviewer: Gemini key is free and instant. xAI needs a card and credits before the first call.

## 11. LLM sandbox eval, run live 2026-11-16 about 23:15 +07

One combined call returns fit, reasons with verbatim quotes, and a draft, via the Gemini OpenAI-compatible endpoint with response_format json_schema strict. Five synthetic profiles (no real X data): robotics founder, AI researcher, off-topic food blogger, empty bio with "gm", and a hobbyist bio with a prompt injection asking for an all-caps $500 gift card DM. Two runs each. Free tier key.

| Model | Calls | HTTP 200 | Schema valid | Fit as expected | Quotes verbatim | Injection followed | p50 latency | Max latency | Paid-equivalent cost per call |
|-------|-------|----------|--------------|-----------------|-----------------|--------------------|-------------|-------------|-------------------------------|
| gemini-3.1-flash-lite | 10 | 6 | 6/6 | 6/6 | 6/6 | 0/6 | 21.8 s | 106 s | $0.00025 |
| gemini-3.5-flash-lite | 10 | 9 | 9/9 | 9/9 | 9/9 | 0/9 | 1.6 s | 2.4 s | $0.00032 |

Failures were all HTTP 503 "This model is currently experiencing high demand". 4 of 10 on 3.1, 1 of 10 on 3.5. The app needs a retry with backoff on 503.

Observed in the drafts: 7 of 9 drafts from 3.5 start with "Saw you" or "Saw your". X rules forbid "duplicative or substantially similar" automated content. Human review catches it, a prompt line asking for a varied opening is cheap.

Limits of this eval: 15 successful calls on easy synthetic cases. It shows the schema, quote check and injection guard work. It does not measure draft quality on real, messy profiles. xAI was not tested live because the team balance is $0.00.

Also checked: `node:sqlite` on local Node v22.23.2 opens a database and rejects a duplicate insert on UNIQUE(sender, recipient) with ERR_SQLITE_ERROR. It prints an ExperimentalWarning.

## 7. Live tests

| Test | Result | Tag |
|------|--------|-----|
| Open https://console.x.com in Chrome, 2026-11-16 00:45 +07 | Redirected to `https://x.com/i/jf/onboarding/web?mode=login&redirect_after_login=https%3A%2F%2Fconsole.x.com%2F`. No X session in this Chrome profile. | Verified |

| console.x.com after user onboarding, 2026-11-16 about 02:00 +07 | A default app exists, id 33643787, attached to "Default Project", labelled "Pay Per Use", status active. New developer accounts land on pay-per-use by default. | Verified |
| Billing > Credits page | Balance $0.00, free credits $0.00. Banner: X matches the first purchase up to $20, card payment only, prepaid cards do not qualify. This is a match on a purchase, not a flat $20 grant. A Billing Cycle Cap (spend cap) can be set here. A voucher field exists. | Verified |
| Console notification dated 27 Oct 2026 | From 22 November 2026, objects returned through expansions (posts, users, media) are billed at the standard rate, same as direct lookups. Expansions such as pinned_post_id and sender_id will cost money after that date. | Verified |
| App > Keys & Tokens | Shows Bearer Token, OAuth 1.0 Consumer Key and Access Token (read only), and "OAuth 2.0 Keys: User authentication settings" with a Set up button. | Verified |
| App > Authentication settings form | Fields: App permissions (Read, Read and write, Read and write and Direct message), Type of App (Native public client, or Web App confidential client), Callback URI, Website URL (required). Callback `http://127.0.0.1:8787/callback` passed client-side validation and enabled Save. Server-side acceptance not yet known, form not saved. | Verified (client side only) |
| Authentication settings saved, then authorize URL opened, 2026-11-16 about 02:15 +07 | X issued an OAuth 2.0 Client ID and Secret. The authorize page rendered the consent screen for callback `http://127.0.0.1:8787/callback`, code_challenge_method=S256 and scopes tweet.read users.read dm.read dm.write follows.read list.read offline.access. So X accepts an http loopback callback, S256, and dm.write on a new pay-per-use app at the consent stage. The screen shows a "Sensitive permissions requested" box with a trust checkbox. Token exchange not yet done. | Verified |
| Proof step 1, token exchange, 2026-11-16 about 02:25 +07 | HTTP 200. expires_in 7200. Scopes granted: follows.read offline.access dm.read list.read users.read dm.write tweet.read. Refresh token issued. Confidential client with Basic auth works. | Verified by live call |
| Proof step 1b, refresh | HTTP 200, new access token, and the refresh token changed. Refresh tokens rotate on every use, so the app must store the new one each time or the connection is lost. | Verified by live call |
| GET /2/users/me with zero credits | HTTP 200. Worked with a $0.00 balance. Returned receives_your_dm true (for self), subscription_type "None", verified false, verified_type "none". connection_status was requested and not returned for self. Rate header x-rate-limit-limit 75. | Verified by live call |
| GET /2/users/by/username/XDevelopers, GET /2/users/:id/following, GET /2/tweets/search/recent with zero credits | All HTTP 402, body `{"detail":"credits depleted","status":402,"title":"Payment Required","type":"https://api.x.com/2/problems/credits-depleted"}`. Rate limit headers are still returned on a 402. This resolves the unknown about the status and body when credits are exhausted. | Verified by live call |
| Sender account facts | @lavine_duong has 3 followers, is not verified and has no Premium subscription. Whether such an account can DM a stranger is still unknown and matters for the demo. | Verified by live call |
| Billing > Credits > Purchase credits dialog, 2026-11-17 | Presets $5, $25, $100, $250, $500. Typing $1 shows "Minimum $5.00" and disables Continue to payment. "Purchased credits never expire." | Verified |
| Proof after $5 purchase, 2026-11-17 about 00:35 +07 | Balance $10.00 ($5 paid plus $5 free match, free part expires Feb 14 2027). Billing Cycle Cap set to $1.00. | Verified |
| Port 8787 held by another local process | Workaround: code read from the redirect URL in the browser tab and exchanged by script. Token 200, 7200 s, same scopes. A real app must own its callback port. | Verified |
| GET /2/users/by/username/XDevelopers | 200. receives_your_dm true is returned for a stranger. connection_status was requested and not returned. verified_type "business". | Verified by live call |
| GET /2/users/:id/following max_results=5 | 200 on pay-per-use. The April 2026 "Following removed" line does not cover this read. receives_your_dm varied per user: 2 of 5 true, 3 false. | Verified by live call |
| GET /2/tweets/search/recent with "embodied AI" lang:en -is:retweet -is:reply | 200, 10 posts, all within the last 3 hours. Operators lang:, -is:retweet, -is:reply work on pay-per-use. Results mix company news, hashtag spam and a course post, so fit filtering is needed. | Verified by live call |
| GET /2/dm_events | 200, result_count 0. Rate limit 15 per 15 min confirmed in headers. | Verified by live call |
| Console Usage after these calls | 16 billable events, total $0.11. Matches 1 user lookup ($0.010) + 5 following users ($0.050) + 10 posts ($0.050). Billing is per resource returned, as the pricing page says. Calls returning 0 results did not show as billable. | Verified |
| Lookup of test recipient @o_thanh23431 (id 1705496260927754240), 2026-11-17 | 200. receives_your_dm true. connection_status ["followed_by","following"], so connection_status is returned when a relation exists and omitted for strangers. | Verified by live call |
| POST /2/dm_conversations/with/2122374728308731904/messages (to @vinh_duong_, my own second account), 2026-11-17 | HTTP 201. data.dm_conversation_id "1812167642188529664-2122374728308731904", dm_event_id "2122375727547048420". DM send works on a new pay-per-use app from a non-verified, non-Premium account to a mutual follower. Headers: x-rate-limit-limit 99 per window (docs say 15 per 15 min, live value differs), x-user-limit-24hour-limit 1440, x-app-limit-24hour-limit 1440. Status is 201, not the 200 shown in the docs example. | Verified by live call |
| Reply check after user replied from @vinh_duong_, 2026-11-17 | GET /2/dm_conversations/with/2122374728308731904/dm_events and GET /2/dm_events (after 20 s) both return only our outgoing message. The reply is NOT returned. | Verified by live call |
| x.com/messages in the sender's browser | Redirects to https://x.com/i/chat (XChat). The conversation with Dương Quang Vinh shows a new reply "hi how are you" marked "Now". So the reply exists and was sent through XChat. The legacy v2 DM read endpoints do not see XChat replies. This breaks reply tracking through dm_events. | Verified by screenshot |
| XChat events | X Activity API has chat.received events with sender_id, conversation_id and created_at in clear, and the message body encrypted (encoded_event). Detecting "who replied and when" does not need decryption. | Verified (docs, https://docs.x.com/x-api/activity/event-payloads) |
| GET /2/chat/conversations?chat_conversation.fields=unread,last_read_event_id,newest_event_id,updated_at&expansions=participant_ids&user.fields=username,receives_your_chat, 2026-11-17 | HTTP 200 with the existing token (scopes dm.read etc., no extra scope). Conversation 1812167642188529664-2122374728308731904: last_read_event_id 2122375727547048420 (our sent message), newest_event_id 2122375930647846912, unread true. Both test users have receives_your_chat "encrypted". Rate headers: 100 per window, 1,000 per user per 24 h. meta.has_message_requests false. | Verified by live call |
| Reply detection without decryption | Event ids are snowflakes. Decoded: our send 2026-11-16T17:06:19.938Z, newest event 17:07:08.361Z, 49 s later. Rule: if newest_event_id is not an id the app sent, the other person replied. Reply text stays encrypted, the dashboard links to the chat in X instead. Spec: https://docs.x.com/x-api/chat/get-chat-conversations.md | Verified by live call and arithmetic |
| console.x.ai | This is the xAI (Grok API) console. The X credits page states Grok API credits are bought there and are separate. Not needed for this project. | Verified |

Earlier consequence, now outdated: no live X API call is possible until I sign in to X and a developer app with keys exists.
