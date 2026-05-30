# Task Plan: Autonomous Periodic Scan + Pipeline

## Goal
Run `career-ops scan` and `career-ops pipeline` on a recurring schedule with bounded token cost and human-gated application step, so new postings get discovered + evaluated without manual triggering.

## Design Decisions (confirmed 2026-05-30)

| Decision | Choice | Rationale |
| --- | --- | --- |
| Scan cadence | Daily, 08:00 local | `scan.mjs` is zero-token; daily catches expiring postings before they close |
| Pipeline cadence | Mon + Thu, 09:00 local | 2×/week with `--max 15` keeps token spend bounded and gives user time to triage |
| Scan runner | Claude cloud routine (`/schedule`) | User chose cloud routines — runs even when laptop is off |
| Pipeline runner | Claude cloud routine (`/schedule`) | Same |
| Hard cap | `--max 15` on pipeline | Prevents runaway evaluation cost |
| Auto-PDF threshold | Generate PDF for score ≥ 3.8 | User-specified; below 3.8 is report-only |
| Language modes | Always English (`modes/`) | User-specified |
| Weekend behavior | No pause; pipeline runs Sat/Sun if scheduled | User-specified |
| Notifications | **Daily email digest** at 09:30 local | User preference. Pipeline-day digests include evaluations + drafts; scan-only days show new discoveries + queue health |
| Action threshold | **top 5 OR all ≥ 4.0** (whichever is larger), hard floor 3.5 | Adapts to score distribution; weak weeks still surface best 5; respects ethical-use rule |
| Attachments | **None** — paths only | User opens files from the repo |
| Recruiter outreach | Draft only — write to `outreach/{company}-{date}.md`, never send | User-specified |
| Application submission | **Never automated** — `apply` mode stops before Submit click (existing rule) | Per CLAUDE.md ethical-use clause |
| Failure mode | Log to `data/automation-log.tsv` | Avoids silent drift; user reviews weekly |
| Pipeline backpressure | Skip pipeline run if pending > 50 | Prevents queue from blowing up if user falls behind |

## Phases

- [x] **Phase 1 — Confirm with user** (done 2026-05-30; see Design Decisions table)

- [ ] **Phase 2 — Wire scan as cloud routine**
  - Create `/schedule` routine: `/career-ops scan` daily 08:00
  - Routine prompt must include explicit `language.modes_dir: modes/` (English) override
  - Post-run: append summary line to `data/automation-log.tsv`

- [ ] **Phase 3 — Wire pipeline as cloud routine**
  - Create `/schedule` routine: `/career-ops pipeline --max 15` Mon+Thu 09:00
  - Pre-check: if `pending > 50` in `pipeline.md`, skip + log "backpressure"
  - Auto-PDF threshold lowered to **3.8** in `modes/pipeline.md` workflow step 2d
  - Post-run: append summary line to `data/automation-log.tsv`

- [ ] **Phase 4 — Daily email digest**
  - Add `scripts/send-digest.mjs` (reads automation-log + recent reports, formats HTML + plaintext email via nodemailer)
  - SMTP creds in `.env` — `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER=emirceyani@gmail.com`, `SMTP_PASS=<app-password>`, `MAIL_FROM=$SMTP_USER`, `MAIL_TO=$SMTP_USER`
  - Run daily at 09:30 local via dedicated cloud routine (separate from pipeline routine)
  - **Action threshold logic**: `actionSet = max(top5, allScoresGTE4_0)` filtered by `score >= 3.5`
  - Two digest shapes:
    - **Pipeline day (Mon/Thu)**: full digest with evaluations, drafts, score distribution, action set
    - **Scan-only day (Tue/Wed/Fri/Sat/Sun)**: new discoveries, current queue size, health stats; no action set
  - Skip email entirely if `0 new discoveries AND 0 evaluations AND queue unchanged` (avoid noise)
  - Subject line dynamically reflects content: `[career-ops] {day} — {N} evaluated · {M} actionable · {Q} pending`

- [ ] **Phase 5 — Recruiter outreach + apply drafts (draft-only)**
  - For each report with score ≥ 4.0:
    - Recruiter draft: LinkedIn lookup via `contacto` mode → `outreach/{company}-{YYYY-MM-DD}.md` (recruiter name + URL + draft DM)
    - Apply draft: if JD has an application form, run `apply` mode in draft mode → `apply-drafts/{company}-{YYYY-MM-DD}.md` (form questions + drafted answers)
  - Never auto-send DMs; never auto-submit forms; never embed sending credentials
  - Include both in email digest with file paths

- [ ] **Phase 6 — Safety & observability**
  - `data/automation-log.tsv` schema: `timestamp\tjob\tstatus\tcount\tnotes`
  - Health check: `node verify-automation.mjs` (last scan < 36h, last pipeline < 5d, log not corrupted, pending queue size)
  - Add `outreach/` to `.gitignore` (personal data)

- [ ] **Phase 7 — Docs**
  - Update `CLAUDE.md` + `AGENTS.md` with autonomous-mode section, clarifying "auto-apply" (never) vs "auto-draft-outreach" (yes, but draft-only)
  - Update `modes/scan.md` + `modes/pipeline.md` with a "Running automatically" note
  - Add `plan/autonomous-scan/setup.md` walkthrough (creating the two cloud routines, configuring email)

## Key Questions

1. ~~Local cron vs cloud routine~~ → **Claude cloud routines** (`/schedule`)
2. ~~Notification channel~~ → **Email digest** after each pipeline run
3. ~~Auto-promote to `applied`~~ → **Never**; user clicks Submit themselves. Auto-PDF triggered at **score ≥ 3.8**.
4. ~~Language modes~~ → **Always English** (`modes/`)
5. ~~Weekend pause~~ → **No pause**

**Resolved 2026-05-30:**

6. ~~Email provider~~ → **Gmail SMTP** (`smtp.gmail.com:587`, app-password in `.env`)
7. ~~Outreach cap~~ → **All reports with score ≥ 4.0** get a recruiter draft
8. ~~Email recipient~~ → confirm `SMTP_USER` / `MAIL_TO` (likely `emirceyani@gmail.com` from profile)

**Apply mode (clarified):** The existing `apply` mode already drafts answers without submitting. Autonomous flow extends this — when a report scores ≥ 4.0 and the JD has a clear application form URL, generate a draft answer file at `apply-drafts/{company}-{date}.md` with: form questions extracted, AI-drafted answers, "Review and paste into the form yourself" reminder.

## Security Notes

- **Leaked credential 2026-05-30:** A Gmail app-password was pasted in chat during this session and is now in the local transcript at `~/.claude/projects/-Users-emirceyani-career-ops-1/*.jsonl`. **Rotate it.** (Actual value redacted from this file — see local transcript if needed.)
- `.env` must contain: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `MAIL_TO`
- `.env` is already in `.gitignore` (verify before first commit)
- Never log `SMTP_PASS` to `data/automation-log.tsv` or anywhere persistent

## Risks

- **Token cost runaway** if pipeline cap is removed or pending queue not capped — mitigated by `--max 15` + backpressure check.
- **Stale postings evaluated** if scan dedup history is corrupted — mitigated by liveness verification already in scan workflow.
- **User falls behind on triage** and pipeline grows to thousands — mitigated by pending > 50 skip rule.
- **Cloud routine drift** (cadence stops without notice) — mitigated by `verify-automation.mjs` weekly check.

## Out of Scope (explicit)

- **Auto-apply** = clicking Submit / uploading CV / hitting "Send Application" on a job portal. Never automated.
- **Auto-send LinkedIn DMs** to recruiters. The system finds the recruiter and drafts the message; the user copy-pastes and sends.
- Cross-language auto-detection of JD market (user locked to English)
- PDF generation below score 3.8

## Definitions (to avoid confusion)

| Term | Meaning | Automated? |
| --- | --- | --- |
| Auto-scan | Discover new postings, add to `pipeline.md` | ✅ Yes (daily) |
| Auto-evaluate | Run A–F evaluation, write report .md | ✅ Yes (Mon+Thu, capped at 15) |
| Auto-PDF | Generate CV PDF when score ≥ 3.8 | ✅ Yes (new threshold) |
| Auto-draft-outreach | Find LinkedIn recruiter, write draft message to `outreach/` | ✅ Yes (draft only, never sent) |
| Auto-draft-apply | Extract application form questions + draft answers to `apply-drafts/` | ✅ Yes (draft only, never submitted) |
| Auto-send-DM | Actually send the LinkedIn message | ❌ Never |
| Auto-submit-form | Press Submit / Apply button on portal | ❌ Never |

## Status

**Implementation complete — pure local launchd architecture (revised from earlier cloud-routine plan after discovering personal state is gitignored).**

Built:
- `scripts/automation/daily-scan.sh` — cron wrapper for `node scan.mjs`
- `scripts/automation/run-pipeline.sh` — cron wrapper for `claude -p` headless pipeline (--max 15, backpressure 50)
- `scripts/automation/send-digest.sh` + `send-digest.mjs` — nodemailer-based email sender
- `scripts/automation/build-digest.mjs` — pure digest renderer (subject + HTML + plaintext)
- `scripts/automation/verify-automation.mjs` — health check
- `scripts/automation/com.careerops.{scan,pipeline,digest}.plist` — launchd schedules
- `scripts/automation/install.sh` + `uninstall.sh` — idempotent setup
- `plan/autonomous-scan/setup.md` — user walkthrough
- `.env.example` updated with SMTP vars
- `.gitignore` updated (`outreach/`, `apply-drafts/`, `.env`, `data/automation-log.tsv`, log files)
- `modes/pipeline.md` updated: auto-PDF threshold 3.8, autonomous-mode note

**Awaiting user action:**
1. Rotate Gmail app-password (the one in chat is exposed)
2. `cp .env.example .env` and fill SMTP vars with the rotated password
3. `bash scripts/automation/install.sh`
4. `node scripts/automation/verify-automation.mjs` to confirm
