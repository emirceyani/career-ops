# Mode: pipeline — URL Inbox (Second Brain)

Process job URLs stored in `data/pipeline.md`. The user adds URLs at any time and then executes `/career-ops pipeline` to process them all.

## Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| `--max N` | `--max 15` | Process only the first N pending items in this run. Items are taken in order (top of the Pending list first). Items beyond the cap remain as `- [ ]` for the next run. |

Example: `/career-ops pipeline --max 15`

## Workflow

1. **Read** `data/pipeline.md` → search for `- [ ]` items in the "Pending" section. If `--max N` was passed, take only the first N items from the list; leave the rest untouched for a future run.
2. **For each pending URL**:
   a. Calculate the next sequential `REPORT_NUM` (read `reports/`, take the highest number + 1)
   b. **Extract JD** using Playwright (browser_navigate + browser_snapshot) → WebFetch → WebSearch
   c. If the URL is not accessible → mark as `- [!]` with a note and continue
   d. **Execute full auto-pipeline**: Evaluation A-F → Report .md → PDF (if score >= 3.8) → Tracker. When invoked from autonomous mode (cron/launchd), additionally: for any report with score >= 4.0, draft a LinkedIn recruiter outreach to `outreach/{company-slug}-{YYYY-MM-DD}.md` and, if the JD has an application form, draft answers to `apply-drafts/{company-slug}-{YYYY-MM-DD}.md`. **Never** submit forms or send messages.
   e. **Move from "Pending" to "Processed"**: `- [x] #NNN | URL | Company | Role | Score/5 | PDF ✅/❌`
3. **If there are 3+ pending URLs**, launch agents in parallel (Agent tool with `run_in_background`) to maximize speed.
4. **At the end**, show summary table:

```
| # | Company | Role | Score | PDF | Recommended action |
```

## Format of pipeline.md

```markdown
## Pending
- [ ] https://jobs.example.com/posting/123
- [ ] https://boards.greenhouse.io/company/jobs/456 | Company Inc | Senior PM
- [!] https://private.url/job — Error: login required

## Processed
- [x] #143 | https://jobs.example.com/posting/789 | Acme Corp | AI PM | 4.2/5 | PDF ✅
- [x] #144 | https://boards.greenhouse.io/xyz/jobs/012 | BigCo | SA | 2.1/5 | PDF ❌
```

## Intelligent JD detection from URL

1. **Playwright (preferred):** `browser_navigate` + `browser_snapshot`. Works with all SPAs.
2. **WebFetch (fallback):** For static pages or when Playwright is unavailable.
3. **WebSearch (last resort):** Search in secondary portals that index the JD.

**Special cases:**
- **LinkedIn**: May require login → mark `[!]` and ask the user to paste the text
- **PDF**: If the URL points to a PDF, read it directly with the Read tool
- **`local:` prefix**: Read the local file. Example: `local:jds/linkedin-pm-ai.md` → read `jds/linkedin-pm-ai.md`

## Automatic numbering

1. List all files in `reports/`
2. Extract the number from the prefix (e.g., `142-medispend...` → 142)
3. New number = maximum found + 1

## Running autonomously

When invoked by launchd via `scripts/automation/run-pipeline.sh`, this mode receives `--max 15` and runs in headless mode (`claude -p`). In headless mode Playwright is unavailable; JD extraction falls back to WebFetch and reports are tagged `**Verification:** unconfirmed (batch mode)`. Outreach + apply drafts are generated as side effects for reports scoring >= 4.0. Backpressure: if `pipeline.md` has more than 50 pending URLs, the wrapper skips the run.

## Source synchronization

Before processing any URL, verify sync:
```bash
node cv-sync-check.mjs
```
If there is a desynchronization, warn the user before continuing.
