# Outreach for GenAI Fund: write-up

## Approach

I built a narrow tool that one person can run alone: find people, read why they fit, approve a message, send it, see who replied. Everything goes through the official X API v2 on pay-per-use and an LLM behind an OpenAI-compatible endpoint (Gemini 3.5 Flash Lite by default).

Discovery takes a target description plus either a recent-post search or seed accounts whose following list is scanned. People whose settings refuse DMs from the sending account are dropped before any paid profile read. For each remaining person the tool reads the bio and five recent posts, and one LLM call returns a fit level, reasons and a draft. Every reason must carry a quote, and the server keeps a quote only if it appears word for word in the fetched text. Fewer than two independent quotes means no draft. The review screen shows those quotes highlighted inside the original bio or post, so the reviewer checks the evidence in seconds rather than trusting the model.

Sending is deliberately manual. X's automation rules forbid unsolicited DMs sent in a bulk or automated way, and the developer guidelines list unsolicited outreach as prohibited. The only defensible reading I found is a person who reads, edits and presses Send for each message, with no follow-ups and an easy do-not-contact. X has not confirmed this reading. Treat it as a risk, not a guarantee.

Duplicates are prevented in the database, not the UI. A unique key on sender and recipient is claimed before the API call. A timeout or server error leaves the message in an unknown state that the tool never retries, so a person checks X instead of the tool guessing.

Replies were the surprise. I sent a test DM and replied from a second account, and the legacy DM read endpoint never showed the reply, because X now routes it through X Chat, which is end-to-end encrypted. The chat conversations endpoint still returns the newest event id, and event ids encode time, so the tool detects who replied and when without decrypting anything. It cannot show the reply text and says so.

## Trade-offs

Next.js with server actions keeps one codebase, and the server core has no other runtime dependency: built-in `node:sqlite`, `fetch` and `crypto`. SQLite instead of Postgres keeps setup short, at the cost of single-instance only. No background worker: discovery runs in the server process and replies are checked on page load. That fails if the app is hosted on a serverless platform. One connected sender account per install.

## Costs (measured on the live account)

X: about $0.035 per person checked (one user read plus five posts) plus the search results that led to them, and $0.015 per DM sent. Reply checks were not priced separately in the console. A run of ten people costs at most about $0.85 in reads, and the UI shows that ceiling before you start. The X console reports my whole live test, three discovery runs, the API proofs and one DM, at $0.49 for 100 billable events. LLM: about $0.0003 per person on Gemini paid tier, free on the free tier. Hosting: none, it runs locally.

## What comes next

A worker that respects X's rate limits for larger runs. Hosting with Postgres. Reading reply text through the Chat XDK. Asking X Developer support to confirm the human-in-the-loop reading of the automation rules. Turning on Gemini billing, because the free tier uses prompts to improve Google products while X bans training on X data.

## How I used AI tools and checked them

Claude Code wrote the code and the research. I did not accept a claim from memory. Pricing, limits and policy came from docs.x.com, help.x.com, the X console and the Gemini and xAI consoles, read live, with each claim tagged verified, reported or assumed in findings.md. Several docs claims turned out wrong or out of date and the live calls won: DM send returns 201, not 200, and replies do not appear on the old endpoint at all. I compared Gemini and Grok with a small eval on synthetic profiles, including a prompt injection, and chose Gemini on cost and measured quality. A separate agent wrote 143 adversarial unit tests and found ten real bugs, among them a repeated quote passing the two-quote rule, which I fixed. I ran the app end to end against the real API with a browser driver, measured every interaction at under 10 ms, and read the drafts myself. That reading caught the model saying GenAI Fund "invests", which it was never told, so the prompt now forbids any claim about the sender beyond its description.
