#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const htmlPath = path.resolve(__dirname, "GamingtheGreatPlague.html");
const passagesDir = path.resolve(__dirname, "passages");
const indexPath = path.resolve(__dirname, "passage-index.json");
const outPath = htmlPath; // overwrite in place

const html = fs.readFileSync(htmlPath, "utf-8");
const index = JSON.parse(fs.readFileSync(indexPath, "utf-8"));

// ── Re-encode plain text back to HTML entities ──────────────────────
// Order matters: & must be encoded FIRST to avoid double-encoding.
function encodeEntities(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Read passage content from individual files ──────────────────────
const contentByPid = new Map();
for (const entry of index) {
  const filepath = path.join(passagesDir, entry.filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`Warning: missing file ${entry.filename} for pid ${entry.pid}, skipping`);
    continue;
  }
  const decoded = fs.readFileSync(filepath, "utf-8");
  contentByPid.set(entry.pid, encodeEntities(decoded));
}

// ── Patch each <tw-passagedata> element in the HTML ─────────────────
const re = /(<tw-passagedata\s+pid="(\d+)"[^>]*>)([\s\S]*?)(<\/tw-passagedata>)/g;

const result = html.replace(re, (match, openTag, pid, _oldContent, closeTag) => {
  if (contentByPid.has(pid)) {
    return openTag + contentByPid.get(pid) + closeTag;
  }
  return match; // unchanged
});

fs.writeFileSync(outPath, result, "utf-8");
console.log(`Patched ${contentByPid.size} passages back into ${outPath}`);
