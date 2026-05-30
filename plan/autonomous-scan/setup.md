# Setup — Autonomous career-ops Automation (Mac, Local)

Three launchd jobs run on your Mac. No cloud routines, no GitHub state push, no API keys outside your machine.

| Job | Schedule | What it does |
|-----|----------|--------------|
| `com.careerops.scan` | Daily 08:00 | Zero-token portal scan, appends new URLs to `data/pipeline.md` |
| `com.careerops.pipeline` | Mon + Thu 09:00 | Headless `claude -p` evaluates pending URLs (max 15/run), generates PDFs ≥ 3.8, drafts recruiter messages + apply answers ≥ 4.0 |
| `com.careerops.digest` | Daily 09:30 | Sends one HTML email with today's activity, action items, score distribution |

If your Mac is asleep at the scheduled time, launchd fires the job when it next wakes. If your Mac is fully off, the run is missed.

## One-time setup

### 1. Rotate your Gmail app-password (security)

The previous one was pasted in chat and lives in the session transcript on disk.

1. https://myaccount.google.com/apppasswords
2. Revoke the old one
3. Generate a new 16-char app-password for "career-ops digest"

### 2. Create `.env`

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=emirceyani@gmail.com
SMTP_PASS=<new app-password, no spaces>
MAIL_FROM=emirceyani@gmail.com
MAIL_TO=emirceyani@gmail.com
```

`.env` is gitignored — it never leaves your machine.

### 3. Install nodemailer

The installer will do this automatically, but if you want to do it now:

```bash
npm install nodemailer
```

### 4. Install the launchd jobs

```bash
bash scripts/automation/install.sh
```

The installer:
- copies the three `.plist` files into `~/Library/LaunchAgents/`
- substitutes `__REPO__` with the absolute path to this repo
- loads each job into launchd

### 5. Verify

```bash
node scripts/automation/verify-automation.mjs
```

Expected on a fresh install:
- `✓ Last scan`, `✓ Last pipeline`, `✓ Last digest` all report "no … logged yet" (will populate after first runs)
- `✓ Pipeline queue` shows current pending count
- `✓ .env present`
- `✓ com.careerops.scan/pipeline/digest` all loaded

### 6. Smoke test the digest

Force a digest now without waiting for 09:30:

```bash
node scripts/automation/send-digest.mjs
```

Check your inbox. The first email will likely show "no activity today" if no scans or pipeline runs have happened — that's correct. Adjust the email text if you want different wording in `scripts/automation/build-digest.mjs`.

### 7. Smoke test the scan

```bash
bash scripts/automation/daily-scan.sh
tail data/automation-log.tsv
```

Expect a line like:
```
2026-05-31T05:00:00Z  scan  ok  12  12 new entries in scan-history
```

## Daily life

- Open inbox each morning around 09:30 → see what landed.
- Reports with score ≥ 4.0 will have draft files waiting in `outreach/` and `apply-drafts/` — review, edit, paste-send manually.
- If the Mac was off and you want to manually trigger a missed run: `launchctl start com.careerops.scan` (or `.pipeline`, `.digest`).

## Pause / resume

Pause all jobs:
```bash
launchctl unload ~/Library/LaunchAgents/com.careerops.*.plist
```

Resume:
```bash
launchctl load ~/Library/LaunchAgents/com.careerops.*.plist
```

Uninstall completely:
```bash
bash scripts/automation/uninstall.sh
```

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Email never arrives | `tail data/automation-log.tsv` — look for `skipped_no_smtp` or `error` rows |
| Pipeline didn't run | `cat data/launchd-pipeline.log`; verify `claude` is on PATH (`command -v claude`) |
| `verify-automation.mjs` reports stale scan | Mac was off at 08:00; run `launchctl start com.careerops.scan` to catch up |
| Digest is empty | Pipeline run produced no reports; check `data/last-pipeline-output.log` |
| Pipeline keeps skipping with `backpressure` | `pipeline.md` has > 50 pending URLs; triage some manually or raise the cap in `run-pipeline.sh` |
