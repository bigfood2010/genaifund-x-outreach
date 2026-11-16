# GenAI Fund take-home: what must be true before submitting

Source of every item: documents/requirement.md (line numbers in brackets) and documents/email-from-the-hr.md.
Status as of 2026-11-17 00:45 GMT+7. Done means proven by a live call or a file on disk.

## 1. How the bot works, end to end

1. You type a target segment ("robotics founders in Southeast Asia") or paste seed accounts. [7]
2. The bot finds candidate people on X through the official X API (recent search, following of seed accounts). [7, 15]
3. For each candidate it reads bio and recent posts, and the LLM says whether they fit and why, quoting their real words. [7]
4. The LLM drafts a short DM from those quotes only. [7]
5. The dashboard shows each candidate, the fit reasons, the quotes and the draft. You edit, approve or reject. Nothing is sent without approval. [7]
6. You press Send on an approved draft. The bot sends it from your connected X account, within X limits. [7]
7. The bot never messages the same person twice. [7]
8. The dashboard shows what was sent, who replied, and what needs your attention (reply waiting, no reply after 72h, refused by X, opted out). [7]
9. Anything blocked (person does not accept DMs, out of credits, rate limited) is shown with the reason. [9]

## 2. Why a "test recipient" is needed

The ground rules say real sending is tested "only with accounts you control or people who have agreed to the test, not unsolicited outreach to strangers". [15] The HR email repeats it: "You do not need to contact strangers".

So in your build and your demo video:
- Steps 1 to 5 run on real AI and robotics people found on X. They are shown in the dashboard with real drafts. Nobody is messaged.
- Step 6 (Send) is proven by sending to a second X account that you own, or to a friend who agreed. That account is the "test recipient".
- A test mode setting allows sends only to listed recipient ids. It is on by default. GenAI Fund turns it off when they run real outreach from their own account.

Without a second account, the Send, reply tracking and "never double message" parts cannot be shown working, and those are pass criteria. [17]

## 3. Deliverables

| # | Item | Requirement | Status |
|---|------|-------------|--------|
| D1 | Participation confirmation email to hr@genaifund.ai | due Fri 13 Nov 12:00 GMT+7 [19] | Unknown, confirm you sent it |
| D2 | Working prototype: source code with setup under 15 minutes, or a hosted link | [11] | Not started |
| D3 | List of account, API access and plan requirements in the README | [11] | Not started |
| D4 | 3 to 5 minute demo video, end to end, honest about unfinished parts | [12] | Not started |
| D5 | One-page write-up: approach, trade-offs, what comes next, costs, how AI tools were used and how their output was checked | [13] | Not started |
| D6 | Submit to hr@genaifund.ai | Tue 17 Nov 12:00 GMT+7 [21] | Not started |

## 4. Functional checklist (pass criteria)

| # | Must work | Requirement | Proof so far |
|---|-----------|-------------|--------------|
| F1 | Input a segment or seed accounts | [7] | X search and following calls work live |
| F2 | Find relevant people and explain why they fit | [7] | LLM eval 9/9 on synthetic profiles |
| F3 | Personalised draft from real evidence, quotes checked against fetched text | [7] | Quote check 9/9 in eval |
| F4 | Review, edit, approve or reject in a dashboard | [7] | Not built |
| F5 | Send approved DMs from the connected account, within X limits | [7] | Not proven, needs test recipient |
| F6 | Never double-message | [7, 17] | SQLite UNIQUE check proven locally |
| F7 | Show sent, replied, needs attention | [7] | DM events read works live |
| F8 | Show limitations and blocked actions clearly | [9] | 402 credits-depleted body captured live, 403 refusal not yet seen |
| F9 | Usable without you beside them | [9] | README and UI copy not written |

## 5. Ground rules

| # | Rule | Requirement | How it is met |
|---|------|-------------|---------------|
| G1 | Real sends only to accounts you control or people who agreed | [15] | Test mode allowlist, second account |
| G2 | Follow X terms, API rules, rate limits, no scraping | [15] | Official API only, one send per click, no follow-ups |
| G3 | No credentials or secrets in the submission | [15] | .env.local is gitignored. Rotate the X client secret and the Gemini key before submitting, both appeared in chat screenshots |
| G4 | Low cost, name paid tools and running costs | [15] | X API about $0.06 per prospect, DM $0.015, Gemini about $0.0003 per call. Spent $0.11 so far |

## 5b. Policy risk to state in the write-up

X's automation rules forbid unsolicited DMs in a bulk or automated way and its developer guidelines list "Unsolicited Outreach" as prohibited. The tool's answer is a human who reads and approves each message and presses Send for each one, no bulk send, no follow-ups, opt-out honoured. X has not confirmed that this is allowed. Say so plainly.

## 6. What you need to provide

| # | Item | Status |
|---|------|--------|
| U1 | X developer app with OAuth 2.0, DM permission, callback URL | Done |
| U2 | X API credits | Done, $10 balance, $1 cycle cap (raise to about $5 for the build) |
| U3 | Second X account you control (username) as test recipient | Missing, blocks F5 to F8 |
| U4 | Gemini API key | Done (free tier) |
| U5 | Gemini billing on (paid tier) before real X profiles are sent to it, because the free tier trains on prompts | Decision needed |
| U6 | GitHub repo under bigfood2010 | Local git set, no remote yet |
| U7 | Screen recorder for the video | Your choice |
