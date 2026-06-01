#!/usr/bin/env node

const args = process.argv.slice(2);

function readArg(name, fallback = "") {
  const index = args.indexOf(`--${name}`);
  if (index === -1) return fallback;
  return args[index + 1] || fallback;
}

function required(value, label) {
  if (!value) {
    console.error(`Missing required value: ${label}`);
    process.exit(1);
  }
  return value;
}

const endpoint = readArg(
  "endpoint",
  process.env.COMPANY_NOTIFY_ENDPOINT ||
    "https://www.sslaserservice.com/.netlify/functions/company-work-notify"
);
const secret = readArg("secret", process.env.NOTIFY_INGEST_SECRET || "");

const payload = {
  to: readArg("to", process.env.NOTIFY_TO || ""),
  site: required(readArg("site", process.env.NOTIFY_SITE || ""), "--site or NOTIFY_SITE"),
  type: readArg("type", process.env.NOTIFY_TYPE || "work"),
  title: required(readArg("title", process.env.NOTIFY_TITLE || ""), "--title or NOTIFY_TITLE"),
  url: readArg("url", process.env.NOTIFY_URL || ""),
  summary: readArg("summary", process.env.NOTIFY_SUMMARY || ""),
  status: readArg("status", process.env.NOTIFY_STATUS || ""),
  actor: readArg("actor", process.env.NOTIFY_ACTOR || "Codex"),
};

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...(secret ? { "X-Notify-Secret": secret } : {}),
  },
  body: JSON.stringify(payload),
});

const body = await response.json().catch(() => ({}));

if (!response.ok || body.ok === false) {
  console.error(JSON.stringify({ status: response.status, body }, null, 2));
  process.exit(1);
}

console.log(body.sent ? "Company WeCom notification sent." : "Notification endpoint reached, but webhook is not configured.");
