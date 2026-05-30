#!/usr/bin/env node
// Build the daily digest object from current repo state.
// Pure function: reads state files, returns { subject, html, text, hasContent }.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const LOG = path.join(REPO, "data", "automation-log.tsv");
const PIPELINE = path.join(REPO, "data", "pipeline.md");
const APPLICATIONS = path.join(REPO, "data", "applications.md");
const REPORTS_DIR = path.join(REPO, "reports");
const OUTREACH_DIR = path.join(REPO, "outreach");
const APPLY_DRAFTS_DIR = path.join(REPO, "apply-drafts");

const ACTION_FLOOR = 3.5;
const ACTION_TOP_N = 5;
const ACTION_THRESHOLD = 4.0;

function readLines(file) {
  try { return fs.readFileSync(file, "utf8").split("\n").filter(Boolean); }
  catch { return []; }
}

function todayStr(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function parseLogToday(today) {
  const lines = readLines(LOG);
  return lines
    .map(l => l.split("\t"))
    .filter(parts => parts[0]?.startsWith(today))
    .map(([timestamp, job, status, count, notes]) => ({
      timestamp, job, status, count: Number(count) || 0, notes: notes || "",
    }));
}

function parseReports(sinceDate) {
  if (!fs.existsSync(REPORTS_DIR)) return [];
  const files = fs.readdirSync(REPORTS_DIR).filter(f => f.endsWith(".md"));
  const out = [];
  for (const f of files) {
    const m = f.match(/^(\d+)-(.+)-(\d{4}-\d{2}-\d{2})\.md$/);
    if (!m) continue;
    const [_, num, slug, date] = m;
    if (date < sinceDate) continue;
    const content = fs.readFileSync(path.join(REPORTS_DIR, f), "utf8");
    const scoreMatch = content.match(/\*\*Score:\*\*\s*([\d.]+)\s*\/\s*5/i)
      || content.match(/Score:\s*([\d.]+)\s*\/\s*5/i);
    const companyMatch = content.match(/\*\*Company:\*\*\s*(.+)/i)
      || content.match(/^#\s+\d+\s+[—–-]\s+(.+?)\s+[—–-]/m);
    const roleMatch = content.match(/\*\*Role:\*\*\s*(.+)/i);
    if (!scoreMatch) continue;
    out.push({
      num: Number(num),
      slug,
      date,
      score: Number(scoreMatch[1]),
      company: companyMatch?.[1]?.trim() || slug,
      role: roleMatch?.[1]?.trim() || "(unknown role)",
      reportPath: `reports/${f}`,
      pdfPath: fs.existsSync(path.join(REPO, "output", `${num}-${slug}-${date}.pdf`))
        ? `output/${num}-${slug}-${date}.pdf` : null,
      outreachPath: fs.existsSync(path.join(OUTREACH_DIR, `${slug}-${date}.md`))
        ? `outreach/${slug}-${date}.md` : null,
      applyDraftPath: fs.existsSync(path.join(APPLY_DRAFTS_DIR, `${slug}-${date}.md`))
        ? `apply-drafts/${slug}-${date}.md` : null,
    });
  }
  return out.sort((a, b) => b.score - a.score);
}

function countPipelinePending() {
  const lines = readLines(PIPELINE);
  return lines.filter(l => l.startsWith("- [ ]")).length;
}

function buildActionSet(reportsToday) {
  const aboveThreshold = reportsToday.filter(r => r.score >= ACTION_THRESHOLD);
  const topN = reportsToday.slice(0, ACTION_TOP_N);
  const merged = aboveThreshold.length > topN.length ? aboveThreshold : topN;
  return merged.filter(r => r.score >= ACTION_FLOOR);
}

function distribution(reports) {
  const buckets = { "≥ 4.0": 0, "3.8–4": 0, "3–3.8": 0, "< 3": 0 };
  for (const r of reports) {
    if (r.score >= 4.0) buckets["≥ 4.0"]++;
    else if (r.score >= 3.8) buckets["3.8–4"]++;
    else if (r.score >= 3.0) buckets["3–3.8"]++;
    else buckets["< 3"]++;
  }
  return buckets;
}

function renderBar(n, max) {
  if (max === 0) return "";
  const filled = Math.round((n / max) * 10);
  return "█".repeat(filled) + " ".repeat(10 - filled);
}

export function buildDigest(now = new Date()) {
  const today = todayStr(now);
  const yesterday = todayStr(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  const log = parseLogToday(today);
  const reportsToday = parseReports(today);
  const reportsRecent = parseReports(yesterday);
  const pendingNow = countPipelinePending();

  const scanRow = log.find(l => l.job === "scan");
  const pipelineRow = log.find(l => l.job === "pipeline");

  const evaluated = reportsToday.length;
  const discovered = scanRow?.count ?? 0;
  // Render action set whenever today produced any reports — regardless of
  // whether the pipeline cron logged a row. Manual /career-ops runs count too.
  const isPipelineDay = evaluated > 0;
  const backpressure = pendingNow > 50;
  const hasContent = evaluated > 0 || discovered > 0 || backpressure;

  const actionSet = buildActionSet(reportsToday);
  const belowThreshold = reportsToday.filter(r => !actionSet.includes(r));
  const dist = distribution(reportsToday);
  const distMax = Math.max(...Object.values(dist), 1);

  const dayName = now.toLocaleDateString("en-US", { weekday: "short" });
  const subject = `[career-ops] ${dayName} ${today} — ${evaluated} evaluated · ${actionSet.length} actionable · ${pendingNow} pending`;

  const args = { today, dayName, scanRow, pipelineRow, evaluated, discovered, pendingNow,
    actionSet, belowThreshold, dist, distMax, isPipelineDay, backpressure };
  const text = renderText(args);
  const html = renderHtml(args);

  return { subject, html, text, hasContent, evaluated, discovered, actionSet, pendingNow };
}

function renderText(d) {
  const lines = [];
  lines.push(`career-ops digest — ${d.dayName} ${d.today}`);
  lines.push("━".repeat(50));
  lines.push("");
  lines.push("📊 Today");
  lines.push(`  Discovered this cycle: ${d.discovered}`);
  lines.push(`  Evaluated today:       ${d.evaluated}`);
  lines.push(`  Pending after run:     ${d.pendingNow}`);
  lines.push("");

  if (d.isPipelineDay && d.actionSet.length > 0) {
    lines.push(`🎯 Action needed (${d.actionSet.length})`);
    lines.push("");
    for (const r of d.actionSet) {
      lines.push(`  #${r.num} · ${r.company} — ${r.role} · ${r.score.toFixed(1)}/5`);
      if (r.pdfPath) lines.push(`      PDF:        ${r.pdfPath}`);
      lines.push(`      Report:     ${r.reportPath}`);
      if (r.outreachPath) lines.push(`      Recruiter:  ${r.outreachPath}`);
      if (r.applyDraftPath) lines.push(`      Apply form: ${r.applyDraftPath}`);
      lines.push("");
    }
  } else if (d.isPipelineDay) {
    lines.push("🎯 Action needed: none today (all scores below 3.5)");
    lines.push("");
  }

  if (d.evaluated > 0) {
    lines.push("📈 Score distribution");
    for (const [bucket, n] of Object.entries(d.dist)) {
      lines.push(`  ${bucket.padEnd(7)} ${renderBar(n, d.distMax)} ${n}`);
    }
    lines.push("");
  }

  if (d.belowThreshold.length > 0) {
    lines.push(`⏭️  Below threshold (${d.belowThreshold.length}, no action)`);
    for (const r of d.belowThreshold.slice(0, 10)) {
      lines.push(`  #${r.num} · ${r.company} — ${r.role} · ${r.score.toFixed(1)}/5`);
    }
    lines.push("");
  }

  if (d.backpressure) {
    lines.push("🚨 Backpressure");
    lines.push(`  Pipeline queue is ${d.pendingNow} (> 50 cap). Automated pipeline will`);
    lines.push("  skip runs until the queue drains. Triage manually or raise the cap.");
    lines.push("");
  }

  lines.push("⚠️  Health");
  lines.push(`  Last scan:      ${d.scanRow?.timestamp ?? "(none today)"} ${d.scanRow?.status === "ok" ? "✓" : ""}`);
  lines.push(`  Pipeline queue: ${d.pendingNow} pending${d.backpressure ? " (backpressure!)" : ""}`);
  lines.push("");
  lines.push("— career-ops · run logs in data/automation-log.tsv");

  return lines.join("\n");
}

function renderHtml(d) {
  const esc = s => String(s ?? "").replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
  const monoStyle = "font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px;";
  const boxStyle = "background: #f6f8fa; border-radius: 6px; padding: 16px; margin: 12px 0;";

  let html = `<!doctype html><html><body style="font-family: -apple-system, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px; color: #1f2328;">`;
  html += `<h2 style="margin-top: 0;">career-ops digest — ${esc(d.dayName)} ${esc(d.today)}</h2>`;

  html += `<div style="${boxStyle}"><strong>📊 Today</strong><br>`;
  html += `Discovered this cycle: <strong>${d.discovered}</strong> · `;
  html += `Evaluated today: <strong>${d.evaluated}</strong> · `;
  html += `Pending: <strong>${d.pendingNow}</strong></div>`;

  if (d.isPipelineDay && d.actionSet.length > 0) {
    html += `<h3>🎯 Action needed (${d.actionSet.length})</h3>`;
    for (const r of d.actionSet) {
      html += `<div style="${boxStyle}">`;
      html += `<strong>#${r.num} · ${esc(r.company)} — ${esc(r.role)}</strong> · <span style="color: #1a7f37;">${r.score.toFixed(1)}/5</span><br>`;
      html += `<span style="${monoStyle}">`;
      if (r.pdfPath) html += `PDF: ${esc(r.pdfPath)}<br>`;
      html += `Report: ${esc(r.reportPath)}<br>`;
      if (r.outreachPath) html += `Recruiter: ${esc(r.outreachPath)}<br>`;
      if (r.applyDraftPath) html += `Apply form: ${esc(r.applyDraftPath)}`;
      html += `</span></div>`;
    }
  } else if (d.isPipelineDay) {
    html += `<p><em>🎯 Action needed: none today (all scores below 3.5)</em></p>`;
  }

  if (d.evaluated > 0) {
    html += `<h3>📈 Score distribution</h3><pre style="${monoStyle}">`;
    for (const [bucket, n] of Object.entries(d.dist)) {
      html += `${bucket.padEnd(7)} ${renderBar(n, d.distMax)} ${n}\n`;
    }
    html += `</pre>`;
  }

  if (d.belowThreshold.length > 0) {
    html += `<h3>⏭️ Below threshold</h3><ul style="${monoStyle}">`;
    for (const r of d.belowThreshold.slice(0, 10)) {
      html += `<li>#${r.num} · ${esc(r.company)} — ${esc(r.role)} · ${r.score.toFixed(1)}/5</li>`;
    }
    html += `</ul>`;
  }

  if (d.backpressure) {
    html += `<div style="background: #ffebe9; border-left: 4px solid #d1242f; border-radius: 6px; padding: 12px; margin: 12px 0;">`;
    html += `<strong>🚨 Backpressure</strong><br>Pipeline queue is <strong>${d.pendingNow}</strong> (> 50 cap). Automated pipeline will skip runs until the queue drains.</div>`;
  }

  html += `<div style="${boxStyle}"><strong>⚠️ Health</strong><br>`;
  html += `Last scan: ${esc(d.scanRow?.timestamp ?? "(none today)")} ${d.scanRow?.status === "ok" ? "✓" : ""}<br>`;
  html += `Pipeline queue: ${d.pendingNow} pending${d.backpressure ? " <strong style='color:#d1242f'>(backpressure!)</strong>" : ""}</div>`;

  html += `<p style="color: #656d76; font-size: 12px;">— career-ops · run logs in data/automation-log.tsv</p>`;
  html += `</body></html>`;
  return html;
}

// CLI: print to stdout for inspection
if (import.meta.url === `file://${process.argv[1]}`) {
  const d = buildDigest();
  console.log("Subject:", d.subject);
  console.log("");
  console.log(d.text);
}
