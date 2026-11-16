# Progress Log

## Session 2026-11-16

- 00:35 Read documents/requirement.md and documents/email-from-the-hr.md.
- 00:37 git init, baseline commit 0a81c40. Planning files created.
- 00:38 env-snapshot.sh failed: "FATAL: no package.json within depth 3". Captured runtimes by hand (see findings.md section 1).
- 00:40 Launched five research-scout agents (Sonnet): X API pricing, X DM policy, X discovery endpoints and SDKs, LLM free tiers, hosting and database.
- 00:45 Chrome check: console.x.com redirects to X login. No X session. Live X API tests blocked.
- 00:50 All five scouts returned. Results written to findings.md sections 2 to 6.
- 00:55 Read https://help.x.com/en/rules-and-policies/x-automation and https://docs.x.com/developer-guidelines by eye in Chrome (scout got HTTP 402 on help.x.com). Written to findings.md 3a and 3b.
- 01:00 Shell has no X or LLM keys (names checked only).
- 01:05 Research brief written to .claude/research/2026-11-16-x-outreach-prototype-stack.md. Verdict Research only, proof PENDING.
- 01:06 Critic agent launched on the brief.
- 01:20 Critic returned 2 Blockers, 6 Majors, 3 Minors. Brief revised. `npm view` engines check done.
- 01:30 User chose "Proof first". X session now present. console.x.com shows the developer onboarding form (account name, use-case text, agreement checkbox). Draft use-case text typed in, not submitted. Accepting the agreement is left to the user.
- 01:35 OAuth URLs confirmed: authorize https://x.com/i/oauth2/authorize, token https://api.x.com/2/oauth2/token (docs.x.com user-access-token page). Docs show only code_challenge_method=plain and say nothing on http 127.0.0.1 callbacks. Both are to be observed in the proof.
- 01:40 Proof script written at scratchpad/proof/x.mjs (plain fetch, no dependencies, syntax checked, not run against X). `.env.local` template created, gitignored.

- 22:40 Read console.x.ai (models, billing, team) and AI Studio rate limits live. Written to findings.md sections 8 and 9.
- 22:50 LLM eval harness written at scratchpad/llm-eval.mjs (5 synthetic fixtures incl. prompt injection and thin evidence). Syntax OK, not run.
- 23:00 Eval blocked: GEMINI_API_KEY is empty on disk in .env.local (file mtime 22:58). Gemini OpenAI-compat GET /models returned 404, native list returned 403 "unregistered callers", both because no key was sent.
- 23:00 Time check: deadline is 17 Nov 12:00 GMT+7, about 13 hours away, not 35.

## Blocked on the user
1. Sign in to X in Chrome and create a developer app at console.x.com (card needed for the $20 credit).
2. A second X account the user controls, to receive test DMs.
3. One LLM API key.
4. Confirm the participation email of 13 November was sent.

## Test results
| Test | Result |
|------|--------|
| console.x.com session check | No session, redirected to login |
| X API live proof (8 steps in the brief) | PENDING, no keys |
