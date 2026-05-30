#!/usr/bin/env node
// Health check for career-ops automation. Run anytime:
//   node scripts/automation/verify-automation.mjs

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const LOG = path.join(REPO, "data", "automation-log.tsv");
const PIPELINE = path.join(REPO, "data", "pipeline.md");

const HOURS = 60 * 60 * 1000;
const SCAN_STALE_AFTER = 36 * HOURS;
const PIPELINE_STALE_AFTER = 5 * 24 * HOURS;
const DIGEST_STALE_AFTER = 36 * HOURS;

function lastRow(job) {
  if (!fs.existsSync(LOG)) return null;
  const lines = fs.readFileSync(LOG, "utf8").split("\n").filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) {
    const parts = lines[i].split("\t");
    if (parts[1] === job) {
      return { timestamp: parts[0], status: parts[2], count: parts[3], notes: parts[4] };
    }
  }
  return null;
}

function ageHours(iso) {
  return ((Date.now() - new Date(iso).getTime()) / HOURS).toFixed(1);
}

function check(label, ok, detail, level = "error") {
  const icon = ok ? "✓" : (level === "info" ? "○" : "✗");
  const color = ok ? "\x1b[32m" : (level === "info" ? "\x1b[33m" : "\x1b[31m");
  console.log(`${color}${icon}\x1b[0m ${label.padEnd(28)} ${detail}`);
  return ok || level === "info";
}

function pendingCount() {
  if (!fs.existsSync(PIPELINE)) return 0;
  return fs.readFileSync(PIPELINE, "utf8").split("\n").filter(l => l.startsWith("- [ ]")).length;
}

function launchdLoaded(label) {
  try {
    execSync(`launchctl list ${label}`, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

let allOk = true;

console.log("career-ops automation health check");
console.log("─".repeat(60));

const scan = lastRow("scan");
allOk &= check("Last scan",
  scan && (Date.now() - new Date(scan.timestamp).getTime()) < SCAN_STALE_AFTER,
  scan ? `${ageHours(scan.timestamp)}h ago (${scan.status})` : "no scan logged yet",
  scan ? "error" : "info");

const pipeline = lastRow("pipeline");
allOk &= check("Last pipeline",
  pipeline && (Date.now() - new Date(pipeline.timestamp).getTime()) < PIPELINE_STALE_AFTER,
  pipeline ? `${ageHours(pipeline.timestamp)}h ago (${pipeline.status})` : "no pipeline logged yet",
  pipeline ? "error" : "info");

const digest = lastRow("digest");
allOk &= check("Last digest",
  digest && (Date.now() - new Date(digest.timestamp).getTime()) < DIGEST_STALE_AFTER,
  digest ? `${ageHours(digest.timestamp)}h ago (${digest.status})` : "no digest logged yet",
  digest ? "error" : "info");

const pending = pendingCount();
allOk &= check("Pipeline queue", pending <= 50, `${pending} pending ${pending > 50 ? "(backpressure!)" : ""}`);

const envOk = fs.existsSync(path.join(REPO, ".env"));
allOk &= check(".env present", envOk, envOk ? "ok" : "missing — copy .env.example to .env");

console.log("─".repeat(60));
console.log("launchd jobs (Mac only):");
for (const label of ["com.careerops.scan", "com.careerops.pipeline", "com.careerops.digest"]) {
  const loaded = launchdLoaded(label);
  allOk &= check(label, loaded, loaded ? "loaded" : "not loaded — run install.sh");
}

console.log("─".repeat(60));
if (allOk) console.log("\x1b[32mAll checks passed.\x1b[0m");
else { console.log("\x1b[31mSome checks failed.\x1b[0m"); process.exit(1); }
