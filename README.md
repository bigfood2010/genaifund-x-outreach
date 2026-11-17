# Outreach

X DM outreach with human approval. Next.js 16, React 19, Node `node:sqlite`.

## Prerequisites

| Item | Get it |
|---|---|
| Node >= 22.18 | https://nodejs.org/en/download |
| X developer app, pay-per-use credits (min $5) | https://console.x.com |
| Gemini API key | https://aistudio.google.com/apikey |
| Second X account you own (DM recipient in test mode) | https://x.com/i/flow/signup |

## X app settings

https://console.x.com > Apps > your app > User authentication settings

| Field | Value |
|---|---|
| App permissions | Read and write and Direct message |
| Type of App | Web App, Automated App or Bot |
| Callback URI | `http://127.0.0.1:3000/callback` |
| Website URL | any valid URL |

Save. Copy OAuth 2.0 Client ID and Client Secret shown after save.

## `.env.local`

| Var | Required | Value | Source |
|---|---|---|---|
| `X_CLIENT_ID` | yes | OAuth 2.0 Client ID | https://console.x.com |
| `X_CLIENT_SECRET` | yes | OAuth 2.0 Client Secret | https://console.x.com |
| `LLM_API_KEY` | yes | Gemini key | https://aistudio.google.com/apikey |
| `TOKEN_ENCRYPTION_KEY` | yes | 32 bytes base64 | `openssl rand -base64 32` |
| `SESSION_SECRET` | yes | 32 bytes base64 | `openssl rand -base64 32` |
| `ALLOWED_OPERATORS` | yes | sender X usernames, comma separated, `@` optional | your account |
| `TEST_RECIPIENTS` | yes | only DM recipients allowed in test mode, same format | your second account |
| `LIVE_SENDING` | no | `true` lifts test mode | default `false` |
| `LLM_BASE_URL` | no | OpenAI-compatible endpoint | default Gemini |
| `LLM_MODEL` | no | model id | default `gemini-3.5-flash-lite` |
| `MAX_PROSPECTS_PER_RUN` | no | 1-50 | default 10 |
| `NO_REPLY_HOURS` | no | hours before Needs attention | default 72 |
| `SENDER_DESCRIPTION` | no | one line about the sender, used in drafts | default GenAI Fund line |

## Run

```bash
cp .env.example .env.local
npm ci
npm run build && npm start
```

Open http://127.0.0.1:3000. Not `localhost`: callback and cookies bind to `127.0.0.1`.

## Test

```bash
npm test
npm run typecheck
```

## Walkthrough

1. `/connect`: tick consent, Connect X, sign in as `ALLOWED_OPERATORS` account.
2. Find: `Seed accounts` + `@karpathy`, Find people. Run row shows progress, then result.
3. Review > To review: quotes highlighted in bio/posts. Edit draft, Approve.
4. Approved: Send, confirm. Test mode shows Send only for `TEST_RECIPIENTS`.
5. Sent / Replied / Needs attention: Check replies. Reply from recipient account moves row to Replied.

## Layout

```
app/                 routes, OAuth login/callback
src/server/domain/   rules: prospect states, evidence, pricing, limits
src/server/infra/    X API, LLM, SQLite, crypto, config
src/server/web/      server actions, session, read models
src/ui/              atoms, molecules, organisms
test/                node:test, no network
```
