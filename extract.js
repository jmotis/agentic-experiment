#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const htmlPath = path.resolve(__dirname, "GamingtheGreatPlague.html");
const passagesDir = path.resolve(__dirname, "passages");
const indexPath = path.resolve(__dirname, "passage-index.json");

const html = fs.readFileSync(htmlPath, "utf-8");

// ── Decode HTML entities to plain text ──────────────────────────────
// Order matters: &amp; must be decoded LAST to avoid double-decoding.
function decodeEntities(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

// ── Extract passages from HTML ──────────────────────────────────────
const re = /<tw-passagedata\s+([^>]*)>([\s\S]*?)<\/tw-passagedata>/g;

const passages = [];
let m;
while ((m = re.exec(html)) !== null) {
  const attrString = m[1];
  const rawContent = m[2]; // HTML-entity-encoded inner text

  // Parse attributes from the opening tag.
  const attr = {};
  const attrRe = /(\w[\w-]*)="([^"]*)"/g;
  let a;
  while ((a = attrRe.exec(attrString)) !== null) {
    attr[a[1]] = a[2];
  }

  passages.push({
    pid: attr.pid,
    name: attr.name,
    tags: attr.tags || "",
    position: attr.position || "",
    size: attr.size || "",
    content: decodeEntities(rawContent),
  });
}

// ── Create passages/ directory ──────────────────────────────────────
if (fs.existsSync(passagesDir)) {
  // Clean out old passage files to avoid stale leftovers
  for (const f of fs.readdirSync(passagesDir)) {
    fs.unlinkSync(path.join(passagesDir, f));
  }
} else {
  fs.mkdirSync(passagesDir);
}

// ── Write individual passage files + build index ────────────────────
const index = [];

for (const p of passages) {
  // Sanitize passage name for use as a filename component.
  // Replace spaces with hyphens, remove anything that isn't alphanumeric,
  // hyphen, or underscore.
  const safeName = p.name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_-]/g, "");

  // Zero-pad the pid for natural sort order.
  const paddedPid = p.pid.padStart(3, "0");
  const filename = `${paddedPid}-${safeName}.txt`;
  const filepath = path.join(passagesDir, filename);

  fs.writeFileSync(filepath, p.content, "utf-8");

  index.push({
    pid: p.pid,
    name: p.name,
    tags: p.tags,
    filename: filename,
    size: Buffer.byteLength(p.content, "utf-8"),
  });
}

// ── Write passage index ─────────────────────────────────────────────
fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), "utf-8");

console.log(`Extracted ${passages.length} passages to ${passagesDir}/`);
console.log(`Wrote passage index to ${indexPath}`);
