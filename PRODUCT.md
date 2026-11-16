# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) with React for the dashboard, chosen by the user on 2026-11-17. Server logic is TypeScript on Node 22 with no other runtime dependencies: built-in `node:sqlite` for storage, `fetch` for the X API and the LLM. Runs locally first. A hosted link is optional and undecided.

## Users

The GenAI Fund team. Fund and ecosystem staff, not engineers, who run the tool themselves from the fund's own X account without the builder present. They want to reach AI and robotics builders, founders and researchers, mostly in Southeast Asia, and start real conversations. The take-home reviewers use it the same way to judge whether it passes.

## Product Purpose

Find relevant AI and robotics people on X, explain why each one fits using their own public words, draft a short personal DM, let a person review and approve it, send approved messages from the connected account within X's rules, and track what was sent, who replied and what needs attention. Success is a team member running outreach end to end alone, with no duplicate messages and no invented familiarity.

## Positioning

Evidence-first outreach. Every fit reason and every draft is tied to verbatim quotes from the person's bio or posts, and the server rejects quotes that are not found in the fetched text. A human approves and sends each message one at a time. The tool prefers a narrow, reliable flow over volume.

## Operating Context

The operator works from a desktop browser. A session looks like: start a run from a target description plus a search query or seed accounts, wait for candidates, review drafts with their evidence, approve or reject or edit, send, and later check replies and anything flagged. Data comes only from the official X API v2 (pay-per-use) and an LLM API. Replies arrive through X Chat, whose message bodies are encrypted, so the tool knows that and when someone replied, not what they wrote.

## Capabilities and Constraints

- Inputs: a target description, plus either a recent-search query (last 7 days of posts) or seed accounts whose following list is scanned.
- X API costs real money per resource read and per DM sent. A spend cap lives in the X developer console.
- X allows 15 DM sends per 15 minutes in its docs, 1,440 per 24 hours per user and per app.
- X automation rules forbid unsolicited bulk or automated DMs and follow-ups after silence. The tool sends only on a human click, never follows up, and lets the operator mark do-not-contact.
- One message per person per sender account, enforced in the database.
- Test mode is on by default: sends go only to listed test recipients until live sending is switched on.
- People whose settings refuse DMs from the account are shown as blocked, not drafted.
- Reply text is not readable (encrypted X Chat). "No reply after 72 hours" is a status, not an automated action.
- Undecided: hosted deployment, multi-account support.

## Brand Commitments

Neutral tool name. No GenAI Fund logo or brand styling in the UI. The sender description given to the LLM names GenAI Fund.

## Evidence on Hand

Live proofs from 2026-11-16 and 17 are recorded in findings.md: OAuth, search, following, lookup, DM send (HTTP 201) and reply detection through X Chat conversations all worked against the real API. No customer quotes, testimonials or usage numbers exist and none may be invented.

## Product Principles

1. Evidence before persuasion: nothing about a person is claimed without their own quoted words.
2. A human presses send: the tool prepares, people decide.
3. Never twice: one message per person, and a failure with an unknown outcome is never retried automatically.
4. Say what is blocked and why, in plain language, with the next step.
5. Spend is visible: the operator can always tell what a run costs and why a request stopped.

## Accessibility & Inclusion

Keyboard operable forms and buttons, visible focus, status changes announced to screen readers, and no information carried by color alone. Names and bios may be in any script, including Vietnamese, Thai and Chinese.
