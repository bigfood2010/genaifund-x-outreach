# Task Plan: GenAI Fund FDE take-home, X outreach prototype

## Goal
Ship a working prototype that finds AI and robotics people on X, drafts evidence-based DMs for human approval, sends approved DMs from a connected account within X rules, never double-messages, and tracks sent, replied and needs-attention. Deliver hosted link or source with setup under 15 minutes, a 3 to 5 minute video, and a one-page write-up.

## Hard dates
- Submission deadline: Tuesday 17 November 2026, 12:00 GMT+7, to hr@genaifund.ai
- Participation confirmation was due Friday 13 November 2026, 12:00 GMT+7. Status unknown, user must confirm it was sent.

## Next Step
User signs in to X and creates a developer app with keys, then run the 11-step live proof in the research brief. Live X tests are blocked until then.

## Current Phase
Phase 1

## Phases

### Phase 1: Requirements & Discovery
- [x] Read documents/requirement.md and documents/email-from-the-hr.md
- [x] Git baseline, planning files
- [x] Research X API access, pricing, DM endpoints, limits (official docs)
- [x] Research X automation and DM policy
- [x] Research discovery endpoints and evidence fields
- [x] Research LLM free tiers
- [x] Research hosting, database, language and framework
- [ ] Live test what can be tested without new credentials
- [x] Document everything in findings.md
- **Status:** in_progress

### Phase 2: Planning & Structure
- [x] Research brief with verdict in .claude/research/
- [ ] PRD with high level design
- [x] Adversarial critique of the brief
- **Status:** pending

### Phase 3: Implementation
- [ ] Compatibility proof against pinned versions in a scratch directory
- [ ] Build the narrow version
- **Status:** pending

### Phase 4: Testing & Verification
- [ ] End to end live test with accounts the user controls
- [ ] Duplicate-send test
- **Status:** pending

### Phase 5: Delivery
- [ ] Hosted link or setup guide, video, one-page write-up
- **Status:** pending

## Requirements traced from the brief
| ID | Requirement | Source line |
|----|-------------|-------------|
| R1 | Input is a target segment or seed accounts | requirement.md:7 |
| R2 | Finds people and explains why they fit | requirement.md:7 |
| R3 | Drafts personalised DMs for review and approval | requirement.md:7 |
| R4 | Sends approved DMs from the connected account within X rules and limits | requirement.md:7 |
| R5 | Never double-messages anyone | requirement.md:7 |
| R6 | Shows what was sent, who replied, what needs attention | requirement.md:7 |
| R7 | Personalisation uses real evidence, not invented familiarity | requirement.md:7 |
| R8 | Usable without the author present, limitations and blocked actions shown | requirement.md:9 |
| R9 | Hosted link or setup under 15 minutes, reviewer connects own accounts and keys | requirement.md:11 |
| R10 | No prohibited scraping, follow X terms and rate limits | requirement.md:15 |
| R11 | No secrets in the submission | requirement.md:15 |
| R12 | Low cost, name paid tools and operating costs | requirement.md:15 |

## Open unknowns that research must answer
1. Which X API tier or pricing model allows DM send, DM read, user lookup and search today, and what it costs.
2. Rate limits and account-level DM caps that bound "at scale".
3. How the API reports that a recipient cannot be messaged.
4. Whether X policy permits approved, human-reviewed cold DMs through the API.
5. Which discovery endpoints give enough evidence for "why they fit".
6. Which LLM, host and database have a free tier that covers a demo.

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Verdict Research only, proof PENDING | No X keys, no live call made |
| Person presses Send per message, no worker | Only reading found that stays outside the automated DM rule, and Vercel Hobby cron is daily |
| TypeScript, Next.js 16.4.6, Postgres, Drizzle 0.45.4 (proposed, not final) | Superseded 23:20, see below |
| LLM: gemini-3.5-flash-lite via OpenAI-compatible endpoint, base URL and model in env, retry on 503 | Live eval 9/9 schema, quotes and fit, p50 1.6 s, $0.00032 per call. xAI is about 10x the price, needs credits, $0 balance (findings 8, 10, 11) |
| Gemini paid tier (billing on) before any real X profile is sent | Free tier trains on prompts, X bans training on X data (findings 3b, 10) |
| No LLM "why no reply" loop in v1. Time-based "No reply after 72h" status instead | No ground truth for one non-reply, tiny volume, X forbids follow-ups (findings 3a) |
| Reply tracking via GET /2/chat/conversations (newest_event_id vs our sent ids, unread flag), not dm_events | Live: XChat reply invisible to dm_events, visible as newest_event_id in chat conversations (findings 7) |
| Dashboard: Next.js + React (user choice in /impeccable init, 2026-11-17). Neutral tool name, operators are GenAI Fund staff | PRODUCT.md |
| Storage: node:sqlite file, not Postgres. Spend cap: X console Billing Cycle Cap, not in-app | Fewer setup steps for the reviewer. Both checked live (findings 7, 11) |

## Errors Encountered
| Error | Resolution |
|-------|------------|
| env-snapshot.sh: "FATAL: no package.json within depth 3" | Captured runtimes by hand |
| console.x.com redirected to X login, no session in Chrome | Blocked on user sign-in |
| Scout fetch of help.x.com returned HTTP 402 | Read the automation rules by eye in Chrome |
