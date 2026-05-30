#!/usr/bin/env node
// Send the daily digest via SMTP using nodemailer.
// Reads .env (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, MAIL_TO).
// Skips silently if .env is missing or digest is empty.

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildDigest } from "./build-digest.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const LOG = path.join(REPO, "data", "automation-log.tsv");

function appendLog(job, status, count, notes) {
  const ts = new Date().toISOString();
  const line = `${ts}\t${job}\t${status}\t${count}\t${notes}\n`;
  fs.appendFileSync(LOG, line);
}

async function main() {
  const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "MAIL_FROM", "MAIL_TO"];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    appendLog("digest", "skipped_no_smtp", 0, `missing env: ${missing.join(",")}`);
    console.error(`[digest] skipped — missing env vars: ${missing.join(", ")}`);
    process.exit(0);
  }

  const digest = buildDigest();
  if (!digest.hasContent) {
    appendLog("digest", "skipped_no_content", 0, "no activity today");
    console.log("[digest] skipped — no activity today");
    process.exit(0);
  }

  let nodemailer;
  try {
    nodemailer = (await import("nodemailer")).default;
  } catch {
    appendLog("digest", "error", 0, "nodemailer not installed; run: npm install nodemailer");
    console.error("[digest] error — nodemailer not installed. Run: npm install nodemailer");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      subject: digest.subject,
      text: digest.text,
      html: digest.html,
    });
    appendLog("digest", "ok", 1, `${digest.actionSet.length} actionable, ${digest.evaluated} evaluated`);
    console.log(`[digest] sent — ${digest.subject}`);
  } catch (err) {
    appendLog("digest", "error", 0, String(err.message || err).slice(0, 200));
    console.error("[digest] error sending:", err.message);
    process.exit(1);
  }
}

main();
