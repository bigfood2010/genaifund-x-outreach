# Outreach

Find AI and robotics builders on X, see why each one fits in their own quoted words, review and approve a short DM, send it from your own account, and track who replied. One message per person, ever.

## What you need

| Item | Where | Cost |
|------|-------|------|
| Node.js 22.18 or newer | nodejs.org | free |
| An X developer account and app on the pay-per-use plan | console.x.com | first purchase minimum $5, X matches it up to $20 |
| An LLM key with an OpenAI-compatible endpoint | aistudio.google.com (Gemini) by default | free tier works, paid tier recommended (see Limits) |
| A second X account you control, for test sends | x.com | free |

## Setup (about 10 minutes)

1. Create the X app. In console.x.com open Apps, then User authentication settings. Choose "Read and write and Direct message", type "Web App, Automated App or Bot", callback `http://127.0.0.1:3000/callback`, any website URL. Save and copy the Client ID and Client Secret.
2. Buy X credits in Billing, Credits. Set a Billing Cycle Cap there, for example $10. Requests stop at the cap.
3. Get an LLM key. For Gemini: aistudio.google.com, Get API key.
4. Configure:
   ```bash
   cp .env.example .env.local
   ```
   Fill in the keys. Generate `TOKEN_ENCRYPTION_KEY` and `SESSION_SECRET` with `openssl rand -base64 32`. Put your sending account in `ALLOWED_OPERATORS` and your test account in `TEST_RECIPIENTS`.
5. Run:
   ```bash
   npm install
   npm run build
   npm start
   ```
6. Open http://127.0.0.1:3000, tick the consent box, Connect X, approve on X.

## Using it

Find. Describe who you want to reach, then either search recent posts or give seed accounts whose following list is scanned. Each run checks up to 10 new people who accept DMs from your account and shows the most it can cost in X reads.

Review. Each candidate shows why they fit, with the exact words from their bio or posts highlighted. Edit the draft, then Approve or Skip. Approved messages are sent one at a time with Send, which asks once more before sending.

Track. Sent, Replied and Needs attention tabs show delivery state. Replies are checked when the page opens or with Check replies. Anything X refused, anything unconfirmed, and anything without a reply after 72 hours lands in Needs attention.

## What it will not do

- Send without a person pressing Send, send in bulk, schedule, or follow up after silence. X's automation rules forbid unsolicited automated DMs and follow-ups.
- Message anyone twice. The database refuses a second message to the same person, and a send whose outcome is unknown is never retried.
- Message real people while test mode is on (the default).
- Read reply text. Replies arrive through X Chat, which is end-to-end encrypted. The tool knows who replied and when, and links to the chat on X.

## Limits found while testing

- Most AI builders found by search do not accept DMs from an account they do not follow. Across three live runs, 23 of 33 candidates were closed. They are left out and counted in the run note.
- The Gemini free tier uses prompts to improve Google products, and X forbids using X data to train AI models. Turn on Gemini billing (paid tier does not train on prompts) before running on real profiles, or point `LLM_BASE_URL` at another provider.
- X pay-per-use prices per resource: user $0.010, post $0.005, DM sent $0.015. From 22 November 2026 objects returned through expansions are billed the same way.

## Development

```bash
npm run dev        # http://127.0.0.1:3000
npm test           # 151 unit tests, no network
npm run typecheck
```

Code layout: `src/server/domain` holds the pure rules (statuses, buckets, evidence, pricing, limits). `src/server/infra` holds the store, X client, LLM call, crypto and config. `src/server/web` holds server actions, session, views and the container. `src/server/outreach.ts` is the use case. `src/ui` holds atoms, molecules and organisms and imports only `domain` and `web/views` types. `app/` holds thin routes.
